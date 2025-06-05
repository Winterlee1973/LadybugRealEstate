import { db } from '../server/db';
import { properties } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function checkProperties() {
  try {
    console.log('Checking all properties in database...');
    const allProperties = await db.select().from(properties);
    console.log(`Total properties found: ${allProperties.length}`);
    
    if (allProperties.length > 0) {
      console.log('\nFirst few properties:');
      allProperties.slice(0, 3).forEach((prop, index) => {
        console.log(`${index + 1}. ID: ${prop.id}, Title: ${prop.title}, ZIP: ${prop.zipCode}, Address: ${prop.address}`);
      });
    }
    
    console.log('\nLooking for properties with ZIP code 90210...');
    const zip90210Properties = await db.select().from(properties).where(eq(properties.zipCode, '90210'));
    console.log(`Properties with ZIP 90210: ${zip90210Properties.length}`);
    
    if (zip90210Properties.length > 0) {
      zip90210Properties.forEach((prop, index) => {
        console.log(`${index + 1}. ID: ${prop.id}, Title: ${prop.title}, ZIP: ${prop.zipCode}, Address: ${prop.address}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking properties:', error);
    process.exit(1);
  }
}

checkProperties();