const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://neld.net');
  const elements = await page.$$('area', elements => elements);
  console.log(elements);
  const serviceToPayBtn = Array.from(elements).find(e => e.alt === 'Electric Online Payment');
  console.log(serviceToPayBtn);
//   serviceToPayBtn.click();
  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();
