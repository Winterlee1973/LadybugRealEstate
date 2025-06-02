export interface SearchFilters {
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  propertyType?: string;
  zipCode?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  inquiryType: 'general' | 'tour' | 'offer' | 'agent';
}
