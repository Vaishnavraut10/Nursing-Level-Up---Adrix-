# NurseLearn - Nursing Education Platform

A comprehensive web platform for nursing students providing courses, MCQ practice tests, and progress tracking.

## Project Overview

NurseLearn is a modern web application designed to help nursing students:
- Browse and purchase nursing courses
- Practice with interactive MCQ tests
- Track learning progress and test results
- Access a professional nursing education experience

The platform includes both a student-facing interface and an admin panel for content management.

## Technology Stack

### Frontend
- **React.js** - UI framework
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe frontend development
- **Tailwind CSS** - Utility-first CSS framework
- **Geist Font** - Modern typography

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **JavaScript** - Backend runtime implementation
- **CORS** - Cross-origin resource sharing

### Database
- **PostgreSQL** - Primary database
- **Neon PostgreSQL** - Cloud PostgreSQL database hosting
- **pg** - PostgreSQL client for Node.js

### Authentication & Payments (Future Implementation)
- **Google OAuth** - User authentication
- **Razorpay** - Payment gateway (India)
- **Stripe** - Payment gateway (International)

## Project Structure

```
course_web/
├── frontend/                    # React/Next.js frontend application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── admin/         # Admin panel pages
│   │   │   ├── courses/       # Student course pages
│   │   │   ├── dashboard/     # Student dashboard
│   │   │   ├── login/         # Student login
│   │   │   ├── profile/       # Student profile
│   │   │   ├── tests/         # MCQ test pages
│   │   │   ├── results/       # Test results pages
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── page.tsx       # Homepage
│   │   │   └── globals.css    # Global styles
│   │   ├── components/        # Reusable React components
│   │   │   ├── Button.tsx     # Button component
│   │   │   ├── Card.tsx       # Card component
│   │   │   ├── Footer.tsx     # Footer component
│   │   │   └── Navbar.tsx     # Navigation bar
│   │   ├── layouts/           # Layout components
│   │   │   └── MainLayout.tsx # Main application layout
│   │   ├── services/          # API service clients
│   │   │   └── api.ts         # API client
│   │   ├── utilities/         # Helper functions
│   │   └── hooks/             # Custom React hooks
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── next.config.ts         # Next.js configuration
│   └── .env.example           # Frontend environment variables
├── backend/                    # Express.js backend API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   └── database.js    # Database connection
│   │   ├── routes/            # API route handlers
│   │   │   └── health.js      # Health check endpoint
│   │   ├── middleware/        # Express middleware
│   │   └── index.js           # Server entry point
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Backend environment variables
├── package.json               # Root package.json (scripts)
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Local Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon account recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/animesh-1121/adrix-courese-web.git
   cd course_web
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

5. **Set up environment variables**
   
   **Frontend:**
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   
   **Backend:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit the `.env` files and add your actual credentials.

### Environment Variables

#### Frontend (.env)
| Variable | Description | Required for Phase 1 |
|----------|-------------|---------------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | No (defaults to localhost:5000) |

#### Backend (.env)
| Variable | Description | Required for Phase 1 |
|----------|-------------|---------------------|
| `PORT` | Server port (default: 5000) | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | No |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | No |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret | No |
| `STRIPE_SECRET_KEY` | Stripe API secret key | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |

### Running the Application

#### Option 1: Run both frontend and backend together
```bash
npm run dev
```
This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

#### Option 2: Run separately
**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

#### Option 3: Production builds
```bash
# Build both
npm run build

# Start both
npm start
```

## How to Connect Neon PostgreSQL

1. **Create a Neon account**
   - Visit [https://neon.tech](https://neon.tech)
   - Sign up for a free account

2. **Create a new project**
   - Click "Create a project"
   - Choose a region close to your users
   - Select PostgreSQL version
   - Name your project (e.g., "nurselearn")

3. **Get connection string**
   - Go to your project dashboard
   - Click "Connection Details"
   - Copy the connection string

4. **Add to backend environment variables**
   Edit `backend/.env`:
   ```env
   DATABASE_URL=postgresql://username:password@ep-example.aws.neon.tech/neondb?sslmode=require
   ```

5. **Test connection**
   The backend will automatically test the database connection on startup.

## Available Routes

### Student Routes (Frontend)
- `/` - Homepage
- `/login` - Student login (Google OAuth - Phase 2)
- `/courses` - Browse nursing courses
- `/courses/:id` - Course details and purchase
- `/dashboard` - Student dashboard
- `/tests/:id` - MCQ test interface
- `/results/:id` - Test results
- `/profile` - Student profile

### Admin Routes (Frontend)
- `/admin/login` - Admin login (Phase 2)
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/courses` - Course management
- `/admin/tests` - MCQ test management
- `/admin/results` - Results management

### API Routes (Backend)
- `GET /api/health` - Health check endpoint
- `GET /` - API status endpoint

## Design System

The platform uses a professional nursing education design:

### Colors
- **Primary**: Green/Mint (#10b981) - Represents health and growth
- **Background**: White (#ffffff) - Clean, professional look
- **Text**: Dark Navy/Charcoal (#1f2937) - High readability
- **Secondary**: Light Gray (#f3f4f6) - Subtle backgrounds
- **Border**: Gray (#e5e7eb) - Subtle separation

### Typography
- **Font**: Geist Sans (modern, clean)
- **Hierarchy**: Clear heading sizes and spacing
- **Readability**: Optimized line heights and contrast

### Components
- **Rounded corners**: 8px border radius
- **Subtle shadows**: Minimal elevation
- **Plenty of whitespace**: Clean, uncluttered interface
- **Responsive**: Mobile-first design approach

## API Endpoints

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok"
}
```

### API Status
```http
GET /
```

**Response:**
```json
{
  "message": "NurseLearn Backend API",
  "status": "running"
}
```

## Testing

### Manual Testing Checklist

#### Frontend
- [ ] Application starts successfully on port 3000
- [ ] Homepage loads without errors
- [ ] All placeholder routes load:
  - [ ] `/login`
  - [ ] `/courses`
  - [ ] `/courses/:id`
  - [ ] `/dashboard`
  - [ ] `/tests/:id`
  - [ ] `/results/:id`
  - [ ] `/profile`
  - [ ] `/admin/login`
  - [ ] `/admin`
  - [ ] `/admin/users`
  - [ ] `/admin/courses`
  - [ ] `/admin/tests`
  - [ ] `/admin/results`
- [ ] Navigation works between pages
- [ ] Responsive layout on mobile/tablet/desktop

#### Backend
- [ ] Backend server starts successfully on port 5000
- [ ] `/api/health` returns `{ "status": "ok" }`
- [ ] `/` returns API status message
- [ ] Database connection test runs on startup

#### Database
- [ ] Neon PostgreSQL connection works
- [ ] Database credentials stored only in environment variables
- [ ] No hardcoded secrets in codebase

## Code Quality Standards

- **No hardcoded secrets**: All credentials in environment variables
- **No unnecessary dependencies**: Only required packages installed
- **No major console errors**: Clean application startup and runtime
- **TypeScript strict mode**: Type-safe code throughout
- **Component reusability**: Modular, maintainable components
- **Responsive design**: Mobile-first approach
- **Separation of concerns**: Clear frontend/backend separation

## Future Phases

### Phase 2 - Authentication & User Management
- Google OAuth integration
- User registration and login
- User profile management
- Session management

### Phase 3 - Course Management
- Course creation and editing
- Course content management
- Course categorization
- Course search and filtering

### Phase 4 - Payment Integration
- Razorpay integration
- Stripe integration
- Payment processing
- Order management

### Phase 5 - MCQ System
- MCQ test creation
- Test administration
- Answer submission
- Result calculation
- Performance analytics

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set in `backend/.env`
- Ensure Neon database is active
- Check network connectivity
- Verify SSL mode in connection string

### Build Errors
- **Frontend**: Clear `.next` folder: `cd frontend && rm -rf .next`
- **Backend**: Clear `dist` folder: `cd backend && rm -rf dist`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Port Already in Use
- **Frontend**: Kill process on port 3000 or change port in `frontend/package.json`
- **Backend**: Kill process on port 5000 or change `PORT` in `backend/.env`

### CORS Issues
- Ensure `FRONTEND_URL` is set correctly in `backend/.env`
- Check that backend CORS middleware is configured properly

## Contributing

This is a private project. For contributions, please contact the project maintainer.

## License

Proprietary - All rights reserved

## Support

For support and questions, please contact the development team.

---

**Built with ❤️ for nursing education**