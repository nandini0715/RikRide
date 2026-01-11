# 🚀 Deploying Firestore Security Rules

## Important: Set Up Firestore Security Rules

Your Firestore database currently has NO security rules, which means anyone can read/write data. You need to deploy the security rules.

### Option 1: Via Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **rik-ride**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Copy the contents from `firestore.rules` file
6. Paste into the rules editor
7. Click **Publish**

### Option 2: Via Firebase CLI

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Select your project: rik-ride
# Use default file names (firestore.rules, firestore.indexes.json)

# Deploy rules
firebase deploy --only firestore:rules
```

---

## 🔒 Security Rules Explained

### Users Collection
- ✅ **Read**: Any authenticated user can view profiles
- ✅ **Create**: Users can only create their own profile
- ✅ **Update**: Users can only update their own profile
- ❌ **Delete**: No one can delete profiles

### Rides Collection
- ✅ **Read**: Students and drivers can only see their own rides
- ✅ **Create**: Only students can create ride requests
- ✅ **Update**: 
  - Drivers can accept/reject/complete rides
  - Students can cancel or rate rides
- ❌ **Delete**: No one can delete rides

### Notifications Collection
- ✅ **Read**: Users can only see their own notifications
- ✅ **Create**: System/authenticated users can create
- ✅ **Update**: Users can mark as read
- ✅ **Delete**: Users can delete their own notifications

---

## 📋 Next Steps After Deploying Rules

1. Test the authentication flow
2. Test driver availability toggle
3. Test ride request creation
4. Monitor Firestore usage in Firebase Console
5. Add real-time location tracking (optional)
6. Integrate payment gateway (Phase 2)

---

## ⚠️ Important Notes

- Always keep security rules updated
- Test rules in the Firebase Console Rules Playground
- Monitor security rule violations in Firebase Console
- Never expose sensitive data in client-side code
