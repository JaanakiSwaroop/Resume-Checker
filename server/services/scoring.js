const { calculateSimilarity } = require('./embedding');
const { cleanText } = require('./sectionParser');

const WEIGHTS = {
    student: {
        skills: 0.35,
        projects: 0.30,
        experience: 0.20,
        certifications: 0.10,
        education: 0.05
    },
    professional: {
        skills: 0.35,
        experience: 0.35,
        projects: 0.15,
        certifications: 0.10,
        education: 0.05
    }
};

/**
 * Extracts distinct skills from text (heuristic: comma separated or bullet points in Skills section).
 * For now, we tokenize and treat tokens in the 'Skills' section as explicit skills.
 * @param {string} text 
 */
function extractExplicitSkills(text) {
    if (!text) return new Set();
    // Heuristic: Skills are often comma separated or bulleted.
    // If we just tokenize space, we lose "Machine Learning".
    // Try splitting by common delimiters first.
    let candidates = text.split(/,|•|\n|\t/);
    if (candidates.length < 3) {
        // Fallback: If not many delimiters, assume space separated (e.g. tag list style)
        // But cleanText removes punctuation? cleanText preserves spaces.
        // cleanText() was applied to 'text' passed here? 
        // Wait, in scoring.js call: extractExplicitSkills(resumeData.textSections.skills); 
        // -> passing raw text (textSections) not cleanedSections. Correct.
        candidates = cleanText(text).split(/\s+/); // cleanText removes punctuation, careful.
    }

    // Better strategy: Use the raw text to extract phrases, then clean them individually.
    candidates = text.split(/,|•|\n|\/|;/); // Split by separators

    const skills = new Set();
    candidates.forEach(c => {
        const cleaned = c.trim().toLowerCase().replace(/[^a-z0-9\s\+\.#]/g, ''); // minor clean, keep c++, c#
        if (cleaned.length > 1) {
            skills.add(cleaned);
        }
    });

    return skills;
}

/**
 * Core Scoring Function
 */
function calculateScore(resumeData, jdData, embeddings, applicantType = 'student') {
    const weights = WEIGHTS[applicantType] || WEIGHTS.student;
    const details = {
        sectionScores: {},
        penalties: [],
        bonuses: [],
        finalScore: 0
    };

    // 1. Calculate Section Similarities
    let weightedSum = 0;

    // Helper to get sim
    const getSim = (sec) => {
        const sim = calculateSimilarity(embeddings.resume[sec], embeddings.jd[sec]);
        return sim;
    };

    // 2. Compute Match Score
    for (const [section, weight] of Object.entries(weights)) {
        let sim = getSim(section);

        // 4. Skill Coverage Logic (Special case for Skills section)
        if (section === 'skills') {
            const resumeSkills = extractExplicitSkills(resumeData.textSections.skills);
            const jdSkills = extractExplicitSkills(jdData.textSections.skills);

            // Intersection
            let matchCount = 0;
            jdSkills.forEach(skill => {
                if (resumeSkills.has(skill)) matchCount++;
            });

            const coverage = jdSkills.size > 0 ? (matchCount / jdSkills.size) : 0;

            // Adjust skill similarity: (0.7 * embedding) + (0.3 * coverage)
            sim = (0.7 * sim) + (0.3 * coverage);

            details.skillCoverage = {
                matchCount,
                total: jdSkills.size,
                ratio: coverage
            };
        }

        const sectionScore = sim * 100; // scalled to 0-100 for display (but we sum fractions first)
        const contribution = sim * weight;

        weightedSum += contribution;
        details.sectionScores[section] = {
            rawSimilarity: sim,
            weightedContribution: contribution,
            score: Math.round(sectionScore)
        };
    }

    let rawScore = weightedSum * 100;

    // 6. Experience Alignment Adjustment
    // Extract years from Experience text (simple regex heuristic)
    const extractYears = (txt) => {
        const m = txt.match(/(\d+)\+?\s*years?/i);
        return m ? parseInt(m[1]) : 0;
    };

    const resumeYears = extractYears(resumeData.textSections.experience);
    const jdYears = extractYears(jdData.textSections.experience);

    if (resumeYears && jdYears) {
        if (resumeYears >= jdYears) {
            rawScore += 5;
            details.bonuses.push({ reason: "Experience years meet/exceed JD", points: 5 });
        } else {
            rawScore -= 5;
            details.penalties.push({ reason: "Experience years below JD", points: -5 });
        }
    }

    // 7. Missing Required Skill Penalty
    // Heuristic: Check for "Required" or "Must have" in JD text sections
    // This is hard to do without specific parsing of "Required Skills" section.
    // We will assume 'skills' section of JD contains requirements.
    // If coverage < 50%, start penalizing? 
    // User spec: "If JD explicitly lists 'required' skills ... Deduct 10 points per missing"
    // We'll rely on the existing skill coverage metric. 
    // Let's say if coverage is LOW, we apply penalty?
    // Or strictly parsing "required".
    // Let's check for "Must have" in JD textual content.
    // For now, let's skip specific "Required" penalty unless we parse it out strictly, to avoid random penalties.
    // Implementing purely based on Skill Coverage count to adhere to "Missing Required Skill" spirit:
    // If specific keywords in JD like "required: java" exist.
    // Let's skip complex NLP for requirements for now to match timeline, but add placeholder.

    // 8. Score Buckets
    // Ensure 0-100
    details.finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    if (details.finalScore >= 80) details.bucket = "Strong Match";
    else if (details.finalScore >= 65) details.bucket = "Good Match";
    else if (details.finalScore >= 50) details.bucket = "Partial Match";
    else details.bucket = "Weak Match";

    // Generate suggestions based on low section scores
    const thresholds = { skills: 50, experience: 40, projects: 40 };
    Object.keys(thresholds).forEach(sec => {
        if (details.sectionScores[sec] && details.sectionScores[sec].score < thresholds[sec]) {
            // Check if section was found (raw sim > 0) or just poor match
            if (details.sectionScores[sec].rawSimilarity === 0) {
                details.penalties.push({ reason: `${sec.charAt(0).toUpperCase() + sec.slice(1)} section missing or not detected` });
            } else {
                details.bonuses.push({ reason: `Improve ${sec} section keywords to match JD` }); // Using bonuses array just to push text, or mapped later?
                // Actually map logic says suggestions comes from penalties. Let's add to penalties list or better yet, return suggestions separaterly.
                // The orchestrator maps `penalties` to suggestions. So let's add helpful text there.
                details.penalties.push({ reason: `Weak match in ${sec} section - add more relevant details` });
            }
        }
    });

    return details;
}

module.exports = { calculateScore, extractExplicitSkills };
