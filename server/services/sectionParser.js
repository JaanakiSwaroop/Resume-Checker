const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer; // Using Porter Stemmer as a proxy for simple lemmatization in basic NLP

// Common section headers regex patterns
const SECTIONS = {
    skills: /skills|technical skills|technologies|proficiencies|core competencies|expertise/i,
    experience: /experience|work history|employment|work experience|professional experience|career history/i,
    projects: /projects|key projects|academic projects|personal projects/i,
    education: /education|academic background|qualifications|academic history/i,
    certifications: /certifications|certificates|courses|licenses/i
};

/**
 * Splits text into standard sections.
 * @param {string} text 
 * @returns {Object} { skills: "...", experience: "...", ... }
 */
function parseSections(text) {
    const lines = text.split('\n');
    const sections = {
        skills: [],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
        unknown: []
    };

    let currentSection = 'unknown';

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check if line is a section header (heuristic: short length + matching keyword)
        // We look for strict matches to avoid false positives inside paragraphs
        if (trimmed.length < 50) {
            let foundHeader = false;
            for (const [key, regex] of Object.entries(SECTIONS)) {
                if (regex.test(trimmed)) {
                    currentSection = key;
                    foundHeader = true;
                    break;
                }
            }
            if (foundHeader) continue; // Don't add the header itself to the content? Or maybe we should? User didn't specify. Let's skip header to keep content clean.
        }

        sections[currentSection].push(trimmed);
    }

    // Join arrays back to strings
    const result = {};
    for (const key of Object.keys(sections)) {
        result[key] = sections[key].join('\n');
    }

    // If specific sections are empty, user said "Missing sections should contribute a score of 0"
    // We return empty keys so embedding service handles them (generates 0 or skip).
    return result;
}

/**
 * Standard Text Cleaning: Lowercase, Stopword removal, Lemmatization, Normalize aliases.
 * @param {string} text 
 * @returns {string} Cleaned text
 */
function cleanText(text) {
    if (!text) return "";

    // 1. Lowercasing
    let cleaned = text.toLowerCase();

    // 2. Normalize Aliases (Basic list, can be expanded)
    cleaned = cleaned
        .replace(/\bjs\b/g, "javascript")
        .replace(/\bts\b/g, "typescript")
        .replace(/\bpy\b/g, "python")
        .replace(/\bai\b/g, "artificial intelligence")
        .replace(/\bml\b/g, "machine learning")
        .replace(/\breact\.js\b/g, "react")
        .replace(/\bnode\.js\b/g, "node");

    // 3. Tokenization
    const tokens = tokenizer.tokenize(cleaned);

    // 4. Stopword Removal & 5. Lemmatization (Stemming)
    // We retain numeric tokens as requested (years, percentages)
    const processedTokens = tokens.filter(token => {
        // Retain numbers (basic check)
        if (/^[\d\.,]+%?$/.test(token)) return true;

        // Remove stopwords (natural has a list, but we can stick to a simpler logic or use natural's)
        // natural.stopwords is not directly exposed in all versions, let's use a small set or assuming tokenizer handles some.
        // Actually stemmer.stem() is what we want for "lemmatization" proxy.
        // Let's filter common stopwords explicitly first.
        const stopWords = new Set(['and', 'the', 'is', 'in', 'at', 'of', 'for', 'to', 'a', 'an', 'with', 'on']);
        if (stopWords.has(token)) return false;

        return true;
    }).map(token => {
        // Don't stem numbers
        if (/^[\d\.,]+%?$/.test(token)) return token;
        return stemmer.stem(token);
    });

    return processedTokens.join(' ');
}

module.exports = { parseSections, cleanText };
