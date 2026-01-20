# System Overview: Resume Checker

## Functionality
The Resume Checker is a web-based application designed to help job seekers optimize their resumes. It provides three main functions:

1.  **Resume Analysis**:
    *   **Input**: User uploads a resume (PDF or DOCX) and pastes a Job Description (text).
    *   **Analysis**: The system extracts text from the uploaded file and compares it against the job description using a keyword matching algorithm.
    *   **Output**: A compatibility score (0-100%) and a breakdown of "Matched" vs "Missing" keywords.

2.  **Suggestions**:
    *   Based on the analysis, the system generates actionable advice.
    *   It identifies specific high-value keywords used in the job description that are missing from the resume.
    *   It provides general formatting and content structure tips if the score is low.

3.  **Cover Letter Generation**:
    *   Uses the extracted candidate skills and the provided job details to draft a professional cover letter.
    *   The generated letter is template-based, ensuring a clean and formal structure suitable for most applications.

## Technical Architecture

### Tech Stack
*   **Frontend**: React (Vite)
    *   Fast, modern web framework for the user interface.
    *   Styling: Custom CSS (Responsive, Clean UI).
    *   HTTP Client: Axios.
*   **Backend**: Node.js + Express
    *   REST API to handle analysis and generation requests.
    *   **File Parsing**: 
        *   `pdf-parse`: Extracts raw text from PDF files.
        *   `mammoth`: Extracts raw text from DOCX files.
    *   **Uploads**: `multer` handles multipart/form-data file uploads in memory.
*   **Algorithm**:
    *   **Keyword Matching**: Deterministic algorithm.
    *   **Normalization**: Text is converted to lowercase, special characters are removed, and text is tokenized.
    *   **Filtering**: A robust "stop-word" list is used to remove common English words (e.g., "the", "and", "daily", "responsible") to focus on professional/technical keywords.
    *   **Scoring**: `(Matches / Total Unique Keywords in JD) * 100`.

### Data Flow
1.  **Client** sends `POST /analyze` with file and text.
2.  **Server** receives file in memory map.
3.  **Server** identifies mimetype:
    *   If PDF -> `pdf-parse`.
    *   If DOCX -> `mammoth`.
4.  **Server** runs `analyzeResume()` service:
    *   Tokenizes both texts.
    *   Filters stop words.
    *   Computes intersection of sets.
5.  **Server** returns JSON object: `{ score, matches, missing, suggestions }`.
6.  **Client** displays results and offers "Draft Cover Letter".
7.  **Client** sends `POST /generate/cover-letter` (optional step).
8.  **Server** fills template and returns string.

## Running the Project
The project uses `concurrently` to run both client and server from the root.

```bash
# In the root directory
npm run dev
```

*   **Client**: http://localhost:5173
*   **Server**: http://localhost:3000
