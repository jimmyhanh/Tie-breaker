import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ---------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------

app.post("/api/analyze", async (req, res) => {
  const { title, context, analysisType, options } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Decision title is required" });
  }

  try {
    const ai = getGeminiClient();
    const modelName = "gemini-3.5-flash";

    let responseSchema: any;
    let systemInstruction = "";
    let prompt = "";

    if (analysisType === "PROS_CONS") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "A unique slug, e.g. cost_impact or career_growth" },
                text: { type: Type.STRING, description: "Short, snappy title of the pro or con" },
                isPro: { type: Type.BOOLEAN, description: "true if it is a Pro (advantage/positive factor), false if it is a Con (disadvantage/negative factor)" },
                impact: { type: Type.INTEGER, description: "Importance rating of this factor on a scale of 1 (minor details) to 5 (critical/dealbreaker)" },
                category: { type: Type.STRING, description: "Grouping category, e.g. Financial, Career, Emotional, Time, Health, Social" },
                explanation: { type: Type.STRING, description: "A 1-2 sentence detailed reason or advice regarding this item" }
              },
              required: ["id", "text", "isPro", "impact", "category", "explanation"]
            }
          },
          verdict: { type: Type.STRING, description: "Deep actionable advice on how to proceed. Offer a clear framework for weighing these specific points." },
          confidence: { type: Type.INTEGER, description: "Model confidence percentage (1-100) in this analysis" },
          summary: { type: Type.STRING, description: "A concise 1-2 sentence executive summary of the pros vs cons trade-offs" }
        },
        required: ["items", "verdict", "confidence", "summary"]
      };

      systemInstruction = "You are a professional decision analyst and executive advisor. Your goal is to dissect a decision into distinct, highly objective, and realistic pros and cons. Be thorough, balanced, and identify non-obvious long-term advantages and hidden risks. Classify under clear categories, weight each item honestly, and supply solid justifications.";
      
      prompt = `Please analyze the following decision:
Decision Topic: "${title}"
Additional Context: ${context || "None provided"}

Generate a balanced list of at least 6-8 comprehensive pros and cons with clear impact weights (1 to 5), grouping categories, and concise explanations. Also provide a summary and a detailed advisor verdict.`;

    } else if (analysisType === "COMPARISON") {
      const parsedOptions = options && Array.isArray(options) && options.length >= 2 ? options : ["Option A", "Option B"];

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          criteriaList: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Unique snake-case ID, e.g., skill_alignment" },
                name: { type: Type.STRING, description: "Criteria name, e.g., Cost, Flexibility, Career Impact, Emotional Health" },
                weight: { type: Type.INTEGER, description: "How important this criteria is generally on a scale from 1 (low) to 5 (essential)" },
                ratings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      optionName: { type: Type.STRING, description: "Name of the option evaluated" },
                      rating: { type: Type.INTEGER, description: "Score from 1 (very bad) to 5 (excellent)" },
                      description: { type: Type.STRING, description: "Brief rationale explaining why this option got this rating for this criteria" },
                      pros: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Up to 2 bullet pros for this option on this criteria"
                      },
                      cons: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Up to 2 bullet cons for this option on this criteria"
                      }
                    },
                    required: ["optionName", "rating", "description", "pros", "cons"]
                  }
                }
              },
              required: ["id", "name", "weight", "ratings"]
            }
          },
          verdict: { type: Type.STRING, description: "In-depth qualitative comparison explaining the key trade-offs between the choices and why one might be favored." },
          winningOption: { type: Type.STRING, description: "The name of the exact option that represents the best choice overall based on the evaluation." },
          summary: { type: Type.STRING, description: "A high-level executive summary summarizing the core distinction between the compared options." }
        },
        required: ["criteriaList", "verdict", "winningOption", "summary"]
      };

      systemInstruction = "You are a professional comparative analyst. Your job is to objectively evaluate 2 or more distinct options across multiple structured dimensions/criteria. Identify 4-6 essential criteria relevant to the topic, rate each option fairly (1 to 5), justify each rating, and recommend a clear winning choice with strategic explanations.";

      prompt = `Compare the following options for this decision:
Decision: "${title}"
Options: ${JSON.stringify(parsedOptions)}
Context: ${context || "None provided"}

Provide a comprehensive, objective criteria-by-criteria rating matrix comparing each option, plus a robust final verdict recommending a clear winner.`;

    } else if (analysisType === "SWOT") {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          strengths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING, description: "Snappy Strength statement (Internal advantage)" },
                explanation: { type: Type.STRING, description: "Detailed explanation of how this is a strength" },
                priority: { type: Type.STRING, description: "High, Medium, or Low priority/impact" }
              },
              required: ["id", "text", "explanation", "priority"]
            }
          },
          weaknesses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING, description: "Snappy Weakness statement (Internal constraint or gap)" },
                explanation: { type: Type.STRING, description: "Detailed explanation of this vulnerability" },
                priority: { type: Type.STRING, description: "High, Medium, or Low" }
              },
              required: ["id", "text", "explanation", "priority"]
            }
          },
          opportunities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING, description: "External positive opportunity to capitalize on" },
                explanation: { type: Type.STRING, description: "Why this opportunity exists and how it could benefit the decision maker" },
                priority: { type: Type.STRING, description: "High, Medium, or Low" }
              },
              required: ["id", "text", "explanation", "priority"]
            }
          },
          threats: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING, description: "External threat, risk, or competitive challenge" },
                explanation: { type: Type.STRING, description: "The nature of this threat and what makes it risky" },
                priority: { type: Type.STRING, description: "High, Medium, or Low" }
              },
              required: ["id", "text", "explanation", "priority"]
            }
          },
          strategies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                quadrant: { type: Type.STRING, description: "The main category this strategy relates to: Strengths, Weaknesses, Opportunities, or Threats" },
                title: { type: Type.STRING, description: "Short strategic recommendation title" },
                description: { type: Type.STRING, description: "Strategic action statement linking internal and external factors (e.g. how to use strengths to seize opportunities, or mitigate weaknesses against threats)" },
                strategyType: { type: Type.STRING, description: "Strategic posture, e.g. Leverage Strengths, Combat Vulnerabilities, Seize Growth, Buffer Risks" }
              },
              required: ["id", "quadrant", "title", "description", "strategyType"]
            }
          },
          verdict: { type: Type.STRING, description: "Actionable strategic summary outlining how the decision-maker should navigate internal qualities and external environments." },
          summary: { type: Type.STRING, description: "Brief executive summary summarizing the SWOT profile." }
        },
        required: ["strengths", "weaknesses", "opportunities", "threats", "strategies", "verdict", "summary"]
      };

      systemInstruction = "You are a professional business planner and strategic framework specialist. Your goal is to construct a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for a personal or professional decision. Identify internal assets/vulnerabilities and external prospects/risks. Synthesize these into highly specific cross-dimensional action strategies (e.g. offensive or defensive maneuvers).";

      prompt = `Conduct a rigorous SWOT analysis for the following decision:
Decision topic: "${title}"
Context & Details: ${context || "None provided"}

Include at least 3 items in each of the 4 quadrants (Strengths, Weaknesses, Opportunities, Threats), along with 4-6 custom strategic recommendations.`;
    } else {
      return res.status(400).json({ error: "Invalid analysisType" });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2, // Low temperature for high objectivity and consistency
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No output text received from Gemini.");
    }

    const analysisData = JSON.parse(text);
    res.json(analysisData);

  } catch (err: any) {
    console.error("Gemini Analysis Error:", err);
    res.status(500).json({
      error: "Analysis failed",
      details: err.message || String(err),
    });
  }
});

// Serve health status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Setup Vite Dev server or static asset production build serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Tiebreaker Server running on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
