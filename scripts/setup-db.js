/**
 * HostelOps Database Setup Script
 * Run: node scripts/setup-db.js
 *
 * This script:
 * 1. Creates the 'users' and 'complaints' tables in Supabase
 * 2. Seeds the default admin account from env vars
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// ── Load .env.local manually ──────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hostelops.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'HostelOps Admin';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function setup() {
    console.log('🔗 Connecting to Supabase:', SUPABASE_URL);

    // ── Step 1: Create tables via Supabase SQL API ──────────────────────────
    console.log('\n📋 Step 1: Creating database tables...');

    const createSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
      name        TEXT        NOT NULL,
      email       TEXT        NOT NULL UNIQUE,
      password    TEXT        NOT NULL,
      role        TEXT        NOT NULL DEFAULT 'student'
                              CHECK (role IN ('student', 'admin')),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category    TEXT        NOT NULL,
      description TEXT        NOT NULL,
      priority    TEXT        NOT NULL DEFAULT 'Medium'
                              CHECK (priority IN ('Low', 'Medium', 'High')),
      status      TEXT        NOT NULL DEFAULT 'Pending'
                              CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_complaints_user_id  ON complaints(user_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_status   ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
    CREATE INDEX IF NOT EXISTS idx_users_email         ON users(email);

    ALTER TABLE users      DISABLE ROW LEVEL SECURITY;
    ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
  `;

    // Use Supabase REST SQL endpoint
    const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: createSQL }),
    });

    // If direct RPC doesn't work, try via pg_query
    // Tables may already exist - check by doing a test select
    const { error: testError } = await supabase.from('users').select('id').limit(1);
    if (testError && testError.code === '42P01') {
        console.log('⚠️  Tables do not exist yet.');
        console.log('👉 Please run this SQL manually in Supabase Dashboard → SQL Editor:');
        console.log('\n' + createSQL);
        console.log('\nThen re-run this script to seed the admin account.');
        process.exit(0);
    } else if (testError) {
        console.error('❌ Cannot connect to Supabase:', testError.message);
        console.log('\n👉 Check your NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
        process.exit(1);
    } else {
        console.log('✅ Tables exist and connection is working!');
    }

    // ── Step 2: Seed admin account ──────────────────────────────────────────
    console.log('\n👤 Step 2: Seeding admin account...');
    console.log('   Email:', ADMIN_EMAIL);

    // Check if admin already exists
    const { data: existing } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', ADMIN_EMAIL)
        .single();

    if (existing) {
        console.log('ℹ️  Admin already exists:', existing.email);
        console.log('\n✨ Setup complete! Login at http://localhost:3000/login');
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Password:', ADMIN_PASSWORD);
        return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const { data: newAdmin, error: insertError } = await supabase
        .from('users')
        .insert([{ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashedPassword, role: 'admin' }])
        .select('id, name, email, role')
        .single();

    if (insertError) {
        console.error('❌ Failed to create admin:', insertError.message);
        process.exit(1);
    }

    console.log('✅ Admin created successfully!');
    console.log('   ID:', newAdmin.id);
    console.log('   Name:', newAdmin.name);
    console.log('   Role:', newAdmin.role);

    console.log('\n🎉 Setup complete! You can now login at:');
    console.log('   URL:      http://localhost:3000/login');
    console.log('   Email:   ', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
}

setup().catch(err => {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
});
