import { chromium } from 'playwright'
import { PlaywrightScoreHeroPage } from './PlaywrightScoreHeroPage';

(async () => {
  await using browser = await chromium.launch();
  await using context = await browser.newContext();
  await using page = await context.newPage();
  await using scoreHeroPage = new PlaywrightScoreHeroPage(page);
})();
