/**
 * Analyzes the resume text against the job description.
 * @param {string} resumeText - The text extracted from the resume.
 * @param {string} jobDescription - The job description text.
 * @returns {Object} - The analysis result containing score and matches.
 */
function analyzeResume(resumeText, jobDescription) {
    if (!resumeText || !jobDescription) {
        return { score: 0, matches: [], missing: [] };
    }

    const cleanText = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

    const resumeTokens = new Set(cleanText(resumeText).split(/\s+/));
    const jdTokens = cleanText(jobDescription).split(/\s+/);

    // Expanded stop words list to reduce noise
    const stopWords = new Set([
        'and', 'the', 'is', 'in', 'at', 'of', 'for', 'to', 'a', 'an', 'with', 'on', 'as',
        'by', 'this', 'that', 'are', 'was', 'were', 'be', 'been', 'being', 'it', 'or', 'if',
        'but', 'not', 'so', 'can', 'could', 'will', 'would', 'should', 'have', 'has', 'had',
        'do', 'does', 'did', 'from', 'up', 'down', 'out', 'about', 'into', 'over', 'after',
        'like', 'basis', 'daily', 'weekly', 'monthly', 'small', 'large', 'good', 'bad',
        'excellent', 'strong', 'working', 'work', 'job', 'role', 'position', 'experience',
        'team', 'skills', 'ability', 'able', 'knowledge', 'understanding', 'proficiency',
        'proficient', 'using', 'used', 'use', 'various', 'other', 'such', 'more', 'less',
        'than', 'then', 'when', 'where', 'how', 'what', 'who', 'why', 'all', 'any', 'some',
        'many', 'much', 'few', 'own', 'your', 'my', 'our', 'their', 'his', 'her', 'its',
        'we', 'you', 'he', 'she', 'they', 'me', 'us', 'them', 'him', 'year', 'years',
        'time', 'day', 'days', 'required', 'preferred', 'qualification', 'qualifications',
        'ensure', 'ensuring', 'responsible', 'responsibility', 'responsibilities', 'duties',
        'support', 'supporting', 'maintain', 'maintaining', 'develop', 'developing',
        'create', 'creating', 'design', 'designing', 'implement', 'implementing',
        'perform', 'performing', 'provide', 'providing', 'assist', 'assisting',
        'participate', 'participating', 'contribute', 'contributing', 'manage', 'managing',
        'across', 'through', 'within', 'during', 'since', 'per', 'via', 'etc', 'eg', 'ie',
        'candidate', 'applicants', 'application', 'status', 'employment', 'opportunity',
        'employer', 'equal', 'action', 'qualified', 'plus', 'must', 'need', 'needs',
        'looking', 'seeking', 'want', 'wants', 'desire', 'desired', 'ideal', 'best'
    ]);

    const keywords = jdTokens.filter(token => {
        // Filter out short words (unless they are tech acronyms like 'go', 'c', 'r' - tough to distinguish without list, 
        // but length > 2 is a safe heuristic for general text)
        if (token.length < 3 && token !== 'c' && token !== 'r' && token !== 'go' && token !== 'ai' && token !== 'ui' && token !== 'ux') {
            return false;
        }
        // Filter out stop words
        if (stopWords.has(token)) return false;
        // Filter out numbers
        if (/^\d+$/.test(token)) return false;

        return true;
    });

    const uniqueKeywords = [...new Set(keywords)];

    let matchCount = 0;
    const matches = [];
    const missing = [];

    uniqueKeywords.forEach(keyword => {
        if (resumeTokens.has(keyword)) {
            matchCount++;
            matches.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    const score = uniqueKeywords.length > 0
        ? Math.round((matchCount / uniqueKeywords.length) * 100)
        : 0;

    return {
        score,
        matches,
        missing: missing.slice(0, 20), // Limit missing keywords to top 20 to avoid overwhelming UI
        totalKeywords: uniqueKeywords.length
    };
}

module.exports = { analyzeResume };
