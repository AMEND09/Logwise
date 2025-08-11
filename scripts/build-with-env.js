#!/usr/bin/env node

/**
 * Build script that handles environment variables for LogWise
 * Usage: node scripts/build-with-env.js [platform]
 * 
 * Environment variables can be passed in several ways:
 * 1. From existing .env files
 * 2. From command line environment variables
 * 3. From CI/CD pipeline environment variables
 * 
 * Examples:
 * EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx npm run build:web:env
 * node scripts/build-with-env.js web
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platform = process.argv[2] || 'web';

console.log(`🚀 Building LogWise for ${platform}...`);

// Get environment variables from multiple sources
function getEnvVars() {
  const envVars = {};
  
  // 1. Try to load from .env.local (highest priority)
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    console.log('📄 Loading environment from .env.local');
    const envLocal = fs.readFileSync(envLocalPath, 'utf8');
    parseEnvFile(envLocal, envVars);
  }
  
  // 2. Try to load from .env (fallback)
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    console.log('📄 Loading environment from .env');
    const env = fs.readFileSync(envPath, 'utf8');
    parseEnvFile(env, envVars);
  }
  
  // 3. Override with process environment variables (highest priority)
  // This is where Cloudflare Pages build environment variables are injected
  if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
    envVars.EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
    console.log('🔧 Using EXPO_PUBLIC_SUPABASE_URL from environment');
  }
  if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    console.log('🔧 Using EXPO_PUBLIC_SUPABASE_ANON_KEY from environment');
  }
  
  // Log the source of environment variables for debugging
  if (process.env.CF_PAGES) {
    console.log('🌐 Running on Cloudflare Pages');
  }
  
  return envVars;
}

function parseEnvFile(content, envVars) {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
}

// Create temporary .env file for the build
function createBuildEnv(envVars) {
  const buildEnvPath = path.join(process.cwd(), '.env.build');
  let content = '# Auto-generated build environment file\n';
  
  if (Object.keys(envVars).length === 0) {
    console.log('⚠️  No Supabase environment variables found. Building in guest mode only.');
    content += '# No Supabase configuration - app will run in guest mode\n';
  } else {
    console.log('✅ Supabase configuration found. Building with cloud sync support.');
    for (const [key, value] of Object.entries(envVars)) {
      if (key.startsWith('EXPO_PUBLIC_')) {
        content += `${key}=${value}\n`;
      }
    }
  }
  
  fs.writeFileSync(buildEnvPath, content);
  return buildEnvPath;
}

// Clean up temporary files
function cleanup(buildEnvPath) {
  if (fs.existsSync(buildEnvPath)) {
    fs.unlinkSync(buildEnvPath);
  }
}

// Copy Cloudflare Pages configuration files
function copyCloudflareConfig() {
  const distPath = path.join(process.cwd(), 'dist');

}

// Main build process
function build() {
  const envVars = getEnvVars();
  const buildEnvPath = createBuildEnv(envVars);
  
  try {
    let buildCommand;
    
    switch (platform) {
      case 'web':
        buildCommand = 'npx expo export --platform web';
        break;
      case 'android':
        buildCommand = 'npx expo build:android';
        break;
      case 'ios':
        buildCommand = 'npx expo build:ios';
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    console.log(`📦 Running: ${buildCommand}`);
    
    // Set environment variables for the build process
    const env = { ...process.env };
    for (const [key, value] of Object.entries(envVars)) {
      if (key.startsWith('EXPO_PUBLIC_')) {
        env[key] = value;
      }
    }
    
    // Execute the build command
    execSync(buildCommand, {
      stdio: 'inherit',
      env: env
    });
    
    console.log(`✅ Build completed successfully for ${platform}!`);
    
    if (platform === 'web') {
      // Copy Cloudflare Pages configuration files
      copyCloudflareConfig();
      
      console.log('📁 Web build output: ./dist/');
      if (Object.keys(envVars).length > 0) {
        console.log('🔗 App built with Supabase cloud sync support');
        console.log('🌐 Ready for Cloudflare Pages deployment with environment variables');
      } else {
        console.log('💾 App built in guest mode (local storage only)');
      }
    }
    
  } catch (error) {
    console.error(`❌ Build failed: ${error.message}`);
    process.exit(1);
  } finally {
    cleanup(buildEnvPath);
  }
}

// Run the build
build();
