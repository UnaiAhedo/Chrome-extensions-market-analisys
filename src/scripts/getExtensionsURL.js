const puppeteer = require("puppeteer");

// parse named arguments
// source: https://stackoverflow.com/a/58188006/243532
const argv = (() => {
    const arguments = {};
    process.argv.slice(2).map( (element) => {
        const matches = element.match( '--([a-zA-Z0-9]+)=(.*)');
        if ( matches ){
            arguments[matches[1]] = matches[2]
                .replace(/^['"]/, '').replace(/['"]$/, '');
        }
    });
    return arguments;
  })();

(async () => {

    const browser = await puppeteer.launch(
        {
            headless: true, // launch headful mode
            slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
        }
    );
    const page = await browser.newPage();

    await page.goto('https://chrome.google.com/webstore/search/' + argv['query'] + '?_category=extensions');
    await page.waitForTimeout(1000);

    // accept Google's conditions / cookies
    await page.waitForSelector('form > div > div > button > span')
    await page.click('form > div > div > button > span')

    await page.waitForTimeout(1000);

    result = []

    async function getURLs(page) {
        return await page.evaluate(() => {

            let urls = [];
            let webs = document.querySelectorAll('.webstore-test-wall-tile');
            
            // for each web we get the URL
            // same as .map in navigator console
            webs.forEach(web => {
                urls.push(web.querySelector('a.h-Ja-d-Ac').href);
            });
            return urls;
        })
    }

    result.push(...await getURLs(page));

    console.log(JSON.stringify(result));
    
    await browser.close();
})();