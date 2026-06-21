import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('SCRIPT ERROR:', err.message);
    process.exit(1);
  }
})();
