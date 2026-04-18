const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'fashionhub');

const files = {
  // ROOT
  'package.json': JSON.stringify({
    name: "fashionhub-monorepo",
    private: true,
    scripts: {
      build: "turbo run build",
      dev: "turbo run dev",
      lint: "turbo run lint",
      format: "prettier --write \"**/*.{ts,tsx,md,json}\"",
      start: "turbo run start"
    },
    devDependencies: {
      "eslint": "^8.57.0",
      "prettier": "^3.2.5",
      "turbo": "^1.13.0",
      "typescript": "^5.4.0"
    },
    engines: {
      node: ">=18"
    },
    packageManager: "pnpm@9.0.0"
  }, null, 2),
  'pnpm-workspace.yaml': `packages:
  - "apps/*"
  - "packages/*"
`,
  'turbo.json': JSON.stringify({
    $schema: "https://turbo.build/schema.json",
    pipeline: {
      build: {
        dependsOn: ["^build"],
        outputs: ["dist/**", ".next/**"]
      },
      lint: {
        dependsOn: ["^lint"]
      },
      dev: {
        cache: false,
        persistent: true
      },
      start: {
        dependsOn: ["^build"]
      }
    }
  }, null, 2),
  'docker-compose.yml': `version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: fashionhub
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
volumes:
  postgres_data:
  redis_data:
`,
  '.env.example': `DATABASE_URL="postgresql://user:password@localhost:5432/fashionhub"
REDIS_URL="redis://localhost:6379"
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001"
`,
  '.eslintrc.js': `module.exports = { root: true, env: { node: true }, parser: '@typescript-eslint/parser', plugins: ['@typescript-eslint'], extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'] };`,
  '.prettierrc': `{"semi": true, "singleQuote": true, "trailingComma": "all"}`,

  // DATABASE PACKAGE
  'packages/database/package.json': JSON.stringify({
    name: "@fashionhub/database",
    version: "1.0.0",
    main: "./src/index.ts",
    types: "./src/index.ts",
    scripts: {
      "build": "tsc",
      "lint": "eslint src/",
      "db:generate": "prisma generate",
      "db:push": "prisma db push"
    },
    dependencies: {
      "@prisma/client": "^5.10.0"
    },
    devDependencies: {
      "prisma": "^5.10.0",
      "typescript": "^5.4.0",
      "@fashionhub/tsconfig": "workspace:*"
    }
  }, null, 2),
  'packages/database/tsconfig.json': JSON.stringify({
    extends: "@fashionhub/tsconfig/base.json",
    compilerOptions: { outDir: "dist", rootDir: "src" },
    include: ["src"]
  }, null, 2),
  'packages/database/prisma/schema.prisma': `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  title       String
  description String?
  url         String   @unique
  imageUrl    String?
  source      String
  brand       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  prices      Price[]
}

model Price {
  id        String   @id @default(cuid())
  amount    Float
  currency  String   @default("INR")
  createdAt DateTime @default(now())
  productId String
  product   Product  @relation(fields: [productId], references: [id])
}
`,
  'packages/database/src/index.ts': `export * from '@prisma/client';
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
`,

  // SHARED TSCONFIG (Adding a dedicated tsconfig package for sanity)
  'packages/tsconfig/package.json': JSON.stringify({
    name: "@fashionhub/tsconfig",
    version: "1.0.0",
    private: true
  }, null, 2),
  'packages/tsconfig/base.json': JSON.stringify({
    compilerOptions: {
      target: "es2022",
      module: "commonjs",
      lib: ["es2022"],
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    }
  }, null, 2),
  'packages/tsconfig/next.json': JSON.stringify({
    compilerOptions: {
      target: "es6",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "node",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true
    }
  }, null, 2),

  // SHARED PACKAGE
  'packages/shared/package.json': JSON.stringify({
    name: "@fashionhub/shared",
    version: "1.0.0",
    main: "./src/index.ts",
    types: "./src/index.ts",
    scripts: {
      "build": "tsc",
      "lint": "eslint src/"
    },
    devDependencies: {
        "typescript": "^5.4.0",
        "@fashionhub/tsconfig": "workspace:*"
    }
  }, null, 2),
  'packages/shared/tsconfig.json': JSON.stringify({
    extends: "@fashionhub/tsconfig/base.json",
    compilerOptions: { outDir: "dist", rootDir: "src" },
    include: ["src"]
  }, null, 2),
  'packages/shared/src/index.ts': `export * from './types';\nexport const CONSTANTS = { API_VERSION: 'v1' };`,
  'packages/shared/src/types.ts': `export interface AppResponse<T> {\n  data: T;\n  success: boolean;\n  message?: string;\n}`,

  // SCRAPER PACKAGE
  'packages/scraper/package.json': JSON.stringify({
    name: "@fashionhub/scraper",
    version: "1.0.0",
    main: "./src/index.ts",
    scripts: {
      "build": "tsc",
      "start": "node dist/index.js",
      "dev": "tsc --watch & node dist/index.js",
      "lint": "eslint src/"
    },
    dependencies: {
      "playwright": "^1.42.0",
      "bullmq": "^5.4.0",
      "ioredis": "^5.3.0",
      "@fashionhub/database": "workspace:*",
      "@fashionhub/shared": "workspace:*"
    },
    devDependencies: {
      "typescript": "^5.4.0",
      "@fashionhub/tsconfig": "workspace:*"
    }
  }, null, 2),
  'packages/scraper/tsconfig.json': JSON.stringify({
    extends: "@fashionhub/tsconfig/base.json",
    compilerOptions: { outDir: "dist", rootDir: "src" },
    include: ["src"]
  }, null, 2),
  'packages/scraper/src/index.ts': `import { Worker } from 'bullmq';
console.log('Scraper worker starting...');
const worker = new Worker('scraping-queue', async job => {
  console.log('Processing job', job.id);
  // Scraper implementation here
}, { connection: { host: 'localhost', port: 6379 } });
`,

  // API APP
  'apps/api/package.json': JSON.stringify({
    name: "@fashionhub/api",
    version: "1.0.0",
    private: true,
    main: "./src/server.ts",
    scripts: {
      "build": "tsc",
      "start": "node dist/server.js",
      "dev": "tsc --watch & node dist/server.js",
      "lint": "eslint src/"
    },
    dependencies: {
      "express": "^4.18.3",
      "cors": "^2.8.5",
      "@fashionhub/database": "workspace:*",
      "@fashionhub/shared": "workspace:*"
    },
    devDependencies: {
      "@types/express": "^4.17.21",
      "@types/cors": "^2.8.17",
      "typescript": "^5.4.0",
      "@fashionhub/tsconfig": "workspace:*"
    }
  }, null, 2),
  'apps/api/tsconfig.json': JSON.stringify({
    extends: "@fashionhub/tsconfig/base.json",
    compilerOptions: { outDir: "dist", rootDir: "src" },
    include: ["src"]
  }, null, 2),
  'apps/api/src/server.ts': `import express from 'express';
import cors from 'cors';
import { prisma } from '@fashionhub/database';
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.json({ message: 'FashionHub API Running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(\`API listening on port \${PORT}\`);
});
`,

  // WEB APP (Next.js)
  'apps/web/package.json': JSON.stringify({
    name: "@fashionhub/web",
    version: "1.0.0",
    private: true,
    scripts: {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    },
    dependencies: {
      "next": "14.1.3",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "framer-motion": "^11.0.8",
      "recharts": "^2.12.2",
      "lucide-react": "^0.358.0",
      "@fashionhub/shared": "workspace:*"
    },
    devDependencies: {
      "@types/node": "^20.11.24",
      "@types/react": "^18.2.61",
      "@types/react-dom": "^18.2.19",
      "autoprefixer": "^10.4.18",
      "eslint": "^8.57.0",
      "eslint-config-next": "14.1.3",
      "postcss": "^8.4.35",
      "tailwindcss": "^3.4.1",
      "typescript": "^5.4.0",
      "@fashionhub/tsconfig": "workspace:*"
    }
  }, null, 2),
  'apps/web/tsconfig.json': JSON.stringify({
    extends: "@fashionhub/tsconfig/next.json",
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"]
      },
      plugins: [{ "name": "next" }]
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  }, null, 2),
  'apps/web/next.config.mjs': `/** @type {import('next').NextConfig} */\nconst nextConfig = { reactStrictMode: true, transpilePackages: ["@fashionhub/shared"] };\nexport default nextConfig;`,
  'apps/web/tailwind.config.ts': `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
`,
  'apps/web/postcss.config.mjs': `/** @type {import('postcss-load-config').Config} */\nconst config = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\nexport default config;`,
  'apps/web/src/app/globals.css': `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
  'apps/web/src/app/layout.tsx': `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FashionHub",
  description: "Real-time clothing price aggregator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
`,
  'apps/web/src/app/page.tsx': `"use client";
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-6 drop-shadow-sm">
          FashionHub
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The ultimate real-time clothing price aggregator for Indian e-commerce.
          Track, compare, and get the best deals across multiple platforms.
        </p>
      </motion.div>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-10 px-8 py-3 rounded-full bg-indigo-600 text-white font-medium shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer"
      >
        Start Hunting Deals
      </motion.button>
    </main>
  );
}
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(rootDir, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
  console.log('Created:', filePath);
});
console.log('Scaffolding complete!');
