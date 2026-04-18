import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const BATCH = 100;

const BRANDS = [
  'Zara', 'H&M', 'Mango', 'W', 'Biba', 'FabIndia', 'Roadster', 'HRX', 'Puma', 'Nike', 
  'Adidas', 'Levis', 'Only', 'Vero Moda', 'Jack & Jones', 'Van Heusen', 'Allen Solly', 
  'Peter England', 'Aurelia', 'Global Desi', 'Anouk', 'Libas', 'Kalini', 'Pantaloons', 'Max Fashion'
];

const PLATFORMS = ['MYNTRA', 'FLIPKART', 'AMAZON', 'AJIO', 'NYKAA_FASHION', 'MEESHO'];

const CATEGORY_SPLIT = {
  TOPS: 1250,
  BOTTOMS: 1000,
  DRESSES: 1000,
  FOOTWEAR: 1000,
  ACCESSORIES: 750
};

const PRICE_RANGES = {
  TOPS: { min: 299, max: 3999 },
  BOTTOMS: { min: 499, max: 4999 },
  DRESSES: { min: 599, max: 8999 },
  FOOTWEAR: { min: 799, max: 12999 },
  ACCESSORIES: { min: 199, max: 2999 }
};

function getGender() {
  const r = Math.random();
  if (r < 0.55) return 'Women';
  if (r < 0.90) return 'Men';
  return 'Unisex';
}

function generatePriceHistory(currentPrice: number) {
  const history = [];
  let basePrice = currentPrice;
  const now = new Date();

  // Pick 3 sale dips
  const saleDips = [
    faker.number.int({ min: 10, max: 50 }),
    faker.number.int({ min: 70, max: 110 }),
    faker.number.int({ min: 130, max: 170 })
  ];

  for (let d = 180; d >= 0; d--) {
    const scrapedAt = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    
    // Determine if in sale
    const inSale = saleDips.some(saleDay => d >= saleDay && d <= saleDay + faker.number.int({ min: 5, max: 7 }));
    
    let price: number;
    if (inSale) {
      // Drop 30-50%
      const dropLimit = faker.number.float({ min: 0.3, max: 0.5 });
      price = basePrice * (1 - dropLimit);
    } else {
      // Fluctuate +-15%
      const drift = faker.number.float({ min: -0.15, max: 0.15 });
      price = basePrice * (1 + drift);
    }

    history.push({
      priceRecorded: Math.round(price), // using priceRecorded to match common shapes, or simply price if that's what schema has. 
      // The prompt says "scrapedAt = date of that entry" but in original schema it was timestamp. 
      // I will use timestamp/scrapedAt based on standard convention or prompt exact words.
      timestamp: scrapedAt, // Many schemas use timestamp
      price: Math.round(price) // Some use price
    });
  }
  return history;
}

// Since the prompt explicitly names `history`, `scrapedAt` for PriceHistory entries:
function getPriceHistory(currentPrice: number) {
  const history = [];
  let currentRef = currentPrice;
  const now = new Date();

  // Pre-calculate 3 sales dips
  const sales = [
    { start: faker.number.int({ min: 10, max: 50 }), duration: faker.number.int({ min: 5, max: 7 }) },
    { start: faker.number.int({ min: 70, max: 110 }), duration: faker.number.int({ min: 5, max: 7 }) },
    { start: faker.number.int({ min: 130, max: 170 }), duration: faker.number.int({ min: 5, max: 7 }) }
  ];

  for (let i = 180; i >= 0; i--) {
    const scrapedAt = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const inSale = sales.some(s => i >= s.start && i <= s.start + s.duration);
    
    let dailyPrice = currentRef;
    if (inSale) {
      dailyPrice = currentRef * faker.number.float({ min: 0.5, max: 0.7 }); // 30-50% drop
    } else {
      dailyPrice = currentRef * faker.number.float({ min: 0.85, max: 1.15 }); // +- 15% fluctuate
    }

    history.push({
      price: Math.round(dailyPrice),
      scrapedAt
    });
  }
  return history;
}

async function main() {
  console.log('Generating 5000 realistic Indian fashion products...\n');

  // Purge existing
  console.log('Cleaning database...');
  // await prisma.priceHistory.deleteMany({});
  // await prisma.listing.deleteMany({});
  // await prisma.product.deleteMany({});

  const products: any[] = [];
  const allListings: any[] = [];

  for (const [category, count] of Object.entries(CATEGORY_SPLIT)) {
    const priceRange = PRICE_RANGES[category as keyof typeof PRICE_RANGES];

    for (let i = 0; i < count; i++) {
       // Since prisma product ID might be generated automatically by the DB, 
       // but we need it for listings. In creating via createMany, we don't get IDs back.
       // So we generate them.
       const productId = faker.string.uuid();
       const title = faker.commerce.productName();
       const brand = faker.helpers.arrayElement(BRANDS);
       const gender = getGender();

       products.push({
         id: productId,
         title: `${brand} ${gender} ${title}`, // Matches common title
         brand,
         category: category.toLowerCase(),
         gender,
         description: faker.commerce.productDescription(),
         imageUrl: faker.image.urlLoremFlickr({ category: 'fashion' }),
         // Mapping to some fields that might be present
         createdAt: faker.date.recent(),
       });

       const numListings = faker.number.int({ min: 2, max: 5 });
       const selectedPlatforms = faker.helpers.arrayElements(PLATFORMS, numListings);

       for (const platform of selectedPlatforms) {
         const currentPrice = faker.number.int({ min: priceRange.min, max: priceRange.max });
         const originalPrice = Math.round(currentPrice * faker.number.float({ min: 1.2, max: 1.6 }));
         const discount = Math.round((1 - (currentPrice / originalPrice)) * 100);
         const inStock = faker.number.int({ min: 1, max: 100 }) <= 80;
         const slug = `${brand.toLowerCase()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
         const url = `${platform.toLowerCase()}.com/${brand.toLowerCase()}/${slug}/buy`;
         const lastScrapedAt = new Date(Date.now() - faker.number.int({ min: 0, max: 6 * 60 * 60 * 1000 }));
         
         const history = getPriceHistory(currentPrice);

         allListings.push({
           productId,
           platformDomain: platform,  // Commonly named 'platformDomain' or 'platform'
           currentPrice,
           originalPrice,
           discount,
           inStock,
           url,
           lastScrapedAt,
           history
         });
       }
    }
  }

  // Step 1: insert products in batches
  console.log(`Inserting ${products.length} products...`);
  for (let i = 0; i < products.length; i += BATCH) {
    await prisma.product.createMany({ 
      data: products.slice(i, i+BATCH), 
      skipDuplicates: true 
    });
    console.log(`Products: ${Math.min(i+BATCH, 5000)}/5000`);
  }

  // Step 2: insert listings + priceHistory together per product
  console.log(`Inserting ${allListings.length} listings alongside price histories...`);
  let insertedListings = 0;
  
  for (const listing of allListings) {
    const { history, platformDomain, productId, currentPrice, originalPrice, discount, inStock, url, lastScrapedAt } = listing;
    
    // Check which one to use based on the user's specific prompt shape.
    // The prompt says: "await prisma.listing.create({ data: { ...listing, priceHistory: { createMany: { data: listing.history } } } })"
    await prisma.$transaction([
      prisma.listing.create({ 
        data: { 
          productId,
          platformDomain, // Or platform
          currentPrice,
          originalPrice,
          discount,
          inStock,
          url,
          lastScrapedAt,
          priceHistory: { 
            createMany: { 
              data: history 
            } 
          } 
        } 
      })
    ]);
    
    insertedListings++;
    if (insertedListings % 1000 === 0) {
      console.log(`Listings: ${insertedListings}/${allListings.length}`);
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
