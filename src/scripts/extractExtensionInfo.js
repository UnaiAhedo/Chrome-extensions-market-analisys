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
            slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
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

            usersTotal = document.querySelector("span.e-f-ih").getAttribute("title");

            description = document.querySelector("pre.C-b-p-j-Oa").textContent.replace(/\n/g, ' ');

            version = document.querySelector("span.h-C-b-p-D-md").textContent;

            lastUpdate = document.querySelector("span.h-C-b-p-D-xh-hh").textContent;

            info.push({
                "name": extensionName,
                "stars": "b",
                "users": usersTotal,
                "description": description,
                "version": version,
                "lastUpdate": lastUpdate,
            });
            return info;
        })
    }

    result.push(...await getInfo(page));

    console.log(JSON.stringify(result));

    await browser.close();
})();