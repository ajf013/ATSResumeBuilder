import React, { useState, useEffect } from 'react';
import ResumePreview from './ResumePreview';
import './ResumeForm.css';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import { asBlob } from 'html-docx-js-typescript';

const ResumeForm = () => {
    const [details, setDetails] = useState({
        firstName: '', lastName: '', title: '', email: '', phone: '', location: '', summary: '',
        skills: '',
        hobbies: '',
    });

    const [experiences, setExperiences] = useState([{ id: 1, title: '', company: '', location: '', date: '', description: '' }]);
    const [educations, setEducations] = useState([{ id: 1, degree: '', major: '', university: '', location: '', date: '', gpa: '' }]);
    const [languages, setLanguages] = useState([{ id: 1, language: '', proficiency: '' }]);
    const [certificates, setCertificates] = useState([{ id: 1, name: '', authority: '', date: '', description: '' }]);

    const [score, setScore] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDetails({ ...details, [name]: value });
    };

    const handleDynamicChange = (type, id, name, value) => {
        const updater = {
            'exp': [experiences, setExperiences],
            'edu': [educations, setEducations],
            'lang': [languages, setLanguages],
            'cert': [certificates, setCertificates]
        };
        const [list, setList] = updater[type];
        const newList = list.map(item => item.id === id ? { ...item, [name]: value } : item);
        setList(newList);
    };

    const addFields = (type) => {
        const updater = {
            'exp': [experiences, setExperiences, { title: '', company: '', location: '', date: '', description: '' }],
            'edu': [educations, setEducations, { degree: '', major: '', university: '', location: '', date: '', gpa: '' }],
            'lang': [languages, setLanguages, { language: '', proficiency: '' }],
            'cert': [certificates, setCertificates, { name: '', authority: '', date: '', description: '' }]
        };
        const [list, setList, template] = updater[type];
        setList([...list, { id: Date.now(), ...template }]);
    };

    const removeFields = (type, id) => {
        const updater = {
            'exp': [experiences, setExperiences],
            'edu': [educations, setEducations],
            'lang': [languages, setLanguages],
            'cert': [certificates, setCertificates]
        };
        const [list, setList] = updater[type];
        if (list.length > 1) {
            setList(list.filter(item => item.id !== id));
        }
    };

    useEffect(() => {
        calculateScore();
    }, [details, experiences, educations, languages, certificates]);

    const [jobDescription, setJobDescription] = useState('');
    const [atsAnalysis, setAtsAnalysis] = useState({ matchScore: 0, missingKeywords: [], matchedKeywords: [] });

    // Common stop words to ignore when extracting keywords
    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'it', 'this', 'that', 'which', 'who', 'what', 'where', 'when', 'how', 'can', 'could', 'should', 'would', 'will', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'us', 'them', 'from', 'up', 'down', 'out', 'into', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);

    const extractKeywords = (text) => {
        if (!text) return [];
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
    };

    const getResumeContent = () => {
        const expText = experiences.map(e => `${e.title} ${e.company} ${e.description}`).join(' ');
        const eduText = educations.map(e => `${e.degree} ${e.major} ${e.university}`).join(' ');
        const langText = languages.map(l => l.language).join(' ');
        const certText = certificates.map(c => `${c.name} ${c.authority} ${c.description}`).join(' ');
        return `${details.firstName} ${details.lastName} ${details.title} ${details.summary} ${details.skills} ${details.hobbies} ${expText} ${eduText} ${langText} ${certText}`;
    };

    useEffect(() => {
        analyzeATS();
    }, [details, experiences, educations, languages, certificates, jobDescription]);

    const analyzeATS = () => {
        // Base score for completeness (up to 40%)
        let completenessScore = 0;
        let checks = 0;

        ['firstName', 'lastName', 'email', 'phone', 'title', 'location', 'summary'].forEach(k => {
            checks++;
            if (details[k]) completenessScore++;
        });

        if (experiences.length > 0 && experiences[0].title) { completenessScore += 3; checks += 3; }
        if (experiences.some(e => e.description && e.description.length > 50)) { completenessScore += 2; checks += 2; }
        if (details.skills && details.skills.length > 10) { completenessScore += 2; checks += 2; }

        const baseScore = Math.round((completenessScore / checks) * 40); // Base score is max 40/100

        // Keyword Matching Score (up to 60%)
        if (!jobDescription.trim()) {
            setScore(Math.min(baseScore * 2.5, 100)); // Scan completeness only if no JD
            setAtsAnalysis({ matchScore: 0, missingKeywords: [], matchedKeywords: [] });
            return;
        }

        const jdKeywords = extractKeywords(jobDescription);
        // Get unique keywords from JD to avoid duplicates skewing score
        const uniqueJdKeywords = [...new Set(jdKeywords)];
        const resumeContent = getResumeContent().toLowerCase();

        const matched = [];
        const missing = [];

        uniqueJdKeywords.forEach(keyword => {
            if (resumeContent.includes(keyword)) {
                matched.push(keyword);
            } else {
                missing.push(keyword);
            }
        });

        const matchPercentage = uniqueJdKeywords.length > 0 ? (matched.length / uniqueJdKeywords.length) : 0;
        const keywordScore = Math.round(matchPercentage * 60);

        setScore(baseScore + keywordScore);
        setAtsAnalysis({
            matchScore: keywordScore,
            missingKeywords: missing.slice(0, 10), // Top 10 missing
            matchedKeywords: matched
        });
    };

    const calculateScore = () => {
        // Deprecated in favor of analyzeATS but kept structure if needed. 
        // analyzeATS handles all scoring now.
    };

    return (
        <div className="resume-grid-layout">
            <div className="form-column">
                <div className="score-panel glass-panel user-score-panel">
                    <h2 className="section-title">
                        <span role="img" aria-label="chart">🎯</span> ATS Match: {score}%
                    </h2>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${score}%`, background: score > 75 ? '#21ba45' : score > 50 ? '#fbbd08' : '#db2828' }}></div>
                    </div>
                    {atsAnalysis.missingKeywords.length > 0 && (
                        <div className="ats-feedback">
                            <p style={{ marginTop: '10px', fontSize: '0.9rem' }}><strong>Missing Keywords:</strong></p>
                            <div className="keyword-tags">
                                {atsAnalysis.missingKeywords.map(k => (
                                    <span key={k} className="keyword-tag missing">{k}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {jobDescription && atsAnalysis.missingKeywords.length === 0 && (
                        <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#21ba45' }}><strong>Great Job! All keywords matched.</strong></p>
                    )}
                </div>

                <div className="form-panel glass-panel">
                    <div className="form-group" style={{ marginBottom: '30px' }}>
                        <label style={{ fontSize: '1.2rem', color: '#21ba45' }}>🔍 Target Job Description</label>
                        <p style={{ fontSize: '0.85rem', marginBottom: '10px', opacity: 0.8 }}>Paste the job description here to scan your resume against it.</p>
                        <textarea
                            placeholder="Paste the full job description here (e.g. 'We are looking for a React Developer with experience in Node.js...')"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            style={{ minHeight: '120px', border: '2px dashed rgba(33, 186, 69, 0.3)' }}
                        ></textarea>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()}>
                        <h2 className="section-title">Personal Information</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" placeholder="Tobias" name="firstName" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" placeholder="Meier" name="lastName" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Professional Title</label>
                            <input type="text" placeholder="Software Engineer" name="title" onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="name@example.com" name="email" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="tel" placeholder="+91 944XXXXXXX" name="phone" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input type="text" placeholder="India" name="location" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Summary</label>
                            <textarea placeholder="Brief professional summary..." name="summary" onChange={handleChange} style={{ height: '100px' }}></textarea>
                        </div>

                        <div className="section-header">
                            <h3 className="section-title">Experience</h3>
                            <button type="button" className="add-btn" onClick={() => addFields('exp')}>+</button>
                        </div>
                        {experiences.map((exp) => (
                            <div key={exp.id} className="dynamic-section">
                                {experiences.length > 1 && <button type="button" className="remove-btn" onClick={() => removeFields('exp', exp.id)}>Trash</button>}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Job Title</label>
                                        <input type="text" placeholder="Senior Software Engineer" value={exp.title} onChange={(e) => handleDynamicChange('exp', exp.id, 'title', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Company</label>
                                        <input type="text" placeholder="Tech Innovators Inc." value={exp.company} onChange={(e) => handleDynamicChange('exp', exp.id, 'company', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input type="text" placeholder="Bangalore, India" value={exp.location} onChange={(e) => handleDynamicChange('exp', exp.id, 'location', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input type="text" placeholder="Jan 2020 - Present" value={exp.date} onChange={(e) => handleDynamicChange('exp', exp.id, 'date', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description & Achievements (Use Bullets)</label>
                                    <textarea placeholder="• Developed..." value={exp.description} onChange={(e) => handleDynamicChange('exp', exp.id, 'description', e.target.value)}></textarea>
                                </div>
                            </div>
                        ))}

                        <div className="section-header">
                            <h3 className="section-title">Education</h3>
                            <button type="button" className="add-btn" onClick={() => addFields('edu')}>+</button>
                        </div>
                        {educations.map((edu) => (
                            <div key={edu.id} className="dynamic-section">
                                {educations.length > 1 && <button type="button" className="remove-btn" onClick={() => removeFields('edu', edu.id)}>Trash</button>}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Degree</label>
                                        <input type="text" placeholder="Bachelor of Technology" value={edu.degree} onChange={(e) => handleDynamicChange('edu', edu.id, 'degree', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Major</label>
                                        <input type="text" placeholder="Computer Science" value={edu.major} onChange={(e) => handleDynamicChange('edu', edu.id, 'major', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>University</label>
                                        <input type="text" placeholder="IIT Bombay" value={edu.university} onChange={(e) => handleDynamicChange('edu', edu.id, 'university', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input type="text" placeholder="Mumbai, India" value={edu.location} onChange={(e) => handleDynamicChange('edu', edu.id, 'location', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input type="text" placeholder="Aug 2013 - May 2017" value={edu.date} onChange={(e) => handleDynamicChange('edu', edu.id, 'date', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>GPA/Percentage</label>
                                        <input type="text" placeholder="8.5/10" value={edu.gpa} onChange={(e) => handleDynamicChange('edu', edu.id, 'gpa', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <h3 className="section-title">Skills</h3>
                        <div className="form-group">
                            <label>Skills List</label>
                            <input type="text" placeholder="JavaScript, React, Node.js, Docker, CI/CD..." name="skills" onChange={handleChange} />
                        </div>

                        <div className="section-header">
                            <h3 className="section-title">Languages</h3>
                            <button type="button" className="add-btn" onClick={() => addFields('lang')}>+</button>
                        </div>
                        {languages.map((lang) => (
                            <div key={lang.id} className="form-row dynamic-row">
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label>Language</label>
                                    <input type="text" placeholder="English" value={lang.language} onChange={(e) => handleDynamicChange('lang', lang.id, 'language', e.target.value)} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Proficiency</label>
                                    <input type="text" placeholder="Fluent" value={lang.proficiency} onChange={(e) => handleDynamicChange('lang', lang.id, 'proficiency', e.target.value)} />
                                </div>
                                {languages.length > 1 && <button type="button" className="remove-btn-icon" onClick={() => removeFields('lang', lang.id)}>✖</button>}
                            </div>
                        ))}

                        <div className="section-header">
                            <h3 className="section-title">Certificates</h3>
                            <button type="button" className="add-btn" onClick={() => addFields('cert')}>+</button>
                        </div>
                        {certificates.map((cert) => (
                            <div key={cert.id} className="dynamic-section">
                                {certificates.length > 1 && <button type="button" className="remove-btn" onClick={() => removeFields('cert', cert.id)}>Trash</button>}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Certificate Name</label>
                                        <input type="text" placeholder="AWS Certified Solutions Architect" value={cert.name} onChange={(e) => handleDynamicChange('cert', cert.id, 'name', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Authority</label>
                                        <input type="text" placeholder="Amazon Web Services" value={cert.authority} onChange={(e) => handleDynamicChange('cert', cert.id, 'authority', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input type="text" placeholder="Jun 2022" value={cert.date} onChange={(e) => handleDynamicChange('cert', cert.id, 'date', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea placeholder="Certification description..." value={cert.description} onChange={(e) => handleDynamicChange('cert', cert.id, 'description', e.target.value)} style={{ height: '60px' }}></textarea>
                                </div>
                            </div>
                        ))}

                        <h3 className="section-title">Hobbies</h3>
                        <div className="form-group">
                            <label>Hobbies</label>
                            <input type="text" placeholder="Rock Climbing, Reading..." name="hobbies" onChange={handleChange} />
                        </div>

                    </form>
                </div>
            </div>

            <div className="preview-column">
                <div className="preview-sticky-container">
                    <div className="download-actions glass-panel">
                        <button className="download-btn pdf" onClick={() => {
                            const element = document.getElementById('resume-preview');
                            const opt = {
                                margin: 0,
                                filename: `${details.firstName}_${details.lastName}_Resume.pdf`,
                                image: { type: 'jpeg', quality: 0.98 },
                                html2canvas: { scale: 2 },
                                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                            };
                            html2pdf().set(opt).from(element).save();
                        }}>
                            Download PDF
                        </button>
                        <button className="download-btn doc" onClick={() => {
                            const element = document.getElementById('resume-preview'); // Get the preview element using ID
                            if (element) {
                                // We need a complete HTML structure for word
                                const htmlString = `
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <meta charset="utf-8">
                                        <title>Resume</title>
                                    </head>
                                    <body>
                                        ${element.outerHTML}
                                    </body>
                                    </html>
                                `;
                                asBlob(htmlString).then(blob => {
                                    saveAs(blob, `${details.firstName}_${details.lastName}_Resume.docx`);
                                });
                            }
                        }}>
                            Download Word
                        </button>
                    </div>
                    <ResumePreview
                        details={details}
                        experiences={experiences}
                        educations={educations}
                        languages={languages}
                        certificates={certificates}
                        hobbies={details.hobbies}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResumeForm;
