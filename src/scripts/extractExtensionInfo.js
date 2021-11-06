const puppeteer = require("puppeteer");

// parse named arguments
// source: https://stackoverflow.com/a/58188006/243532
const argv = (() => {
    const arguments = {};
    process.argv.slice(2).map((element) => {
        const matches = element.match('--([a-zA-Z0-9]+)=(.*)');
        if (matches) {
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
        }
    );
    const page = await browser.newPage();

    await page.goto('https://chrome.google.com/webstore/detail/' + argv['extensionId']);
    await page.waitForTimeout(1000);

    // accept Google's conditions / cookies
    await page.waitForSelector('form > div > div > button > span')
    await page.click('form > div > div > button > span')

    await page.waitForTimeout(1000);

    result = []

    async function getInfo(page) {
        return await page.evaluate(() => {

            let info = [];

            extensionName = document.querySelector("h1.e-f-w").textContent;

            usersTotal = document.querySelector("span.e-f-ih").getAttribute("title").replace(" usuarios", '').replace(" users", '');

            // rule of 3: 100% of width = 5 stars
            //            the width that we retrieve = x stars
            starsString = document.querySelector("div.t9Fs9c").getAttribute("style").replace("width:", '').replace("%", '');

            stars = ((parseFloat(starsString) *5) / 100).toFixed(1);

            description = document.querySelector("pre.C-b-p-j-Oa").textContent.replace(/\n/g, ' ');

            version = document.querySelector("span.h-C-b-p-D-md").textContent;

            lastUpdate = document.querySelector("span.h-C-b-p-D-xh-hh").textContent;

            info.push({
                "name": extensionName,
                "stars": stars,
                "users": usersTotal,
                "description": description,
                "version": version,
                "lastUpdate": lastUpdate,
            });
            return info;
        })
    }
    
    await page.waitForTimeout(1000);

    result.push(...await getInfo(page));

    console.log(JSON.stringify(result));

    await browser.close();
})();