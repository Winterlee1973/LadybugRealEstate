# Ladybug.com - Real Estate Platform

A next-generation real estate platform designed to empower homeowners with flexible, tech-enhanced selling options. Ladybug.com offers a user-friendly experience where buyers can easily search for properties using Property IDs and explore comprehensive property detail pages with AI support, agent/seller connection tools, and transparent deal pathways.

## 🏠 Features

### Core Functionality
- **Property ID Search**: Direct property lookup using unique Property IDs (e.g., LBG12345)
- **Property Listings**: Browse all available properties with advanced filtering
- **Detailed Property Pages**: Comprehensive property information with image galleries
- **AI-Powered Assistant**: Real-time property Q&A powered by intelligent responses
- **Agent Connection**: Direct communication with listing agents and sellers
- **Responsive Design**: Mobile-first design that works on all devices

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

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Fast, unopinionated web framework
- **TypeScript**: Type-safe server-side code
- **Drizzle ORM**: TypeScript-first ORM with excellent developer experience
- **Zod**: TypeScript-first schema validation
- **In-Memory Storage**: Fast storage solution for development and prototyping

### Development Tools
- **ESBuild**: Fast JavaScript bundler
- **PostCSS**: CSS processing with Tailwind CSS integration
- **TypeScript Compiler**: Static type checking
- **Drizzle Kit**: Database migration and introspection tools

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** for version control
- **VS Code** (recommended) - [Download VS Code](https://code.visualstudio.com/)

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
- TypeScript and build tools
- UI component libraries
- Development tools

### 3. Start the Development Server

```bash
npm run dev
```

This single command starts both:
- **Frontend Development Server** (Vite) - http://localhost:5000
- **Backend API Server** (Express) - http://localhost:5000/api

The application will automatically open in your browser at `http://localhost:5000`.

### 4. VS Code Setup (Recommended)

#### Essential Extensions

Install these VS Code extensions for the best development experience:

1. **TypeScript and JavaScript Language Features** (built-in)
2. **Tailwind CSS IntelliSense** - Intelligent autocomplete for Tailwind classes
3. **ES7+ React/Redux/React-Native snippets** - Useful React code snippets
4. **Auto Rename Tag** - Automatically rename paired HTML/JSX tags
5. **Bracket Pair Colorizer** - Color matching brackets
6. **GitLens** - Enhanced Git capabilities
7. **Prettier - Code formatter** - Consistent code formatting
8. **ESLint** - JavaScript/TypeScript linting

#### VS Code Settings

Create a `.vscode/settings.json` file in your project root:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "tailwindCSS.experimental.classRegex": [
    "cn\\(([^)]*)\\)"
  ]
}
```

#### VS Code Launch Configuration

Create a `.vscode/launch.json` file for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "tsx/cjs"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

## 📁 Project Structure

```
ladybug-real-estate/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Shadcn/ui components
│   │   │   ├── navigation.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── property-card.tsx
│   │   │   └── ai-chat.tsx
│   │   ├── pages/          # Route components
│   │   │   ├── landing.tsx
│   │   │   ├── property-listings.tsx
│   │   │   ├── property-detail.tsx
│   │   │   └── not-found.tsx
│   │   ├── lib/            # Utility functions and types
│   │   │   ├── utils.ts
│   │   │   ├── types.ts
│   │   │   └── queryClient.ts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── App.tsx         # Main application component
│   │   ├── main.tsx        # Application entry point
│   │   └── index.css       # Global styles and Tailwind imports
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data storage layer
│   └── vite.ts            # Vite development server integration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schemas and types
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── drizzle.config.ts      # Drizzle ORM configuration
└── README.md              # This file
```

## 🧩 Key Components

### Frontend Components

#### Navigation (`client/src/components/navigation.tsx`)
- Responsive navigation bar with mobile menu
- Ladybug branding and logo
- Navigation links for Buy, Rent, Sell, etc.
- Login button (placeholder for authentication)

#### Property Card (`client/src/components/property-card.tsx`)
- Displays property summary information
- Image carousel with favorite button
- Price, location, and key details
- Links to detailed property page

#### AI Chat (`client/src/components/ai-chat.tsx`)
- Modal-based chat interface
- Intelligent responses to property questions
- Simulated AI responses for common queries
- Expandable for integration with real AI services

### Pages

#### Landing Page (`client/src/pages/landing.tsx`)
- Hero section with Property ID search
- Feature highlights with icons
- Selling options pricing cards
- Call-to-action sections

#### Property Listings (`client/src/pages/property-listings.tsx`)
- Grid view of all properties
- Search and filter functionality
- Sorting options (price, date, bedrooms)
- Pagination support

#### Property Detail (`client/src/pages/property-detail.tsx`)
- Comprehensive property information
- Image gallery with navigation
- Agent contact information
- AI chat integration
- Contact form for inquiries

### Backend API

#### Routes (`server/routes.ts`)
- `GET /api/properties` - List all properties with filtering
- `GET /api/properties/:propertyId` - Get specific property
- `GET /api/search` - Search properties by ID or address
- `POST /api/inquiries` - Submit property inquiries
- `GET /api/inquiries/:propertyId` - Get property inquiries
- Favorites management endpoints

#### Storage (`server/storage.ts`)
- In-memory data storage for development
- Interface-based design for easy database migration
- Sample property data for testing
- CRUD operations for properties, favorites, and inquiries

## 🎨 Styling & Design

### Design System

The application uses a carefully crafted design system based on the Ladybug brand:

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
- **Buttons**: Rounded corners with hover states
- **Forms**: Focus states and validation styling
- **Navigation**: Sticky header with backdrop blur

### Responsive Design

The application is built mobile-first with responsive breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Database operations (when using real database)
npm run db:generate    # Generate migrations
npm run db:migrate     # Run migrations
npm run db:studio      # Open Drizzle Studio

**Important Note for Supabase Database Updates:**
Any database schema updates for Supabase should be performed by manually feeding SQL statements directly into the Supabase interface, rather than pushing changes via migrations. Generate the SQL statements using Drizzle Kit and then apply them manually.
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
# Database (when migrating from in-memory storage)
DATABASE_URL=your_database_connection_string

# Server
PORT=5000
NODE_ENV=production

# External Services (future integrations)
STRIPE_SECRET_KEY=your_stripe_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
OPENAI_API_KEY=your_openai_key
```

### Deployment Platforms

The application is ready for deployment on:
- **Replit Deployments** (recommended for this setup)
- **Vercel** (with Node.js runtime)
- **Netlify** (with serverless functions)
- **Railway** or **Heroku** (traditional hosting)

## 🧪 Testing Property IDs

Use these sample Property IDs to test the search functionality:

- `LB1234` - Beautifully Renovated Single-Family Home ($729,000)
- `LB1235` - Stunning Luxury Home with Pool ($1,250,000)
- `LB1236` - Classic Victorian Charm ($585,000)
- `LB1237` - Architect-Designed Contemporary ($950,000)
- `LB1238` - Charming Cottage Perfect for First-Time Buyers ($425,000)
- `LB1239` - Single-Level Living with Large Lot ($675,000)

**Note:** Property IDs can be entered as either `LB1234` or just `1234` format.

## 🤖 AI Chat Testing

Test the AI assistant with these sample questions:

- "What's the price of this property?"
- "Tell me about the schools in this area"
- "Can I schedule a tour?"
- "What are the kitchen features?"
- "What's the neighborhood like?"

## 🔮 Future Enhancements

### Phase 1: Authentication & User Management
- User registration and login
- User profiles and preferences
- Saved searches and favorites
- Inquiry history

### Phase 2: Real Database Integration
- PostgreSQL database setup
- User data persistence
- Property management system
- Advanced search capabilities

### Phase 3: External Integrations
- Real MLS data integration
- Stripe payment processing
- Twilio SMS notifications
- OpenAI GPT integration for AI chat
- Map integration (Google Maps/Mapbox)

### Phase 4: Advanced Features
- Virtual tour integration
- Property valuation tools
- Mortgage calculator
- Agent dashboard
- Admin panel

## 📞 Support & Contribution

### Getting Help

If you encounter issues:

1. Check the console logs in browser dev tools
2. Verify all dependencies are installed
3. Ensure Node.js version is 18 or higher
4. Check that the development server is running

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Use Prettier for code formatting
- Write descriptive commit messages
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the future of real estate**

For questions or support, please open an issue in the GitHub repository.