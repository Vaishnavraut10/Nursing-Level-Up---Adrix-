# Database Setup Guide

## Option 1: Local PostgreSQL

If you have PostgreSQL installed locally:

1. **Create a database:**
```bash
createdb test
```

2. **Update .env file:**
```
DATABASE_URL=postgresql://test:password@localhost:5432/test
```

3. **Run the schema:**
```bash
cd backend
psql -U test -d test -f src/config/schema.sql
```

4. **Run the seed data:**
```bash
psql -U test -d test -f src/config/seed.sql
```

## Option 2: Neon PostgreSQL (Recommended for Development)

Neon is a serverless PostgreSQL that's easy to set up.

1. **Sign up for Neon:**
   - Go to https://neon.tech
   - Create a free account
   - Create a new project

2. **Get connection string:**
   - In Neon dashboard, go to your project
   - Copy the connection string (Postgres Connection String)
   - It will look like: `postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require`

3. **Update .env file:**
```
DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

4. **Run the schema:**
```bash
cd backend
psql "postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require" -f src/config/schema.sql
```

5. **Run the seed data:**
```bash
psql "postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require" -f src/config/seed.sql
```

## Option 3: Docker PostgreSQL

If you have Docker installed:

1. **Run PostgreSQL container:**
```bash
docker run --name nursing-postgres -e POSTGRES_USER=test -e POSTGRES_PASSWORD=password -e POSTGRES_DB=test -p 5432:5432 -d postgres:15
```

2. **Update .env file:**
```
DATABASE_URL=postgresql://test:password@localhost:5432/test
```

3. **Run the schema:**
```bash
cd backend
docker exec -i nursing-postgres psql -U test -d test < src/config/schema.sql
```

4. **Run the seed data:**
```bash
docker exec -i nursing-postgres psql -U test -d test < src/config/seed.sql
```

## Verify Setup

After running the schema and seed data, you can verify:

```bash
psql "YOUR_DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
psql "YOUR_DATABASE_URL" -c "SELECT COUNT(*) FROM test_series;"
psql "YOUR_DATABASE_URL" -c "SELECT COUNT(*) FROM questions;"
```

Expected output:
- users: 6 (1 admin + 5 students)
- test_series: 5
- questions: 5

## Start Backend

Once the database is set up:

```bash
cd backend
npm run dev
```

The backend should connect successfully and start on port 5000.
