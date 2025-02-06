import puppeteer, { Browser, Page } from "puppeteer";

const launchBrowser = async (): Promise<Browser> => {
  return await puppeteer.launch({ headless: false });
};

const navigateToBing = async (page: Page, city: string): Promise<void> => {
  await page.goto("https://www.bing.com");
  await page.waitForSelector("textarea[name=q]");
  await page.type("textarea[name=q]", `site:zillow.com ${city} homes`, {
    delay: 10,
  });
  await Promise.all([page.keyboard.press("Enter"), page.waitForNavigation()]);
};

const getZillowPage = async (browser: Browser, page: Page): Promise<Page> => {
  const [newPage] = await Promise.all([
    new Promise<Page>((resolve) => {
      browser.once("targetcreated", async (target) => {
        const page = await target.page();
        if (page) resolve(page);
      });
    }),
    page.click("h2"),
  ]);
  await newPage.waitForNavigation();
  return newPage;
};

const scrollToBottom = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 800;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
};

const scrapeData = async (page: Page) => {
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

  return data;
};

const scraper = async (city: string) => {
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await navigateToBing(page, city);
    const zillowPage = await getZillowPage(browser, page);
    await scrollToBottom(zillowPage);
    const data = await scrapeData(zillowPage);
    console.log(data);
    return data;
  } catch (error) {
    console.error("Scraping error:", error);
    return [];
  } finally {
    if (browser) await browser.close();
  }
};
// scraper("san jose");

export default scraper;
