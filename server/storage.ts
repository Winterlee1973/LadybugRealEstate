import { properties, favorites, inquiries, type Property, type InsertProperty, type Favorite, type InsertFavorite, type Inquiry, type InsertInquiry } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private properties: Map<string, Property>;
  private favoritesMap: Map<string, Favorite>;
  private inquiriesMap: Map<number, Inquiry>;
  private currentId: number;
  private currentFavoriteId: number;
  private currentInquiryId: number;

  constructor() {
    this.properties = new Map();
    this.favoritesMap = new Map();
    this.inquiriesMap = new Map();
    this.currentId = 1;
    this.currentFavoriteId = 1;
    this.currentInquiryId = 1;
    this.seedData();
  }

  private seedData() {
    const sampleProperties: Property[] = [
      {
        id: this.currentId++,
        propertyId: "LBG12345",
        title: "Beautifully Renovated Single-Family Home",
        description: "Beautifully renovated single-family home in a prime location. This stunning property features an open floor plan, a gourmet kitchen with stainless steel appliances, and a spacious backyard perfect for entertaining. Enjoy modern finishes and ample natural light throughout.",
        price: "729000",
        address: "123 Main Street",
        city: "Anytown",
        state: "CA",
        zipCode: "90210",
        bedrooms: 4,
        bathrooms: "3.0",
        squareFootage: 2100,
        lotSize: "0.25 acres",
        yearBuilt: 2018,
        propertyType: "Single Family",
        status: "for_sale",
        images: [
          "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        features: ["Newly Renovated Kitchen", "Hardwood Floors", "Central Air Conditioning", "2-Car Garage", "Landscaped Yard", "Walk-in Closets"],
        hoaFees: "150",
        propertyTax: "8748",
        agentName: "Sarah Johnson",
        agentPhone: "(555) 123-4567",
        agentEmail: "sarah@ladybug.com",
        agentPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        agentRating: "4.9",
        agentReviews: 127,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        propertyId: "LBG12346",
        title: "Stunning Luxury Home with Pool",
        description: "Stunning luxury home with pool and panoramic city views. This magnificent property offers the ultimate in modern living with high-end finishes throughout.",
        price: "1250000",
        address: "456 Oak Avenue",
        city: "Beverly Hills",
        state: "CA",
        zipCode: "90212",
        bedrooms: 5,
        bathrooms: "4.0",
        squareFootage: 3200,
        lotSize: "0.5 acres",
        yearBuilt: 2020,
        propertyType: "Single Family",
        status: "for_sale",
        images: [
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        features: ["Swimming Pool", "City Views", "Gourmet Kitchen", "Master Suite", "3-Car Garage", "Wine Cellar"],
        hoaFees: "300",
        propertyTax: "15000",
        agentName: "Michael Chen",
        agentPhone: "(555) 234-5678",
        agentEmail: "michael@ladybug.com",
        agentPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        agentRating: "4.8",
        agentReviews: 93,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        propertyId: "LBG12347",
        title: "Classic Victorian Charm",
        description: "Classic Victorian charm with modern updates throughout. This historic home has been lovingly restored while maintaining its original character.",
        price: "585000",
        address: "789 Elm Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102",
        bedrooms: 3,
        bathrooms: "2.0",
        squareFootage: 1800,
        lotSize: "0.15 acres",
        yearBuilt: 1890,
        propertyType: "Victorian",
        status: "for_sale",
        images: [
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        features: ["Historic Character", "Updated Kitchen", "Original Hardwood", "Bay Windows", "Garden", "Period Details"],
        hoaFees: "0",
        propertyTax: "7020",
        agentName: "Emily Rodriguez",
        agentPhone: "(555) 345-6789",
        agentEmail: "emily@ladybug.com",
        agentPhoto: "https://images.unsplash.com/photo-1494790108755-2616b332e234?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        agentRating: "4.7",
        agentReviews: 84,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        propertyId: "LBG12348",
        title: "Architect-Designed Contemporary",
        description: "Architect-designed contemporary home with stunning views. This modern masterpiece showcases clean lines and innovative design.",
        price: "950000",
        address: "321 Pine Road",
        city: "Marin County",
        state: "CA",
        zipCode: "94941",
        bedrooms: 4,
        bathrooms: "3.0",
        squareFootage: 2400,
        lotSize: "0.3 acres",
        yearBuilt: 2019,
        propertyType: "Contemporary",
        status: "for_sale",
        images: [
          "https://images.unsplash.com/photo-1601760562234-9814eea6663a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        features: ["Architect Designed", "Floor-to-Ceiling Windows", "Open Floor Plan", "Modern Kitchen", "Views", "Sustainable Features"],
        hoaFees: "200",
        propertyTax: "11400",
        agentName: "David Kim",
        agentPhone: "(555) 456-7890",
        agentEmail: "david@ladybug.com",
        agentPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        agentRating: "4.9",
        agentReviews: 156,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        propertyId: "LBG12349",
        title: "Charming Cottage Perfect for First-Time Buyers",
        description: "Charming cottage perfect for first-time buyers. This cozy home offers comfortable living in a desirable neighborhood.",
        price: "425000",
        address: "654 Rose Lane",
        city: "Palo Alto",
        state: "CA",
        zipCode: "94301",
        bedrooms: 2,
        bathrooms: "1.0",
        squareFootage: 1200,
        lotSize: "0.1 acres",
        yearBuilt: 1950,
        propertyType: "Cottage",
        status: "for_sale",
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        features: ["Cozy Living", "Garden", "Updated Bathroom", "Hardwood Floors", "Quiet Street", "Walking Distance to Transit"],
        hoaFees: "0",
        propertyTax: "5100",
        agentName: "Lisa Thompson",
        agentPhone: "(555) 567-8901",
        agentEmail: "lisa@ladybug.com",
        agentPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        agentRating: "4.6",
        agentReviews: 72,
        createdAt: new Date(),
      },
      {
        id: this.currentId++,
        propertyId: "LBG12350",
        title: "Single-Level Living with Large Lot",
        description: "Single-level living with spacious rooms and large lot. Perfect for those seeking comfort and convenience in one floor living.",
        price: "675000",
        address: "987 Maple Drive",
        city: "San Jose",
        state: "CA",
        zipCode: "95123",
        bedrooms: 3,
        bathrooms: "2.0",
        squareFootage: 1950,
        lotSize: "0.4 acres",
        yearBuilt: 1975,
        propertyType: "Ranch",
        status: "for_sale",
        images: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        features: ["Single Level", "Large Lot", "Updated Kitchen", "Family Room", "2-Car Garage", "Mature Trees"],
        hoaFees: "0",
        propertyTax: "8100",
        agentName: "Robert Wilson",
        agentPhone: "(555) 678-9012",
        agentEmail: "robert@ladybug.com",
        agentPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        agentRating: "4.8",
        agentReviews: 104,
        createdAt: new Date(),
      }
    ];

    sampleProperties.forEach(property => {
      this.properties.set(property.propertyId, property);
    });
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(propertyId: string): Promise<Property | undefined> {
    return this.properties.get(propertyId);
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    return Array.from(this.properties.values()).find(p => p.id === id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const property: Property = {
      ...insertProperty,
      id: this.currentId++,
      createdAt: new Date(),
    };
    this.properties.set(property.propertyId, property);
    return property;
  }

  async updateProperty(propertyId: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(propertyId);
    if (!property) return undefined;

    const updatedProperty = { ...property, ...updates };
    this.properties.set(propertyId, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(propertyId: string): Promise<boolean> {
    return this.properties.delete(propertyId);
  }

  async searchProperties(query: { 
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    city?: string;
    propertyType?: string;
  }): Promise<Property[]> {
    const allProperties = Array.from(this.properties.values());
    
    return allProperties.filter(property => {
      if (query.priceMin && parseFloat(property.price) < query.priceMin) return false;
      if (query.priceMax && parseFloat(property.price) > query.priceMax) return false;
      if (query.bedrooms && property.bedrooms < query.bedrooms) return false;
      if (query.bathrooms && parseFloat(property.bathrooms) < query.bathrooms) return false;
      if (query.city && !property.city.toLowerCase().includes(query.city.toLowerCase())) return false;
      if (query.propertyType && property.propertyType !== query.propertyType) return false;
      return true;
    });
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return Array.from(this.favoritesMap.values()).filter(fav => fav.userId === userId);
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const favorite: Favorite = {
      ...insertFavorite,
      id: this.currentFavoriteId++,
      createdAt: new Date(),
    };
    this.favoritesMap.set(`${favorite.propertyId}-${favorite.userId}`, favorite);
    return favorite;
  }

  async removeFavorite(propertyId: string, userId: string): Promise<boolean> {
    return this.favoritesMap.delete(`${propertyId}-${userId}`);
  }

  async getInquiries(propertyId: string): Promise<Inquiry[]> {
    return Array.from(this.inquiriesMap.values()).filter(inq => inq.propertyId === propertyId);
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const inquiry: Inquiry = {
      ...insertInquiry,
      id: this.currentInquiryId++,
      createdAt: new Date(),
    };
    this.inquiriesMap.set(inquiry.id, inquiry);
    return inquiry;
  }
}

export const storage = new MemStorage();
