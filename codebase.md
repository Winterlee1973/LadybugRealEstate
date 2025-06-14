# Ladybug Real Estate Codebase Overview

## Architecture Summary
Real estate platform with direct Supabase integration - no CRUD API layer.

## Directory Structure
```
LadybugRealEstate/
├── client/                 # React frontend (port 5173)
├── server/                 # Express backend (port 3000)  
├── shared/                 # Shared TypeScript types
├── scripts/               # Database utilities
├── migrations/            # Database schema files
└── mcp-server/           # AI chat server
```

## Key Files by Feature

### Authentication & Users
- `client/src/contexts/AuthContext.tsx` - Global auth state
- `client/src/components/auth/AuthModal.tsx` - Login/signup UI
- `client/src/pages/profile.tsx` - User profile management

### Properties & Listings  
- `client/src/pages/property-listings.tsx` - Property browse page
- `client/src/pages/property-detail.tsx` - Individual property page
- `client/src/components/property-card.tsx` - Property display component
- `server/storage.ts` - Property data access layer

### Database & Types
- `shared/schema.ts` - All database types and Zod schemas
- `client/src/lib/supabase.ts` - Supabase client + file upload
- `server/db.ts` - Database connection configuration

### UI Components
- `client/src/components/ui/` - Shadcn/ui component library
- `client/src/components/navigation.tsx` - Main navigation
- `client/src/components/footer.tsx` - Site footer

## Data Flow Pattern
```
User Action → Supabase Client → Database → UI Update
```

No API middleware layer - all CRUD operations use direct Supabase calls.

## Environment Setup
- `.env.local` - Development environment variables
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Frontend build configuration
- `tsconfig.json` - TypeScript configuration

## Database Tables
- `profiles` - User roles and metadata
- `properties` - Property listings
- `favorites` - User saved properties  
- `inquiries` - Property contact requests

## Authentication Flow
1. User signs up/in via Supabase Auth
2. Profile automatically created in `profiles` table
3. Role assigned (buyer/seller)
4. Role-based UI and permissions

## File Upload Pattern
```typescript
// Direct to Supabase Storage
const imageUrl = await uploadImage(file, user.id);
await supabase.auth.updateUser({
  data: { avatar_url: imageUrl }
});
```

## Common Patterns
- **Auth Check**: `const { user, role } = useAuth()`
- **Data Fetch**: `await supabase.from('table').select()`
- **File Upload**: `uploadImage(file, userId)` from supabase.ts
- **Navigation**: `useLocation()` and `<Link>` from Wouter
- **Forms**: React Hook Form + Zod validation

## Development Workflow
1. Make database changes manually in Supabase dashboard
2. Update types in `shared/schema.ts`
3. Implement UI changes in React components
4. Test with sample data using scripts
5. Deploy to Netlify with environment variables