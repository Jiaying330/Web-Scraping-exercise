import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import scraper from "./scraper_bing";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/scrape", async (req: Request, res: Response) => {
  const { query } = req.body;
  console.log("query = ", query);
  if (!query) {
    res.status(400).json({ error: "Search query is required." });
    return;
  }

  try {
    const listings = await scraper(query);
    res.status(200).json({
      status: "success",
      results: listings.length,
      data: {
        listings,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to scrape data." });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
