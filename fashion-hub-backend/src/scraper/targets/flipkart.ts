import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeFlipkart(url: string) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    await page.evaluate(() => window.scrollBy(0, 500));
    await new Promise(r => setTimeout(r, 1000));
    
    const productData = await page.evaluate(() => {
      // Flipkart uses heavily obfuscated single-letter class names that change frequently,
      // but commonly the title block classes remain somewhat stable or use structural DOM layout
      const titleSpan = document.querySelector('span.VU-ZEz') || document.querySelector('span.B_NuCI');
      const title = titleSpan?.textContent?.trim() || '';
      
      const brandSpan = document.querySelector('span.G6XhRU');
      const brand = brandSpan?.textContent?.trim() || '';
      
      // The massive price text element
      const priceElement = document.querySelector('div.Nx9bqj.CxhGGd');
      const priceStr = priceElement?.textContent?.replace(/[^0-9]/g, '') || '0';
      
      const inStock = !(document.body.innerText.toLowerCase().includes('sold out'));
      
      return {
        title: title,
        brand: brand,
        currentPrice: parseInt(priceStr, 10),
        inStock: inStock
      };
    });

    await browser.close();
    return productData;

  } catch (error) {
    if (browser) await browser.close();
    throw new Error(`Flipkart Scraping Failed: ${error}`);
  }
}
