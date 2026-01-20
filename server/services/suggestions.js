/**
 * Generates suggestions based on analysis results.
 * @param {Object} analysis - The result from the analyzer.
 * @returns {Array<string>} - A list of suggestions.
 */
function generateSuggestions(analysis) {
    const suggestions = [];

    if (analysis.score < 50) {
        suggestions.push("Your resume has a low match score. Consider tailoring it more closely to the job description.");
    } else if (analysis.score < 80) {
        suggestions.push("Good start, but you can improve your match score by including more specific keywords.");
    } else {
        suggestions.push("Excellent match score! Your resume is well-tailored.");
    }

    if (analysis.missing && analysis.missing.length > 0) {
        const missingStr = analysis.missing.slice(0, 5).join(", ");
        suggestions.push(`Try to include these missing keywords: ${missingStr}.`);
    }

    // General formatting advice (static for now, could be dynamic based on parsing result)
    suggestions.push("Ensure your resume uses action verbs at the start of bullet points.");
    suggestions.push("Quantify your achievements where possible (e.g., 'Increased sales by 20%').");

    return suggestions;
}

module.exports = { generateSuggestions };
