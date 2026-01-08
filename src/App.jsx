import React, { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer/Footer';
import ResumeForm from './components/ResumeForm';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false
    });
  }, []);

  return (
    <ThemeProvider>
      <div className="app-main">
        <Header />
        <main className="content-wrapper">
          <ResumeForm />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
