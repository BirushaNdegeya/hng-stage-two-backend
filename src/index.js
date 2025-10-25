import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { getFact } from "./utils/get-fact.js";

const app = express();
app.use(cors()); // Enable CORS for all routes

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again later."
  }
});
app.use(limiter);

dotenv.config({ quiet: true });
const port = process.env.PORT || 3000;
const base = process.env.FUN_FACT_API || 'https://catfact.ninja';
app.get("/", function (req, res) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`);
  res.status(200).json({
    message: "HNG Stage Zero Backend Task API is running 🚀",
    nextStep: "Go to /me endpoint to view profile with dynamic cat facts",
    documentation: "Check README for API usage guidelines",
  });
});

app.get("/me", async function (req, res) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`);
  try {
    const fact = await getFact(base);
    const timestamp = new Date().toISOString();
    res.status(200).json({
      status: "success",
      user: {
        email: "birushandegeya@gmail.com",
        name: "Birusha Ndegeya",
        stack: "Node.js/Express",
      },
      timestamp: timestamp,
      fact: fact,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in /me endpoint:`, error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch cat fact",
    });
  }
});

// Export the app for Vercel
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, function () {
    console.log(`
========================================
APP [STATUS:RUNNING] ON PORT ::: ${port}
========================================
    `);
  });
}
