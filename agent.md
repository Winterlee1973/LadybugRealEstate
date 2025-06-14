# Ladybug Real Estate AI Agent Context

## Project Overview
Next-generation real estate platform built with React/TypeScript frontend, Express backend, and Supabase as the primary database and authentication provider.

## Critical Architecture Rules

### 🚨 NEVER CREATE API ENDPOINTS FOR CRUD OPERATIONS
- All data operations use direct Supabase client calls
- Database operations: `await supabase.from('table').select()`
- Authentication: Handled entirely through Supabase Auth
- File uploads: Direct to Supabase Storage

### 🚨 MANUAL SUPABASE SETUP ONLY
- ALL database structure changes done manually at supabase.com
- ALL storage bucket/policy setup done manually at supabase.com  
- ALL authentication configuration done manually at supabase.com
- NEVER create scripts to modify Supabase infrastructure

## Tech Stack & Patterns

### Frontend (client/)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Routing**: Wouter (lightweight React router)
- **State**: TanStack Query + React Context (AuthContext)
- **Auth**: `const { user, supabase, role } = useAuth()`

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **Database**: Direct Supabase client calls
- **File Structure**: Routes in server/routes.ts, storage in server/storage.ts

### Database & Auth
- **Provider**: Supabase (PostgreSQL + Auth + Storage)
- **Schema**: Shared types in shared/schema.ts
- **Auth Flow**: Supabase Auth with role-based permissions (buyer/seller)

## Key Code Patterns

### Authentication
```typescript
// Always use the useAuth hook
const { user, supabase, role } = useAuth();
// Check authentication state
if (!user) return <LoginPrompt />;
```

### Database Operations
```typescript
// Direct Supabase calls - NO API endpoints
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('user_id', user.id);
```

### File Uploads
```typescript
// Direct to Supabase Storage
const { data, error } = await supabase.storage
  .from('user-uploads')
  .upload(filePath, file);
```

### Components
```typescript
// Use Shadcn/ui components from client/src/components/ui/
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

## File Structure Reference

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── ui/         # Shadcn/ui components
│   │   │   └── auth/       # Auth-related components  
│   │   ├── pages/          # Route components
│   │   ├── contexts/       # React contexts (AuthContext)
│   │   ├── lib/            # Utilities (supabase.ts, types.ts)
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes (search/utilities only)
│   ├── storage.ts         # Data access layer
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schemas + Zod validation
└── scripts/               # Database utilities (seed, test only)
```

## User Roles & Permissions
- **Buyer**: Default role, can browse properties, save favorites, contact agents
- **Seller**: Enhanced permissions, access to seller dashboard, property management
- **Role Management**: Handled through profiles table and AuthContext

## Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  
DATABASE_URL=your_supabase_database_url
```

## Common Tasks & Solutions

### Adding New Features
1. Check if feature needs authentication (`useAuth()`)
2. Use direct Supabase calls for data operations
3. Follow existing component patterns in client/src/components/
4. Add types to shared/schema.ts if needed

### Database Changes
1. Make ALL changes manually in Supabase dashboard
2. Update shared/schema.ts with new types
3. Test with scripts/test-connection.ts

### Storage/File Uploads
1. Ensure bucket exists in Supabase dashboard
2. Set policies manually in Supabase dashboard
3. Use uploadImage function from client/src/lib/supabase.ts

## What NOT to Do
- ❌ Create API endpoints for basic CRUD operations
- ❌ Create database migration scripts  
- ❌ Create Supabase policy/bucket scripts
- ❌ Use external APIs for data that should be in Supabase
- ❌ Create new documentation files unless explicitly requested

## Development Commands
```bash
npm run dev:full        # Start full development stack
npm run build          # Build for production
npm run db:seed        # Seed sample data (after manual setup)
npm run db:test-connection # Test database connectivity
```

This context should help AI assistants understand the project structure and make appropriate code suggestions that align with the established architecture patterns.