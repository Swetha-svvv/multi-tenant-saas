require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/db');

async function seedPasswords() {
  console.log('🔐 Hashing seed passwords...');

  const users = [
    { email: 'superadmin@system.com', password: 'Admin@123' },
    { email: 'admin@demo.com', password: 'Demo@123' },
    { email: 'user1@demo.com', password: 'User@123' },
    { email: 'user2@demo.com', password: 'User@123' }
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hash, u.email]
    );
    console.log(`✅ Updated password for ${u.email}`);
  }

  process.exit();
}

seedPasswords().catch(console.error);
