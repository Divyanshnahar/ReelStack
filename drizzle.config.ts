import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// load environment variables from .env.local (used by Next) as well as default .env
dotenv.config({ path: '.env.local' });
dotenv.config();

export default defineConfig({
    out: './drizzle',
    schema: './config/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.NEXT_PUBLIC_DATABASE_URL!,
    },
});