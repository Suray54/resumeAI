import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API endpoints
  app.post('/api/ai/enhance', async (req, res) => {
    try {
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'resumeai' } }
      });
      
      const { text, type, context } = req.body;
      let prompt = '';
      
      switch(type) {
        case 'summary':
          prompt = `Improve this professional summary for a resume: "${text}". Make it concise, punchy, and highlight achievements. Keep it factual to the original text. Return only the improved text.`;
          break;
        case 'job-description':
          prompt = `Enhance this job description making it ATS-friendly and action-oriented: "${text}". Context about position: ${context || 'None'}. Return only the improved text, without quoting or formatting blocks.`;
          break;
        case 'rewrite':
          prompt = `Rewrite this professionally for a resume: "${text}". Make it sound professional, clear, and impactful. Return only the improved text.`;
          break;
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      res.json({ result: response.text?.trim() });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/ai/extract', upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'resumeai' } }
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: req.file.buffer.toString('base64'),
              mimeType: req.file.mimetype,
            }
          },
          "Extract the resume data from this PDF into the JSON schema provided."
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              personalInfo: {
                type: Type.OBJECT,
                properties: {
                  fullName: { type: Type.STRING },
                  jobTitle: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  website: { type: Type.STRING },
                  address: { type: Type.STRING }
                }
              },
              summary: { type: Type.STRING },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    position: { type: Type.STRING },
                    startDate: { type: Type.STRING, description: "Format: YYYY-MM or 'Present'" },
                    endDate: { type: Type.STRING, description: "Format: YYYY-MM or 'Present'" },
                    current: { type: Type.BOOLEAN },
                    description: { type: Type.STRING }
                  }
                }
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    link: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });
      
      let parsed = {};
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (e) {
        console.error("JSON parse error:", response.text);
      }
      
      res.json(parsed);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Fallback JSON error handler for any uncaught express errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
