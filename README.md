# 🎨 Arty — Digital Art Marketplace

> A full-stack digital art marketplace where artists upload and sell their work, collectors discover and purchase unique pieces, and admins manage the platform.

**Live Demo:** [arty-lake.vercel.app](https://arty-lake.vercel.app/)
---
### Home
![Home](public/Home.png)
### Home Dark Mode
![Home](public/home_darkmode.png)
### Home Arabic Language
![Home](public/home_locatization.png)
### Home Small Screen
![Home](public/phone_home.png)
### Art Types
![Art Types](public/art_types.png)
### Gallery
![Gallery](public/gallery.png)
### Gallery (Collector)
![Gallery](public/collector_gallery.png)
### Artists
![Artists](public/artists.png)
### Artist Profile
![Artists](public/artistProfile.png)
### User Profile
![Profile](public/userprofile.png)
### Role
![Role](public/role.png)
### Login
![Login](public/login.png)
### Register
![Register](public/register.png)
### Favorites (Collector)
![Favorites](public/favorites.png)
### Collection (collector)
![Collection](public/myCollection_empty.png)
### Earning(Artists)
![Earning](public/earning.png)
### ArtWorks(Artist)
![Artworks](public/my_artworks.png)
### Upload Artwork(Artist)
![Upload Artwork](public/upload_artwork.png)
### Edit Artwork(Artist)
![Edit Artwork](public/editArtwork.png)
### Canvas(Artist)
![Canvas](public/canvas.png)
### Payment Gate
![Payment](public/payment_gate.png)
### Successful Payment
![Payment](public/payment_sucess.png)
### Dashboard(Admin)
![Dashboard](public/dashboard_overview.png)
![Dashboard](public/dashboard_artworks.png)

---

## 📸 Overview

Arty is a production-ready React application that connects artists with art collectors. Artists can upload, auction, or sell their digital artwork — collectors can browse, favorite, bid, and purchase. The platform supports Arabic and English with full RTL support.

---

## ✨ Features

### 🔐 Authentication & Roles
- Email/password registration and login
- Google OAuth (popup on localhost, redirect on production)
- Three roles: **Admin**, **Artist**, **Collector**
- Role selection screen after first login
- Protected routes per role

### 🎨 Artist Features
- Upload artwork with image, title, description, price, category, and medium
- **Edit** uploaded artworks
- **Canvas Editor** — draw directly in the browser using Fabric.js
- Set artwork as **Auction** with starting bid and end time
- View all personal artworks
- Earnings dashboard with sales history and stats
- Public artist profile with follower count and total value

### 🖼️ Collector Features
- Browse gallery with search, filter by category, and sort
- Add/remove artworks to **Favorites**
- Place **bids** on auction artworks with live countdown timer
- Buy artworks directly via **Stripe Checkout**
- View purchased artworks in **My Collection**
- Follow/unfollow artists

### 🛡️ Admin Features
- Full dashboard with stats: users, artworks, sales, revenue
- Manage users (view, delete)
- Moderate artworks (view, delete)
- View all sales history

### 🌍 Localization
- Full **Arabic** and **English** support
- RTL layout for Arabic using `stylis-plugin-rtl`
- Language switcher in navbar

### 🌙 Dark Mode
- Toggle between light and dark theme
- Preference saved in localStorage

### 💳 Payments
- Stripe Checkout integration
- Serverless API function for creating checkout sessions
- Purchase saved to Firestore after successful payment

### 🔔 Other Features
- Virtual exhibition page (**Art Types**) — explore painting, digital art, photography, and more
- Artist public profile with follow button and artworks grid
- Share artwork — copy link to clipboard
- Image zoom modal on artwork detail page
- Auction bidding with real-time countdown and bid history

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18, Vite |
| UI Library | MUI (Material UI) v5 |
| State Management | Redux Toolkit |
| Routing | React Router v6 |
| Backend / Database | Firebase Firestore |
| Authentication | Firebase Auth |
| Image Upload | Cloudinary |
| Payments | Stripe Checkout |
| Canvas Drawing | Fabric.js |
| Localization | i18next, react-i18next |
| RTL Support | stylis-plugin-rtl, @emotion/cache |
| Deployment | Vercel |

---

## 📁 Project Structure

```
src/
├── Firebase/
│   ├── auth.js           # Google & email auth providers
│   ├── firebaseConfig.js # Firebase app init
│   └── firestore.js      # Firestore db instance
├── Hooks/
│   └── useAuth.js        # Auth listener + useAuth hook
├── Pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ChooseRole.jsx
│   ├── Home.jsx
│   ├── Gallery.jsx
│   ├── ArtTypes.jsx
│   ├── ArtworkDetail.jsx
│   ├── ArtistProfile.jsx
│   ├── UserProfile.jsx
│   ├── UploadArtwork.jsx
│   ├── EditArtwork.jsx
│   ├── CanvasEditor.jsx
│   ├── MyArtworks.jsx
│   ├── MyCollection.jsx
│   ├── Favorites.jsx
│   ├── Earnings.jsx
│   ├── AdminDashboard.jsx
│   ├── PaymentSuccess.jsx
│   └── Navbar.jsx
├── Store/
│   ├── index.js
│   ├── authSlice.js
│   ├── artWorksSlice.js
│   ├── favoritesSlice.js
│   ├── bidsSlice.js
│   └── followSlice.js
├── Services/
│   └── cloudinary.js
├── locales/
│   ├── en/translation.json
│   └── ar/translation.json
├── App.jsx
├── router.jsx
├── i18n.js
└── main.jsx

api/
└── create-checkout-session.js  # Vercel serverless function
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project
- Cloudinary account
- Stripe account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/arty.git
cd arty
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

STRIPE_SECRET_KEY=sk_test_...
```

### 4. Run the development server

```bash
# Terminal 1 — React app
npm run dev

# Terminal 2 — Stripe API server
node server.js
```

### 5. Open the app

```
http://localhost:5173
```

---

## 🔥 Firebase Setup

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    match /artworks/{artworkId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (
        resource.data.artistId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"
      );
    }

    match /purchases/{purchaseId} {
      allow read: if request.auth != null && (
        resource.data.collectorId == request.auth.uid ||
        resource.data.artistId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin"
      );
      allow create: if request.auth != null;
    }

    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null &&
        resource.data.collectorId == request.auth.uid;
      allow create: if request.auth != null;
    }

    match /bids/{bidId} {
      allow read: if true;
      allow create: if request.auth != null;
    }

    match /follows/{followId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth != null &&
        resource.data.followerId == request.auth.uid;
    }
  }
}
```

### Enable Authentication Providers
- Email/Password
- Google

### Add Authorized Domains
In Firebase Console → Authentication → Settings → Authorized domains:
- `localhost`
- `your-app.vercel.app`

---

## ☁️ Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to **Settings → Upload → Upload Presets**
3. Create a new preset named `arty_uploads` with **Unsigned** signing mode
4. Copy your **Cloud Name** to `.env`

---

## 💳 Stripe Setup

1. Create an account at [stripe.com](https://stripe.com)
2. Get your **Publishable Key** (`pk_test_...`) and **Secret Key** (`sk_test_...`)
3. Add both to `.env`

**Test Card:**
```
Number : 4242 4242 4242 4242
Expiry : 12/34
CVC    : 123
```

---

## 🚢 Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "initial commit"
git push origin main
```

### 2. Import on Vercel
- Go to [vercel.com](https://vercel.com)
- Click **Add New Project** → import your repo
- Framework: **Vite**

### 3. Add Environment Variables
Add all variables from your `.env` file in Vercel → Settings → Environment Variables.

### 4. Deploy

Vercel auto-deploys on every push to `main`. The `api/create-checkout-session.js` file is automatically deployed as a serverless function.

---

## 👤 Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | View all users, artworks, sales. Delete any content. |
| **Artist** | Upload, edit, auction artworks. Canvas editor. View earnings. |
| **Collector** | Browse, buy, bid, favorite artworks. Follow artists. |

To make yourself an Admin: go to **Firestore → users → your document** and change `role` to `"admin"`.

