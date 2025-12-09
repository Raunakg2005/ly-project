#!/usr/bin/env ts-node

/**
 * Test Database Connection
 * 
 * Run with: npm run test:db
 */

import connectDB from '../lib/db/mongodb.js';
import { User } from '../lib/db/models/User.js';

async function testDB() {
    try {
        console.log('🧪 Testing MongoDB connection...\n');

        // Connect to database
        await connectDB();
        console.log('✅ MongoDB connection successful\n');

        // Test User model
        console.log('📝 Testing User model...');
        const userCount = await User.countDocuments();
        console.log(`   Found ${userCount} users in database\n`);

        // Test creating a test user (if none exist)
        if (userCount === 0) {
            console.log('👤 Creating test user...');
            const testUser = await User.create({
                email: 'test@docshield.com',
                name: 'Test User',
                role: 'user',
                subscription: {
                    plan: 'free',
                    status: 'active',
                },
                profile: {
                    verified: false,
                },
            });
            console.log(`   Created user: ${testUser.email}\n`);
        }

        console.log('✅ All database tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database test failed:', error);
        process.exit(1);
    }
}

testDB();
