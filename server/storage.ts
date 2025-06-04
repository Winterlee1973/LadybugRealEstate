import { properties, favorites, inquiries, profiles, type Property, type InsertProperty, type Favorite, type InsertFavorite, type Inquiry, type InsertInquiry, type Profile, type InsertProfile } from "@shared/schema";
import { db } from './db';
import { eq, gte, lte, ilike, and, sql } from 'drizzle-orm';

export interface IStorage {
  // Properties
  getProperties(): Promise<Property[]>;
  getProperty(propertyId: string): Promise<Property | undefined>;
  getPropertyById(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(propertyId: string, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(propertyId: string): Promise<boolean>;
  searchProperties(query: {
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    city?: string;
    propertyType?: string;
    searchableId?: string;
    address?: string;
    title?: string;
    propertyId?: string;
    zipCode?: string;
    general?: string; // Add general search parameter
  }): Promise<Property[]>;

  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;

  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(propertyId: string, userId: string): Promise<boolean>;

  // Inquiries
  getInquiries(propertyId: string): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateProfileRole(id: string, role: 'buyer' | 'seller'): Promise<Profile | undefined>;
}

export class SupabaseStorage implements IStorage {
  constructor() {}

  async getProperties(): Promise<Property[]> {
    const result = await db.select().from(properties);
    return result;
  }

  async getProperty(propertyId: string): Promise<Property | undefined> {
    // Try to find by propertyId (UUID) first
    let result = await db.select().from(properties).where(eq(properties.propertyId, propertyId)).limit(1);
    if (result[0]) {
      return result[0];
    }

    // If not found by UUID, try to find by searchableId (4-digit number)
    result = await db.select().from(properties).where(eq(properties.searchableId, propertyId)).limit(1);
    return result[0];
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    return result[0];
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(insertProperty).returning();
    return result[0];
  }

  async updateProperty(propertyId: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const result = await db.update(properties).set(updates).where(eq(properties.propertyId, propertyId)).returning();
    return result[0];
  }

  async deleteProperty(propertyId: string): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.propertyId, propertyId)).returning();
    return result.length > 0;
  }

  async searchProperties(query: {
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    city?: string;
    propertyType?: string;
    searchableId?: string;
    address?: string;
    title?: string;
    propertyId?: string;
    zipCode?: string;
    general?: string; // Add general search parameter here
  }): Promise<Property[]> {
    console.log("searchProperties called with query:", query); // Add this line for debugging
    const conditions = [];

    if (query.priceMin) {
      conditions.push(gte(sql`CAST(${properties.price} AS REAL)`, query.priceMin));
    }
    if (query.priceMax) {
      conditions.push(lte(sql`CAST(${properties.price} AS REAL)`, query.priceMax));
    }
    if (query.bedrooms) {
      conditions.push(gte(properties.bedrooms, query.bedrooms));
    }
    if (query.bathrooms) {
      conditions.push(gte(sql`CAST(${properties.bathrooms} AS REAL)`, query.bathrooms));
    }
    if (query.city) {
      conditions.push(ilike(properties.city, `%${query.city}%`));
    }
    if (query.propertyType) {
      conditions.push(eq(properties.propertyType, query.propertyType));
    }

    if (query.searchableId) {
      conditions.push(ilike(properties.searchableId, `%${query.searchableId}%`));
    }
    if (query.address) {
      conditions.push(ilike(properties.address, `%${query.address}%`));
    }
    if (query.title) {
      conditions.push(ilike(properties.title, `%${query.title}%`));
    }
    if (query.propertyId) {
      conditions.push(ilike(properties.propertyId, `%${query.propertyId}%`));
    }
    if (query.zipCode) {
      conditions.push(ilike(properties.zipCode, `%${query.zipCode}%`));
    }

    if (query.general) {
      const generalSearchConditions = [
        ilike(properties.address, `%${query.general}%`),
        ilike(properties.city, `%${query.general}%`),
        ilike(properties.zipCode, `%${query.general}%`),
        ilike(properties.title, `%${query.general}%`),
      ];
      conditions.push(sql`(${and(...generalSearchConditions)})`);
    }

    if (conditions.length === 0) {
      return []; // If no search criteria, return empty array
    }
    const result = await db.select().from(properties).where(and(...conditions));
    return result;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    try {
      let result = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
      
      if (!result[0]) {
        console.log(`Profile not found for user ${userId}. Creating new profile with default 'buyer' role.`);
        const newProfile = await this.createProfile({ id: userId, role: 'buyer' });
        return { ...newProfile, role: newProfile.role as 'buyer' | 'seller' };
      }
      console.log(`Profile fetched for user ${userId}:`, result[0]);
      return { ...result[0], role: result[0].role as 'buyer' | 'seller' };
    } catch (error) {
      console.error(`Error fetching or creating profile for user ${userId}:`, error);
      throw error;
    }
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    try {
      const result = await db.insert(profiles).values(insertProfile).returning();
      console.log("Profile created:", result[0]);
      return { ...result[0], role: result[0].role as 'buyer' | 'seller' };
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  }

  async updateProfileRole(userId: string, role: 'buyer' | 'seller'): Promise<Profile | undefined> {
    try {
      const result = await db.update(profiles).set({ role }).where(eq(profiles.id, userId)).returning();
      if (result[0]) {
        console.log(`Profile role updated for user ${userId} to ${role}:`, result[0]);
        return { ...result[0], role: result[0].role as 'buyer' | 'seller' };
      }
      console.warn(`Profile not found for update: userId=${userId}`);
      return undefined;
    } catch (error) {
      console.error(`Error updating profile role for user ${userId} to ${role}:`, error);
      throw error;
    }
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    const result = await db.select().from(favorites).where(eq(favorites.userId, userId as any)); // Cast userId to any for now due to schema change
    return result;
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    // Check if the favorite already exists
    const existingFavorite = await db.select()
      .from(favorites)
      .where(and(
        eq(favorites.propertyId, insertFavorite.propertyId),
        eq(favorites.userId, insertFavorite.userId as any) // Cast userId to any for now due to schema change
      ))
      .limit(1);

    if (existingFavorite.length > 0) {
      console.log("Favorite already exists:", existingFavorite[0]);
      return existingFavorite[0]; // Return the existing favorite
    }

    // If it doesn't exist, insert it
    const result = await db.insert(favorites).values(insertFavorite).returning();
    console.log("Favorite added:", result[0]);
    return result[0];
  }

  async removeFavorite(propertyId: string, userId: string): Promise<boolean> {
    const result = await db.delete(favorites).where(and(eq(favorites.propertyId, propertyId), eq(favorites.userId, userId as any))).returning(); // Cast userId to any for now due to schema change
    return result.length > 0;
  }

  async getInquiries(propertyId: string): Promise<Inquiry[]> {
    const result = await db.select().from(inquiries).where(eq(inquiries.propertyId, propertyId));
    return result;
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const result = await db.insert(inquiries).values(insertInquiry).returning();
    return result[0];
  }
}

export const storage = new SupabaseStorage();
