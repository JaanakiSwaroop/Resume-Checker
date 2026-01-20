# Deployment Instructions (Unified)

You can deploy the entire application as a **single Web Service** on Render.

## Steps

1. **Push to GitHub**: Ensure your latest code is pushed.
2. **Create New Web Service** on Render.
3. **Connect Repository**: Select your repo.
4. **Configuration**:
    - **Name**: `resume-checker` (or similar)
    - **Root Directory**: `.` (Leave empty or set to root)
    - **Environment**: `Node`
    - **Build Command**: `cd client && npm install && npm run build && cd ../server && npm install`
    - **Start Command**: `node server/index.js`
5. **Environment Variables** (Add these in Render Dashboard):
    - `GEMINI_API_KEY`: Your Google AI Key
    - `OPENAI_API_KEY`: Your OpenAI API Key
    - `NODE_ENV`: `production`

The server will automatically build the frontend, serve it, and handle API requests on the same URL!
