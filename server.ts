import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize GoogleGenAI server-side securely. Use standard user-agent header.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Vetting and Career Advice Endpoint
app.post('/api/ai/coach', async (req: Request, res: Response): Promise<void> => {
  try {
    const { candidateName, resumeText, jdText } = req.body;

    if (!resumeText || !jdText) {
      res.status(400).json({ error: 'Missing resume or job description content.' });
      return;
    }

    const systemInstruction = `You are an expert Talent Acquisition Consultant and Career Coach specialized in the Indian Software Ecosystem. 
    Analyze the provided candidate's resume text against the Job Description. Write a highly analytical, specific, and actionable summary in JSON format.
    Do NOT mention file names, paths, or code variables. Focus entirely on the candidate's career fit, strengths, and Indian-market career pathway suggestions.
    Response must be valid JSON matching this schema:
    {
      "executiveSummary": "A concise 3-sentence professional summary of candidate fit.",
      "culturalFitScore": 85, // out of 100
      "topStrengths": ["Strength 1 with details", "Strength 2 with details"],
      "learningCurriculum": ["Highly specific certification or roadmap to bridge skill gaps in India"],
      "resumeImprovementTips": ["Specific tweak 1", "Specific tweak 2"]
    }`;

    const promptText = `
    Candidate Name: ${candidateName || "Candidate"}
    
    Resume Content:
    ${resumeText}
    
    Target Job Description:
    ${jdText}
    `;

    // Query Gemini 3.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    res.json(parsedResponse);
  } catch (error: any) {
    console.error('Gemini Coaching API failed:', error);
    res.status(500).json({ 
      error: 'Gemini coaching pipeline error', 
      details: error.message || error 
    });
  }
});

// Service entry point wrapping Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
