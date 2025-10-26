# 🚀 Workflow Builder - Startup Guide

This guide shows you how to quickly start and manage your Workflow Builder application.

---

## 📋 **Quick Start Scripts**

We've created easy-to-use scripts to manage your application:

| Script | Purpose | Usage |
|--------|---------|-------|
| `run-all.bat` | Start all services | Double-click or run in CMD |
| `stop-all.bat` | Stop all services | Double-click or run in CMD |
| `status.bat` | Check service status | Double-click or run in CMD |
| `logs.bat` | View service logs | Run in CMD |

---

## 🎯 **Method 1: Using Batch Files (Easiest)**

### **Start Everything**

**Option A: Double-Click**
1. Find `run-all.bat` in your project folder
2. Double-click it
3. Wait for all services to start
4. Access the app at http://localhost:5173

**Option B: Command Prompt**
```cmd
cd C:\Users\memam\Desktop\N8N
run-all.bat
```

### **Stop Everything**
```cmd
stop-all.bat
```

### **Check Status**
```cmd
status.bat
```

### **View Logs**
```cmd
logs.bat
```

---

## 💻 **Method 2: Using PowerShell Scripts**

### **Start Everything**
```powershell
.\run-all.ps1
```

### **Stop Everything**
```powershell
.\stop-all.ps1
```

### **Check Status**
```powershell
.\status.ps1
```

---

## 🔄 **What run-all.bat Does**

When you run `run-all.bat`, it automatically:

1. ✅ Checks if Docker Desktop is running
2. ✅ Starts Docker Desktop if needed
3. ✅ Starts all services (PostgreSQL, Backend, Frontend, n8n)
4. ✅ Waits for services to be healthy
5. ✅ Runs database migrations
6. ✅ Shows service status
7. ✅ Displays access URLs

---

## 🌐 **Access Your Application**

Once `run-all.bat` completes successfully:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | demo@example.com / demo123 |
| **Backend API** | http://localhost:3001 | (JWT auth) |
| **API Docs** | http://localhost:3001/api-docs | None required |
| **n8n** | http://localhost:5678 | admin / admin123 |

---

## 📊 **Service Status**

### **Check if Everything is Running**

Run `status.bat` to see:
- Docker Desktop status
- Container status
- Service health checks
- Access URLs

### **Expected Output**
```
Docker Status:
  ✓ Docker Desktop is running

Container Status:
  workflow-builder-backend    Up 5 minutes (healthy)
  workflow-builder-frontend   Up 5 minutes
  workflow-builder-n8n        Up 5 minutes (healthy)
  workflow-builder-db         Up 5 minutes (healthy)

Service Health Checks:
  Backend API:  ✓ Healthy
  Frontend:     ✓ Healthy
  n8n:          ✓ Healthy
```

---

## 📝 **Viewing Logs**

### **All Services**
```cmd
logs.bat
```

### **Specific Service**
```cmd
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f n8n
docker-compose logs -f postgres
```

### **Last 50 Lines**
```cmd
docker-compose logs --tail=50
```

---

## 🛠️ **Troubleshooting**

### **Problem: Docker Desktop Won't Start**

**Solution:**
1. Manually open Docker Desktop from Start Menu
2. Wait for it to fully start (whale icon in system tray)
3. Run `run-all.bat` again

### **Problem: Services Won't Start**

**Check what's wrong:**
```cmd
status.bat
```

**View error logs:**
```cmd
logs.bat
```

**Restart everything:**
```cmd
stop-all.bat
run-all.bat
```

### **Problem: Port Already in Use**

If you see "port already in use" errors:

**Check what's using the ports:**
```cmd
netstat -ano | findstr :3001
netstat -ano | findstr :5173
netstat -ano | findstr :5678
```

**Stop the process using the port:**
```cmd
taskkill /PID <process_id> /F
```

### **Problem: Database Errors**

**Reset the database:**
```cmd
docker-compose down -v
run-all.bat
```

⚠️ **Warning:** This deletes all data!

---

## 🔧 **Advanced Commands**

### **Restart Specific Service**
```cmd
docker-compose restart backend
docker-compose restart frontend
docker-compose restart n8n
```

### **Rebuild Services**
```cmd
docker-compose up -d --build
```

### **View Resource Usage**
```cmd
docker stats
```

### **Clean Everything (Including Data)**
```cmd
docker-compose down -v
docker system prune -a
```

---

## 📦 **Docker Compose Commands**

If you prefer using Docker Compose directly:

| Command | Purpose |
|---------|---------|
| `docker-compose up -d` | Start all services |
| `docker-compose down` | Stop all services |
| `docker-compose ps` | List containers |
| `docker-compose logs` | View logs |
| `docker-compose restart` | Restart services |
| `docker-compose pull` | Update images |

---

## ⏱️ **Startup Times**

Expected startup times:

- **Docker Desktop:** 10-30 seconds (if not running)
- **PostgreSQL:** 5-10 seconds
- **Backend API:** 10-15 seconds
- **Frontend:** 5-10 seconds
- **n8n:** 10-15 seconds

**Total:** ~1-2 minutes from cold start

---

## 🎯 **Daily Workflow**

### **Starting Your Day**
1. Run `run-all.bat`
2. Wait for "ALL SERVICES ARE RUNNING!" message
3. Open http://localhost:5173 in your browser
4. Start building workflows!

### **During Development**
- Use `status.bat` to check if everything is healthy
- Use `logs.bat` to debug issues
- Use `docker-compose restart backend` after changing backend code

### **Ending Your Day**
1. Run `stop-all.bat`
2. Your data is preserved in Docker volumes
3. Close Docker Desktop if desired

---

## 💡 **Tips & Tricks**

### **Tip 1: Create Desktop Shortcuts**
Right-click `run-all.bat` → Send to → Desktop (create shortcut)

### **Tip 2: Add to Startup**
1. Press `Win + R`
2. Type `shell:startup`
3. Copy `run-all.bat` shortcut here
4. Services will start automatically when you login

### **Tip 3: Use Multiple Terminals**
- Terminal 1: `logs.bat` (watch logs)
- Terminal 2: Development work
- Terminal 3: Testing/debugging

### **Tip 4: Quick Status Check**
Add this to your PowerShell profile:
```powershell
function wf { cd C:\Users\memam\Desktop\N8N; .\status.ps1 }
```

---

## 🚨 **Emergency Commands**

### **Everything is Broken - Start Fresh**
```cmd
stop-all.bat
docker-compose down -v
docker system prune -f
run-all.bat
```

### **Just Restart Backend**
```cmd
docker-compose restart backend
```

### **See What's Running**
```cmd
docker ps
```

---

## 📚 **Additional Resources**

- **Main README:** `README.md`
- **Project Summary:** `PROJECT_SUMMARY.md`
- **API Documentation:** http://localhost:3001/api-docs (when running)
- **Docker Compose Config:** `docker-compose.yml`

---

## ✅ **Success Indicators**

You know everything is working when:

✅ `run-all.bat` completes without errors  
✅ `status.bat` shows all services healthy  
✅ http://localhost:5173 loads the frontend  
✅ You can login with demo@example.com / demo123  
✅ You can create and execute workflows  

---

## 🎉 **You're Ready!**

Run this command to start everything:

```cmd
run-all.bat
```

Then open your browser to:

```
http://localhost:5173
```

**Happy workflow building!** 🚀

---

## 📞 **Need Help?**

If you encounter issues:
1. Check `status.bat` output
2. View `logs.bat` for errors
3. Review `TROUBLESHOOTING.md` (if available)
4. Check Docker Desktop is running
5. Ensure ports 3001, 5173, 5432, 5678 are available

---

**Last Updated:** October 26, 2025

