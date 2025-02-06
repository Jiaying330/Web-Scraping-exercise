import puppeteer, { Page } from "puppeteer";

const scraper = async (city: string) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto("https://www.bing.com");
    await page.waitForSelector("textarea[name=q]");
    await page.type("textarea[name=q]", `site:zillow.com homes in ${city}`, {
      delay: 10,
    });

    await Promise.all([
      await page.keyboard.press("Enter"),
      await page.waitForNavigation(),
    ]);

    const [newPage] = await Promise.all([
      new Promise<Page>((resolve) =>
        browser.once("targetcreated", async (target) => {
          const page = await target.page();
          if (page) resolve(page);
        })
      ),
      page.click("h2"),
    ]);

    await newPage.waitForNavigation();

    const data = await newPage.$$eval("article", (articles) => {
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
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};
scraper("san jose");

export default scraper;
