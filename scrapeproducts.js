const pupHelper = require('./puppeteerhelper');
const path = require('path');
const {
  siteLink
} = require('./keys');
const fs = require('fs');
let browser;
const results = [];

const run = () => new Promise(async (resolve, reject) => {
  try {
    browser = await pupHelper.launchBrowser(true);
    const page = await pupHelper.launchPage(browser);

    await page.goto(siteLink, {
      timeout: 0,
      waitUntil: 'load'
    });
    await page.waitForSelector('select#category');

    const noOfCategories = await page.$$('select#category > option');
    console.log(`Number of Categories Found: ${noOfCategories.length - 1}`);

    for (let i = 1; i < noOfCategories.length; i++) {
      const categoryResults = [];
      await page.goto(siteLink, {
        timeout: 0,
        waitUntil: 'load'
      });
      await page.waitForSelector('select#category');

      const categoryName = await pupHelper.getTxt(`select#category > option[value="${i}"]`, page);
      console.log(`${i}/${noOfCategories.length - 1} - Fetching from Category ${categoryName}`);

      await page.select('select#category', String(i));
      await page.click('.input-group-btn > button#submit');

      await page.waitForSelector('#no-more-tables > table');
      const rows = await page.$$('#no-more-tables > table > tbody > tr');

      for (let j = 0; j < rows.length; j++) {
        const result = {
          category: categoryName
        };
        if (categoryName.toLowerCase() == 'bis registration' || categoryName.toLowerCase() == 'isi certification') {
          result.productLink = await pupHelper.getAttr('td[data-title="Products"] > a', 'href', rows[j]);
          result.productName = await pupHelper.getTxt('td[data-title="Products"] > span', rows[j]);
          result.productImage = await pupHelper.getAttr('td[data-title="Products"] > a > img', 'src', rows[j]);
          result.indianStandard = await pupHelper.getTxt('td[data-title="IS Standard"]', rows[j]);
          result.remark = await pupHelper.getTxt('td[data-title="Remark"]', rows[j]);

          result.productLink = siteLink + result.productLink;
          result.productImage = result.productImage.split('/').pop();
        } else if (categoryName.toLowerCase() == 'wpc approval' || categoryName.toLowerCase() == 'bee registration') {
          result.productLink = await pupHelper.getAttr('td[data-title="product"] > a', 'href', rows[j]);
          result.productName = await pupHelper.getTxt('td[data-title="product"] > span', rows[j]);
          result.productImage = await pupHelper.getAttr('td[data-title="product"] > a > img', 'src', rows[j]);
          result.indianStandard = await pupHelper.getTxt('td[data-title="standards"]', rows[j]);
          result.remark = await pupHelper.getTxt('td[data-title="Remarks"]', rows[j]);

          result.productLink = siteLink + result.productLink;
          result.productImage = result.productImage.split('/').pop();
        } else if (categoryName.toLowerCase() == 'tec certification') {
          result.productLink = await pupHelper.getAttr('td[data-title="Equipment"] > a', 'href', rows[j]);
          result.productName = await pupHelper.getTxt('td[data-title="Equipment"] > span', rows[j]);
          result.productImage = await pupHelper.getAttr('td[data-title="Equipment"] > a > img', 'src', rows[j]);
          result.essentialTests = await pupHelper.getTxtMultiple('td[data-title="essential tests"] > ul > li', rows[j]);
          result.group = await pupHelper.getTxt('td[data-title="group"]', rows[j]);
          result.scheme = await pupHelper.getTxt('td[data-title="scheme"]', rows[j]);

          result.productLink = siteLink + result.productLink;
          result.productImage = result.productImage.split('/').pop();
        } else if (categoryName.toLowerCase() == 'epr authorization') {
          result.productLink = await pupHelper.getAttr('td[data-title="Equipment"] > a', 'href', rows[j]);
          result.productName = await pupHelper.getTxt('td[data-title="Equipment"] > span', rows[j]);
          result.productImage = await pupHelper.getAttr('td[data-title="Equipment"] > a > img', 'src', rows[j]);
          result.eeeCode = await pupHelper.getTxt('td[data-title="EEE Code"]', rows[j]);
          result.remark = await pupHelper.getTxt('td[data-title="Remarks"]', rows[j]);

          result.productLink = siteLink + result.productLink;
          result.productImage = result.productImage.split('/').pop();
        }
        categoryResults.push(result);
      }

      console.log(`Number of Products Found in Category: ${categoryResults.length}`);
      const filePath = path.resolve(__dirname, 'results', `category-${i}.json`);
      fs.writeFileSync(filePath, JSON.stringify(categoryResults));
    }

  await browser.close();
  resolve(true);
} catch (error) {
  if (browser) await browser.close();
  console.log(`Run Error: ${error}`);
  reject(error);
}
})

run();