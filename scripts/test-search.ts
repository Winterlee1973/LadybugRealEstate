import { db } from '../server/db';
import { properties } from '../shared/schema';
import { eq, gte, lte, ilike, and, or, sql } from 'drizzle-orm';

async function testSearch() {
  try {
    console.log('Testing ZIP code search...');
    
    // Test direct ZIP code search
    console.log('\n1. Direct ZIP code search with eq:');
    const directSearch = await db.select().from(properties).where(eq(properties.zipCode, '90210'));
    console.log(`Results: ${directSearch.length}`);
    
    // Test ZIP code search with ilike (what our storage uses)
    console.log('\n2. ZIP code search with ilike (current implementation):');
    const ilikeSearch = await db.select().from(properties).where(ilike(properties.zipCode, '%90210%'));
    console.log(`Results: ${ilikeSearch.length}`);
    
    // Test the exact search conditions from our storage
    console.log('\n3. Testing storage searchProperties logic:');
    const conditions = [];
    const query = { zipCode: '90210' };
    
    if (query.zipCode) {
      conditions.push(ilike(properties.zipCode, `%${query.zipCode}%`));
    }
    
    if (conditions.length === 0) {
      console.log('No conditions - would return empty array');
    } else {
      const result = await db.select().from(properties).where(and(...conditions));
      console.log(`Results: ${result.length}`);
      if (result.length > 0) {
        result.forEach((prop, index) => {
          console.log(`${index + 1}. ID: ${prop.id}, Title: ${prop.title}, ZIP: ${prop.zipCode}`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing search:', error);
    process.exit(1);
  }
}

testSearch();