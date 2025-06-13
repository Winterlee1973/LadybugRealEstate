# Ladybug.com - Real Estate Platform

A next-generation real estate platform designed to empower homeowners with flexible, tech-enhanced selling options. Ladybug.com offers a comprehensive user experience with authentication, property search, favorites management, user profiles, and AI-powered assistance for both buyers and sellers.

## 🏠 Features

### Core Functionality
- **Property ID Search**: Direct property lookup using unique Property IDs (e.g., LBG12345)
- **Advanced Property Listings**: Browse properties with filtering, sorting, and search capabilities
- **Detailed Property Pages**: Comprehensive property information with image galleries and agent details
- **AI-Powered Assistant**: Real-time property Q&A powered by intelligent responses
- **User Authentication**: Secure login/signup with Supabase Auth
- **User Profiles**: Role-based profiles (buyer/seller) with personalized experiences
- **Favorites System**: Save and manage favorite properties
- **Agent Connection**: Direct communication with listing agents and sellers
- **Seller Dashboard**: Property management interface for sellers
- **Responsive Design**: Mobile-first design optimized for all devices

### User Roles & Permissions
- **Buyers**: Browse properties, save favorites, contact agents, manage profile
- **Sellers**: List properties, manage listings, view inquiries, access seller dashboard
- **Authenticated Features**: Favorites, profile management, inquiry history

### Selling Options
- **For Sale by Owner (FSBO)**: $995/month plan with MLS syndication and AI support
- **Agent Connection**: 2% total commission with vetted partner agents
- **Professional Services**: Photography, staging, and marketing support

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern React with hooks and function components
- **TypeScript**: Full type safety throughout the application
- **Vite**: Fast development build tool with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Wouter**: Lightweight client-side routing (2KB alternative to React Router)
- **TanStack Query**: Powerful data fetching and caching library
- **Shadcn/ui**: Beautiful, accessible UI components built on Radix UI
- **Lucide React**: Beautiful SVG icons
- **React Hook Form**: Performant forms with easy validation
- **Framer Motion**: Smooth animations and transitions

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Fast, unopinionated web framework
- **TypeScript**: Type-safe server-side code
- **Supabase**: Backend-as-a-Service with PostgreSQL database
- **Drizzle ORM**: TypeScript-first ORM with excellent developer experience
- **Zod**: TypeScript-first schema validation
- **Express Session**: Session management with PostgreSQL store

### Database & Authentication
- **Supabase PostgreSQL**: Managed PostgreSQL database with real-time capabilities
- **Supabase Auth**: Complete authentication system with social providers
- **Row Level Security (RLS)**: Database-level security policies
- **Drizzle Migrations**: Type-safe database schema management

### Development Tools
- **ESBuild**: Fast JavaScript bundler
- **PostCSS**: CSS processing with Tailwind CSS integration
- **TypeScript Compiler**: Static type checking
- **Drizzle Kit**: Database migration and introspection tools
- **TSX**: TypeScript execution for scripts

## ⚠️ Important Architecture Notes

### Direct Supabase Integration Required

**This application uses direct Supabase client calls instead of API endpoints for data operations.** This architectural decision is necessary for Netlify deployment compatibility and ensures optimal performance.

#### Key Implementation Details:
- ✅ **Client-side data operations**: All property creation, fetching, and user operations use the Supabase client directly
- ✅ **Authentication**: Handled entirely through Supabase Auth
- ✅ **File uploads**: Images and assets uploaded directly to Supabase Storage
- ⚠️ **API endpoints**: Limited to non-data operations only (search, utilities)

#### Why This Architecture:
1. **Netlify Compatibility**: Direct Supabase calls work seamlessly with Netlify's serverless functions
2. **Performance**: Eliminates the need for API middleware, reducing latency
3. **Real-time Features**: Direct access to Supabase's real-time capabilities
4. **Simplified Deployment**: No need to manage API server state or connections

#### Development Guidelines:
- **DO**: Use Supabase client directly for all CRUD operations
- **DON'T**: Create API endpoints for basic data operations
- **EXCEPTION**: Search and utility functions may use API endpoints if needed

```typescript
// ✅ Correct approach - Direct Supabase
const { data, error } = await supabase
  .from('properties')
  .insert([propertyData]);

// ❌ Avoid - API endpoint for data operations
const response = await fetch('/api/properties', {
  method: 'POST',
  body: JSON.stringify(propertyData)
});
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** for version control
- **VS Code** (recommended) - [Download VS Code](https://code.visualstudio.com/)
- **Supabase Account** - [Sign up at Supabase](https://supabase.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ladybug-real-estate.git
cd ladybug-real-estate
```

### 2. Install Dependencies

```bash
npm install
```

This will install all frontend and backend dependencies including:
- React and related packages
- Express.js and server dependencies
- Supabase client and authentication
- TypeScript and build tools
- UI component libraries
- Development tools

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_database_url

# Development
NODE_ENV=development
PORT=3000
```

**Important**: 
- Use `VITE_` prefix for client-side environment variables
- The Vite config automatically loads `.env.local` for local development
- For production deployment (Netlify, Vercel, etc.), set these environment variables in your hosting platform's dashboard

### 4. Database Setup

#### Initialize Supabase Tables

Run the database migration to create all necessary tables:

```bash
npm run db:migrate
```

#### Seed Sample Data

Populate the database with sample properties and data:

```bash
npm run db:seed
```

#### Test Database Connection

Verify your database connection:

```bash
npm run db:test-connection
```

### 5. Start the Development Server

You have two options for running the development server:

#### Option 1: Full Development Stack (Recommended)
```bash
npm run dev:full
```

This runs the `start-dev.sh` script which:
- Starts the MCP (Model Context Protocol) server for AI chat functionality
- Starts the main Express server with live logs
- Handles process cleanup automatically
- Shows colored console output for easy debugging

#### Option 2: Basic Development Server
```bash
npm run dev
```

This starts just the core application:
- **Frontend Development Server** (Vite) - http://localhost:3000
- **Backend API Server** (Express) - http://localhost:3000/api

**Note**: The full stack (`dev:full`) is recommended as it provides the complete development experience with all services running and proper log output for debugging.

## 📁 Project Structure

```
ladybug-real-estate/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Shadcn/ui components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── navigation.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── property-card.tsx
│   │   │   └── ai-chat.tsx
│   │   ├── pages/          # Route components
│   │   │   ├── landing.tsx
│   │   │   ├── property-listings.tsx
│   │   │   ├── property-detail.tsx
│   │   │   ├── favorite-listings.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── seller-admin.tsx
│   │   │   ├── sell-your-home.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   └── not-found.tsx
│   │   ├── contexts/       # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── lib/            # Utility functions and types
│   │   │   ├── utils.ts
│   │   │   ├── types.ts
│   │   │   ├── queryClient.ts
│   │   │   └── supabase.ts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── App.tsx         # Main application component
│   │   ├── main.tsx        # Application entry point
│   │   └── index.css       # Global styles and Tailwind imports
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── db.ts              # Database connection and configuration
│   ├── storage.ts         # Data access layer
│   ├── supabase-storage.ts # Supabase-specific storage operations
│   └── vite.ts            # Vite development server integration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schemas and Zod validation
├── scripts/               # Database and utility scripts
│   ├── migrate.ts         # Database migration runner
│   ├── seed.ts            # Database seeding script
│   ├── test-connection.ts # Database connection test
│   ├── check-properties.ts # Property data validation
│   ├── test-search.ts     # Search functionality test
│   ├── backfill-profiles.ts # User profile backfill utility
│   └── create-tables.ts   # Table creation script
├── migrations/            # Drizzle database migrations
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── drizzle.config.ts     # Drizzle ORM configuration
└── README.md             # This file
```

## 🔐 Authentication & User Management

### Authentication Flow
- **Supabase Auth**: Handles user registration, login, and session management
- **Role-based Access**: Users are assigned 'buyer' or 'seller' roles
- **Protected Routes**: Certain features require authentication
- **Profile Management**: Users can update their profiles and preferences

### User Roles
- **Buyer**: Default role for new users
  - Browse and search properties
  - Save favorites
  - Contact agents
  - Manage profile
- **Seller**: Enhanced permissions for property owners
  - All buyer permissions
  - Access to seller dashboard
  - Property management
  - View inquiries and analytics

## 🗄️ Database Schema

### Core Tables

#### Profiles
- User profiles with role-based permissions
- UUID primary keys for Supabase Auth integration
- Created timestamp tracking

#### Properties
- Comprehensive property information
- Unique property IDs for easy searching
- Image arrays and feature lists
- Agent contact information
- User association for sellers

#### Favorites
- User-property relationship tracking
- Quick access to saved properties
- Timestamp for sorting

#### Inquiries
- Property inquiry management
- Contact information capture
- Inquiry type categorization

## 🧩 Key Components & Features

### Frontend Components

#### Authentication (`client/src/components/auth/`)
- **AuthModal**: Login/signup modal with Supabase Auth UI
- **AuthContext**: Global authentication state management
- Protected route handling

#### Navigation (`client/src/components/navigation.tsx`)
- Responsive navigation with mobile menu
- Authentication-aware menu items
- User profile dropdown
- Role-based navigation options

#### Property Components
- **PropertyCard**: Property summary with favorites integration
- **PropertyDetail**: Comprehensive property information
- **PropertyListings**: Grid view with advanced filtering

#### User Features
- **Profile Management**: User settings and preferences
- **Favorites**: Saved properties management
- **Seller Dashboard**: Property management interface

### Backend API Endpoints

#### Authentication & Users
- `GET /api/profile/:userId` - Get user profile
- `POST /api/profile` - Create/update user profile

#### Properties
- `GET /api/properties` - List properties with filtering
- `GET /api/properties/:propertyId` - Get specific property
- `GET /api/search` - Search properties by ID or address
- `POST /api/properties` - Create new property (sellers only)

#### Favorites
- `GET /api/favorites/:userId` - Get user's favorites
- `POST /api/favorites` - Add property to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

#### Inquiries
- `POST /api/inquiries` - Submit property inquiry
- `GET /api/inquiries/:propertyId` - Get property inquiries

## 🎨 Styling & Design

### Design System

#### Color Palette
- **Primary (Ladybug)**: `#D4756B` - Warm coral red for CTAs and highlights
- **Dark Gray**: `#2D3748` - Primary text color
- **Medium Gray**: `#718096` - Secondary text and subtle elements
- **Light Gray**: `#F7FAFC` - Background and card colors

#### Typography
- **Font Family**: Inter (modern, clean sans-serif)
- **Headings**: Bold weights for hierarchy
- **Body Text**: Regular weight for readability

#### Components
- **Cards**: Clean white backgrounds with subtle shadows
- **Buttons**: Rounded corners with hover states and loading states
- **Forms**: Focus states, validation styling, and error handling
- **Navigation**: Sticky header with backdrop blur

### Responsive Design
- **Mobile**: < 768px - Touch-optimized interface
- **Tablet**: 768px - 1024px - Balanced layout
- **Desktop**: > 1024px - Full feature set

## 🔧 Development Commands

```bash
# Development
npm run dev:full        # Start full development stack (recommended)
npm run dev             # Start basic development server
npm run build           # Build for production
npm run start           # Start production server
npm run start:env       # Start production server with local env
npm run check           # TypeScript type checking

# Database Operations
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data
npm run db:push         # Push schema changes to database
npm run db:test-connection # Test database connectivity

# Utility Scripts
tsx scripts/check-properties.ts    # Validate property data
tsx scripts/test-search.ts         # Test search functionality
tsx scripts/backfill-profiles.ts   # Backfill user profiles
```

## 🚀 Production Deployment

### Build the Application

```bash
npm run build
```

This creates optimized production builds:
- Frontend assets in `client/dist/`
- Server bundle ready for deployment

### Environment Variables

For production deployment, set these environment variables:

```bash
# Supabase (Required)
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
DATABASE_URL=your_production_database_url

# Server Configuration
PORT=3000
NODE_ENV=production

# Optional External Services
STRIPE_SECRET_KEY=your_stripe_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
OPENAI_API_KEY=your_openai_key
```

### Deployment Platforms

The application is ready for deployment on:
- **Vercel** (recommended) - Automatic deployments with Supabase integration
- **Netlify** - With serverless functions
- **Railway** - Full-stack deployment with database
- **Replit Deployments** - Quick prototyping and development

### Supabase Production Setup

1. Create a production Supabase project
2. Run migrations: `npm run db:migrate`
3. Seed initial data: `npm run db:seed`
4. Configure Row Level Security policies
5. Set up authentication providers
6. Update environment variables

## 🧪 Testing & Sample Data

### Sample Property IDs

Use these Property IDs to test the search functionality:

- `LBG12345` - Beautifully Renovated Single-Family Home ($729,000)
- `LBG12346` - Stunning Luxury Home with Pool ($1,250,000)
- `LBG12347` - Classic Victorian Charm ($585,000)
- `LBG12348` - Architect-Designed Contemporary ($950,000)
- `LBG12349` - Charming Cottage Perfect for First-Time Buyers ($425,000)
- `LBG12350` - Single-Level Living with Large Lot ($675,000)

### Test User Accounts

After seeding, you can test with these scenarios:
- Create a buyer account and browse properties
- Save properties to favorites
- Switch to seller role and access seller dashboard
- Test property inquiries and contact forms

### AI Chat Testing

Test the AI assistant with these sample questions:
- "What's the price of this property?"
- "Tell me about the schools in this area"
- "Can I schedule a tour?"
- "What are the kitchen features?"
- "What's the neighborhood like?"

## 🔮 Future Enhancements

### Phase 1: Enhanced User Experience
- ✅ User authentication and profiles
- ✅ Favorites system
- ✅ Role-based permissions
- 🔄 Advanced search filters
- 🔄 Property comparison tool
- 🔄 Saved searches with alerts

### Phase 2: Seller Tools
- ✅ Seller dashboard
- 🔄 Property analytics
- 🔄 Lead management
- 🔄 Pricing recommendations
- 🔄 Marketing tools

### Phase 3: External Integrations
- 🔄 Real MLS data integration
- 🔄 Stripe payment processing
- 🔄 Twilio SMS notifications
- 🔄 OpenAI GPT integration for AI chat
- 🔄 Map integration (Google Maps/Mapbox)
- 🔄 Property valuation APIs

### Phase 4: Advanced Features
- 🔄 Virtual tour integration
- 🔄 Mortgage calculator
- 🔄 Document management
- 🔄 Transaction management
- 🔄 Admin panel with analytics

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Test your database connection
npm run db:test-connection

# Check environment variables
echo $DATABASE_URL
```

#### Authentication Problems
- Verify Supabase URL and keys in `.env.local`
- Check Supabase project settings
- Ensure RLS policies are configured correctly

#### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Type check
npm run check
```

### Development Tips

1. **Hot Reload**: The dev server supports hot module replacement
2. **Database Changes**: Always run migrations after schema updates
3. **Type Safety**: Use TypeScript throughout for better development experience
4. **Component Library**: Leverage Shadcn/ui components for consistency

## 📞 Support & Contribution

### Getting Help

If you encounter issues:

1. Check the console logs in browser dev tools
2. Verify all dependencies are installed (`npm install`)
3. Ensure Node.js version is 18 or higher
4. Check that environment variables are set correctly
5. Test database connection (`npm run db:test-connection`)

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Use Prettier for code formatting
- Write descriptive commit messages
- Add JSDoc comments for complex functions
- Follow React best practices and hooks patterns

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the future of real estate**

For questions or support, please open an issue in the GitHub repository.

### Recent Updates

- ✅ Integrated Supabase authentication and database
- ✅ Added user profiles with role-based permissions
- ✅ Implemented favorites system
- ✅ Created seller dashboard
- ✅ Enhanced property search and filtering
- ✅ Added comprehensive database schema
- ✅ Implemented session management
- ✅ Added utility scripts for database operations