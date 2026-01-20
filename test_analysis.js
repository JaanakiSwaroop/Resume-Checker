
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function testAnalysis() {
    try {
        // 1. Create a dummy PDF file
        const dummyPdfPath = path.join(__dirname, 'dummy_resume.pdf');
        // In a real scenario, we'd content-create a valid PDF, but for this quick test, 
        // we'll try to rely on fs.writeFileSync to write a minimal PDF or just use a text file masquerading?
        // Actually, 'pdf-parse' might fail on invalid PDF. 
        // Let's assume we can create a minimalist valid PDF or just upload a text file if we supported it.
        // Since our parser supports Docx/PDF, let's try to mock a request differently or rely on just unit testing the services.
        // Better yet: Create a unit test for the service itself first, then integration test.

        console.log("Skipping full integration test via script for now to avoid PDF generation complexity.");
        console.log("Instead, I will run a unit test on the analyzer service directly.");

        const { analyzeResume } = require('./server/services/analyzer');
        const resumeText = "I am a software engineer with experience in React and Node.js. I love coding.";
        const jd = "Looking for a software engineer proficient in React and Node.js.";

        const result = analyzeResume(resumeText, jd);
        console.log("Analysis Result:", JSON.stringify(result, null, 2));

        if (result.score > 0) {
            console.log("SUCCESS: Analysis service returned a score.");
        } else {
            console.error("FAILURE: Analysis service returned 0 score.");
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testAnalysis();
