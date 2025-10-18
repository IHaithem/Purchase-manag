# NixoPizza Backend API

A comprehensive Node.js/Express.js REST API for restaurant inventory management system with features for product management, order tracking, staff management, and real-time notifications.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Authentication & Authorization](#authentication--authorization)
- [File Upload](#file-upload)
- [Background Jobs](#background-jobs)
- [Error Handling](#error-handling)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

NixoPizza Backend is a comprehensive inventory management system designed for restaurants and food businesses. It provides complete CRUD operations for products, categories, orders, suppliers, and staff management with role-based access control.

### Key Capabilities
- **Inventory Management**: Track products, stock levels, and expiration dates
- **Order Management**: Handle supplier orders with different statuses
- **Staff Management**: Role-based access (Admin/Staff) with task assignments
- **Analytics**: Generate spending and category analytics
- **Notifications**: Real-time alerts for low stock, expiration warnings
- **File Management**: Image uploads for products, categories, and profiles

## ✨ Features

### Core Features
- 🔐 **JWT Authentication** with refresh token mechanism
- 👥 **Role-based Authorization** (Admin/Staff roles)
- 📦 **Product Management** with barcode support and stock tracking
- 📊 **Order Management** with status tracking (pending/confirmed/paid)
- 🏪 **Supplier Management** with category associations
- 📱 **Task Management** for staff assignments
- 🔔 **Notification System** for alerts and warnings
- 📈 **Analytics Dashboard** with monthly/yearly reports
- 📷 **File Upload** with image processing and validation
- ⏰ **Automated Monitoring** for product expiration

### Advanced Features
- **Low Stock Alerts**: Automatic notifications when products are below minimum quantity
- **Expiration Monitoring**: Cron job to track and alert on expiring products
- **Multi-category Products**: Products can belong to multiple categories
- **Order Analytics**: Detailed spending analysis and trends
- **Staff Task Tracking**: Assign and monitor task completion
- **Supplier Categories**: Link suppliers to specific product categories

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (≥18.x)
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer
- **Image Processing**: File validation and storage
- **Scheduling**: Node-cron for background jobs
- **Email**: Nodemailer for notifications

### Development
- **Language**: TypeScript
- **Development Server**: ts-node-dev
- **Build Tool**: TypeScript Compiler (tsc)
- **Process Manager**: Nodemon

### Security & Middleware
- **CORS**: Cross-origin resource sharing
- **Body Parser**: Request body parsing
- **Cookie Parser**: HTTP cookie parsing
- **bcryptjs**: Password hashing
- **Helmet**: Security headers (recommended for production)

## 📁 Project Structure

```
nixopizza-back/
├── src/
│   ├── config/
│   │   └── database.ts              # MongoDB connection configuration
│   ├── controllers/
│   │   ├── admin.controller.ts      # Admin operations & analytics
│   │   ├── auth.controller.ts       # Authentication & user management
│   │   ├── category.controller.ts   # Product categories CRUD
│   │   ├── expirationMonitoring.controller.ts # Product expiration monitoring
│   │   ├── notification.controller.ts # Notifications management
│   │   ├── order.controller.ts      # Order management & analytics
│   │   ├── product.controller.ts    # Product CRUD & stock management
│   │   ├── productOrder.controller.ts # Order items management
│   │   ├── suplier.controller.ts    # Supplier management
│   │   └── task.controller.ts       # Staff task management
│   ├── middlewares/
│   │   ├── Auth.ts                  # JWT authentication middleware
│   │   └── Multer.ts                # File upload configuration
│   ├── models/
│   │   ├── category.model.ts        # Category schema
│   │   ├── notification.model.ts    # Notification schema
│   │   ├── order.model.ts           # Order schema
│   │   ├── product.model.ts         # Product schema
│   │   ├── productOrder.model.ts    # Order items schema
│   │   ├── supplier.model.ts        # Supplier schema
│   │   ├── task.model.ts            # Task schema
│   │   └── user.model.ts            # User schema
│   ├── routes/
│   │   ├── admin.router.ts          # Admin routes
│   │   ├── auth.router.ts           # Authentication routes
│   │   ├── category.router.ts       # Category routes
│   │   ├── notification.router.ts   # Notification routes
│   │   ├── order.router.ts          # Order routes
│   │   ├── product.router.ts        # Product routes
│   │   ├── supplier.router.ts       # Supplier routes
│   │   └── task.router.ts           # Task routes
│   ├── types/
│   │   └── express.d.ts             # Express type definitions
│   ├── uploads/                     # File storage directory
│   │   ├── categories/              # Category images
│   │   ├── products/                # Product images
│   │   ├── staffs/                  # Staff avatars
│   │   └── suppliers/               # Supplier images
│   ├── utils/
│   │   ├── Analytics.ts             # Analytics helper functions
│   │   ├── Delete.ts                # File deletion utilities
│   │   ├── PushNotification.ts      # Notification utilities
│   │   └── Token.ts                 # JWT token utilities
│   └── index.ts                     # Application entry point
├── public/
│   └── index.html                   # Static HTML page
├── package.json                     # Project dependencies
├── tsconfig.json                    # TypeScript configuration
├── nodemon.json                     # Nodemon configuration
├── .env.example                     # Environment variables template
└── README.md                        # This file
```

## 🚀 Installation

### Prerequisites
- Node.js (≥18.x)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/mohamed-bekkouche/nixopizza-back.git
   cd nixopizza-back
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration (see Environment Variables section)

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Run the application**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

6. **Verify installation**
   Navigate to `http://localhost:8000/api/health` to check if the server is running

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/NEXO

# CORS Origins
CLIENT_ORIGIN=http://localhost:3000
ADMIN_ORIGIN=http://localhost:3001
PROD_CLIENT_ORIGIN=https://your-client.vercel.app
PROD_ADMIN_ORIGIN=https://your-admin.vercel.app

# JWT Secrets (generate secure random strings)
ACCESS_SECRET=your_access_token_secret_here
REFRESH_SECRET=your_refresh_token_secret_here
JWT_SECRET=your_jwt_secret_here

# Default Admin Account
ADMIN_FULLNAME=Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123
```

### Security Notes
- Generate secure random strings for JWT secrets
- Use environment-specific values for production
- Never commit `.env` files to version control

## 🛣 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/logout` | User logout | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| PUT | `/api/auth/profile` | Update user profile | ✅ |

### Products
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/api/products` | Get all products with filters | ✅ | ❌ |
| GET | `/api/products/:id` | Get single product | ✅ | ❌ |
| GET | `/api/products/low` | Get low stock products | ✅ | ❌ |
| GET | `/api/products/over` | Get overstock products | ✅ | ❌ |
| POST | `/api/products` | Create new product | ✅ | ❌ |
| PUT | `/api/products/:id` | Update product | ✅ | ✅ |
| DELETE | `/api/products/:id` | Delete product | ✅ | ❌ |

### Categories
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | Get all categories | ❌ |
| POST | `/api/categories` | Create category | ❌ |
| PUT | `/api/categories/:id` | Update category | ❌ |
| DELETE | `/api/categories/:id` | Delete category | ❌ |

### Orders
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | Get orders with filters | ✅ |
| GET | `/api/orders/:id` | Get single order | ✅ |
| GET | `/api/orders/stats` | Get order statistics | ✅ |
| GET | `/api/orders/analytics` | Get order analytics | ✅ |
| POST | `/api/orders` | Create new order | ✅ |
| PUT | `/api/orders/:id` | Update order | ✅ |

### Suppliers
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/api/suppliers` | Get all suppliers | ✅ | ❌ |
| GET | `/api/suppliers/:id` | Get single supplier | ✅ | ❌ |
| POST | `/api/suppliers` | Create supplier | ✅ | ✅ |
| PUT | `/api/suppliers/:id` | Update supplier | ✅ | ✅ |

### Tasks
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|-----------| 
| GET | `/api/tasks` | Get tasks | ✅ | ❌ |
| GET | `/api/tasks/:id` | Get single task | ✅ | ❌ |
| POST | `/api/tasks` | Create task | ✅ | ✅ |
| PUT | `/api/tasks/:id` | Update task status | ✅ | ❌ |

### Admin
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/api/admin/staffs` | Get all staff members | ✅ | ✅ |
| POST | `/api/admin/staffs` | Create staff member | ✅ | ✅ |
| PUT | `/api/admin/staffs/:id` | Update staff member | ✅ | ✅ |
| GET | `/api/admin/analytics/category` | Category analytics | ✅ | ✅ |
| GET | `/api/admin/analytics/monthly` | Monthly spending analytics | ✅ | ✅ |

### Notifications
| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/api/notifications` | Get notifications | ✅ | ✅ |
| PUT | `/api/notifications/:id` | Mark notification as read | ✅ | ✅ |
| PUT | `/api/notifications` | Mark all as read | ✅ | ✅ |

### Health Check
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Server health check | ❌ |

## 📊 Data Models

### User Model
```typescript
interface IUser {
  fullname: string;
  email: string;
  password: string;
  avatar?: string;
  role: "admin" | "staff";
  isActive: boolean;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Product Model
```typescript
interface IProduct {
  name: string;
  barcode: string;
  unit: "liter" | "kilogram" | "box" | "piece" | "meter" | "pack";
  categoryId: ObjectId;
  imageUrl: string;
  currentStock: number;
  minQty: number;
  maxQty: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order Model
```typescript
interface IOrder {
  bon: string;
  orderNumber: string;
  supplierId: ObjectId;
  staffId: ObjectId;
  status: "pending" | "confirmed" | "paid";
  totalAmount: number;
  items: ObjectId[];
  notes: string;
  paidDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category Model
```typescript
interface ICategory {
  name: string;
  description: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Supplier Model
```typescript
interface ISupplier {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  categoryIds: ObjectId[];
  image: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Task Model
```typescript
interface ITask {
  taskNumber: string;
  staffId: ObjectId;
  items: { productId: ObjectId; quantity: number }[];
  status: "pending" | "completed" | "canceled";
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### ProductOrder Model
```typescript
interface IProductOrder {
  productId: ObjectId;
  quantity: number;
  expirationDate: Date;
  unitCost: number;
  remainingQte: number;
  isExpired: boolean;
  expiredQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification Model
```typescript
interface INotification {
  type: "low_stock" | "budget_alert" | "expiry_warning" | "completed_task";
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 Authentication & Authorization

### JWT Token System
- **Access Token**: Short-lived (15 minutes) for API access
- **Refresh Token**: Long-lived (7 days) stored in HTTP-only cookies
- **Automatic Refresh**: Seamless token renewal mechanism

### Role-Based Access Control
- **Admin Role**: Full system access including staff management and analytics
- **Staff Role**: Limited access to products, orders, and assigned tasks

### Security Features
- Password hashing with bcryptjs
- HTTP-only secure cookies for refresh tokens
- CORS configuration for allowed origins
- Input validation and sanitization

## 📁 File Upload

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF, WebP, AVIF
- **Maximum Size**: 5MB per file
- **Storage**: Local filesystem with organized directories

### Upload Endpoints
- Products: `/uploads/products/`
- Categories: `/uploads/categories/`
- Staff Avatars: `/uploads/staffs/`
- Suppliers: `/uploads/suppliers/`
- Order Receipts: `/uploads/orders/`

### File Management
- Automatic directory creation
- Unique filename generation with timestamps
- File deletion when records are removed
- Image validation and error handling

## ⏰ Background Jobs

### Expiration Monitoring
- **Schedule**: Daily at midnight (configurable)
- **Purpose**: Check for expired products and update inventory
- **Actions**:
  - Mark products as expired
  - Update remaining quantities
  - Send low stock notifications
  - Generate expiration warnings

### Notification System
- **Low Stock Alerts**: When products fall below minimum quantity
- **Expiration Warnings**: For products nearing expiration
- **Budget Alerts**: For high spending periods
- **Task Completion**: When staff complete assigned tasks

## ❌ Error Handling

### Global Error Handling
- Centralized error responses
- Detailed error messages for development
- Sanitized error messages for production
- HTTP status code consistency

### Validation
- Mongoose schema validation
- Request body validation
- File upload validation
- Authentication checks

### Common Error Codes
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (duplicate resources)
- `500`: Internal Server Error

## 💻 Development

### Available Scripts
```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development Tools
- **TypeScript**: Type safety and better developer experience
- **ts-node-dev**: Fast development server with hot reload
- **Nodemon**: Process monitoring and automatic restarts

### Code Structure
- **Controllers**: Business logic and request handling
- **Models**: Database schemas and data validation
- **Routes**: API endpoint definitions
- **Middlewares**: Cross-cutting concerns (auth, file upload, etc.)
- **Utils**: Helper functions and utilities

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set secure JWT secrets
- [ ] Configure CORS for production domains
- [ ] Set up file storage (local or cloud)
- [ ] Configure process manager (PM2 recommended)
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (Nginx recommended)
- [ ] Set up SSL certificates

### Environment Setup
```bash
# Install production dependencies only
npm ci --only=production

# Build the application
npm run build

# Start with process manager
pm2 start src/index.ts --name "nixopizza-api"
```

### Database Considerations
- Ensure MongoDB replica set for production
- Set up database backups
- Configure connection pooling
- Monitor database performance

---

## 📞 Support

For support and questions:
- **Email**: mohamed.bekkouche@example.com
- **GitHub Issues**: [Create an issue](https://github.com/mohamed-bekkouche/nixopizza-back/issues)

---

**NixoPizza Backend API** - Built with ❤️ for restaurant inventory management
