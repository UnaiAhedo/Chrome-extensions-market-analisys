const puppeteer = require('puppeteer');

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
      headless: false, // launch headful mode
      slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
    }
  );
  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation()
  // Gitmate (w/o reviews)
  // await page.goto('https://chrome.google.com/webstore/detail/bbaoeligdffnfjmibohaijpchomoljej');

  // Block Site 
  // await page.goto('https://chrome.google.com/webstore/detail/blocksite-block-websites/eiimnmioipafcokbfikbljfdeojpcgbh');
  await page.goto('https://chrome.google.com/webstore/detail/' + argv['extensionId']);
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


  let maxPages = argv['maxPages'] || 3;

  async function extractComments(page) {
    return await page.evaluate(() => {

      let messages = [];
      let comments = document.querySelectorAll("body    div.ba-pa")

      // 25 of them, might be empty
      comments.forEach(comment => {
        if (comment.querySelector(".ba-Eb-ba") != null) {
          if (comment.querySelector(".rsw-stars") != null) {
            stars = comment.querySelector(".rsw-stars").ariaLabel.replace(" stars", "").replace(" star", "");
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

  await browser.close();

})();