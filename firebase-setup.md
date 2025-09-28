# Firebase Integration Setup Guide

## Overview
This guide will help you set up Firebase for the Card Force application to enable real-time data synchronization across devices and users.

## Prerequisites
- Google account
- Firebase project
- Node.js (for local development)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `card-force-app`
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable "Google" provider
3. Add your domain to authorized domains
4. Copy the Web SDK configuration

## Step 3: Create Firestore Database

1. Go to "Firestore Database" > "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location (choose closest to your users)
4. Click "Done"

## Step 4: Update Firebase Configuration

1. Open `firebase-config.js`
2. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "card-force-app.firebaseapp.com",
    projectId: "card-force-app",
    storageBucket: "card-force-app.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## Step 5: Set Up Firestore Security Rules

1. Go to "Firestore Database" > "Rules"
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own cart
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own addresses
    match /addresses/{addressId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Users can read their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.userSub == request.auth.uid);
      allow write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Admins can read/write all orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        request.auth.token.email == 'imsongbo@gmail.com';
    }
    
    // Products are readable by all authenticated users
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.email == 'imsongbo@gmail.com';
    }
    
    // Chat messages are readable by participants
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Refunds are readable by users and admins
    match /refunds/{refundId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.email == 'imsongbo@gmail.com');
      allow write: if request.auth != null && 
        request.auth.token.email == 'imsongbo@gmail.com';
    }
  }
}
```

## Step 6: Install Firebase SDK

For local development, you can use the CDN version (already included in the HTML files) or install via npm:

```bash
npm install firebase
```

## Step 7: Test Firebase Integration

1. Open the Card Force application
2. Sign in with Google
3. Add items to cart
4. Check Firebase Console to see data being saved
5. Test on different devices/browsers to verify sync

## Data Structure

### Collections Created:

1. **users** - User profiles and preferences
2. **carts** - Shopping cart data per user
3. **orders** - Order information
4. **addresses** - User shipping addresses
5. **products** - Product catalog
6. **chatMessages** - Live design chat messages
7. **refunds** - Refund records

### Document Structure Examples:

#### User Document (`/users/{userId}`)
```json
{
  "uid": "user123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "createdAt": "2025-01-01T00:00:00Z",
  "lastLogin": "2025-01-01T00:00:00Z",
  "savedDesigns": [...]
}
```

#### Cart Document (`/carts/{userId}`)
```json
{
  "userId": "user123",
  "items": [
    {
      "id": 1234567890,
      "name": "Mike Card",
      "price": 5.99,
      "type": "trading-card",
      "quantity": 1
    }
  ],
  "lastUpdated": "2025-01-01T00:00:00Z"
}
```

#### Order Document (`/orders/{orderId}`)
```json
{
  "id": "order123",
  "orderNumber": "CF123456",
  "userId": "user123",
  "userEmail": "user@example.com",
  "items": [...],
  "totalPrice": 15.98,
  "shippingAddress": {...},
  "status": "confirmed",
  "createdAt": "2025-01-01T00:00:00Z",
  "emailNotifications": true
}
```

## Features Enabled

### Real-time Synchronization
- Cart items sync across devices
- Orders update in real-time for admins
- User preferences persist across sessions

### Offline Support
- Data cached locally for offline access
- Automatic sync when connection restored

### Admin Features
- Real-time order monitoring
- Centralized product management
- User data analytics

### User Features
- Persistent cart across devices
- Saved designs sync
- Address book synchronization

## Troubleshooting

### Common Issues:

1. **Authentication errors**: Check Google OAuth configuration
2. **Permission denied**: Verify Firestore security rules
3. **Data not syncing**: Check Firebase configuration
4. **CORS errors**: Ensure domain is authorized in Firebase

### Debug Mode:
Enable debug logging by adding to `firebase-config.js`:
```javascript
// Enable debug mode
import { connectFirestoreEmulator } from 'firebase/firestore';
if (location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Production Considerations

1. **Security Rules**: Tighten rules for production
2. **Data Validation**: Add server-side validation
3. **Backup Strategy**: Set up automated backups
4. **Monitoring**: Enable Firebase monitoring
5. **Performance**: Optimize queries and indexes

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)

For Card Force integration issues:
- Check browser console for errors
- Verify Firebase configuration
- Test with different browsers/devices
