import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  await page.waitForSelector('span.inline-flex.items-center');
  
  const tags = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('span.inline-flex.items-center').forEach(el => {
      const text = el.innerText.replace(/\n/g, ' ').trim();
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      results.push({
        text,
        height: rect.height,
        classes: el.className,
        padding: `${style.paddingTop} ${style.paddingBottom}`,
        lineHeight: style.lineHeight,
        fontSize: style.fontSize,
      });
    });
    return results;
  });
  
  console.log(JSON.stringify(tags.filter(t => t.text.includes('Primary Grinder') || t.text.includes('T8') || t.text.includes('Ø') || t.text.includes('Honing')), null, 2));
  
  await browser.close();
})();
