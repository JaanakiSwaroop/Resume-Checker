const express = require('express');
const router = express.Router();
const { generateCoverLetter } = require('../services/generator');
const { extractResumeTextForGenerate } = require('../services/fileParser'); // We might need to re-parse or pass text? 
// Ah, the client doesn't send the full text back.
// We either need to (A) Send the resume AGAIN for generation, or (B) Just use the metadata we have.
// Phase 5 plan said "Switch to use aiAnalyzer...".
// If using AI, we really want the FULL resume context for a good letter.
// But currently our /generate/cover-letter endpoint only expects { candidateName, jobRole... }.

// Let's create a NEW endpoint: /generate/cover-letter-ai
// It will require the resume file again OR the raw text if the client has it.
// Simpler: The client doesn't store the raw text. 
// Let's stick to the current flow for now but maybe hint that for AI we need more.
// actually, if we want "Advanced Techniques", we should probably update the client to send the resume file again 
// OR (better state management) the client receives the parsed text in the analysis step?
// That might be too much data.
// Let's keep /generate/cover-letter as is (template) 
// AND add a NEW /generate/ai-cover-letter that accepts the resume file + JD.

// Wait, the user asked to "scale up".
// Let's update the existing route to support an optional "aiMode" flag?
// But we need the resume text.
// The easiest path with current architecture:
// 1. Client sends /analyze. Server returns analysis + (NEW) `resumeTextSnippet` or similar? 
// No, let's just make the cover letter endpoint accept text if provided.

// REVISED PLAN:
// 1. Update /analyze to return the full parsed resumeText (hidden from UI maybe, or just stored in state).
// 2. Client passes `resumeText` to /generate/cover-letter.
// 3. Server checks for `resumeText`. If present & AI Key exists -> Use AI. Else -> Template.

// Let's go with this. It requires updating `analyze.js` response and `App.jsx` state.

const { generateCoverLetterAI } = require('../services/aiAnalyzer');

router.post('/cover-letter', async (req, res) => {
    try {
        const { candidateName, jobRole, companyName, topSkills, resumeText, jobDescription, provider } = req.body;

        if ((process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) && resumeText && jobDescription) {
            try {
                console.log(`Generating AI Cover Letter with ${provider || 'gemini'}...`);
                const letter = await generateCoverLetterAI(resumeText, jobDescription, provider);
                return res.json({ success: true, coverLetter: letter });
            } catch (error) {
                console.error("AI Generation failed, falling back to template:", error);
            }
        }

        // Fallback or default template
        const letter = generateCoverLetter(candidateName, jobRole, companyName, topSkills);
        res.json({ success: true, coverLetter: letter });
    } catch (error) {
        console.error('Error generating cover letter:', error);
        res.status(500).json({ error: 'Failed to generate cover letter' });
    }
});

module.exports = router;
