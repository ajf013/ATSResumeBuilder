import React from 'react';
import './ResumePreview.css';

const ResumePreview = ({ details, experiences, educations, languages, certificates, hobbies }) => {
    return (
        <div className="resume-preview-paper" id="resume-preview">
            <div className="resume-header">
                <h1 className="resume-name">{details.firstName || 'Tobias'} {details.lastName || 'Meier'}</h1>
                <p className="resume-title">{details.title || 'Software Engineer'}</p>
                <div className="resume-contact-info">
                    {details.email && <span>{details.email}</span>}
                    {details.email && (details.phone || details.location) && <span className="separator">◆</span>}
                    {details.phone && <span>{details.phone}</span>}
                    {details.phone && details.location && <span className="separator">◆</span>}
                    {details.location && <span>{details.location}</span>}
                </div>
            </div>

            <div className="resume-section">
                <h3 className="resume-section-title">Summary</h3>
                <p className="resume-summary">{details.summary || 'Developed and optimized scalable web applications...'}</p>
            </div>

            {experiences.length > 0 && experiences[0].title && (
                <div className="resume-section">
                    <h3 className="resume-section-title">Experience</h3>
                    {experiences.map((exp) => (
                        <div key={exp.id} className="resume-item">
                            <div className="resume-item-header">
                                <span className="resume-item-title">{exp.title}</span>
                                <span className="resume-item-date">{exp.date}</span>
                            </div>
                            <div className="resume-item-sub">
                                <span className="resume-item-company">{exp.company}</span>
                                {exp.location && <span className="resume-item-location"> — {exp.location}</span>}
                            </div>
                            <p className="resume-item-desc">{exp.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {educations.length > 0 && educations[0].degree && (
                <div className="resume-section">
                    <h3 className="resume-section-title">Education</h3>
                    {educations.map((edu) => (
                        <div key={edu.id} className="resume-item">
                            <div className="resume-item-header">
                                <span className="resume-item-title">{edu.degree} {edu.major && `in ${edu.major}`}</span>
                                <span className="resume-item-date">{edu.date}</span>
                            </div>
                            <div className="resume-item-sub">
                                <span className="resume-item-company">{edu.university}</span>
                                {edu.location && <span className="resume-item-location"> — {edu.location}</span>}
                                {edu.gpa && <span className="resume-item-gpa"> — GPA: {edu.gpa}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(details.skills || (languages.length > 0 && languages[0].language) || (certificates.length > 0 && certificates[0].name) || hobbies) && (
                <div className="resume-section">
                    {details.skills && (
                        <div className="resume-skill-row">
                            <span className="resume-skill-label">Skills:</span>
                            <span className="resume-skill-content">{details.skills}</span>
                        </div>
                    )}

                    {languages.length > 0 && languages[0].language && (
                        <div className="resume-skill-row">
                            <span className="resume-skill-label">Languages:</span>
                            <span className="resume-skill-content">
                                {languages.map((lang, i) => (
                                    <span key={lang.id}>{lang.language} {lang.proficiency && `(${lang.proficiency})`}{i < languages.length - 1 ? ', ' : ''}</span>
                                ))}
                            </span>
                        </div>
                    )}

                    {certificates.length > 0 && certificates[0].name && (
                        <div className="resume-certificates">
                            <h4 className="resume-subsection-title">Certificates</h4>
                            {certificates.map(cert => (
                                <div key={cert.id} className="resume-cert-item">
                                    <strong>{cert.name}</strong> - {cert.authority} {cert.date && `(${cert.date})`}
                                </div>
                            ))}
                        </div>
                    )}

                    {details.hobbies && (
                        <div className="resume-skill-row">
                            <span className="resume-skill-label">Hobbies:</span>
                            <span className="resume-skill-content">{details.hobbies}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResumePreview;
