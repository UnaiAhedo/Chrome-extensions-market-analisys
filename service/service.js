const express = require('express');
const puppeteer = require('puppeteer');
var cors = require('cors');
const app = express();

app.use(cors());

app.use(express.json());

app.listen(4000, () => {
  console.log('listening')
})

app.get('/searchExtensions', async (req, res) => {
  console.log("A");
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

  result.push(...await getURLs(page));

  // console.log(JSON.stringify(result));
  res.send(JSON.stringify(result));

  await browser.close();
})

app.post('/extractExtensionInfo', async (req, res) => {

  let URLs = req.body.query;

  let result = []

  for (let index = 0; index < URLs.length; index++) { // for each URL get the info

    const browser = await puppeteer.launch(
      {
        headless: true, // launch headful mode
        slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
      }
    );

    const page = await browser.newPage();

    // await page.goto(req.query.q); // old version
    await page.goto(URLs[index]);
    await page.waitForTimeout(1000);

    // accept Google's conditions / cookies
    await page.waitForSelector('form > div > div > button > span')
    await page.click('form > div > div > button > span')

    await page.waitForTimeout(1000);


    result.push(...await getInfo(page));
    await browser.close();
  }
  // console.log(JSON.stringify(result));
  res.send(JSON.stringify(result));
})

app.post('/extractComments', async (req, res) => {

  let URLs = req.body.query;

  let result = []

  for (let index = 0; index < URLs.length; index++) { // for each URL get the info
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
    //await page.goto(req.query.q);
    await page.goto(URLs[index]);
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

    let hasNext = true;

    let maxPages = 3;

    var comments = {};

    while (hasNext && maxPages > 0) {
      comments = await extractComments(page);
      result.push(comments);
      hasNext = await page.evaluate(() => {
        if (document.querySelector("body  a.dc-se").getAttribute("style") != "display: none;") {
          document.querySelector("body  a.dc-se").click();
          return true;
        }
        return false;
      });
      await page.waitForTimeout(1000);
      maxPages--;
    }
    await browser.close();
  }
  //console.log(JSON.stringify(result));
  res.send(JSON.stringify(result));
})

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