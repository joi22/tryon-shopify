#!/usr/bin/env node

/**
 * Helper script to ensure DATABASE_URL is set for Prisma commands
 * Falls back to STORAGE_POSTGRES_URL if DATABASE_URL is not set
 */

// Load environment variables from .env file if it exists
import dotenv from 'dotenv';
dotenv.config();

// Set DATABASE_URL from STORAGE_POSTGRES_URL if needed
if (!process.env.DATABASE_URL && process.env.STORAGE_POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.STORAGE_POSTGRES_URL;
}

// Execute the Prisma command passed as arguments
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const command = `npx prisma ${args.join(' ')}`;

try {
    execSync(command, {
        stdio: 'inherit',
        env: process.env
    });
} catch (error) {
    process.exit(1);
}

