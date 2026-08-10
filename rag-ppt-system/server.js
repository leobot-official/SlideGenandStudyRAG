import express from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module'; // <-- Add this

const require = createRequire(import.meta.url); // <-- Add this
const pdfParse = require('pdf-parse');          // <-- Import via require

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

let activePDFText = "";

const verifyFaculty = (req, res, next) => {
  const code = req.headers['x-faculty-code'];
  if (code !== process.env.FACULTY_PASSCODE) {
    return res.status(403).json({ error: "Unauthorized access to Faculty Module." });
  }
  next();
};

// Upload PDF Endpoint
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded.' });
    const parsed = await pdfParse(req.file.buffer);
    activePDFText = parsed.text;
    res.json({ message: 'PDF parsed successfully!', textLength: activePDFText.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process PDF file.' });
  }
});

// Student Ask AI Endpoint (Groq Llama 3.3)
app.post('/api/ask-ai', async (req, res) => {
  const { question, marks } = req.body;
  if (!activePDFText) {
    return res.status(400).json({ error: 'No study material PDF uploaded yet.' });
  }

  let promptInstructions = `You are an academic AI assistant. Use the provided study notes text to answer the student's question accurately.`;
  if (marks) {
    promptInstructions += ` Format the response specifically as a ${marks}-mark question answer with clear bullet points and structured headings.`;
  } else {
    promptInstructions += ` Provide a simple, clear, and concise explanation.`;
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: promptInstructions },
        { 
          role: 'user', 
          content: `Study Notes Content:\n${activePDFText.slice(0, 25000)}\n\nQuestion: ${question}` 
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    });

    const answer = chatCompletion.choices[0]?.message?.content || "No answer generated.";
    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate answer from Groq AI.' });
  }
});

// Faculty PPT Generation Endpoint (Groq JSON Mode)
app.post('/api/faculty/generate-ppt', verifyFaculty, async (req, res) => {
  const { topicText } = req.body;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a presentation outline generator. Respond ONLY with valid JSON array format. Do not add conversational text or markdown formatting.
Expected format:
[
  { "title": "Slide Title", "bullets": ["Point 1", "Point 2", "Point 3"] }
]`
        },
        { role: 'user', content: `Generate presentation slides from this content:\n${topicText}` }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: "json_object" }, // Ensures structured output
      temperature: 0.2,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "[]";
    const parsedData = JSON.parse(responseText);
    
    // Extract array if wrapped inside an object
    const slides = Array.isArray(parsedData) ? parsedData : (parsedData.slides || []);
    res.json({ slides });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate presentation structure via Groq.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
