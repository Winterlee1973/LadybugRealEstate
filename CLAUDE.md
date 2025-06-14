# Claude Development Assistant Guide

## Project Information
- **Name**: Ladybug Real Estate Platform
- **Type**: Full-stack web application
- **Framework**: React + TypeScript frontend, Express backend, Supabase database

## Essential Commands

### Development
```bash
npm run dev:mcp          # Start full development stack (client + server + MCP)
npm run dev             # Start server only
npm run build           # Build for production
npm run start           # Start production server
```

### Database & Testing
```bash
npm run db:test-connection  # Test database connectivity
npm run db:seed            # Seed sample data
npm run check              # TypeScript type checking
```

### MCP Server
```bash
npm run mcp:install     # Install MCP server dependencies
npm run mcp:build       # Build MCP server
npm run mcp:start       # Start MCP server
npm run mcp:dev         # Start MCP server in development mode
```

## Architecture Guidelines

### 🚨 Critical Rules
- **NO API endpoints for CRUD operations** - Use direct Supabase client calls
- **NO automated Supabase setup** - All database/storage changes done manually
- **Direct database access** - `await supabase.from('table').select()`
- **Supabase Auth only** - No custom authentication systems

### Key Patterns
- Authentication: `const { user, supabase, role } = useAuth()`
- Components: Import from `@/components/ui/` (Shadcn/ui)
- Routing: Uses Wouter for lightweight routing
- State: TanStack Query + React Context

## File Structure
```
├── client/src/          # React frontend
│   ├── components/      # Reusable components
│   ├── pages/          # Route components  
│   ├── lib/            # Utilities (supabase.ts, types.ts)
│   └── contexts/       # React contexts
├── server/             # Express backend (utilities only)
├── shared/schema.ts    # Database types + Zod validation
├── mcp-server/         # MCP server for AI integration
└── scripts/           # Database utilities
```

## Common Tasks

### When adding new features:
1. Check if authentication is needed (`useAuth()`)
2. Use direct Supabase calls for data
3. Follow existing component patterns
4. Update `shared/schema.ts` for new types

### When database changes are needed:
1. Make changes manually in Supabase dashboard
2. Update `shared/schema.ts` with new types
3. Test with `npm run db:test-connection`

### Before committing:
- Run `npm run check` for TypeScript validation
- Test the application with `npm run dev:mcp`

## Environment Setup
Required environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `DATABASE_URL`

## Notes for Claude
- This is a real estate platform with buyer/seller roles
- Focus on direct Supabase integration over API layers
- Use existing UI components from Shadcn/ui
- Follow TypeScript best practices
- All database structure managed manually in Supabase dashboard