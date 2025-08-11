-- LogWise Nutrition Tracker - Supabase Database Schema
-- Run these commands in your Supabase SQL Editor to set up the database

-- Create the profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  weight_kg DECIMAL NOT NULL,
  height_cm INTEGER NOT NULL,
  start_weight_kg DECIMAL NOT NULL,
  goal_weight_kg DECIMAL NOT NULL,
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goals JSONB NOT NULL,
  eating_triggers TEXT[] DEFAULT '{}',
  problem_foods TEXT[] DEFAULT '{}',
  preferred_habits TEXT[] DEFAULT '{}',
  motivation_reason TEXT DEFAULT '',
  meal_times JSONB DEFAULT '{"breakfast": "08:00", "lunch": "12:30", "dinner": "18:30"}',
  notifications_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the daily_logs table
CREATE TABLE daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meals JSONB DEFAULT '{}',
  workout_entries JSONB DEFAULT '[]',
  water_ml INTEGER DEFAULT 0,
  daily_habits JSONB DEFAULT '{}',
  mood_checkins JSONB DEFAULT '{}',
  reflection JSONB DEFAULT '{}',
  habit_streak JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create the custom_foods table
CREATE TABLE custom_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grams INTEGER NOT NULL,
  calories DECIMAL NOT NULL,
  protein_g DECIMAL NOT NULL,
  carbs_g DECIMAL NOT NULL,
  fats_g DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the weight_logs table
CREATE TABLE weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create the progress_photos table
CREATE TABLE progress_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  image_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- Create policies for daily_logs
CREATE POLICY "Users can view own daily_logs" ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily_logs" ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily_logs" ON daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily_logs" ON daily_logs FOR DELETE USING (auth.uid() = user_id);

-- Create policies for custom_foods
CREATE POLICY "Users can view own custom_foods" ON custom_foods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own custom_foods" ON custom_foods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own custom_foods" ON custom_foods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own custom_foods" ON custom_foods FOR DELETE USING (auth.uid() = user_id);

-- Create policies for weight_logs
CREATE POLICY "Users can view own weight_logs" ON weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight_logs" ON weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight_logs" ON weight_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight_logs" ON weight_logs FOR DELETE USING (auth.uid() = user_id);

-- Create policies for progress_photos
CREATE POLICY "Users can view own progress_photos" ON progress_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress_photos" ON progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress_photos" ON progress_photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress_photos" ON progress_photos FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(date);
CREATE INDEX idx_custom_foods_user_id ON custom_foods(user_id);
CREATE INDEX idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX idx_weight_logs_date ON weight_logs(date);
CREATE INDEX idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX idx_progress_photos_date ON progress_photos(date);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_foods_updated_at BEFORE UPDATE ON custom_foods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weight_logs_updated_at BEFORE UPDATE ON weight_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_photos_updated_at BEFORE UPDATE ON progress_photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
