const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');

app.use(cors());
app.use(express.json());

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../client/dist')));

const analyzeRoute = require('./routes/analyze');
const generateRoute = require('./routes/generate');

app.use('/analyze', analyzeRoute);
app.use('/generate', generateRoute);

// Catch-all handler for any request that doesn't match the above
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
