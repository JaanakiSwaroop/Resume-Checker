const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts text from a file buffer based on mimetype.
 * @param {Buffer} buffer - The file buffer.
 * @param {string} mimetype - The mime type of the file.
 * @returns {Promise<string>} - The extracted text.
 */
async function parseFile(buffer, mimetype) {
    try {
        if (mimetype === 'application/pdf') {
            const data = await pdf(buffer);
            return data.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else {
            console.log('Unsupported mimetype:', mimetype);
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        console.error('Error parsing file:', error);
        throw new Error('Failed to parse file content: ' + error.message);
    }
}

module.exports = { parseFile };
