import React, { useState } from 'react';

const ResumeUploader = ({ onAnalyze, isLoading }) => {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file && jobDescription) {
            onAnalyze(file, jobDescription);
        }
    };

    return (
        <div className="card">
            <h2>1. Upload Resume & Job Description</h2>
            <form onSubmit={handleSubmit} className="upload-form">
                <div className="form-group">
                    <label>Resume (PDF/DOCX)</label>
                    <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Job Description</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here..."
                        rows={6}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading} className="primary-btn">
                    {isLoading ? 'Analyzing...' : 'Analyze My Resume'}
                </button>
            </form>
        </div>
    );
};

export default ResumeUploader;
