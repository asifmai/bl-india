const pupHelper = require('./puppeteerhelper');
const fs = require('fs');
const path = require('path');
let browser = false;

const run = () => new Promise(async (resolve, reject) => {
  try {
    browser = await pupHelper.launchBrowser(true);
    
    for (let catIdx = 1; catIdx <= 6; catIdx++) {
      console.log(`Fetching Images for Category ${catIdx}/6`);
      const productsPath = path.join(__dirname, 'results', `category-${catIdx}.json`)
      const products = JSON.parse(fs.readFileSync(productsPath));
      
      for (let prodIdx = 0; prodIdx < products.length; prodIdx++) {
        console.log(`${prodIdx+1}/${products.length} - Fetching Image [${products[prodIdx].productImage}]`);
        await downloadImage(products[prodIdx].productImage);
      }
    }

    await browser.close();
    resolve(true);
  } catch (error) {
    if (browser) await browser.close();
    console.log('run Error: ', error);
    reject(error);
  }
});

const downloadImage = (image) => new Promise(async (resolve, reject) => {
  let page = false;
  try {
    const imageUrl = 'https://www.bl-india.com/productbg/' + image;
    page = await pupHelper.launchPage(browser);

    const viewSource = await page.goto(imageUrl, {timeout: 0, waitUntil: 'load'});
    const imgPath = path.join(__dirname, 'images', `${image}.jpg`);
    fs.writeFileSync(imgPath, await viewSource.buffer());

    await page.close();
    resolve(true);
  } catch (error) {
    if (page) await page.close();
    console.log('downloadImage Error: ', error);
    reject(error);
  }
});

run();
