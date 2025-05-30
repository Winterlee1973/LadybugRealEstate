import { properties, favorites, inquiries, type Property, type InsertProperty, type Favorite, type InsertFavorite, type Inquiry, type InsertInquiry } from "@shared/schema";
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
  }): Promise<Property[]>;

  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(propertyId: string, userId: string): Promise<boolean>;

  // Inquiries
  getInquiries(propertyId: string): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
}

export class SupabaseStorage implements IStorage {
  constructor() {}

  async getProperties(): Promise<Property[]> {
    const result = await db.select().from(properties);
    return result;
  }

  async getProperty(propertyId: string): Promise<Property | undefined> {
    const result = await db.select().from(properties).where(eq(properties.propertyId, propertyId)).limit(1);
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
  }): Promise<Property[]> {
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

    const result = await db.select().from(properties).where(and(...conditions));
    return result;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    const result = await db.select().from(favorites).where(eq(favorites.userId, userId));
    return result;
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values(insertFavorite).returning();
    return result[0];
  }

  async removeFavorite(propertyId: string, userId: string): Promise<boolean> {
    const result = await db.delete(favorites).where(and(eq(favorites.propertyId, propertyId), eq(favorites.userId, userId))).returning();
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
