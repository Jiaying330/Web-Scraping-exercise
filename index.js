import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  channel: "chrome",
  headless: false,
});
const page = await browser.newPage();
