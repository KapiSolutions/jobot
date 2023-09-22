import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import findOffers from "./scripts/findOffers";
import type { JobOffer, ScrapperOptions } from "./types/main";

const app = express();
const port = 4200 || process.env.PORT;

// Configure rate limiter for api requests
const limiter = rateLimit({
  windowMs: 6000, // 1 minute window
  max: 10, // Limit each IP address to max 10 requests per window
  message: "Too many requests from this IP, please try again later.",
});

// Apply the rate limiter middleware to all routes
app.use(limiter);

// Middleware to handle incorrect HTTP methods
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  next();
});

// Endpoint to fetch job offers based on search value and limit
app.get("/offers/:search_value", async (req: Request, res: Response) => {
  const searchValue = req.params.search_value;
  // Validate search value parameter
  if (!searchValue || typeof searchValue != "string" || searchValue.length > 40) {
    return res.status(400).json({ error: "Invalid type or missing search value parameter" });
  }
  // Validate maxRecords/limit parameter, default 10, valid range is 1-50
  const maxRecords = Math.min(50, Math.max(1, parseInt(req.query.limit || "1"))) || 10;

  const options: ScrapperOptions = { searchValue, maxRecords };

  // Scrapp job offers based on search value and provided limit
  try {
    const offers: Array<JobOffer> = await findOffers(options);
    res.status(200).json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Middleware to handle 404 (Not Found) errors
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
