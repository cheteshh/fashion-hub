import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeMyntra(url: string) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Randomize User Agent for Anti-Blocking 
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-GB,en;q=0.9',
    });
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // Simulate some basic human scrolling
    await page.evaluate(() => window.scrollBy(0, 500));
    await new Promise(r => setTimeout(r, 1000));
    
    // Extract Myntra Specific DOM elements (These frequently change and require maintenance)
    const productData = await page.evaluate(() => {
      const title = document.querySelector('h1.pdp-title')?.textContent?.trim() || '';
      const brand = document.querySelector('h1.pdp-name')?.textContent?.trim() || '';
      
      // Grab price block
      const priceElement = document.querySelector('span.pdp-price strong') || document.querySelector('.pdp-price');
      const priceStr = priceElement?.textContent?.replace(/[^0-9]/g, '') || '0';
      
      return {
        title: title + ' ' + brand,
        brand: brand,
        currentPrice: parseInt(priceStr, 10),
        inStock: !document.querySelector('.pdp-out-of-stock')
      };
    });

    await browser.close();
    return productData;

  } catch (error) {
    if (browser) await browser.close();
    throw new Error(`Myntra Scraping Failed: ${error}`);
  }
}
