# Development Context & Guidelines

## AI Development Rules

### Before Making Changes
1. **Always read existing files first** using Read tool
2. **Check current implementation patterns** in similar components
3. **Follow existing code style** and naming conventions
4. **Use TodoWrite for complex tasks** to track progress

### Architecture Constraints
- **Direct Supabase Integration**: No API endpoints for CRUD operations
- **Manual Infrastructure**: All database/storage changes via Supabase dashboard
- **TypeScript First**: Strict typing throughout the application
- **Component Consistency**: Use existing Shadcn/ui patterns

### Development Preferences
- **File Modifications**: Always prefer editing existing files over creating new ones
- **Documentation**: Never create documentation files unless explicitly requested
- **Error Handling**: Include proper error states and user feedback
- **Performance**: Use React best practices (useMemo, useCallback when needed)

## Code Reading Strategy
When asked to implement features:
1. Read relevant existing components first
2. Check shared/schema.ts for data types
3. Look at similar pages for patterns
4. Review AuthContext for auth patterns
5. Check lib/supabase.ts for data operations

## Common Implementation Patterns

### New Component Checklist
- [ ] Import necessary UI components from components/ui/
- [ ] Use useAuth() hook if authentication needed
- [ ] Follow existing TypeScript patterns
- [ ] Add proper error handling and loading states
- [ ] Use Tailwind classes for styling
- [ ] Include accessibility attributes

### Database Operation Pattern
```typescript
// Always use direct Supabase calls
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

if (error) {
  console.error('Error:', error);
  // Handle error in UI
  return;
}

// Use data
```

### File Upload Pattern
```typescript
// Use existing uploadImage function
const imageUrl = await uploadImage(file, user.id);
if (imageUrl) {
  // Update database with image URL
}
```

## Project-Specific Conventions

### Authentication
- Always check user state before protected operations
- Use role-based rendering for buyer/seller features
- Handle loading states during auth initialization

### Data Fetching
- Use TanStack Query for caching where appropriate
- Always handle loading and error states
- Provide user feedback for operations

### UI/UX Standards
- Follow existing color scheme (ladybug primary color)
- Use consistent spacing and typography
- Mobile-first responsive design
- Smooth transitions and animations

### Error Handling
- Use toast notifications for user feedback
- Log errors to console for debugging
- Provide fallback UI for error states
- Never expose technical errors to users

## Testing Approach
- Test with existing sample data
- Verify authentication flows work correctly
- Check role-based permissions
- Test responsive design on different screen sizes
- Verify file upload functionality

## Performance Considerations
- Optimize image uploads with proper sizing
- Use lazy loading for property images
- Implement proper loading states
- Cache user data appropriately
- Minimize unnecessary re-renders

## Security Best Practices
- Never expose sensitive data in client code
- Use Supabase RLS policies for data security
- Validate all user inputs
- Handle authentication state properly
- Secure file upload processes