import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { CountryModel } from "./models/country.js";
import { fetchCountries, processCountries } from "./utils/fetchCountries.js";
import { fetchExchangeRates } from "./utils/fetchRates.js";
import { generateSummaryImage } from "./utils/generateImage.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// Initialize database
(async () => {
  try {
    await CountryModel.createTable();
    console.log("Database table initialized");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
})();

dotenv.config({ quiet: true });
const port = process.env.PORT || 3000;

app.get("/", function (req, res) {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`
  );
  res.status(200).json({
    message: "HNG Stage Two Backend Task API is running 🚀",
    documentation: "Check README for API usage guidelines",
  });
});

// Country endpoints
app.post("/countries/refresh", async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`
  );
  try {
    const [countriesData, rates] = await Promise.all([
      fetchCountries(),
      fetchExchangeRates(),
    ]);

    const processedCountries = processCountries(countriesData, rates);
    await CountryModel.upsertCountries(processedCountries);

    // Generate summary image
    const status = await CountryModel.getStatus();
    const topCountries = await CountryModel.getTopByGDP();
    await generateSummaryImage(
      status.total_countries,
      topCountries,
      status.last_refreshed_at
    );

    res.status(200).json({ message: "Countries data refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing countries:", error);
    if (error.message.includes("fetch")) {
      return res.status(503).json({
        error: "External data source unavailable",
        details: error.message,
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/countries", async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`
  );
  try {
    const { region, currency, sort } = req.query;
    const filters = {};
    const sortOptions = {};

    if (region) filters.region = region;
    if (currency) filters.currency = currency;

    if (sort) {
      const [field, order] = sort.split("_");
      if (field === "gdp") {
        sortOptions.field = "estimated_gdp";
        sortOptions.order = order === "desc" ? "DESC" : "ASC";
      }
    }

    const countries = await CountryModel.getAll(filters, sortOptions);
    res.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/countries/:name", async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`
  );
  try {
    const country = await CountryModel.getByName(req.params.name);
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }
    res.json(country);
  } catch (error) {
    console.error("Error fetching country:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/countries/:name", async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`
  );
  try {
    const deleted = await CountryModel.deleteByName(req.params.name);
    if (!deleted) {
      return res.status(404).json({ error: "Country not found" });
    }
    res.json({ message: "Country deleted successfully" });
  } catch (error) {
    console.error("Error deleting country:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/status", async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`
  );
  try {
    const status = await CountryModel.getStatus();
    res.json({
      total_countries: status.total_countries,
      last_refreshed_at: status.last_refreshed_at,
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/countries/image", (req, res) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`
  );
  const imagePath = path.join(__dirname, "../cache/summary.png");
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).json({ error: "Summary image not found" });
    }
  });
});


export default app;

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(port, function () {
    console.log(`
========================================
APP [STATUS:RUNNING] ON PORT ::: ${port}
========================================
    `);
  });
}
