# 🔍 Pre-Flight Checklist

Run through this checklist before starting the application to ensure everything is configured correctly.

## ✅ Prerequisites Check

### 1. Node.js Version
```bash
node --version
# Should be v18.0.0 or higher
```

### 2. PostgreSQL Installation
```bash
psql --version
# Should be PostgreSQL 14 or higher

# Check if PostgreSQL is running
pg_isready
# Should output: accepting connections
```

### 3. npm Installation
```bash
npm --version
# Should be 8.0.0 or higher
```

## 📦 Installation Steps

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

**Expected output:** No errors, all packages installed successfully

### Step 2: Database Setup

```bash
# Create database
createdb workflow_builder

# Verify database was created
psql -l | grep workflow_builder
```

**Expected output:** Database `workflow_builder` appears in the list

### Step 3: Environment Configuration

```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit the .env file with your settings
# Minimum required:
# - DATABASE_URL (adjust if your PostgreSQL credentials differ)
# - JWT_SECRET (change to a random string)
# - ENCRYPTION_KEY (32 character random string)
```

**Minimal working `.env`:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/workflow_builder
JWT_SECRET=change-this-to-random-string
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ENCRYPTION_KEY=12345678901234567890123456789012
```

### Step 4: Run Migrations

```bash
cd backend
npm run migrate
```

**Expected output:**
```
Running database migrations...
✅ Database migrations completed successfully!
```

**If you see errors:**
- Check DATABASE_URL in `.env`
- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep workflow_builder`

### Step 5: Seed Demo Data (Optional but Recommended)

```bash
npm run seed
```

**Expected output:**
```
Seeding database...
✅ Created demo user: demo@example.com / demo123
✅ Created sample workflow
🎉 Database seeded successfully!
```

## 🚀 Starting the Application

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:3001
📝 API Docs: http://localhost:3001/api/docs
🏥 Health: http://localhost:3001/health
```

**Check backend is running:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

## ✅ Verification Steps

### 1. Backend Health Check

Visit: http://localhost:3001/health

**Expected:** JSON response with `{"status":"ok",...}`

### 2. API Documentation

Visit: http://localhost:3001/api/docs

**Expected:** Swagger UI with API documentation

### 3. Frontend Login

Visit: http://localhost:5173

**Expected:** Login page appears

### 4. Demo Login

- Email: `demo@example.com`
- Password: `demo123`

**Expected:** Redirects to workflow list with sample workflow

### 5. Test Workflow Generation

1. Click "New Workflow"
2. Type: "Send an email notification"
3. Click "Generate"

**Expected:** Workflow nodes appear on canvas

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# If not running, start it:
# macOS (Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services app
```

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Find and kill the process
# macOS/Linux
lsof -ti:3001 | xargs kill

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process

# Or change PORT in backend/.env
PORT=3002
```

### Issue: "Port 5173 already in use"

**Solution:**
```bash
# Kill the process or change Vite port
# In frontend/vite.config.ts, change:
server: { port: 5174 }
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Do the same in backend/ and frontend/
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../frontend && rm -rf node_modules package-lock.json && npm install
```

### Issue: "TypeScript errors"

**Solution:**
```bash
# These will resolve after npm install
cd backend && npm install
cd ../frontend && npm install

# Restart your IDE/editor to reload TypeScript
```

### Issue: Migration fails with "relation already exists"

**Solution:**
```bash
# Drop and recreate database
dropdb workflow_builder
createdb workflow_builder
cd backend && npm run migrate
```

## 🧪 Run Tests

```bash
cd backend
npm test
```

**Expected output:**
```
 PASS  src/__tests__/workflow.test.ts
 PASS  src/__tests__/mcp-tools.test.ts

Test Suites: 2 passed, 2 total
Tests:       X passed, X total
```

## 📊 System Requirements

- **OS:** Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **RAM:** 4GB minimum, 8GB recommended
- **Disk Space:** 1GB for dependencies
- **Node.js:** v18.0.0+
- **PostgreSQL:** v14.0+
- **npm:** v8.0.0+

## ✅ Final Checklist

Before proceeding, verify:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Database `workflow_builder` created
- [ ] Dependencies installed (root, backend, frontend)
- [ ] `backend/.env` file configured
- [ ] Migrations completed successfully
- [ ] Demo data seeded
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can login with demo credentials
- [ ] Tests pass

## 🎉 Ready to Go!

If all checks pass, you're ready to use the Workflow Builder!

**Next Steps:**
1. Read [QUICKSTART.md](QUICKSTART.md) for features overview
2. Follow [DEMO.md](DEMO.md) for demo scenarios
3. Check [README.md](README.md) for detailed documentation

**Need Help?**
- Check the troubleshooting section above
- Review the README.md
- Ensure all environment variables are set correctly
