const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // For some SDK versions, it's not directly exposed on genAI. 
        // We might need to use the model manager if available, or just try a standard one.
        // Actually, looking at docs, it's not always simple to list.
        // Let's try a different approach: Try 'gemini-1.5-flash-latest' or 'gemini-1.0-pro'.

        // But let's try to just run a generation with gemini-1.5-flash and catch specific error.
        // The previous error WAS specific.

        console.log("Testing model: gemini-1.5-flash");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash");
    } catch (error) {
        console.log("Failed with gemini-1.5-flash:", error.message);
    }

    try {
        console.log("Testing model: gemini-pro");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-pro");
    } catch (error) {
        console.log("Failed with gemini-pro:", error.message);
    }
}

listModels();
