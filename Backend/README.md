# Easy Booking Backend - Next.js Migration

This backend has been migrated from Express.js to Next.js 14, providing better performance, automatic API routes, and modern React Server Components.

## 🚀 Project Structure

```
Backend/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── login/
│   │   │       └── route.js          # Admin login endpoint
│   │   └── trending/
│   │       ├── trenddata/
│   │       │   └── route.js          # Get all trending items
│   │       ├── add/
│   │       │   └── route.js          # Add trending item
│   │       └── delete/
│   │           └── [name]/
│   │               └── route.js      # Delete trending item
│   ├── layout.js                     # Root layout
│   └── page.js                       # Home page
├── lib/
│   ├── mongodb.js                    # Database connection
│   ├── cloudinary.js                 # Cloudinary config
│   ├── fileUpload.js                 # File upload utilities
│   └── auth.js                       # JWT verification
├── models/
│   └── Trending.js                   # Mongoose model
├── uploads/                          # Temporary file storage
├── .env.example                      # Environment variables template
├── .gitignore
├── jsconfig.json
├── next.config.mjs
└── package.json
```

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your actual values
```

3. Configure your environment variables in `.env.local`:
   - `MONGO_URL` - MongoDB connection string
   - `CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY` - Cloudinary credentials
   - `JWT_SECRET` - Secret key for JWT tokens
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Admin login credentials

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on http://localhost:3001

### Production Mode
```bash
npm run build
npm start
```

## 🔌 API Endpoints

### Admin Routes
- **POST** `/api/admin/login` - Admin login
  - Body: `{ email, password }`
  - Returns: `{ success, message, token }`

### Trending Routes
- **GET** `/api/trending/trenddata` - Get all trending items
  - Returns: Array of trending items

- **POST** `/api/trending/add` - Add new trending item
  - Content-Type: `multipart/form-data`
  - Fields: name, subname, description, image (required), image1-6, video (optional), location, highlights, address, contact, availableThings
  - Returns: `{ success, message }`

- **DELETE** `/api/trending/delete/[name]` - Delete trending item by name
  - Requires: Authorization header with Bearer token
  - Returns: `{ success, message }`

## 🔐 Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Get the token by logging in through `/api/admin/login`.

## 🌐 CORS Configuration

Next.js handles CORS differently. To configure CORS for your frontend:

1. Update `next.config.mjs` to add custom headers:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: 'http://localhost:5173' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,POST,PUT,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
      ],
    },
  ];
}
```

## 🔄 Migration Notes

### Key Changes from Express.js to Next.js:

1. **No Server.js**: Next.js handles server startup automatically
2. **Route Files**: Each API route is a separate file in `app/api/`
3. **File Uploads**: Using Next.js FormData handling instead of multer middleware
4. **Database Connection**: Optimized with connection caching for serverless
5. **Middleware**: Converted to utility functions called within route handlers
6. **Environment Variables**: Use `.env.local` instead of `.env`

### Breaking Changes:
- API endpoints remain the same path-wise
- Authentication still uses JWT tokens
- File upload field names remain unchanged
- Database schema is identical

## 📝 Development Tips

- Hot reload is automatic in development mode
- Check console for MongoDB connection status
- Temporary uploaded files are stored in `uploads/` directory
- All API routes return JSON responses

## 🐛 Troubleshooting

**MongoDB Connection Issues:**
- Ensure `MONGO_URL` is correctly set in `.env.local`
- Check if MongoDB is running locally or connection string is valid

**File Upload Issues:**
- Verify Cloudinary credentials
- Check `uploads/` directory exists and has write permissions
- Ensure file sizes are within limits (10MB default)

**JWT Token Issues:**
- Verify `JWT_SECRET` is set in `.env.local`
- Check token expiration (default 1 hour)
- Ensure proper Bearer token format in Authorization header

## 📄 License

ISC
