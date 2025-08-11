# LogWise - Deployment Guide

## Quick Setup Instructions

### 1. Environment Setup
```bash
# Clone and install dependencies
git clone <your-repo>
cd Reality
npm install
```

### 2. Choose Your Mode

#### Option A: Guest Mode Only (No Backend)
- Ready to use immediately
- All data stored locally
- No setup required

#### Option B: With Supabase Backend
1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Create `.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
4. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor

### 3. Development
```bash
# Start development server
npx expo start

# For web
npx expo start --web

# For mobile
# Scan QR code with Expo Go app
```

### 4. Build for Production
```bash
# Web build
npx expo export --platform web

# Mobile builds
npx expo build:android
npx expo build:ios
```

## Features Available

### Guest Mode
- ✅ Food logging with macro tracking
- ✅ Custom food database
- ✅ Workout logging
- ✅ Water intake tracking
- ✅ Habit tracking
- ✅ Progress photos
- ✅ Behavioral insights
- ✅ All data stored locally

### Account Mode (with Supabase)
- ✅ All guest mode features
- ✅ Cloud sync across devices
- ✅ Account creation/login
- ✅ Data backup and restore
- ✅ Multi-device access

## Troubleshooting

### Common Issues
1. **TypeScript errors**: Run `npm run type-check`
2. **Module not found**: Clear cache with `npx expo r -c`
3. **Database errors**: Check Supabase connection and RLS policies
4. **Build failures**: Ensure all environment variables are set

### Support
- Check the README.md for detailed documentation
- Review the Supabase setup guide in README.md
- Ensure your schema matches the provided SQL file
