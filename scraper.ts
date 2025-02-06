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

  const data = await page.evaluate(() => {
    const items = document.querySelectorAll("article");
    const houseItems = Array.from(items).map((item) => {
      const price = (
        item.querySelector("[data-test='property-card-price']") as HTMLElement
      )?.innerText;
      const address = (item.querySelector("address") as HTMLElement)?.innerText;

      const special = (
        item.querySelector(
          "div[class^='StyledPropertyCardBadge']"
        ) as HTMLElement
      )?.innerText;

      const specifications: Record<string, string> = {};
      item
        .querySelectorAll("ul[class^='StyledPropertyCardHomeDetailsList'] li")
        .forEach((ele) => {
          const attribute = ele.querySelector("abbr")?.innerText;
          const value = ele.querySelector("b")?.innerText;
          if (attribute && value) {
            specifications[attribute] = value;
          }
        });

      return { price, address, specifications, special };
    });
    return houseItems;
  });

  console.log(data);
  console.log("Scraping completed");
  return data;
};

scraper("San Jose");
export default scraper;
