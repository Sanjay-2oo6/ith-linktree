/**
 * Supabase Setup Script
 * Creates database tables and seeds admin user
 * Run this once after deploying the app
 * 
 * Usage: node scripts/setup-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.VITE_ADMIN_EMAIL;
const adminPassword = process.env.VITE_ADMIN_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !adminEmail || !adminPassword) {
  console.error('❌ Missing environment variables. Check .env file.');
  console.error('   Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_ADMIN_EMAIL, VITE_ADMIN_PASSWORD');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupDatabase() {
  console.log('🔧 Setting up Supabase database...\n');

  try {
    // Create admin_users table
    console.log('📝 Creating admin_users table...');
    const { error: adminUsersError } = await supabase.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS admin_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          last_login TIMESTAMP,
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    }).catch(() => ({ error: null })); // Ignore if table exists

    console.log('📝 Creating audit_logs table...');
    await supabase.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
          action VARCHAR(50),
          link_id VARCHAR(255),
          changes JSONB,
          timestamp TIMESTAMP DEFAULT NOW(),
          ip_address INET,
          user_agent TEXT
        );
      `
    }).catch(() => ({ error: null }));

    console.log('📝 Creating admin_sessions table...');
    await supabase.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS admin_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
          token_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP NOT NULL,
          ip_address INET
        );
      `
    }).catch(() => ({ error: null }));

    // Try to enable RLS
    console.log('🔐 Enabling Row Level Security...');
    await supabase.rpc('query', {
      query: `ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;`
    }).catch(() => ({ error: null }));

    // Hash admin password
    console.log('🔐 Hashing admin password...');
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Check if admin user exists
    console.log('👤 Checking for existing admin user...');
    const { data: existingUser, error: selectError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', adminEmail)
      .maybeSingle();

    if (existingUser) {
      console.log(`✅ Admin user "${adminEmail}" already exists`);
      console.log(`   ID: ${existingUser.id}`);
    } else {
      // Create admin user
      console.log(`👤 Creating admin user "${adminEmail}"...`);
      const { data: newUser, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: adminEmail,
          password_hash: passwordHash,
          created_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log(`✅ Admin user created successfully`);
      console.log(`   ID: ${newUser[0].id}`);
      console.log(`   Email: ${newUser[0].email}`);
    }

    console.log('\n✨ Supabase setup completed successfully!\n');
    console.log('📌 Next steps:');
    console.log('   1. Add environment variables to Vercel');
    console.log('   2. Deploy to production');
    console.log('   3. Test login at https://connect.innotechhub.in/admin');
    console.log(`   4. Use email: ${adminEmail}`);
    console.log('   5. Use password: (the password you provided)\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nNote: Tables might already exist. Check Supabase dashboard.');
    process.exit(1);
  }
}

setupDatabase();
