import React from 'react';
import Typewriter from 'typewriter-effect';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className={`app-header ${theme}`}>
            <div className="header-content glass-panel">
                <div className="logo-container">
                    <h1 className="logo-text">
                        <Typewriter
                            options={{
                                strings: ['ATS Resume Builder', 'Optimize Your CV', 'Beat the Bots'],
                                autoStart: true,
                                loop: true,
                                delay: 75,
                            }}
                        />
                    </h1>
                </div>
                <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </header>
    );
};

export default Header;
