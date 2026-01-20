const express = require('express');
const multer = require('multer');
const { parseFile } = require('../services/fileParser');
const { analyzeResume } = require('../services/analyzer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const { analyzeWithAI } = require('../services/aiAnalyzer');
const { generateSuggestions } = require('../services/suggestions');

router.post('/', upload.single('resume'), async (req, res) => {
    try {
        const { jobDescription, provider, applicantType } = req.body;
        const file = req.file;

        if (!file || !jobDescription) {
            console.log('Missing file or job description');
            if (!file) console.log('File is missing');
            if (!jobDescription) console.log('Job Description is missing');
            return res.status(400).json({ error: 'Resume file and Job Description are required' });
        }

        console.log(`Received file: ${file.originalname}, mimetype: ${file.mimetype}, size: ${file.size}`);

        const resumeText = await parseFile(file.buffer, file.mimetype);
        console.log('Resume text extracted, length:', resumeText.length);

        // Check if ANY AI key is present (logic handled inside analyzeWithAI based on provider)


        if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
            try {
                console.log(`Attempting AI analysis with ${provider || 'gemini'}...`);
                // If provider is missing, it defaults to 'gemini' in the service, but let's pass it explicit
                const aiResults = await analyzeWithAI(resumeText, jobDescription, provider);
                return res.json({
                    success: true,
                    data: {
                        ...aiResults,
                        resumeText // Pass back so client can send it for Cover Letter gen
                    }
                });
            } catch (aiError) {
                console.warn("AI Analysis failed (likely quota/model issue). Falling back to basic keyword analysis.");
                console.warn(`AI Error: ${aiError.message}`);
                // Fallback proceeds below
            }
        } else {
            console.log("GEMINI_API_KEY not found, using basic analysis.");
        }

        const analysis = analyzeResume(resumeText, jobDescription);
        const suggestions = generateSuggestions(analysis);

        res.json({
            success: true,
            data: {
                ...analysis,
                resumeText,
                suggestions
            }
        });
    } catch (error) {
        console.error('Analysis error details:', error);
        res.status(500).json({ error: 'Internal server error processing request: ' + error.message });
    }
});

module.exports = router;
