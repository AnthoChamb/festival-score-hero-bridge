import { chromium } from 'playwright'

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await context.close();
  await browser.close();
})();
