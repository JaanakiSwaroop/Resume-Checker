import axios from 'axios';

// If no VITE_API_URL is set, default to '' (empty string) to use the same host as the frontend
// This enables "Unified Deployment" where backend serves frontend.
const API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
    analyzeResume: async (file, jobDescription, provider = 'gemini') => {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        formData.append('provider', provider);

        const response = await axios.post(`${API_URL}/analyze`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    generateCoverLetter: async (data) => {
        const response = await axios.post(`${API_URL}/generate/cover-letter`, data);
        return response.data;
    },
};
