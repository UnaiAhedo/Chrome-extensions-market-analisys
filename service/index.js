const express = require('express')
const puppeteer = require("puppeteer");

const app = express()

app.get('/', async (req, res) => {
    const browser = await puppeteer.launch(
        {
            headless: true // launch headful mode
        }
    );
    const page = await browser.newPage();
    console.log('New page')
    await page.goto('https://es.wikipedia.org/wiki/Wikipedia:Portada');
    console.log('Gone website')
    await page.waitForTimeout(2000);
    console.log('Waited timeout')
    await page.waitForSelector('#pt-anonuserpage')
    console.log('Selector loaded')
    const name = await page.$eval('#pt-anonuserpage', e => e.innerText)

    console.log(name)

    res.send(name)
    console.log('Sent response')
    await browser.close()
})

app.get('/searchExtensions', async (req, res) => {
    const browser = await puppeteer.launch(
        {
            headless: true, // launch headful mode
            slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
        }
    );
    const page = await browser.newPage();

    await page.goto('https://chrome.google.com/webstore/search/' + req.q + '?_category=extensions');
    await page.waitForTimeout(1000);

    // accept Google's conditions / cookies
    await page.waitForSelector('form > div > div > button > span')
    await page.click('form > div > div > button > span')

    await page.waitForTimeout(1000);

    let result = []

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

    res.send(JSON.stringify(result))

    await browser.close();
})

app.listen(4000, () => {
    console.log('listening')
})