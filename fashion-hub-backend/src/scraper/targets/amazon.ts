import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeAmazon(url: string) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-GB,en;q=0.9',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"'
    });
    
    // Amazon India specifically
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // Simulate real user interaction to pass captcha triggers
    await page.evaluate(() => window.scrollBy(0, 800));
    await new Promise(r => setTimeout(r, 1500));
    
    const productData = await page.evaluate(() => {
      const title = document.querySelector('#productTitle')?.textContent?.trim() || '';
      const brand = document.querySelector('#bylineInfo')?.textContent?.replace('Brand: ', '')?.trim() || '';
      
      // Amazon has multiple price selectors depending on deal of the day states
      const priceElement = document.querySelector('.a-price-whole') || document.querySelector('#priceblock_ourprice');
      const priceStr = priceElement?.textContent?.replace(/[^0-9]/g, '') || '0';
      
      const inStock = !(document.querySelector('#availability')?.textContent?.toLowerCase().includes('currently unavailable'));
      
      // Rating handling (e.g. "4.3 out of 5 stars")
      const ratingStr = document.querySelector('#acrPopover')?.getAttribute('title') || '0';
      const customPlatformRating = parseFloat(ratingStr.split(' ')[0]);

      return {
        title: title,
        brand: brand,
        currentPrice: parseInt(priceStr, 10),
        inStock: inStock,
        customPlatformRating: isNaN(customPlatformRating) ? 0 : customPlatformRating
      };
    });

    await browser.close();
    return productData;

  } catch (error) {
    if (browser) await browser.close();
    throw new Error(`Amazon Scraping Failed: ${error}`);
  }
}
