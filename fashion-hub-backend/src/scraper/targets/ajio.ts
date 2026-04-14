import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeAjio(url: string) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    const productData = await page.evaluate(() => {
      // AJIO often heavily relies on React Hydration, so waiting for DOM works well
      const title = document.querySelector('h1.prod-name')?.textContent?.trim() || '';
      const brand = document.querySelector('h2.brand-name')?.textContent?.trim() || '';
      const priceStr = document.querySelector('div.prod-sp')?.textContent?.replace(/[^0-9]/g, '') || '0';
      
      return {
        title: title,
        brand: brand,
        currentPrice: parseInt(priceStr, 10),
        inStock: !document.querySelector('.out-of-stock-msg')
      };
    });

    await browser.close();
    return productData;

  } catch (error) {
    if (browser) await browser.close();
    throw new Error(`Ajio Scraping Failed: ${error}`);
  }
}
