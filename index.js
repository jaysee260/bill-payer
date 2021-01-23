const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://neld.net');
  await page.screenshot({ path: 'steps/1-neld-landing-page.png', fullPage: true });
  await page.$eval('area[alt="Electric Online Payment"]', e => e.click());
  // this doesn't work?
  // const element = await page.$('area[alt="Electric Online Payment"]');
  // await element.click();
  await page.screenshot({ path: 'steps/2-electric-payment-page.png', fullPage: true });

  await browser.close();
})();
