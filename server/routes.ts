import type { Express } from "express";
// Remove createServer and type Server import
import { storage } from "./storage";
import { insertInquirySchema, properties } from "@shared/schema";
import { z } from "zod";
import { log } from "./vite";
import { db } from "./db"; // Import db
import { eq } from "drizzle-orm"; // Import eq

// Modify function signature and remove server creation
export async function registerRoutes(app: Express): Promise<void> {
  log("Registering routes...");
  log(`Storage object available: ${!!storage}`);

  // Get all properties
  app.get("/api/properties", async (req, res) => {
    try {
      const { priceMin, priceMax, bedrooms, bathrooms, city, propertyType } = req.query;

      const searchQuery = {
        ...(priceMin && { priceMin: parseInt(priceMin as string) }),
        ...(priceMax && { priceMax: parseInt(priceMax as string) }),
        ...(bedrooms && { bedrooms: parseInt(bedrooms as string) }),
        ...(bathrooms && { bathrooms: parseFloat(bathrooms as string) }),
        ...(city && { city: city as string }),
        ...(propertyType && { propertyType: propertyType as string }),
      };

      const properties = Object.keys(searchQuery).length > 0
        ? await storage.searchProperties(searchQuery)
        : await storage.getProperties();

      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Create user profile
  app.post("/api/profile", async (req, res) => {
    try {
      const { id, role: providedRole } = req.body;

      if (!id) {
        return res.status(400).json({ message: "User ID (id) is required" });
      }

      let role = providedRole;
      if (!role) {
        role = 'seller'; // Default role to 'seller' if not provided
      } else if (role !== 'buyer' && role !== 'seller') {
        return res.status(400).json({ message: "Invalid role. Must be 'buyer' or 'seller'." });
      }

      const profile = await storage.createProfile({ id, role });
      res.status(201).json(profile);
    } catch (error: any) {
      log(`Error creating profile: ${error.message}`);
      // Check for unique constraint violation (specific error code/message depends on ORM/DB)
      // For Prisma, P2002 is the unique constraint violation code
      if (error.code === 'P2002' || (error.message && error.message.toLowerCase().includes("unique constraint failed"))) {
        return res.status(409).json({ message: "Profile already exists." });
      }
      // Generic server error
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  // Get property by property ID
  app.get("/api/properties/:propertyId", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const property = await storage.getProperty(propertyId);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Search properties by property ID or address
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const query = q as string;
      
      // Check if the query matches a property ID pattern (e.g., LB1234 or 1234)
      const propertyIdMatch = query.match(/^(LB)?(\d{4})$/i);

      if (propertyIdMatch) {
        const numericId = propertyIdMatch[2]; // Extract the 4-digit number
        const property = await storage.getProperty(numericId); // getProperty handles both UUID and searchableId
        if (property) {
          return res.json([property]); // Return as an array for consistency with search results
        } else {
          return res.json([]); // No property found with that ID
        }
      } else {
        const zipCodeMatch = query.match(/^\d{5}$/);
        if (zipCodeMatch) {
          // If it's a 5-digit zip code, search by zipCode
          // If it's a 5-digit zip code, perform a direct query
          const searchResults = await db.select().from(properties).where(eq(properties.zipCode, query));
          res.json(searchResults);
        } else {
          // If not a property ID or a 5-digit zip code, return empty results
          // The searchProperties function will return an empty array if no conditions are met
          const searchResults = await storage.searchProperties({});
          res.json(searchResults);
        }
      }
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Create inquiry
  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      res.status(201).json(inquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inquiry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });

  // Get inquiries for a property
  app.get("/api/inquiries/:propertyId", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const inquiries = await storage.getInquiries(propertyId);
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  // Add/remove favorites
  app.post("/api/favorites", async (req, res) => {
    try {
      const { propertyId, userId } = req.body;

      if (!propertyId || !userId) {
        return res.status(400).json({ message: "Property ID and User ID are required" });
      }

      const favorite = await storage.addFavorite({ propertyId, userId });
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:propertyId/:userId", async (req, res) => {
    try {
      const { propertyId, userId } = req.params;
      const success = await storage.removeFavorite(propertyId, userId);

      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Get user favorites
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Get user profile
  log("Defining profile routes..."); // Log before profile routes
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getProfile(userId);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update user profile role
  app.put("/api/profile/:userId/role", async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!userId || !role) {
        return res.status(400).json({ message: "User ID and role are required" });
      }

      if (role !== 'buyer' && role !== 'seller') {
        return res.status(400).json({ message: "Invalid role. Must be 'buyer' or 'seller'." });
      }

      const updatedProfile = await storage.updateProfileRole(userId, role);

      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile role" });
    }
  });

  // Remove server creation
  // const httpServer = createServer(app);
  // return httpServer;
}

