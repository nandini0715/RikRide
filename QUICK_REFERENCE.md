# Quick Reference: New Features 🚀

## Driver Dashboard New Buttons

### Main Actions:
- **Go Online/Offline** - Toggle in availability card
- **Accept Ride** - Green button on ride request cards
- **Decline** - Red outlined button on ride request cards  
- **Edit Fare** - Small blue link next to fare amount (₹)
- **Start Ride** - Appears after accepting ride
- **Complete Ride** - Green button when ride is ongoing

### Fare Editing:
1. Click "Edit Fare" on any ride request or active ride
2. Enter new amount in ₹ INR
3. Click "Update Fare"
4. Student sees new fare instantly

---

## Student Dashboard New Features

### Current Ride Card (Left Sidebar):
- Shows when you have an active ride
- **Yellow pulsing dot** - Ride is active
- **Status badges:**
  - 🔵 **Requested** - Waiting for driver
  - 🟡 **Accepted** - Driver confirmed
  - 🟢 **Ongoing** - Ride in progress
  - ⚫ **Completed** - Finished
- **Cancel Ride** button - Only visible when status is "Requested"

### Rating System:
- Appears automatically when ride is completed
- Tap stars to rate (1-5)
- Text descriptions: Poor → Fair → Good → Very Good → Excellent
- **Skip** or **Submit Rating** buttons

---

## Real-time Updates

### What updates automatically:
✅ Ride requests (driver)  
✅ Ride status changes (both)  
✅ Fare updates (both)  
✅ Available drivers list (student)  
✅ Active ride info (both)  

### No refresh needed!
All changes happen instantly via Firestore listeners.

---

## Status Transitions

```
REQUESTED → ACCEPTED → ONGOING → COMPLETED
    ↓           ↓          ↓          ↓
 Student    Driver    Driver    Driver
 creates   accepts   starts   completes
```

**Student can cancel:** ❌ Only when status = REQUESTED  
**Driver can accept:** ✅ Only one ride at a time  
**Driver can edit fare:** ✅ Anytime (even during ride)  

---

## Firestore Collections Updated

### `rides` collection:
```json
{
  "status": "requested | accepted | ongoing | completed | cancelled | declined",
  "fare": 50,
  "rating": 5,
  "requestedAt": "timestamp",
  "acceptedAt": "timestamp",
  "startedAt": "timestamp",
  "completedAt": "timestamp",
  "ratedAt": "timestamp"
}
```

### `users` collection (drivers):
```json
{
  "rating": 4.5,
  "totalRides": 10
}
```

---

## Important Notes ⚠️

1. **Deploy Firestore index** before testing:
   ```bash
   firebase deploy --only firestore:indexes
   ```

2. **One ride at a time:**
   - Drivers can only accept one ride
   - Students can only request one ride
   - Prevents conflicting bookings

3. **Fare is editable:**
   - Driver can change fare anytime
   - Student sees updates instantly
   - No negotiation flow yet (future feature)

4. **Rating updates driver:**
   - Currently overwrites rating (not averaged)
   - TODO: Calculate average of all ratings

---

## Color Scheme 🎨

**Status Colors:**
- Requested: Blue (`bg-blue-100`)
- Accepted: Yellow (`bg-yellow-100`)
- Ongoing: Green (`bg-green-100`)
- Completed: Gray (`bg-gray-100`)

**Action Colors:**
- Accept: Default shadcn button
- Decline: Red outlined
- Cancel: Red outlined
- Complete: Green background

---

## Keyboard Shortcuts (Future)

Not implemented yet, but planned:
- `Ctrl/Cmd + A` - Accept ride (driver)
- `Ctrl/Cmd + D` - Decline ride (driver)
- `Ctrl/Cmd + S` - Start ride (driver)
- `Ctrl/Cmd + C` - Complete ride (driver)

---

## Troubleshooting 🔧

### "Firestore index required" error:
→ Run: `firebase deploy --only firestore:indexes`

### Rides not appearing:
→ Check driver is online (green toggle)  
→ Check student doesn't have active ride  

### Status not updating:
→ Check Firestore rules deployed  
→ Check internet connection  
→ Check browser console for errors  

### Rating not saving:
→ Ensure ride status is "completed"  
→ Check Firestore permissions  

---

**Need help?** Check:
- `PHASE_2_COMPLETE.md` - Full documentation
- `PHASE_2_SUMMARY.md` - Overview
- Firebase Console - Database and error logs
