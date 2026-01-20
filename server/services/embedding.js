const OpenAI = require("openai");
const computeCosineSimilarity = require('compute-cosine-similarity');

// Re-use the existing OpenAI instance logic or create new
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/**
 * Generates embedding for text using text-embedding-3-large.
 * @param {string} text 
 * @returns {Promise<number[]>} Vector or null if text is empty/too short
 */
async function getEmbedding(text) {
    if (!text || text.trim().length === 0) return null;
    if (!openai) throw new Error("OPENAI_API_KEY is required for embeddings.");

    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-large",
            input: text,
            encoding_format: "float",
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error("Embedding Error:", error.message);
        throw error; // Propagate up
    }
}

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} 0 to 1
 */
function calculateSimilarity(vecA, vecB) {
    if (!vecA || !vecB) return 0;
    // compute-cosine-similarity usually handles nulls gracefully or throws.
    // Ensure vectors are same length? text-embedding-3-large is fixed size, so yes.
    const sim = computeCosineSimilarity(vecA, vecB);
    return sim === null ? 0 : Math.max(0, sim); // Ensure 0-1 range (cosine can be negative but for documents usually positive)
}

module.exports = { getEmbedding, calculateSimilarity };
