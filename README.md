│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useApi.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── ProductForm.jsx
│   │   ├── Categories.jsx
│   │   ├── Orders.jsx
│   │   ├── Users.jsx
│   │   ├── Settings.jsx
│   │   ├── Analytics.jsx
│   │   ├── Coupons.jsx
│   │   ├── Reviews.jsx
│   │   ├── Banners.jsx
│   │   └── Notifications.jsx
│   ├── services/
│   │   └── api.js
│   ├── store/
│   │   └── authStore.js
│   └── utils/
│       └── helpers.js
└── public/
 
Pages:

Dashboard - Revenue, orders, products, customers KPIs with charts
Products - Full CRUD with images, variants, SEO
Categories - Hierarchical tree management
Orders - Status management, tracking, invoices
Users - Roles, addresses, wishlist, order history
Analytics - Revenue trends, conversion funnel, top products
Settings - 7 tabs: General, Appearance, Shipping, Payment, Email, Notifications, SEO
🔐 Security Features
JWT authentication with HttpOnly cookies
Rate limiting (API, login, upload)
Helmet.js security headers
MongoDB injection prevention
XSS protection
CORS configuration
Input validation & sanitization
Password hashing (bcrypt 12 rounds)
Role-based access control (Admin/Manager/User)
🎨 Design System
Colors
--primary: #1E3A8A (Deep Blue)
--secondary: #EC4899 (Pink)
--accent: #F59E0B (Amber)
--success: #10B981 (Emerald)
--dark: #0F172A (Slate 900)
 
Typography
Arabic: IBM Plex Sans Arabic
English: Inter / Poppins
Monospace: Roboto Mono
Components
Glassmorphism cards
Gradient buttons
Animated inputs
Toast notifications
Modal dialogs
Data tables with sorting/filtering
📊 Analytics Features
Revenue trends (daily/weekly/monthly)
Order volume & conversion rates
Top selling products
Customer acquisition & retention
Geographic distribution
Traffic sources
Conversion funnel
Real-time dashboard updates
🔔 Notification System
Channel	Provider	Features
Push	Firebase	Rich notifications, topics
Email	Nodemailer	Templates, scheduling
SMS	Twilio	International, templates
In-App	Socket.io	Real-time, persistent
💳 Payment Integration
Stripe - Cards, Apple Pay, Google Pay
Mada - Saudi national payment network
STC Pay - Saudi digital wallet
Cash on Delivery - COD with fee
🚀 Deployment
Environment Variables (Production)
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secure_production_secret
CLIENT_URL=https://pmstore.sa
ADMIN_URL=https://admin.pmstore.sa
 
Docker Compose Services
services:
  mongodb:
    image: mongo:7
    volumes: [mongodb_data:/data/db]
 
  backend:
    build: ./backend
    depends_on: [mongodb]
    env_file: .env.production
 
  frontend:
    build: ./frontend
    depends_on: [backend]
 
  admin-panel:
    build: ./admin-panel
    depends_on: [backend]
 
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: [./nginx-proxy.conf:/etc/nginx/nginx.conf]
 
SSL/TLS (Let’s Encrypt)
# Install certbot
certbot --nginx -d pmstore.sa -d www.pmstore.sa -d admin.pmstore.sa
 
# Auto-renewal
crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
 
📈 Performance
Frontend: Lazy loading, code splitting, image optimization
Backend: Query optimization, indexes, pagination, caching
Database: Compound indexes, text search indexes, aggregation pipelines
Caching: Redis for sessions, API responses, rate limiting
CDN: Cloudflare for static assets
🧪 Testing
# Backend tests
cd backend && npm test
 
# Admin panel tests
cd admin-panel && npm test
 
# E2E tests
npm run test:e2e
 
📝 License
MIT License - see LICENSE file for details.

🤝 Contributing
Fork the repository
Create feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open Pull Request
📞 Support
Email: support@pmstore.sa
Issues: GitHub Issues
Docs: /docs folder
Built with ❤️ for PM Store
Modern e-commerce for modern electronics
