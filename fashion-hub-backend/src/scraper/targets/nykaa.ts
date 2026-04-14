import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeNykaa(url: string) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    const productData = await page.evaluate(() => {
      const title = document.querySelector('.product-title')?.textContent?.trim() || '';
      const brand = document.querySelector('.product-brand')?.textContent?.trim() || '';
      
      const priceElement = document.querySelector('.css-1jczs19') || document.querySelector('.price-info');
      const priceStr = priceElement?.textContent?.replace(/[^0-9]/g, '') || '0';
      
      return {
        title: title,
        brand: brand,
        currentPrice: parseInt(priceStr, 10),
        inStock: true // Nykaa handles out of stock differently, typically redirecting or graying out the button
      };
    });

    await browser.close();
    return productData;

  } catch (error) {
    if (browser) await browser.close();
    throw new Error(`Nykaa Scraping Failed: ${error}`);
  }
}
