
const fs = require('fs');
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyB2RTzgiiFKiIl5jLX2wEWiuNbMaLEdcUg";
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function run() {
    try {
        const res = await fetch(URL);
        if (!res.ok) {
            console.error("HTTP Error:", res.status, res.statusText);
            return;
        }
        const data = await res.json();
        if (data.models) {
            fs.writeFileSync('models_full.json', JSON.stringify(data.models, null, 2));
            console.log("Success: Written to models_full.json");
        } else {
            console.log("No 'models' array found.");
        }
    } catch (err) {
        console.error("Fetch Exception:", err);
    }
}

run();
