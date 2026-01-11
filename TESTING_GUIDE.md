# 🧪 Testing Guide - RikHub

## Quick Test Steps

### 1. **Test Signup Flow**

#### Create a Driver Account:
```
1. Go to http://localhost:3000/signup
2. Click "Driver" card
3. Fill in:
   - Name: Test Driver
   - Email: driver@test.com
   - Phone: +91 9876543210
   - Vehicle Number: DL-01-AB-1234
   - Vehicle Type: Auto Rickshaw
   - Password: test123
   - Confirm Password: test123
4. Click "Create Account"
5. Should redirect to /driver/dashboard ✅
```

#### Create a Student Account:
```
1. Open incognito/another browser
2. Go to http://localhost:3000/signup
3. Click "Student" card
4. Fill in:
   - Name: Test Student
   - Email: student@test.com
   - Phone: +91 9876543211
   - College Name: ABC College
   - Student ID: 2024-CS-001
   - Password: test123
   - Confirm Password: test123
5. Click "Create Account"
6. Should redirect to /student/dashboard ✅
```

---

### 2. **Test Driver Availability Toggle**

```
In Driver Dashboard:
1. Look for "Availability Status" card
2. Toggle switch from OFF to ON
3. Status should change to "Online" with green dot ✅
4. Check Firestore Console - isAvailable should be true ✅
```

---

### 3. **Test Real-time Driver List**

```
With Driver Online:
1. Go to Student Dashboard (in incognito browser)
2. Should see the driver in "Available Drivers" list ✅
3. Driver card shows:
   - Name, Vehicle info
   - Rating and total rides
   - Green "Available" badge
   
Test Real-time Update:
1. Toggle driver OFF in driver dashboard
2. Watch student dashboard - driver should disappear instantly ✅
3. Toggle driver back ON
4. Driver should reappear in student list ✅
```

---

### 4. **Test Ride Request**

```
In Student Dashboard:
1. Click "Request Ride" on a driver
2. Dialog opens
3. Fill in:
   - Pickup: College Gate 2
   - Drop: Metro Station
4. Click "Confirm Request"
5. Success message appears ✅

In Driver Dashboard:
1. New ride request should appear in "Ride Requests" section ✅
2. Shows student name, pickup/drop, fare
3. "Accept" and "Decline" buttons visible
```

---

### 5. **Test Login**

```
1. Logout from any dashboard
2. Go to /login
3. Enter credentials (driver@test.com / test123)
4. Click "Sign In"
5. Should redirect to correct dashboard based on role ✅
```

---

## 🔍 Check Firestore Data

### Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select "rik-ride" project
3. Click "Firestore Database"

### Verify Collections:

#### **users** collection:
```
Should see 2 documents (driver and student)
Check fields:
- role: "driver" or "student"
- isAvailable: true/false (for driver)
- All profile info
```

#### **rides** collection:
```
Should see ride requests with:
- studentId, driverId
- pickupLocation, dropLocation
- status: "requested"
- fare: 50
```

---

## ⚠️ Common Issues & Fixes

### Issue: "Cannot find module '@/components/ui/button'"
**Fix:** Restart dev server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: No drivers showing in student dashboard
**Check:**
1. Is driver availability toggle ON?
2. Check Firestore - isAvailable = true?
3. Check browser console for errors

### Issue: Ride request not appearing
**Check:**
1. Open Firestore Console
2. Look in "rides" collection
3. Check status field is "requested"
4. Verify driverId matches

---

## 📊 Expected Behavior

| Action | Expected Result |
|--------|----------------|
| Driver toggles ON | isAvailable = true in Firestore |
| Student views drivers | Real-time list updates |
| Student requests ride | Document created in "rides" collection |
| Driver logs in | Redirects to /driver/dashboard |
| Student logs in | Redirects to /student/dashboard |

---

## 🎯 Success Criteria

- ✅ Can create both student and driver accounts
- ✅ Driver can toggle availability
- ✅ Student can see available drivers in real-time
- ✅ Student can request rides
- ✅ Ride requests appear in driver dashboard
- ✅ Login redirects to correct dashboard
- ✅ Real-time updates work instantly

---

## 🐛 Debugging Tips

### Check Browser Console:
```
F12 → Console tab
Look for:
- Firebase errors
- Network errors
- React errors
```

### Check Network Tab:
```
F12 → Network tab
Filter: Firestore
See real-time updates
```

### Check Firestore Rules:
```
If getting permission errors:
1. Deploy security rules from firestore.rules
2. Or temporarily use test mode (NOT for production!)
```

---

**All tests passing? Your RikHub MVP is working perfectly! 🎉**
