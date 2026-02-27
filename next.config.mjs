import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Explicitly set Turbopack root to this project directory.
  // Prevents Next.js from incorrectly detecting C:\dbms\skill_lab as workspace root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
