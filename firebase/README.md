# Firebase Setup

This folder contains all Firebase-related configuration and initialization.

## Structure

```
firebase/
├── config.ts      # Firebase configuration from environment variables
├── firebase.ts    # Firebase app initialization and services
└── index.ts       # Central export file
```

## Usage

### Import Firebase services in your components:

```typescript
import { auth, db, analytics } from '@/firebase';
```

### Available Services

- **auth** - Firebase Authentication
- **db** - Firestore Database
- **analytics** - Firebase Analytics
- **app** - Firebase App instance

## Configuration

All Firebase credentials are stored directly in `config.ts` file for easy access and management.
