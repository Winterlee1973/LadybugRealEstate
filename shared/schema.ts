import { pgTable, text, serial, integer, boolean, decimal, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // Use uuid type
  role: text("role").notNull().default('buyer'), // 'buyer' or 'seller'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  propertyId: text("property_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }).notNull(),
  squareFootage: integer("square_footage").notNull(),
  lotSize: text("lot_size"),
  yearBuilt: integer("year_built"),
  propertyType: text("property_type").notNull(),
  status: text("status").notNull().default("for_sale"),
  images: text("images").array().notNull().default([]),
  features: text("features").array().notNull().default([]),
  hoaFees: decimal("hoa_fees", { precision: 8, scale: 2 }),
  propertyTax: decimal("property_tax", { precision: 10, scale: 2 }),
  agentName: text("agent_name"),
  agentPhone: text("agent_phone"),
  agentEmail: text("agent_email"),
  agentPhoto: text("agent_photo"),
  agentRating: decimal("agent_rating", { precision: 2, scale: 1 }),
  agentReviews: integer("agent_reviews"),
  userId: uuid("user_id").references(() => profiles.id), // Change to uuid and reference profiles.id
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  inquiryType: text("inquiry_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  createdAt: true,
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
