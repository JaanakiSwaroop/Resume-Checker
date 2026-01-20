import React from 'react';

const CoverLetterView = ({ letter }) => {
    return (
        <div className="card">
            <h2>Generated Cover Letter</h2>
            <div className="letter-content">
                <pre>{letter}</pre>
            </div>
            <button
                onClick={() => navigator.clipboard.writeText(letter)}
                className="secondary-btn"
                style={{ marginTop: '1rem' }}
            >
                Copy to Clipboard
            </button>
        </div>
    );
};

export default CoverLetterView;
