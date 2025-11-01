# PawConnect - Pet Adoption Platform
## Comprehensive Project Guide

---

## 📋 Project Overview

**PawConnect** is a modern, full-stack pet adoption and rehoming platform designed to connect pet owners with adopters in their local area. The platform simplifies the process of finding, listing, and adopting pets while building community engagement.

### Why PawConnect is Unique
- **Community-Driven**: Local pet rehoming marketplace
- **Real-Time Interaction**: Direct owner-to-adopter communication
- **Rich Media Support**: High-quality pet photos via Cloudinary
- **Emotional Connection**: Stories, ratings, and reviews for trust-building
- **Search & Discovery**: Advanced filters (breed, age, location, pet type)

---

## 🏗️ Project Architecture

```
PawConnect/
├── pawConnectFrontend/          # React + Vite SPA
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route pages
│   │   ├── context/             # Global state (Auth, User)
│   │   ├── services/            # API calls (axios)
│   │   └── styles/              # Tailwind CSS
│   └── .env                     # Frontend env vars
│
└── backend/                     # Node.js + Express API
    ├── models/                  # Mongoose schemas (User, Pet, etc.)
    ├── routes/                  # API endpoints
    ├── controllers/             # Business logic
    ├── middleware/              # Auth, validation, error handling
    ├── config/                  # DB, Cloudinary, Passport
    ├── server.js                # App entry point
    └── .env                     # Backend env vars
```

---

## 💻 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI library |
| Vite | Fast build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client for API calls |
| React Router | Client-side navigation |
| Context API | Global state management |
| jwt-decode | JWT token handling |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime |
| Express | Web framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| JWT | Authentication tokens |
| Bcrypt | Password hashing |
| Passport.js | OAuth authentication |
| Cloudinary | Image hosting & CDN |
| Multer | File upload handling |
| Dotenv | Environment variables |
| Nodemon | Dev auto-reload |

### Infrastructure
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database |
| Cloudinary | Image storage & optimization |
| Vercel/Netlify | Frontend deployment |
| Render/Railway | Backend deployment |

---

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, required),
  password: String (hashed),
  phone: String,
  location: {
    city: String,
    state: String,
    country: String
  },
  profilePicture: String (Cloudinary URL),
  bio: String (max 500 chars),
  userType: String (enum: ['adopter', 'pet_owner', 'both']),
  ratings: {
    average: Float,
    count: Number,
    reviews: [Review]
  },
  favorites: [ObjectId] (refs to Pet),
  createdAt: Date,
  updatedAt: Date
}
```

### Pet Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  type: String (enum: ['dog', 'cat', 'rabbit', 'bird', 'other']),
  breed: String,
  age: Number,
  size: String (enum: ['small', 'medium', 'large']),
  color: String,
  gender: String (enum: ['male', 'female']),
  description: String,
  adoptionStatus: String (enum: ['available', 'adopted', 'pending']),
  images: [String] (Cloudinary URLs),
  owner: ObjectId (ref to User),
  location: {
    city: String,
    state: String
  },
  tags: [String] (friendly, playful, etc.),
  healthInfo: {
    vaccinated: Boolean,
    neutered: Boolean,
    medicalHistory: String
  },
  adoptionRequirements: String,
  reviews: [{
    reviewer: ObjectId,
    rating: Number,
    comment: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Chat Model (Future)
```javascript
{
  _id: ObjectId,
  participants: [ObjectId],
  petId: ObjectId (ref),
  messages: [{
    sender: ObjectId,
    text: String,
    timestamp: Date,
    read: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📍 API Endpoints

### Auth Routes
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login with email & password
POST   /api/auth/logout            Logout (clear token)
GET    /api/auth/profile           Get authenticated user profile
PUT    /api/auth/profile           Update user profile
POST   /api/auth/google            Google OAuth callback
```

### Pet Routes
```
GET    /api/pets                   Get all pets (with filters)
GET    /api/pets/:id               Get single pet details
GET    /api/pets/mypets            Get user's own pets (protected)
POST   /api/pets                   Create new pet listing (protected)
PUT    /api/pets/:id               Update pet listing (owner only)
DELETE /api/pets/:id               Delete pet listing (owner only)
POST   /api/pets/:id/favorite      Add pet to favorites (protected)
DELETE /api/pets/:id/favorite      Remove from favorites (protected)
POST   /api/pets/:id/review        Add review/rating (protected)
```

### Upload Routes
```
POST   /api/upload                 Upload single image
POST   /api/upload/multiple        Upload multiple images
```

### Search & Filter
```
GET    /api/pets?type=dog&city=Mumbai&breed=Labrador
GET    /api/pets?adopted=false&page=1&limit=10
```

---

## 🎨 UI/UX Component Structure

### Pages
- **HomePage**: Pet discovery, search, advanced filters
- **LoginPage**: Email/password + Google OAuth
- **SignupPage**: Registration with role selection
- **AddPetPage**: Form to list a new pet
- **EditPetPage**: Modify existing pet listing
- **PetDetailsPage**: Full pet profile, owner info, reviews, adoption button
- **MyPostsPage**: User's pet listings with edit/delete
- **ProfilePage**: User profile, ratings, favorites
- **FavoritesPage**: Saved pets (wishlist)
- **SearchResultsPage**: Filtered pet results
- **ChatPage**: Contact owner (future)

### Components
- **Navbar**: Navigation, user menu, search bar
- **Footer**: Links, social, contact info
- **PetCard**: Pet preview (image, name, type, location)
- **FilterBar**: Type, breed, age, size, location filters
- **RatingStars**: Display/submit ratings
- **ImageUpload**: Drag-and-drop image uploader
- **ProtectedRoute**: Require authentication
- **LoadingSpinner**: Async state indicator
- **Modal**: Confirmation dialogs

---

## 🔐 Authentication Flow

### Login/Signup
1. User submits email & password
2. Backend validates & hashes password
3. JWT token generated (exp: 7 days)
4. Token stored in localStorage (frontend)
5. Token sent in Authorization header for API calls

### Google OAuth
1. Frontend opens Google consent screen
2. User authorizes
3. Backend receives auth code
4. Backend exchanges for user info
5. User auto-created/logged in
6. JWT issued, redirect to dashboard

### Protected Routes
- All `/api/*` routes checked for valid JWT
- Middleware decodes token, sets `req.user`
- Missing/invalid token → 401 Unauthorized

---

## 🔍 Search & Filter Features

### Filter Options
- **Pet Type**: Dog, Cat, Rabbit, Bird, Other
- **Breed**: Dropdown/autocomplete
- **Age Range**: 0-2, 2-5, 5-10, 10+ years
- **Size**: Small, Medium, Large
- **Location**: City/State search
- **Health Status**: Vaccinated, Neutered
- **Adoption Status**: Available, Adopted, Pending
- **Health Keywords**: Tag-based search

### Search Implementation
```javascript
// Backend query example
Pet.find({
  type: req.query.type,
  "location.city": { $regex: req.query.city, $options: 'i' },
  age: { $gte: minAge, $lte: maxAge },
  adoptionStatus: 'available'
}).sort({ createdAt: -1 })
```

---

## 🌟 Advanced Features (Roadmap)

### Phase 1: MVP (Current)
- User authentication (JWT + Google OAuth)
- Pet listing & search
- Basic profile management
- Image upload (Cloudinary)

### Phase 2: Engagement (Next 2 weeks)
- ✅ Favorite/Wishlist system
- ✅ Ratings & reviews
- ✅ Advanced filtering
- ✅ Real-time notifications (email)
- ✅ User ratings/reputation

### Phase 3: Communication (Next 4 weeks)
- Real-time chat (Socket.io)
- Adoption request workflow
- Message notifications
- Admin moderation

### Phase 4: Scaling (Future)
- Mobile app (React Native)
- Video pet tours
- Adoption analytics dashboard
- Vet partnerships
- Pet insurance integration

---

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
cd pawConnectFrontend
npm run build
vercel --prod
```
- Env vars: VITE_API_BASE_URL (backend URL)

### Backend Deployment (Render/Railway)
```bash
cd backend
npm install
# Create env vars on platform:
# - MONGO_URI
# - JWT_SECRET
# - CLOUDINARY_*
# - PORT
# - NODE_ENV=production
```
- Logs & auto-deploy from GitHub

---

## 📊 Key Metrics to Track

- **Daily Active Users (DAU)**
- **Pet Listings Growth**
- **Adoption Success Rate**
- **Avg Search to Contact Time**
- **User Retention (30d)**
- **App Crash/Error Rate**
- **Page Load Time (Core Web Vitals)**

---

## 🛠️ Development Workflow

### Local Setup
```bash
# Backend
cd backend
npm install
echo "MONGO_URI=..." > .env
npm run dev

# Frontend (new terminal)
cd pawConnectFrontend
npm install
npm run dev
```

### Git Workflow
```bash
git checkout -b feat/feature-name
# Make changes, commit
git push origin feat/feature-name
# Create PR, review, merge
```

---

## 📞 Support & Contact

- **Issues**: GitHub Issues
- **Email**: support@pawconnect.com
- **Docs**: Full API docs at `/api/docs` (Swagger - optional)

---

## 📝 License

MIT License - Free to use and modify

---

**Last Updated**: November 2025  
**Version**: 1.0.0 - MVP
