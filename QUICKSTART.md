# ⚡ Quick Start Guide

Get the Workflow Builder up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git installed

## 🚀 Setup Steps

### 1. Clone & Install (2 minutes)

```bash
# Clone repository
cd /path/to/project

# Run automated setup
chmod +x setup.sh
./setup.sh
```

### 2. Database Setup (1 minute)

```bash
# Create database
createdb workflow_builder

# Run migrations and seed demo data
cd backend
npm run migrate
npm run seed
```

### 3. Configure Environment (1 minute)

```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit with your settings (minimum required):
# - DATABASE_URL (already set for local)
# - SMTP credentials for email (optional but recommended)
```

**Minimal `.env` for testing:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/workflow_builder
JWT_SECRET=my-super-secret-key-change-this
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ENCRYPTION_KEY=12345678901234567890123456789012
```

### 4. Start Servers (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs

**Demo Login:**
- Email: `demo@example.com`
- Password: `demo123`

## ✅ Verify Installation

1. Open http://localhost:5173
2. Login with demo credentials
3. You should see the sample "Clean & Notify" workflow
4. Click "Edit" to open the workflow builder
5. Try the prompt generator:
   - Type: "Send an email notification"
   - Click "Generate"
   - Workflow nodes should appear!

## 🎯 Next Steps

### Try These Features:

1. **Generate a workflow from prompt:**
   ```
   Read from Google Sheets and send WhatsApp and Email
   ```

2. **Edit node properties:**
   - Click any node
   - Modify its properties in the inspector
   - Click "Save"

3. **Execute a workflow:**
   - Click "Run" button
   - View real-time logs
   - Check execution details

4. **Explore API:**
   - Visit http://localhost:3001/api/docs
   - Try the interactive API documentation

## 🔧 Optional Configurations

### Enable Email Sending

Add to `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Gmail Users:**
1. Enable 2FA on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use that password in `SMTP_PASS`

### Enable WhatsApp (Twilio)

Add to `backend/.env`:
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Enable Google Sheets

Add to `backend/.env`:
```env
SHEETS_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
```

[How to get Google Sheets credentials](https://developers.google.com/sheets/api/quickstart/nodejs)

### Enable n8n Integration

Add to `backend/.env`:
```env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Or start it:
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=3002

# Or kill the process using the port:
lsof -ti:3001 | xargs kill
```

### Dependencies Installation Failed
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Migration Errors
```bash
# Drop and recreate database
dropdb workflow_builder
createdb workflow_builder
cd backend && npm run migrate
```

## 📚 Learn More

- **Full Documentation:** See [README.md](README.md)
- **Demo Guide:** See [DEMO.md](DEMO.md)
- **API Documentation:** http://localhost:3001/api/docs

## 🎉 Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173  
- [ ] Can login with demo credentials
- [ ] Can view sample workflow
- [ ] Can generate workflow from prompt
- [ ] Can edit and save workflow
- [ ] Can execute workflow and view logs

**All checked?** You're ready to build workflows! 🚀
