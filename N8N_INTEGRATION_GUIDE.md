# n8n Integration Guide

## 🚀 Quick Start

### 1. Start Docker Desktop
Make sure Docker Desktop is running, then start all services:

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** (port 5432)
- **Backend API** (port 3001)
- **Frontend UI** (port 5173)
- **n8n** (port 5678) ⭐ NEW!

---

## 🔐 Accessing n8n

Once Docker containers are running:

1. **Open n8n UI:** http://localhost:5678
2. **Login credentials:**
   - **Username:** `admin`
   - **Password:** `admin123`

> 💡 **Note:** Change these credentials in production by editing `docker-compose.yml`

---

## 🔑 Getting Your n8n API Key

### Step 1: Access n8n Settings
1. Go to http://localhost:5678
2. Login with `admin` / `admin123`
3. Click your **profile icon** (top right)
4. Select **Settings** → **API**

### Step 2: Generate API Key
1. Click **"Create an API key"**
2. Give it a name: `workflow-builder-integration`
3. Copy the generated API key
4. Update `backend/.env`:
   ```env
   N8N_API_KEY=n8n_your_actual_api_key_here
   ```

### Step 3: Restart Backend
```bash
docker-compose restart backend
```

---

## 📋 How n8n Integration Works

### Architecture

```
┌─────────────────┐
│  Workflow UI    │  (User creates workflow)
│  (Frontend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │  (Executes workflow steps)
└────────┬────────┘
         │
         ├───► Email Tool (Gmail SMTP)
         ├───► Google Sheets Tool
         ├───► WhatsApp Tool (TextMe Bot)
         └───► n8n Tool (Advanced workflows) ⭐
                │
                ▼
         ┌─────────────┐
         │     n8n     │  (Complex automation)
         └─────────────┘
```

### Use Cases for n8n Integration

Our workflow builder handles **simple steps** directly:
- ✅ Send email
- ✅ Update Google Sheet
- ✅ Send WhatsApp message
- ✅ Basic conditions

For **complex scenarios**, delegate to n8n:
- 🔄 HTTP API calls to external services
- 🕐 Delays & scheduled retries
- 🔀 Complex branching logic
- 📊 Data transformation
- 🎣 Webhook listeners
- 🤖 AI/LLM integrations (OpenAI, Claude, etc.)

---

## 🔨 Creating an n8n Workflow

### Example: Sales Notification Workflow

#### Step 1: Create Workflow in n8n UI
1. Go to http://localhost:5678
2. Click **"New workflow"**
3. Name it: `Sales Notification`

#### Step 2: Add Webhook Trigger
1. Click **"+"** → Search for **"Webhook"**
2. Configure:
   - **HTTP Method:** POST
   - **Path:** `sales-notify`
   - **Authentication:** None (or Basic Auth)
3. Click **"Listen for test event"**
4. **Copy the webhook URL:** `http://localhost:5678/webhook/sales-notify`

#### Step 3: Add Processing Nodes
Example setup:
```
Webhook → Code (Transform) → HTTP Request (CRM) → Send Email
```

1. **Code Node** (optional):
   ```javascript
   return items.map(item => ({
     json: {
       customer: item.json.name,
       amount: item.json.revenue,
       priority: item.json.revenue > 1000 ? 'HIGH' : 'NORMAL'
     }
   }));
   ```

2. **HTTP Request Node:**
   - **Method:** POST
   - **URL:** `https://your-crm.com/api/leads`
   - **Headers:** `{"Authorization": "Bearer YOUR_TOKEN"}`
   - **Body:** `{{ $json }}`

3. **Send Email Node:**
   - Use n8n's built-in Gmail integration
   - Send notification to sales team

#### Step 4: Activate Workflow
Click **"Active"** toggle (top right)

---

## 🔌 Using n8n in Your Workflow Builder

### Frontend: Add n8n Node

In your workflow canvas, add an **"External (n8n)"** node:

```typescript
{
  "id": "n8n_1",
  "type": "external.n8n",
  "props": {
    "workflowName": "Sales Notification",
    "webhookPath": "sales-notify",
    "payload": {
      "name": "{{lead.name}}",
      "email": "{{lead.email}}",
      "revenue": "{{lead.deal_value}}"
    }
  }
}
```

### Backend: How It Works

The `n8n.ts` MCP tool:

1. **Receives execution request** from workflow executor
2. **Constructs webhook URL:** `http://localhost:5678/webhook/{path}`
3. **Sends POST request** with payload:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "revenue": 5000,
     "timestamp": "2024-10-12T10:30:00Z",
     "runId": "run_123"
   }
   ```
4. **n8n processes** the data through its workflow
5. **Returns response** to our backend
6. **Logs execution** in `tool_executions` table

---

## 🎯 Example: Full Workflow with n8n

### Scenario: Lead Qualification & Notification

```json
{
  "name": "Lead Qualification Pipeline",
  "nodes": [
    {
      "id": "trigger_1",
      "type": "trigger.manual",
      "props": {}
    },
    {
      "id": "sheets_1",
      "type": "action.google_sheets.read",
      "props": {
        "sheet": "Leads!A2:F",
        "credentialRef": "GOOGLE_SHEETS"
      }
    },
    {
      "id": "condition_1",
      "type": "condition",
      "props": {
        "expr": "{{lead.score}} > 80"
      }
    },
    {
      "id": "n8n_high_priority",
      "type": "external.n8n",
      "props": {
        "webhookPath": "high-priority-lead",
        "payload": "{{lead}}"
      }
    },
    {
      "id": "email_1",
      "type": "action.email.send",
      "props": {
        "to": "{{lead.owner_email}}",
        "subject": "High Priority Lead: {{lead.name}}",
        "body": "Score: {{lead.score}}"
      }
    },
    {
      "id": "whatsapp_1",
      "type": "action.whatsapp.send",
      "props": {
        "to": "{{lead.phone}}",
        "message": "Hi {{lead.name}}, thanks for your interest!"
      }
    }
  ],
  "edges": [
    {"from": "trigger_1", "to": "sheets_1"},
    {"from": "sheets_1", "to": "condition_1"},
    {"from": "condition_1", "to": "n8n_high_priority", "when": "true"},
    {"from": "n8n_high_priority", "to": "email_1"},
    {"from": "email_1", "to": "whatsapp_1"}
  ]
}
```

### What This Does:

1. ✅ **Trigger:** Manual start
2. 📊 **Google Sheets:** Read leads
3. 🔍 **Condition:** Filter high-score leads (>80)
4. 🚀 **n8n Webhook:** Send to n8n for advanced processing
   - n8n can call CRM APIs
   - n8n can enrich data from external sources
   - n8n can apply ML models for scoring
5. 📧 **Email:** Notify lead owner
6. 💬 **WhatsApp:** Send automated message to lead

---

## 🔄 n8n Callbacks (Advanced)

### Receiving Data Back from n8n

If you need n8n to send data **back** to your workflow:

#### Step 1: Create Callback Endpoint in Backend

The backend already has `/api/webhooks/n8n` endpoint:

```typescript
// backend/src/routes/executions.ts
router.post('/webhooks/n8n', async (req, res) => {
  const { runId, status, data } = req.body;
  // Update workflow run with n8n results
  // Store in database
});
```

#### Step 2: Configure n8n Webhook Response

In your n8n workflow, add an **HTTP Request node** at the end:

- **Method:** POST
- **URL:** `http://backend:3001/api/webhooks/n8n`
- **Body:**
  ```json
  {
    "runId": "{{ $json.runId }}",
    "status": "completed",
    "data": {
      "crm_lead_id": "{{ $json.lead_id }}",
      "score": "{{ $json.final_score }}"
    }
  }
  ```

---

## 🛠️ Troubleshooting

### Issue: n8n not accessible at localhost:5678

**Solution:**
```bash
# Check if n8n container is running
docker ps | grep n8n

# Check n8n logs
docker logs workflow-builder-n8n

# Restart n8n
docker-compose restart n8n
```

### Issue: Webhook not triggering

**Checklist:**
- ✅ Is n8n workflow **active**? (toggle in top right)
- ✅ Is the webhook path correct? (check n8n node settings)
- ✅ Is the payload format valid JSON?
- ✅ Check n8n executions tab for errors

### Issue: API Key not working

**Solution:**
```bash
# Verify API key in n8n UI: Settings → API
# Update backend/.env with correct key
# Restart backend
docker-compose restart backend
```

---

## 📚 Additional Resources

- **n8n Documentation:** https://docs.n8n.io
- **n8n API Reference:** https://docs.n8n.io/api/
- **Webhook Trigger:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- **Community Workflows:** https://n8n.io/workflows

---

## 🎓 Next Steps

1. ✅ Start Docker Desktop
2. ✅ Run `docker-compose up -d`
3. ✅ Access n8n at http://localhost:5678
4. ✅ Generate API key and update `.env`
5. ✅ Create your first n8n workflow
6. ✅ Test integration from Workflow Builder UI

---

## 💡 Pro Tips

- **Use n8n for external API calls** – don't reinvent the wheel!
- **Store sensitive tokens in n8n credentials** – better security
- **Monitor n8n executions tab** – great debugging tool
- **Leverage n8n's 300+ integrations** – Slack, Stripe, Shopify, etc.
- **Use n8n's built-in code node** – JavaScript/Python for custom logic

---

**Happy Automating! 🚀**

