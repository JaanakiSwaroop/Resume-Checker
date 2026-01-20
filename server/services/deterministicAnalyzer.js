const { parseSections, cleanText } = require('./sectionParser');
const { getEmbedding } = require('./embedding');
const { calculateScore } = require('./scoring');

/**
 * Main Deterministic Analyzer Function
 */
async function analyzeDeterministic(resumeFullText, jdFullText, applicantType = 'student') {
    // 1. Parse & Sectioning
    const resumeSections = parseSections(resumeFullText);
    const jdSections = parseSections(jdFullText);

    // 2. Prepare Data Structure
    const resumeData = {
        textSections: resumeSections,
        cleanedSections: {}
    };
    const jdData = {
        textSections: jdSections,
        cleanedSections: {}
    };

    // Clean text for all sections
    const sections = ['skills', 'experience', 'projects', 'education', 'certifications'];

    sections.forEach(sec => {
        resumeData.cleanedSections[sec] = cleanText(resumeSections[sec]);
        jdData.cleanedSections[sec] = cleanText(jdSections[sec]);
    });

    // 3. Generate Embeddings (Parallel)
    const embeddings = {
        resume: {},
        jd: {}
    };

    // Helper to fetch valid embedding or zero-vector equivalent (handled by similarity check returning 0 if null)
    const fetchEmb = async (text) => await getEmbedding(text);

    // Create array of promises: [ [sec, 'resume', prom], [sec, 'jd', prom], ... ]
    const promises = [];

    for (const sec of sections) {
        // Only fetch if text exists
        if (resumeData.cleanedSections[sec]) {
            promises.push(fetchEmb(resumeData.cleanedSections[sec]).then(res => embeddings.resume[sec] = res));
        } else {
            embeddings.resume[sec] = null;
        }

        if (jdData.cleanedSections[sec]) {
            promises.push(fetchEmb(jdData.cleanedSections[sec]).then(res => embeddings.jd[sec] = res));
        } else {
            embeddings.jd[sec] = null;
        }
    }

    await Promise.all(promises);

    // 4. Scoring
    const scoreResult = calculateScore(resumeData, jdData, embeddings, applicantType);

    // 5. Formatting Output matches existing UI expectations where possible
    // The UI expects: score (number), matches (array), missing (array), suggestions (array)
    // We need to map our detailed result to this flat structure or update UI.
    // For now, mapping to flat structure + extra 'details' field.

    // 5. Formatting Output matches existing UI expectations
    // Populate matches and missing from the skill coverage details
    let matches = [];
    let missing = [];

    if (scoreResult.skillCoverage) {
        // We need the sets again to diff them. 
        // Ideally scoring.js defines this, but let's re-extract or pass them out.
        // For simplicity, let's just re-extract here or rely on scoring.js to return sets (but sets aren't JSON serializable easily).
        // Let's modify logic to extraction here or just do it again.
        // Re-extracting for display purposes:
        const { extractExplicitSkills } = require('./scoring');
        const resumeSkills = extractExplicitSkills(resumeData.textSections.skills);
        const jdSkills = extractExplicitSkills(jdData.textSections.skills);

        matches = [...jdSkills].filter(s => resumeSkills.has(s));
        missing = [...jdSkills].filter(s => !resumeSkills.has(s));
    }

    return {
        score: scoreResult.finalScore,
        matches: matches,
        missing: missing,
        suggestions: scoreResult.penalties.map(p => p.reason),
        details: scoreResult
    };
}

module.exports = { analyzeDeterministic };
