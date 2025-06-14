# File & Code Conventions

## File Naming Standards

### Components
- **React Components**: PascalCase with .tsx extension
  - `PropertyCard.tsx`, `AuthModal.tsx`, `NavigationBar.tsx`
- **Pages**: kebab-case with .tsx extension  
  - `property-listings.tsx`, `seller-admin.tsx`, `how-it-works.tsx`
- **UI Components**: kebab-case (following Shadcn/ui)
  - `button.tsx`, `input.tsx`, `dropdown-menu.tsx`

### Utilities & Logic
- **Utility Files**: camelCase with .ts extension
  - `formatPrice.ts`, `validateForm.ts`, `dateHelpers.ts`
- **Types & Schemas**: descriptive names
  - `types.ts`, `schema.ts`, `apiTypes.ts`
- **Hooks**: use- prefix with camelCase
  - `useAuth.ts`, `usePropertySearch.ts`, `useFavorites.ts`

### Configuration Files
- **Config Files**: kebab-case or standard names
  - `vite.config.ts`, `tailwind.config.ts`, `package.json`
- **Environment**: standard naming
  - `.env.local`, `.env.example`

## Code Naming Conventions

### Variables & Functions
```typescript
// Variables: camelCase
const userProfile = getUserProfile();
const isLoading = true;
const propertyList = [];

// Functions: camelCase with descriptive verbs
const formatCurrency = (amount: number) => {};
const validateEmail = (email: string) => {};
const handleSubmit = async () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const API_ENDPOINTS = {
  PROPERTIES: '/api/properties'
};
```

### React Components
```typescript
// Component names: PascalCase
const PropertyCard = ({ property }: PropertyCardProps) => {};
const UserProfile = () => {};

// Props interfaces: ComponentName + Props
interface PropertyCardProps {
  property: Property;
  onFavorite?: () => void;
}

// State variables: descriptive camelCase
const [isLoading, setIsLoading] = useState(false);
const [userProperties, setUserProperties] = useState<Property[]>([]);
```

### Database & Types
```typescript
// Table names: snake_case (following SQL convention)
// properties, user_profiles, favorite_listings

// Type names: PascalCase
type Property = {
  id: string;
  title: string;
  price: number;
};

// Enum values: UPPER_CASE
enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller'
}
```

## Import/Export Standards

### Import Order
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

// 3. Internal components (UI first, then custom)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PropertyCard } from '@/components/PropertyCard';

// 4. Hooks and utilities
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

// 5. Types
import type { Property } from '@shared/schema';
```

### Export Patterns
```typescript
// Default exports for components and pages
export default function PropertyListings() {}

// Named exports for utilities and types
export const formatCurrency = () => {};
export const validateEmail = () => {};
export type { Property, User };
```

## CSS & Styling Conventions

### Tailwind Classes
```typescript
// Order: layout → spacing → typography → colors → effects
className="flex items-center gap-4 p-6 text-lg font-semibold text-gray-900 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"

// Use semantic class groupings
className="
  flex flex-col items-center gap-6
  p-8 mx-auto max-w-4xl
  text-center
  bg-gradient-to-br from-blue-50 to-purple-50
  rounded-xl shadow-lg
"
```

### CSS Custom Properties
```css
/* Use CSS variables for consistent theming */
:root {
  --color-ladybug: #D4756B;
  --color-primary: var(--color-ladybug);
  --color-text: #2D3748;
}
```

## Comment Standards

### TypeScript Comments
```typescript
/**
 * Formats a price value into currency string
 * @param price - The numeric price value
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
const formatCurrency = (price: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price);
};

// TODO: Add error handling for invalid price values
// FIXME: Handle edge case with extremely large numbers
```

### Component Comments
```typescript
/**
 * PropertyCard - Displays property information in a card format
 * 
 * Features:
 * - Property image with fallback
 * - Favorite toggle functionality
 * - Responsive design
 * - Price formatting
 */
const PropertyCard = ({ property, onFavorite }: PropertyCardProps) => {
  // Component implementation
};
```

## Directory Organization

### Component Structure
```
components/
├── ui/                 # Shadcn/ui components (kebab-case)
│   ├── button.tsx
│   ├── input.tsx
│   └── dropdown-menu.tsx
├── auth/              # Auth-related components
│   ├── AuthModal.tsx
│   └── LoginForm.tsx
├── PropertyCard.tsx   # Standalone components (PascalCase)
├── Navigation.tsx
└── Footer.tsx
```

### Page Structure
```
pages/
├── landing.tsx           # Public pages (kebab-case)
├── property-listings.tsx
├── property-detail.tsx
├── profile.tsx          # User pages
├── seller-admin.tsx     # Role-specific pages
└── not-found.tsx
```

## API & Data Conventions

### Supabase Operations
```typescript
// Consistent error handling pattern
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('user_id', userId);

if (error) {
  console.error('Database error:', error);
  throw new Error('Failed to fetch properties');
}

return data;
```

### Type Safety
```typescript
// Always use proper typing
const properties: Property[] = data || [];
const user: User | null = getCurrentUser();

// Avoid 'any' type - use unknown or proper types
const parseUserData = (data: unknown): User => {
  // Type validation logic
};
```

These conventions ensure consistency across the codebase and make it easier for AI assistants to generate appropriate code that follows the established patterns.