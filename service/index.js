const express = require('express')
const puppeteer = require("puppeteer");

const app = express()

app.listen(4000, () => {
    console.log('listening')
})

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/searchExtensions', async (req, res) => {
    const browser = await puppeteer.launch(
        {
            headless: true, // launch headful mode
            slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
        }
    );
    const page = await browser.newPage();
    await page.goto(req.query.q);
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
    res.send(JSON.stringify(result));

    await browser.close();
})

app.get('/extractExtensionInfo', async (req, res) => {
    const browser = await puppeteer.launch(
        {
            headless: true, // launch headful mode
            slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
        }
    );
    const page = await browser.newPage();

    await page.goto(req.query.q);
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

            stars = ((parseFloat(starsString) * 5) / 100).toFixed(1);

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

    result.push(...await getInfo(page));

    console.log(JSON.stringify(result));
    res.send(JSON.stringify(result));
    await browser.close();
})

app.get('/extractComments', async (req, res) => {
    const browser = await puppeteer.launch(
        {
          headless: true, // launch headful mode
          slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
        }
      );
      const page = await browser.newPage();
      const navigationPromise = page.waitForNavigation()
      // Gitmate (w/o reviews)
      // await page.goto('https://chrome.google.com/webstore/detail/bbaoeligdffnfjmibohaijpchomoljej');
    
      // Block Site 
      // await page.goto('https://chrome.google.com/webstore/detail/blocksite-block-websites/eiimnmioipafcokbfikbljfdeojpcgbh');
      //await page.goto('https://chrome.google.com/webstore/detail/' + argv['extensionId']);
      await page.goto(req.query.q);
      // eiimnmioipafcokbfikbljfdeojpcgbh
    
      // Screencastify 
      // await page.goto('https://chrome.google.com/webstore/detail/screencastify-screen-vide/mmeijimgabbpbgpdklnllpncmdofkcpn');
    
    
      await page.waitForTimeout(1000);
    
    
      // accept Google's conditions / cookies
      await page.waitForSelector('form > div > div > button > span')
      await page.click('form > div > div > button > span')
    
      await page.waitForTimeout(1000);
      // await navigationPromise
    
      page.on('console', (msg) => {
        if (!msg.text().includes('Failed to load resource')) {
          console.log(msg.text())
        }
      });
    
      let result = [];
      let hasNext = true;
    
    
      let maxPages = 3 || 3;
    
      async function extractComments(page) {
        return await page.evaluate(() => {
    
          let messages = [];
          let comments = document.querySelectorAll("body    div.ba-pa")
    
          // 25 of them, might be empty
          comments.forEach(comment => {
            if (comment.querySelector(".ba-Eb-ba") != null) {
              if (comment.querySelector(".rsw-stars") != null) {
                stars = comment.querySelector(".rsw-stars").ariaLabel.replace(" stars", "").replace(" estrellas", "");
              }
              text = comment.querySelector(".ba-Eb-ba").innerText;
              author = comment.querySelector(".comment-thread-displayname").innerText;
              date = comment.querySelector(".ba-Eb-Nf").innerText.replace("Modified ", "");
    
              messages.push({
                "author": author,
                "date": date,
                "stars": stars,
                "text": text,
              });
            }
          });
    
          return messages;
        })
      }
    
    
      while (hasNext && maxPages > 0) {
        result.push(...await extractComments(page));
        hasNext = await page.evaluate(() => {
          if (document.querySelector("body  a.dc-se") != null){
            document.querySelector("body  a.dc-se").click();
            return true;
          }  
          return false;
        });
    
        await page.waitForTimeout(1000);
        maxPages--;
      }
    
      console.log(JSON.stringify(result));
      res.send(JSON.stringify(result));
      await browser.close();
})