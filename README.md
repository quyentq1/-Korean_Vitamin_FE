# Korean Vitamin Frontend

Hệ thống hỗ trợ học tập và ôn thi các chứng chỉ tiếng Hàn cho Trung tâm Hàn Ngữ Vitamin.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Development](#development)
- [Testing](#testing)
- [Performance Optimization](#performance-optimization)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: Comes with Node.js

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Korean_Vitamin_FE

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
Korean_Vitamin_FE/
├── public/                 # Static assets
│   ├── images/           # Optimized images
│   └── vite.svg
├── src/
│   ├── api/              # API services
│   ├── assets/           # Static assets
│   ├── components/        # Reusable components
│   │   ├── ui/         # UI component library
│   │   ├── Admin/       # Admin components
│   │   ├── Staff/       # Staff components
│   │   └── Teacher/     # Teacher components
│   ├── contexts/          # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── i18n/            # Internationalization
│   ├── locales/          # Translation files
│   ├── pages/            # Page components
│   │   ├── Admin/       # Admin pages
│   │   ├── Courses/      # Course pages
│   │   ├── Dashboard/    # Dashboard pages
│   │   ├── Exam/         # Exam pages
│   │   ├── Guest/        # Guest pages
│   │   ├── Learner/      # Learner pages
│   │   ├── Manager/      # Manager pages
│   │   ├── Shared/       # Shared pages
│   │   ├── Staff/        # Staff pages
│   │   └── Teacher/      # Teacher pages
│   ├── services/          # Service layer
│   ├── styles/           # Global styles
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component
│   ├── index.css         # Global styles
│   └── main.jsx          # Entry point
├── docs/                 # Documentation
├── scripts/              # Build scripts
├── .env.development      # Development environment variables
├── .env.production       # Production environment variables
├── vite.config.js        # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── package.json           # Project dependencies
├── vercel.json           # Vercel deployment config
├── DEPLOYMENT.md         # Deployment guide
├── PERFORMANCE.md         # Performance optimization guide
└── TESTING.md           # Testing guide
```

---

## 📜 Available Scripts

### Development

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview       # Preview production build locally
npm run lint         # Run ESLint
```

### Testing

```bash
npm run test           # Run tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
npm run test:ci        # Run tests in CI mode
```

### Performance

```bash
npm run build:analyze  # Build with bundle analysis
npm run analyze:bundle  # Analyze bundle and open stats
npm run optimize:images # Optimize images
```

---

## 💻 Development

### Environment Variables

Development variables are in `.env.development`:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Korean Vitamin
VITE_APP_URL=http://localhost:3000
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

### API Integration

The frontend integrates with the backend API at `http://localhost:8080/api` (development) or `https://api.koreatine.com/api` (production).

### Internationalization

The application supports multiple languages:
- Vietnamese (vi)
- English (en)

Language files are in `src/locales/`:
- `vi.json` - Vietnamese translations
- `en.json` - English translations

---

## 🧪 Testing

### Test Coverage

The project has comprehensive test coverage:
- **UI Components**: Button, Input, Modal, Card, Badge
- **Pages**: HomePage, LoginPage
- **Coverage Target**: 70% for branches, functions, lines, statements

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

See [TESTING.md](./TESTING.md) for detailed testing guide.

---

## ⚡ Performance Optimization

### Code Splitting

The application uses manual code splitting for optimal performance:
- **Vendor chunks**: React, React DOM, React Router
- **UI components**: Button, Input, Modal, Card, Badge
- **Pages**: HomePage, LoginPage, LearnerDashboard
- **Services**: authService, courseService

### Lazy Loading

All pages and heavy components use lazy loading:
- `src/utils/lazyLoad.js` - Lazy loading utilities
- `src/utils/lazyRoutes.js` - Lazy route definitions

### Bundle Analysis

Run bundle analysis to identify optimization opportunities:

```bash
npm run build:analyze
npm run analyze:bundle
```

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed performance guide.

---

## 🚀 Deployment

### Vercel Deployment

The application is configured for Vercel deployment:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Environment Variables

Production variables are in `.env.production`:

```bash
VITE_API_BASE_URL=https://api.koreatine.com/api
VITE_APP_NAME=Korean Vitamin
VITE_APP_URL=https://koreatine.com
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

### Build Configuration

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18.x or higher

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide.

---

## 📚 Documentation

### Additional Documentation

- [TESTING.md](./TESTING.md) - Testing guide and best practices
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance optimization guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide and troubleshooting
- [plans/redesign-plan.md](../plans/redesign-plan.md) - Project redesign plan

### API Documentation

The frontend integrates with 68 API endpoints across 9 controllers:

**Public Endpoints**:
- GuestController: 3 endpoints
- PublicCourseController: 2 endpoints

**Authenticated Endpoints**:
- AuthController: 3 endpoints
- StudentController: 8 endpoints
- TeacherController: 10 endpoints
- AdminController: 8 endpoints
- StaffController: 5 endpoints
- ClassController: 4 endpoints
- ForumController: 4 endpoints
- ManagerController: 6 endpoints

See [plans/redesign-plan.md](../plans/redesign-plan.md) for complete API documentation.

---

## 🎨 Design System

### Colors

- **Primary Teal**: `#3DCBB1` - Main brand color
- **Navy**: `#2D3E50` - Headers/footer
- **Semantic Colors**: success, warning, error, info
- **Badge Colors**: beginner (yellow), intermediate (blue), advanced (pink)

### Typography

- **Font Family**: Inter (body), Poppins (headings)
- **Font Sizes**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl

### Components

See `src/components/ui/` for reusable UI components:
- Button - Primary, secondary, outline variants
- Input - Text, email, password, number, textarea types
- Modal - With header, footer, actions
- Card - With title, content, footer
- Badge - Beginner, intermediate, advanced levels

---

## 🔧 Configuration Files

### vite.config.js

Vite configuration with:
- Code splitting
- Terser minification
- Bundle optimization
- CSS optimization
- Development server settings

### tailwind.config.js

Tailwind CSS configuration with:
- Custom color palette
- Custom font families
- Custom font sizes
- Custom spacing
- Custom border radius
- Custom shadows
- Custom animations

---

## 📊 Performance Targets

### Core Web Vitals

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| First Contentful Paint (FCP) | < 1.8s | < 1.0s | < 0.5s |
| Largest Contentful Paint (LCP) | < 2.5s | < 1.5s | < 1.0s |
| Time to Interactive (TTI) | < 3.8s | < 2.5s | < 1.5s |
| Cumulative Layout Shift (CLS) | < 0.1 | < 0.05 | < 0.01 |
| First Input Delay (FID) | < 100ms | < 50ms | < 20ms |

### Bundle Size Targets

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| Initial Bundle | < 200KB | < 150KB | < 100KB |
| Total Bundle | < 500KB | < 400KB | < 300KB |
| Largest Chunk | < 100KB | < 75KB | < 50KB |

---

## 🆘 Troubleshooting

### Common Issues

**Build fails**:
- Check Node.js version (18.x or higher)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check environment variables

**API requests failing**:
- Verify `VITE_API_BASE_URL` is correct
- Check backend is running
- Check CORS configuration

**Performance issues**:
- Run bundle analyzer: `npm run analyze:bundle`
- Optimize images: `npm run optimize:images`
- Enable lazy loading

---

## 📞 Support

For issues or questions:
- Check [TESTING.md](./TESTING.md) for testing issues
- Check [PERFORMANCE.md](./PERFORMANCE.md) for performance issues
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Check [plans/redesign-plan.md](../plans/redesign-plan.md) for project plan

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.
