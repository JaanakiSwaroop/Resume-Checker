/**
 * Generates a cover letter based on a template.
 * @param {string} candidateName - Name of the candidate (optional, placeholder if missing).
 * @param {string} jobRole - The role applying for (extracted or provided).
 * @param {string} companyName - The company name (optional).
 * @param {Array<string>} topSkills - Top matching skills found.
 * @returns {string} - The generated cover letter text.
 */
function generateCoverLetter(candidateName, jobRole, companyName, topSkills) {
    const name = candidateName || "[Your Name]";
    const role = jobRole || "[Job Title]";
    const company = companyName || "[Company Name]";

    // Choose top 3 skills or placeholders
    const skillsText = topSkills && topSkills.length >= 3
        ? `My experience with ${topSkills[0]}, ${topSkills[1]}, and ${topSkills[2]} makes me a strong candidate.`
        : "My technical skills and experience align well with the requirements of this role.";

    return `
${name}
[Your Address]
[Your Phone Number]
[Your Email]

[Date]

Hiring Manager
${company}
[Company Address]

Dear Hiring Manager,

I am writing to express my strong interest in the ${role} position at ${company}. With my background in software development and my passion for building efficient, scalable applications, I am confident in my ability to contribute effectively to your team.

${skillsText}

In my previous roles, I have demonstrated the ability to learn quickly and adapt to new challenges. I am excited about the opportunity to bring my expertise to ${company} and help achieve your goals.

Thank you for considering my application. I look forward to the possibility of discussing how my skills and experience align with your needs.

Sincerely,

${name}
  `.trim();
}

module.exports = { generateCoverLetter };
