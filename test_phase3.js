
const { generateSuggestions } = require('./server/services/suggestions');
const { generateCoverLetter } = require('./server/services/generator');

console.log("--- Testing Suggestions ---");
const mockAnalysis = {
    score: 60,
    matches: ['react', 'node'],
    missing: ['typescript', 'aws']
};
const suggestions = generateSuggestions(mockAnalysis);
console.log("Input Analysis:", mockAnalysis);
console.log("Generated Suggestions:", suggestions);

if (suggestions.length > 0 && suggestions.some(s => s.includes('typescript'))) {
    console.log("SUCCESS: Suggestions logic is working.");
} else {
    console.error("FAILURE: Suggestions logic failed.");
}

console.log("\n--- Testing Cover Letter ---");
const letter = generateCoverLetter("John Doe", "Frontend Developer", "Tech Corp", ["React", "CSS", "HTML"]);
console.log("Generated Letter Snippet:", letter.substring(0, 200) + "...");

if (letter.includes("John Doe") && letter.includes("Tech Corp")) {
    console.log("SUCCESS: Cover Letter logic is working.");
} else {
    console.error("FAILURE: Cover Letter logic failed.");
}
