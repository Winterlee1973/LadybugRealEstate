import { eq, and, ilike, gte, lte } from 'drizzle-orm';
import { db } from './db';
import { properties, favorites, inquiries, profiles, type Property, type InsertProperty, type Favorite, type InsertFavorite, type Inquiry, type InsertInquiry, type Profile, type InsertProfile } from './db';
import type { IStorage } from './storage';

export class SupabaseStorage implements IStorage {
  async getProperties(): Promise<Property[]> {
    try {
      const result = await db.select().from(properties);
      return result;
    } catch (error) {
      console.error('Failed to get properties:', error);
      return [];
    }
  }

  async getProperty(propertyId: string): Promise<Property | undefined> {
    try {
      const result = await db
        .select()
        .from(properties)
        .where(eq(properties.propertyId, propertyId))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error('Failed to get property:', error);
      return undefined;
    }
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    try {
      const result = await db
        .select()
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error('Failed to get property by ID:', error);
      return undefined;
    }
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    try {
      const result = await db
        .insert(properties)
        .values(property)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Failed to create property:', error);
      throw new Error('Failed to create property');
    }
  }

  async updateProperty(propertyId: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    try {
      const result = await db
        .update(properties)
        .set(updates)
        .where(eq(properties.propertyId, propertyId))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Failed to update property:', error);
      return undefined;
    }
  }

  async deleteProperty(propertyId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(properties)
        .where(eq(properties.propertyId, propertyId));
      
      return true;
    } catch (error) {
      console.error('Failed to delete property:', error);
      return false;
    }
  }

  async searchProperties(query: { 
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    city?: string;
    propertyType?: string;
    userId?: string;
  }): Promise<Property[]> {
    try {
      const conditions = [];

      if (query.priceMin) {
        conditions.push(gte(properties.price, query.priceMin.toString()));
      }
      
      if (query.priceMax) {
        conditions.push(lte(properties.price, query.priceMax.toString()));
      }
      
      if (query.bedrooms) {
        conditions.push(gte(properties.bedrooms, query.bedrooms));
      }
      
      if (query.bathrooms) {
        conditions.push(gte(properties.bathrooms, query.bathrooms.toString()));
      }
      
      if (query.city) {
        conditions.push(ilike(properties.city, `%${query.city}%`));
      }
      
      if (query.propertyType) {
        conditions.push(eq(properties.propertyType, query.propertyType));
      }

      if (query.userId) {
        conditions.push(eq(properties.userId, query.userId));
      }

      let result;
      if (conditions.length > 0) {
        result = await db.select().from(properties).where(and(...conditions));
      } else {
        result = await db.select().from(properties);
      }

      return result;
    } catch (error) {
      console.error('Failed to search properties:', error);
      return [];
    }
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    try {
      const result = await db
        .select()
        .from(favorites)
        .where(eq(favorites.userId, userId));
      
      return result;
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    try {
      const result = await db
        .insert(favorites)
        .values(favorite)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Failed to add favorite:', error);
      throw new Error('Failed to add favorite');
    }
  }

  async removeFavorite(propertyId: string, userId: string): Promise<boolean> {
    try {
      await db
        .delete(favorites)
        .where(and(
          eq(favorites.propertyId, propertyId),
          eq(favorites.userId, userId)
        ));
      
      return true;
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      return false;
    }
  }

  async getInquiries(propertyId: string): Promise<Inquiry[]> {
    try {
      const result = await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.propertyId, propertyId));
      
      return result;
    } catch (error) {
      console.error('Failed to get inquiries:', error);
      return [];
    }
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    try {
      const result = await db
        .insert(inquiries)
        .values(inquiry)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Failed to create inquiry:', error);
      throw new Error('Failed to create inquiry');
    }
  }
  async getProfile(id: string): Promise<Profile | undefined> {
    try {
      const result = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, id))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error('Failed to get profile:', error);
      return undefined;
    }
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    try {
      const result = await db
        .insert(profiles)
        .values(profile)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  async updateProfileRole(id: string, role: 'buyer' | 'seller'): Promise<Profile | undefined> {
    try {
      const result = await db
        .update(profiles)
        .set({ role })
        .where(eq(profiles.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Failed to update profile role:', error);
      throw new Error('Failed to update profile role');
    }
  }
}