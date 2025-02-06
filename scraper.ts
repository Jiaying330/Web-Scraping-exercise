import puppeteer from "puppeteer";
import readline from "readline";

const io = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const scraper = async (city: string) => {
  console.log("Scraper running");
  const browser = await puppeteer.launch({
    channel: "chrome",
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto("https://www.google.com");
  await page.type("textarea[name=q]", `site:zillow.com homes in ${city}`);
  await Promise.all([
    await page.keyboard.press("Enter"),
    await page.waitForNavigation(),
  ]);

  console.log(
    "Please complete the reCAPTCHA verification before continuing..."
  );

  await new Promise<void>((resolve) => {
    io.question("", () => {
      resolve();
    });
  });

  console.log("reCAPTCHA is resolved, please continue...");

  await Promise.all([await page.click("h3"), await page.waitForNavigation()]);

  const data = await page.$$eval("article", (articles) => {
    return articles.map((article) => {
      const price = (
        article.querySelector(
          "[data-test='property-card-price']"
        ) as HTMLElement
      )?.innerText;
      const address = (article.querySelector("address") as HTMLElement)
        ?.innerText;

      const details: Record<string, string> = {};
      article
        .querySelectorAll("ul[class^='StyledPropertyCardHomeDetailsList'] li")
        .forEach((ele) => {
          const key = ele.querySelector("abbr")?.innerText;
          const value = ele.querySelector("b")?.innerText;
          if (key && value) {
            details[key] = value;
          }
        });

      return { price, address, details };
    });
  });

  console.log(data);
  console.log("Scraping completed");
  return data;
};

// scraper("San Jose");
export default scraper;
