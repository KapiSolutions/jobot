import express, { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";
import rateLimit from "express-rate-limit";
import findOffers from "./scripts/findOffers";
import type { JobOffer, ScrapperOptions } from "./types/main";

const app = express();
const port = 4200 || process.env.PORT;

// Enable 'trust proxy' to trust X-Forwarded-* headers
app.set("trust proxy", true);

// Create a cache instance with a 2-hour TTL
const cache = new NodeCache({ stdTTL: 2 * 60 * 60 });

// Configure rate limiter for api requests
const limiter = rateLimit({
  windowMs: 6000, // 1 minute window
  max: 10, // Limit each IP address to max 10 requests per defined window
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
  const maxRecords = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || "1"))) || 10;

  // Check if the response is already cached
  const cacheKey = `${searchValue}-${maxRecords}`;
  const cachedResponse: Array<JobOffer> = cache.get(cacheKey);

  if (cachedResponse) {
    // If cached response exists, return it
    return res.status(200).json(cachedResponse);
  }

  try {
    // Scrapp job offers based on search value and provided limit
    const options: ScrapperOptions = { searchValue, maxRecords };
    const offers: Array<JobOffer> = await findOffers(options);

    // Store the response in the cache
    cache.set(cacheKey, offers);
    res.status(200).json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Display welcome message
app.get("/", (req: Request, res: Response) => {
  res.send("🤖 Jobot! This project is a bot for scrapping tech job boards.");
});

// Middleware to handle 404 (Not Found) errors
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
