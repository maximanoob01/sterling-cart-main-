const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:5174/');
  await page.waitForLoadState('networkidle');
  
  const loginBtns = await page.$$('button');
  for (const btn of loginBtns) {
    if ((await btn.textContent()).includes('Login')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForTimeout(1000);
  await page.fill('input[placeholder="Enter your phone number"]', '+91 99999 00000');
  await page.click('button:has-text("Send OTP")');
  
  await page.waitForTimeout(1000);
  await page.fill('input[placeholder="Enter 4-digit OTP"]', '1234');
  await page.click('button:has-text("Verify")');
  
  await page.waitForTimeout(2000);
  
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await browser.close();
  console.log('Script finished');
})();
