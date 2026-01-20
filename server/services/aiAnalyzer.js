const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/**
 * Metadata for supported models
 */
const MODELS = {
    gemini: "gemini-2.5-flash",
    openai: "gpt-3.5-turbo" // Use gpt-3.5-turbo for better availability/cost
};

/**
 * Unified Analysis Function relying on provider.
 */
async function analyzeWithAI(resumeText, jobDescription, provider = 'gemini') {
    if (provider === 'openai') {
        return analyzeWithOpenAI(resumeText, jobDescription);
    } else {
        return analyzeWithGemini(resumeText, jobDescription);
    }
}

async function analyzeWithGemini(resumeText, jobDescription) {
    if (!genAI) throw new Error("GEMINI_API_KEY is not configured");
    const model = genAI.getGenerativeModel({ model: MODELS.gemini });

    const prompt = `
    You are an expert AI Resume Scanner & Recruiter. Compare the candidate's resume against the provided Job Description.
    
    Job Description:
    ${jobDescription}

    Resume Text:
    ${resumeText.substring(0, 15000)}

    Analyze the match and provide the output in the following JSON format ONLY:
    {
        "score": <number 0-100>,
        "scoreExplanation": "<Detailed 2-3 sentences explaining WHY this score was given. Be specific about what matched and what didn't.>",
        "matches": ["<list of specific skills/keywords found in resume that match JD>"],
        "missing": ["<list of critical skills/keywords from JD NOT found in resume>"],
        "suggestions": ["<Actionable advice 1>", "<Actionable advice 2>", "<Actionable advice 3>"]
    }
    
    Be strict but fair. Do not hallucinate skills. If a skill is "Javascript" and resume says "JS", count it as match.
    The "scoreExplanation" should be very helpful to the user.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw error;
    }
}

async function analyzeWithOpenAI(resumeText, jobDescription) {
    if (!openai) throw new Error("OPENAI_API_KEY is not configured");

    const prompt = `
    You are an expert Technical Recruiter. Analyze the resume against the job description.
    
    Job Description:
    ${jobDescription}

    Resume:
    ${resumeText.substring(0, 15000)}

    Return JSON:
    {
        "score": <0-100>,
        "scoreExplanation": "<Detailed explanation of the score, highlighting key strengths and critical gaps.>",
        "matches": ["<list of matching skills>"],
        "missing": ["<list of missing critical skills>"],
        "suggestions": ["<Specific improvements>"]
    }
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: MODELS.openai,
            messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON." }, { role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI Analysis Error:", error);
        throw error;
    }
}

/**
 * Unified Cover Letter Generation
 */
async function generateCoverLetterAI(resumeText, jobDescription, provider = 'gemini') {
    if (provider === 'openai') {
        return generateCoverLetterOpenAI(resumeText, jobDescription);
    } else {
        return generateCoverLetterGemini(resumeText, jobDescription);
    }
}

async function generateCoverLetterGemini(resumeText, jobDescription) {
    if (!genAI) throw new Error("GEMINI_API_KEY is not configured");
    const model = genAI.getGenerativeModel({ model: MODELS.gemini });
    const prompt = `Write a professional cover letter.\nResume: ${resumeText.substring(0, 5000)}\nJob: ${jobDescription.substring(0, 2000)}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function generateCoverLetterOpenAI(resumeText, jobDescription) {
    if (!openai) throw new Error("OPENAI_API_KEY is not configured");

    const completion = await openai.chat.completions.create({
        model: MODELS.openai,
        messages: [
            { role: "system", content: "You are a professional Career Coach." },
            { role: "user", content: `Write a professional cover letter.\nResume: ${resumeText.substring(0, 5000)}\nJob: ${jobDescription.substring(0, 2000)}` }
        ]
    });
    return completion.choices[0].message.content;
}

module.exports = { analyzeWithAI, generateCoverLetterAI };
