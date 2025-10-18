# NexoPizza Admin Dashboard

A modern, responsive admin dashboard for inventory and purchasing management built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Inventory Management**: Complete CRUD operations for products, categories, and stock tracking
- **Purchase Management**: Handle suppliers, purchase orders, and order generation
- **Staff Management**: User authentication and staff management system
- **Analytics Dashboard**: Real-time charts and statistics
- **Low Stock Alerts**: Automated notifications for inventory management
- **Responsive Design**: Mobile-first design with modern UI components
- **Dark/Light Theme**: Built-in theme switching support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 4.1.9, Radix UI Components
- **State Management**: Zustand with persistence
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with retry logic and interceptors
- **Charts**: ApexCharts, Recharts
- **Icons**: Lucide React
- **Fonts**: Geist Sans/Mono, Space Grotesk
- **Analytics**: Vercel Analytics

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **pnpm**: Package manager (recommended) or npm/yarn
- **Git**: For version control

## 🏗️ Project Structure

```
nexopizza-admin/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page (Login)
│   └── dashboard/        # Dashboard pages
│       ├── alerts/       # Low stock alerts
│       ├── categories/   # Category management
│       ├── notifications/# Notification center
│       ├── products/     # Product management
│       ├── purchases/    # Purchase orders
│       ├── stuff/        # Staff management
│       └── suppliers/    # Supplier management
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard widgets
│   ├── layout/           # Layout components
│   └── [feature]/        # Feature-specific components
├── hooks/                # Custom React hooks
│   └── useAuth.ts        # Authentication hook
├── lib/                  # Utilities and configurations
│   ├── apis/             # API service functions
│   ├── axios.ts/         # HTTP client configuration
│   └── utils.ts          # Utility functions
├── store/                # Zustand store
│   └── user.store.ts     # User state management
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ramy-dje/nexopizza-admin.git
cd nexopizza-admin
```

### 2. Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:8000"

# Add other environment variables as needed
# NEXT_PUBLIC_API_URL=""
# NEXTAUTH_SECRET=""
# NEXTAUTH_URL=""
```

**Required Environment Variables:**
- `NEXT_PUBLIC_BASE_URL`: Backend API base URL

### 4. Run the Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
pnpm build && pnpm start
# or
npm run build && npm start
```

## 🔐 Authentication

The application uses a custom authentication system with JWT tokens:

- **Login**: Email and password authentication
- **Token Management**: Automatic refresh token handling
- **Protected Routes**: Dashboard routes require authentication
- **Demo Credentials**: Any email and password for development

### Authentication Flow

1. User submits login form
2. API validates credentials and returns JWT tokens
3. Tokens are stored in Zustand store with persistence
4. Axios interceptors automatically attach tokens to requests
5. Automatic token refresh on expiration

## 📚 API Integration

### HTTP Client Configuration

The application uses Axios with the following features:

- **Base URL**: Configured via environment variables
- **Interceptors**: Request/response interceptors for auth
- **Retry Logic**: Automatic retry for failed requests
- **Error Handling**: Centralized error handling

### API Endpoints Structure

```typescript
// Base URL: ${NEXT_PUBLIC_BASE_URL}/api

// Authentication
POST /auth/login
POST /auth/logout
POST /auth/refresh
PUT  /auth/profile

// Products
GET    /products
POST   /products
GET    /products/:id
PUT    /products/:id
DELETE /products/:id
GET    /products/low

// Categories
GET    /categories
POST   /categories
PUT    /categories/:id
DELETE /categories/:id

// Suppliers
GET    /admin/suppliers
POST   /admin/suppliers
PUT    /admin/suppliers/:id
DELETE /admin/suppliers/:id

// Staff
GET    /admin/staffs
POST   /admin/staffs
PUT    /admin/staffs/:id
DELETE /admin/staffs/:id

// Orders
GET    /orders
POST   /orders
PUT    /orders/:id

// Analytics
GET    /admin/analytics/monthly
```

## 🎨 UI Components

The project uses shadcn/ui components with Radix UI primitives:

### Available Components

- **Forms**: Input, Label, Textarea, Select, Button
- **Layout**: Card, Sheet, Dialog, Separator
- **Data Display**: Table, Badge, Avatar, Progress
- **Feedback**: Alert, Toast (react-hot-toast)
- **Navigation**: Dropdown Menu
- **Charts**: ApexCharts integration

### Component Usage

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Use in your components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Click me</Button>
  </CardContent>
</Card>
```

## 🗄️ State Management

### Zustand Store

The application uses Zustand for state management with persistence:

```typescript
// User Store
interface IUser {
  _id: string;
  fullname: string;
  email: string;
  role: "admin" | "staff";
  isActive: boolean;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

// Store Methods
- login(user, access_token)
- setProfile(user)  
- logout()
- setAccessToken(access_token)
```

### Authentication Hook

```typescript
import { useAuth } from "@/hooks/useAuth";

const { user, isAuthenticated, login, logout } = useAuth();
```

## 📊 Features Overview

### Dashboard
- Real-time statistics cards
- Interactive charts (spending, inventory trends)
- Low stock alerts widget
- Recent activity feed
- Quick action buttons

### Product Management  
- Product CRUD operations
- Image upload support
- Category assignment
- Stock level tracking
- Barcode support

### Purchase Management
- Supplier management
- Purchase order creation
- Manual order generation
- Order status tracking
- Receipt previews

### Staff Management
- Staff member CRUD
- Role-based access (admin/staff)
- Task assignment system
- Contact information management

### Notifications
- Low stock alerts
- System notifications
- Real-time updates
- Notification center

## 🚨 Error Handling

### Client-Side Error Handling

```typescript
// API calls return standardized responses
const { success, data, message } = await apiCall();

if (success) {
  // Handle success
  toast.success("Operation successful");
} else {
  // Handle error
  toast.error(message);
}
```

### HTTP Error Handling

- **401**: Automatic token refresh
- **403**: Redirect to login
- **500**: Retry logic with exponential backoff
- **Network errors**: Automatic retry

## 🧪 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting (currently disabled for builds)
- **Prettier**: Code formatting (recommended to set up)
- **Import Aliases**: Use `@/` for absolute imports

### Component Patterns

```typescript
// Functional components with TypeScript
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export function Component({ title, onAction }: ComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}
```

### API Service Pattern

```typescript
// lib/apis/[feature].ts
export const createItem = async (data: any) => {
  try {
    const { data: response } = await api.post("/endpoint", data);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("Error:", error);
    const message = error.response?.data?.message || "Operation failed";
    return { success: false, message };
  }
};
```

## 🔧 Configuration Files

### Next.js Configuration (`next.config.mjs`)
```javascript
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true }
}
```

### Tailwind Configuration
- Uses Tailwind CSS 4.1.9
- shadcn/ui component styling
- Custom CSS variables for theming
- Responsive design utilities

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/*`)
- Next.js plugin integration

## 🚀 Deployment

### Build Commands

```bash
# Production build
pnpm build

# Start production server
pnpm start

# Development server
pnpm dev

# Linting
pnpm lint
```

### Environment Variables for Production

```bash
NEXT_PUBLIC_BASE_URL="https://your-api-domain.com"
# Add other production environment variables
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 📝 TODO / Roadmap

- [ ] Add comprehensive error boundaries
- [ ] Implement proper testing suite (Jest + React Testing Library)
- [ ] Add Storybook for component documentation
- [ ] Implement proper ESLint and Prettier configuration
- [ ] Add Docker configuration for development
- [ ] Implement real-time notifications with WebSockets
- [ ] Add data export functionality
- [ ] Implement advanced filtering and search
- [ ] Add role-based permission system
- [ ] Optimize bundle size and performance

## 🆘 Troubleshooting

### Common Issues

1. **Build Errors**: 
   - Ensure all environment variables are set
   - Check TypeScript errors (currently ignored in build)

2. **API Connection Issues**:
   - Verify `NEXT_PUBLIC_BASE_URL` is correct
   - Check backend server is running
   - Verify CORS configuration

3. **Authentication Issues**:
   - Clear browser storage and cookies
   - Check token expiration
   - Verify API endpoints

4. **Styling Issues**:
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS classes
   - Verify component imports

### Getting Help

- Check existing GitHub issues
- Create a new issue with detailed description
- Include error messages and reproduction steps

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Developer**: ramy-dje
- **Repository**: [nexopizza-admin](https://github.com/ramy-dje/nexopizza-admin)

---

**Happy Coding! 🚀**

For more information or support, please refer to the documentation or create an issue in the repository.
