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
  const browser = await puppeteer.launch(
    {
      headless: true // launch headful mode
    }
  );
  const page = await browser.newPage();
  await page.goto(req.query.q);
  await page.waitForTimeout(500);

  // accept Google's conditions / cookies
  await page.waitForSelector('form > div > div > button > span');
  await page.click('form > div > div > button > span');

  let result = []

  await page.waitForTimeout(2000);

  result.push(...await getURLs(page));

  // console.log(JSON.stringify(result));
  res.send(JSON.stringify(result));

  await browser.close();
})

app.post('/extractExtensionInfo', async (req, res) => {

  let URLs = req.body.query;

  let result = []

  const browser = await puppeteer.launch(
    {
      headless: true // launch headful mode
    }
  );
  let firstTime = true;

  for (let index = 0; index < URLs.length; index++) { // for each URL get the info

    const page = await browser.newPage();

    // await page.goto(req.query.q); // old version
    await page.goto(URLs[index]);

    if (firstTime) {
      await page.waitForTimeout(1050);
      // accept Google's conditions / cookies
      await page.waitForSelector('form > div > div > button > span')
      await page.click('form > div > div > button > span')
      firstTime = false;
    }

    await page.waitForTimeout(1125);

    result.push(...await getInfo(page));

    await page.close();
  }
  // console.log(JSON.stringify(result));
  await browser.close();
  res.send(JSON.stringify(result));
})

app.post('/extractComments', async (req, res) => {

  let URLs = req.body.query;

  let result = [];

  const browser = await puppeteer.launch(
    {
      headless: true
    }
  );

  let firstTime = true;

  for (let index = 0; index < URLs.length; index++) { // for each URL get the info

    const page = await browser.newPage();

    await page.goto(URLs[index]);

    // accept Google's conditions / cookies
    if (firstTime) {
      await page.waitForTimeout(1050);
      // accept Google's conditions / cookies
      await page.waitForSelector('form > div > div > button > span')
      await page.click('form > div > div > button > span')
      firstTime = false;
    }

    await page.waitForTimeout(1050);

    let hasNext = true;

    let maxPages = 3;

    var comments2 = [];

    var comments = {};

    while (hasNext && maxPages > 0) {
      await page.waitForTimeout(1050);
      comments = await extractComments(page);
      comments2 = comments2.concat(comments);
      hasNext = await page.evaluate(() => {
        if (document.querySelector("body  a.dc-se").getAttribute("style") != "display: none;") {
          document.querySelector("body  a.dc-se").click();
          return true;
        }
        return false;
      });
      await page.waitForTimeout(1050);
      maxPages--;
    }
    if(comments2.length > 0){
      result.push(comments2);
    }
    await page.close();
  }
  //console.log(JSON.stringify(result));
  await browser.close();
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
          stars = comment.querySelector(".rsw-stars").ariaLabel.replace(" stars", "").replace(" estrellas", "").replace(" star", "").replace(" estrella", "");
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

    if (usersTotal = document.querySelector("span.e-f-ih") != null) {
      usersTotal = document.querySelector("span.e-f-ih").getAttribute("title").replace(" usuarios", '').replace(" users", '');
    } else {
      usersTotal = 0;
    }

    // rule of 3: 100% of width = 5 stars
    //            the width that we retrieve = x stars
    if (document.querySelector("div.t9Fs9c") != null) {
      starsString = document.querySelector("div.t9Fs9c").getAttribute("style").replace("width:", '').replace("%", '');
    } else {
      starsString = 0;
    }

    stars = ((parseFloat(starsString) * 5) / 100).toFixed(1);

    if (document.querySelector("pre.C-b-p-j-Oa") != null) {
      description = document.querySelector("pre.C-b-p-j-Oa").textContent.replace(/\n/g, ' ');
    } else {
      description = '';
    }

    if (document.querySelector("span.h-C-b-p-D-md") != null) {
      version = document.querySelector("span.h-C-b-p-D-md").textContent;
    } else {
      version = '';
    }

    if (document.querySelector("span.h-C-b-p-D-xh-hh") != null) {
      lastUpdate = document.querySelector("span.h-C-b-p-D-xh-hh").textContent;
    } else {
      lastUpdate = '';
    }

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