import React, { useState } from 'react';
import './App.css';
import ResumeUploader from './components/ResumeUploader';
import AnalysisDisplay from './components/AnalysisDisplay';
import CoverLetterView from './components/CoverLetterView';
import { api } from './services/api';

const AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'openai', name: 'OpenAI (GPT-4)' }
];

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AI Provider State
  const [aiProvider, setAiProvider] = useState('gemini');

  // Keep track of job details for cover letter generation
  const [currentJobDesc, setCurrentJobDesc] = useState('');

  const handleAnalyze = async (file, jobDesc) => {
    setLoading(true);
    setError(null);
    setCurrentJobDesc(jobDesc);
    try {
      const result = await api.analyzeResume(file, jobDesc, aiProvider);
      console.log("Analysis Result:", result);
      if (result.success) {
        setAnalysis(result.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!analysis) return;
    setLoading(true);
    try {
      const data = {
        candidateName: "[Candidate Name]", // In a real app, parsed from resume
        jobRole: "Applicant", // Could extract from Job Desc
        companyName: "[Company Name]", // Could extract from Job Desc
        topSkills: analysis.matches,
        resumeText: analysis.resumeText, // New field
        jobDescription: currentJobDesc, // State field
        provider: aiProvider
      };

      const result = await api.generateCoverLetter(data);
      if (result.success) {
        setLetter(result.coverLetter);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Resume Checker & Improver</h1>
        <p>Optimize your resume for the job you want.</p>
      </header>

      {error && <div className="card" style={{ color: 'red' }}>{error}</div>}

      {!analysis && (
        <>
          <div className="card" style={{ marginBottom: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>AI Engine:</label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {AI_PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>


          </div>
          <ResumeUploader onAnalyze={handleAnalyze} isLoading={loading} />
        </>
      )}

      {analysis && !letter && (
        <AnalysisDisplay
          analysis={analysis}
          onGenerateLetter={handleGenerateLetter}
        />
      )}

      {letter && (
        <CoverLetterView letter={letter} />
      )}

      {analysis && (
        <button
          className="secondary-btn"
          onClick={() => { setAnalysis(null); setLetter(null); }}
          style={{ marginTop: '2rem', width: '100%' }}
        >
          Start Over
        </button>
      )}
    </div>
  );
}

export default App;
