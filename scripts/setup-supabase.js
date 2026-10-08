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
  console.error('Missing environment variables. Check .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupDatabase() {
  console.log('🔧 Setting up Supabase database...\n');

  try {
    // Create tables
    console.log('📋 Creating tables...');
    const { error: tableError } = await supabase.rpc('create_auth_tables', {});
    
    if (tableError && tableError.message !== 'function "create_auth_tables" does not exist') {
      throw tableError;
    }

    // If RPC doesn't exist, create tables directly
    console.log('📝 Creating admin_users table...');
    await supabase.from('admin_users').select('id').limit(1);

    // Hash admin password
    console.log('🔐 Hashing admin password...');
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Check if admin user exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (existingUser) {
      console.log(`✅ Admin user "${adminEmail}" already exists`);
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
    console.log('   1. Test login at https://connect.innotechhub.in/admin');
    console.log(`   2. Use email: ${adminEmail}`);
    console.log('   3. Use password: (the password you provided)');
    console.log('\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
