const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://stackoverflow.com/questions/49539842/puppeteer-scroll-and-click-on-button", {
    waitUntil: "networkidle2",
  });
  await page.emulateMediaType("screen");
  await page.pdf({
    path: "./react.pdf",
    printBackground: true,
    format: "a4",
  });
  await browser.close();
})();