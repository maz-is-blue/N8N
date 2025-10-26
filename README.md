# Workflow Builder - Lindy-Style Prompted Flow Builder

A full-stack workflow automation platform with a visual flow builder, MCP tool adapters, and n8n integration. Users can describe workflows in natural language, edit them visually on a React Flow canvas, and execute them with comprehensive logging.

## 🎯 Features

### Frontend (React + React Flow)
- ✅ **Visual Flow Builder** - Drag-and-drop canvas with zoom, pan, and controls
- ✅ **Prompt-to-Workflow** - Generate workflows from natural language descriptions
- ✅ **Node Types** - Trigger, Action, Condition, Transform, and External (n8n) nodes
- ✅ **Node Inspector** - Edit node properties and validate configurations
- ✅ **Workflow Management** - Save, load, version, and execute workflows
- ✅ **Run Logs Viewer** - Real-time execution logs with step-by-step details

### Backend (Express.js + TypeScript)
- ✅ **MCP Tool Registry** - Extensible adapter system for external services
- ✅ **MCP Adapters**:
  - 📧 **Email** - Send emails via SMTP (Gmail, etc.)
  - 📊 **Google Sheets** - Read/write spreadsheet data
  - 💬 **WhatsApp** - Send messages via Twilio or Meta Cloud API
  - 🔗 **n8n** - Trigger external n8n workflows via API/webhooks
- ✅ **Workflow Execution Engine** - Step-by-step execution with logging
- ✅ **JWT Authentication** - Secure API access
- ✅ **Credential Management** - Encrypted credential storage
- ✅ **OpenAPI Documentation** - Interactive API docs at `/api/docs`

### Database (PostgreSQL)
- ✅ Users, Credentials, Workflows, Runs, Steps, Tool Executions
- ✅ Encrypted credential storage
- ✅ Comprehensive audit trail

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Prompt     │  │  React Flow  │  │    Node      │     │
│  │  Generator   │  │    Canvas    │  │  Inspector   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (REST API)
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Workflow   │  │  Execution   │  │     MCP      │     │
│  │     API      │  │    Engine    │  │   Registry   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐            │
│         ▼                  ▼                  ▼            │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐        │
│  │  Email   │      │  Sheets  │      │ WhatsApp │        │
│  │  Tool    │      │   Tool   │      │   Tool   │        │
│  └──────────┘      └──────────┘      └──────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Database                          │
│   Users, Workflows, Runs, Steps, Credentials               │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd workflow-builder

# Install all dependencies
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb workflow_builder

# Or using psql:
psql -U postgres
CREATE DATABASE workflow_builder;
\q
```

### 3. Configure Environment Variables

Create `backend/.env` file:

```bash
# Copy example env file
cp backend/env.example backend/.env
```

Edit `backend/.env` with your configurations:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/workflow_builder

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Google Sheets (Optional - for Google Sheets nodes)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SHEETS_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}

# Email/SMTP (Required for email nodes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WhatsApp via Twilio (Optional)
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# WhatsApp via Meta Cloud API (Optional alternative)
WHATSAPP_PROVIDER=meta
META_WHATSAPP_TOKEN=your-token
META_WHATSAPP_PHONE_NUMBER_ID=your-phone-id

# n8n Integration (Optional)
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_SECRET=your-webhook-secret

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
```

### 4. Run Database Migrations

```bash
cd backend
npm run migrate
npm run seed  # Optional: Creates demo user and sample workflow
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## 🚀 Usage

### Demo Credentials (if seeded)
- Email: `demo@example.com`
- Password: `demo123`

### Creating a Workflow

1. **Login/Register** at http://localhost:5173
2. **Create New Workflow** - Click "New Workflow"
3. **Use Prompt Generator**:
   - Type: "Read from Google Sheets and send WhatsApp and Email"
   - Click "Generate" - workflow nodes will appear on canvas
4. **Edit Nodes** - Click any node to edit its properties
5. **Save Workflow** - Click "Save" button
6. **Execute** - Click "Run" to execute the workflow

### Example Prompts

```
"Read from Google Sheets and send WhatsApp and Email"
→ Creates: Trigger → Sheets Read → Transform → Condition → WhatsApp + Email

"Process form submissions and notify sales team"
→ Creates: Form Trigger → Save to Sheets → Condition → Email Notification

"Send an email with attachments"
→ Creates: Manual Trigger → Email Action
```

### Workflow Node Types

| Type | Description | Example Use Case |
|------|-------------|------------------|
| **Trigger** | Starts the workflow | Manual, Form Submit, Schedule |
| **Action** | Performs an operation | Send Email, Update Sheets |
| **Condition** | Branches based on logic | If priority = high |
| **Transform** | Modifies data | Trim, TitleCase, Normalize |
| **External** | Calls external services | n8n workflow, API calls |

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run specific test
npm test -- workflow.test.ts
```

### Test Coverage
- ✅ End-to-end workflow execution
- ✅ MCP tool validation
- ✅ API authentication
- ✅ Workflow CRUD operations

## 📚 API Documentation

Interactive API documentation is available at:
```
http://localhost:3001/api/docs
```

### Key Endpoints

**Authentication**
```
POST /api/auth/register
POST /api/auth/login
```

**Workflows**
```
GET    /api/workflows
POST   /api/workflows
GET    /api/workflows/:id
PUT    /api/workflows/:id
DELETE /api/workflows/:id
```

**Execution**
```
POST /api/executions/workflows/:id/execute
GET  /api/executions/workflows/:id/runs
GET  /api/executions/runs/:id
GET  /api/executions/runs/:id/logs
```

**Credentials**
```
GET    /api/credentials
POST   /api/credentials
PUT    /api/credentials/:id
DELETE /api/credentials/:id
```

## 🔧 Configuration

### Adding New MCP Tools

1. Create tool adapter in `backend/src/mcp/tools/`:

```typescript
import { MCPTool, MCPToolContext, MCPToolResult } from '../types';

export class MyCustomTool implements MCPTool {
  name = 'my_custom.action';
  description = 'Does something custom';

  validateParams(params: any) {
    // Validation logic
    return { valid: true };
  }

  async execute(params: any, context: MCPToolContext): Promise<MCPToolResult> {
    // Execution logic
    return {
      success: true,
      data: { result: 'done' },
      logs: ['Action completed'],
    };
  }
}
```

2. Register in `backend/src/mcp/registry.ts`:

```typescript
import { MyCustomTool } from './tools/myCustom';

registerDefaultTools() {
  this.register(new MyCustomTool());
  // ... other tools
}
```

### n8n Integration

#### Option 1: API Execution
Set in `.env`:
```env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-api-key
```

Use in workflow:
```json
{
  "type": "external.n8n",
  "props": {
    "workflowId": "your-n8n-workflow-id",
    "payload": { "data": "..." }
  }
}
```

#### Option 2: Webhook Trigger
```json
{
  "type": "external.n8n",
  "props": {
    "webhookUrl": "https://your-n8n.com/webhook/...",
    "secretRef": "N8N_SECRET"
  }
}
```

## 📊 Database Schema

```sql
users
├── id (PK)
├── email (unique)
├── password_hash
└── role

workflows
├── id (PK)
├── user_id (FK)
├── name
├── json (JSONB)
└── version

workflow_runs
├── id (PK)
├── workflow_id (FK)
├── status
├── result
└── timestamps

run_steps
├── id (PK)
├── run_id (FK)
├── node_id
├── logs (JSONB)
└── status

credentials (encrypted)
├── id (PK)
├── user_id (FK)
├── provider
└── tokens (encrypted)
```

## 🎨 Tech Stack

### Frontend
- React 18
- TypeScript
- React Flow (visual workflow editor)
- TanStack Query (data fetching)
- Zustand (state management)
- Tailwind CSS (styling)
- Vite (build tool)

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL (database)
- JWT (authentication)
- Zod (validation)
- Nodemailer (email)
- Google APIs (Sheets)
- Twilio/Meta (WhatsApp)
- Axios (HTTP client)

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Encrypted credential storage (AES)
- ✅ Input validation with Zod
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Password hashing with bcrypt

## 🚢 Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve 'dist' folder with nginx or similar
```

### Environment Variables
Ensure all production environment variables are set:
- `NODE_ENV=production`
- `DATABASE_URL` with production database
- Strong `JWT_SECRET` and `ENCRYPTION_KEY`
- Production SMTP/API credentials

## 📝 Example Workflow JSON

```json
{
  "name": "Clean & Notify",
  "nodes": [
    {
      "id": "t1",
      "type": "trigger.manual",
      "props": {},
      "position": { "x": 100, "y": 50 }
    },
    {
      "id": "s1",
      "type": "action.google_sheets.read",
      "props": {
        "sheet": "Leads!A1:F",
        "credentialRef": "G_SHEETS_DEFAULT"
      },
      "position": { "x": 100, "y": 150 }
    },
    {
      "id": "e1",
      "type": "action.email.send",
      "props": {
        "to": "admin@example.com",
        "subject": "New Leads",
        "body": "Check attached data"
      },
      "position": { "x": 100, "y": 250 }
    }
  ],
  "edges": [
    { "id": "e1", "source": "t1", "target": "s1" },
    { "id": "e2", "source": "s1", "target": "e1" }
  ]
}
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d workflow_builder
```

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=3002
```

### SMTP Errors
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" or use OAuth2
- Check SMTP_HOST and SMTP_PORT settings

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Check API docs at `/api/docs`
- Review test files for usage examples

---

**Built with ❤️ for the Workflow Automation Assessment**
