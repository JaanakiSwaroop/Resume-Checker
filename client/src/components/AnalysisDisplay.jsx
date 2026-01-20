import React from 'react';

const AnalysisDisplay = ({ analysis, onGenerateLetter }) => {
    const { score, matches, missing, suggestions } = analysis;

    const scoreColor = score >= 80 ? 'green' : score >= 50 ? 'orange' : 'red';

    return (
        <div className="analysis-container">
            <div className="card score-card">
                <h2>Analysis Results</h2>
                <div className="score-ring" style={{ borderColor: scoreColor }}>
                    <span className="score-value">{score}%</span>
                    <span className="score-label">Match</span>
                </div>
            </div>

            {/* AI Score Explanation */}
            {analysis.scoreExplanation && (
                <div className="card full-width" style={{ marginTop: '1rem', borderLeft: '4px solid #3498db' }}>
                    <h3>📝 AI Verdict</h3>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{analysis.scoreExplanation}</p>
                </div>
            )}

            <div className="grid-2">
                <div className="card">
                    <h3>✅ Matched Keywords</h3>
                    <ul className="tag-list">
                        {matches.map(m => <li key={m} className="tag match">{m}</li>)}
                    </ul>
                </div>
                <div className="card">
                    <h3>❌ Missing Keywords</h3>
                    <ul className="tag-list">
                        {missing.map(m => <li key={m} className="tag missing">{m}</li>)}
                    </ul>
                </div>
            </div>



            <div className="card">
                <h3>💡 Suggestions</h3>
                <ul className="suggestion-list">
                    {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>

            <div className="action-area">
                <button onClick={onGenerateLetter} className="secondary-btn">
                    Draft Cover Letter
                </button>
            </div>
        </div>
    );
};

export default AnalysisDisplay;
