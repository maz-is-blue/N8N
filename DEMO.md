# 🎬 Workflow Builder - Demo Guide

This guide walks you through a complete demonstration of the Workflow Builder application.

## 📋 Prerequisites

- Application running (backend on :3001, frontend on :5173)
- Demo user seeded (email: `demo@example.com`, password: `demo123`)

## 🎯 Demo Scenario: "Clean & Notify"

We'll build and execute a workflow that:
1. Reads data from Google Sheets
2. Transforms/cleans the data
3. Sends notifications via WhatsApp and Email

## Step 1: Login

1. Navigate to http://localhost:5173
2. Login with demo credentials:
   - Email: `demo@example.com`
   - Password: `demo123`

## Step 2: View Existing Workflows

You'll see the workflow list page with the sample "Clean & Notify" workflow.

**What to show:**
- Workflow card with name, description, version
- Active status indicator
- Edit, Run, and Delete buttons

## Step 3: Create New Workflow with Prompt

1. Click **"New Workflow"**
2. In the prompt input box, type:
   ```
   Read from Google Sheets, transform the data, and send WhatsApp and Email notifications
   ```
3. Click **"Generate"** (or press Enter)

**What happens:**
- Workflow nodes automatically appear on the canvas
- Nodes are connected with edges
- Workflow name and description are auto-generated

## Step 4: Explore the Canvas

**Interactive features to demonstrate:**

### Pan & Zoom
- Mouse wheel to zoom in/out
- Click and drag background to pan
- Use minimap (bottom-left) for navigation

### Node Types
Point out the different node types:
- 🟢 **Trigger** (Green) - Manual Trigger
- 🔵 **Action** (Blue) - Google Sheets Read, Email Send, WhatsApp Send
- 🟣 **Transform** (Purple) - Data transformation
- 🟡 **Condition** (Yellow) - Conditional branching

### Controls
- Bottom-left controls: Zoom in, Zoom out, Fit view

## Step 5: Edit Node Properties

1. Click on the **"Read Google Sheets"** node
2. Inspector panel opens on the right

**Show the inspector features:**
- Node type (read-only)
- Label (editable)
- Properties:
  - `sheet`: "Leads!A1:F"
  - `credentialRef`: "G_SHEETS_DEFAULT"
  - `filter`: "status == 'pending'"

3. Modify the sheet range:
   ```
   Leads!A1:J
   ```

4. Click **"Save"**

## Step 6: Add a New Connection

1. Hover over a node to see connection handles
2. Drag from a source handle (bottom) to a target handle (top)
3. New edge appears with smooth animation

## Step 7: Save Workflow

1. Enter workflow name: **"Demo: Clean & Notify"**
2. Enter description: **"Reads leads from Google Sheets, cleans data, and sends notifications"**
3. Click **"Save"** button

**What happens:**
- Success toast notification
- Workflow is saved to database
- URL updates to `/workflows/{id}`

## Step 8: Execute Workflow

1. Click **"Run"** button

**What happens:**
- Workflow execution starts
- Redirects to Run Details page
- Shows real-time execution progress

## Step 9: View Run Details

On the Run Details page, observe:

### Run Overview (Top card)
- Status: Running → Completed (or Failed)
- Duration: X seconds
- Number of steps executed

### Execution Steps (Below)
Each step shows:
1. **Step number** and **Node ID**
2. **Status** with icon (Running/Completed/Failed)
3. **Logs** - Expandable log messages:
   ```
   [12:34:56] Trigger activated: trigger.manual
   [12:34:57] Executing action: google_sheets.read
   [12:34:58] Retrieved credentials
   [12:34:59] Reading from spreadsheet...
   [12:35:00] Read 25 rows
   ```
4. **Output** - JSON output (expandable)

## Step 10: View All Runs

1. Navigate back to workflow
2. Click workflow name → **"View Runs"** or go to `/workflows/{id}/runs`

**Runs table shows:**
- Status indicators (icons + text)
- Start time
- Duration
- Link to details

## Step 11: Demonstrate Node Types

Go back to workflow editor and explain each node type:

### 1. Trigger Nodes
```
Manual Trigger - User initiates
Schedule - Cron-based timing
Form Submit - Webhook trigger
```

### 2. Action Nodes
```
Google Sheets Read - Fetch spreadsheet data
Google Sheets Append - Add rows
Email Send - SMTP email delivery
WhatsApp Send - Twilio/Meta API
```

### 3. Transform Nodes
```
Trim - Remove whitespace
TitleCase - Format names
Normalize Phone - E.164 format
Drop Invalid - Filter rows
```

### 4. Condition Nodes
```
Expression-based branching
Multiple outputs (true/false)
```

### 5. External Nodes
```
n8n Integration - Call external n8n workflows
API calls via n8n nodes
```

## Step 12: API Documentation

1. Navigate to http://localhost:3001/api/docs
2. Show Swagger UI with:
   - All endpoints documented
   - Request/response schemas
   - Try it out functionality

**Demonstrate:**
- Authentication endpoints
- Workflow CRUD operations
- Execution APIs
- Credentials management

## Step 13: Credentials Management

1. Go to Workflows page
2. (In production UI, this would be a separate page)
3. Show how credentials are:
   - Stored encrypted
   - Referenced by name in nodes
   - Never exposed in API responses

## 🎥 Key Points to Emphasize

### 1. Prompt-to-Workflow ✨
- Natural language → Visual workflow
- Rules-based parsing (extensible to LLM)
- Instant feedback

### 2. Visual Flow Builder 🎨
- Intuitive React Flow interface
- Drag-and-drop nodes
- Visual connections
- Real-time updates

### 3. MCP Tool Architecture 🔧
- Extensible adapter pattern
- Mock mode for development
- Production-ready integrations
- Consistent error handling

### 4. Execution & Logging 📊
- Step-by-step execution
- Real-time logs
- Audit trail
- Error tracking

### 5. Security 🔐
- JWT authentication
- Encrypted credentials
- Input validation
- SQL injection protection

### 6. Developer Experience 💻
- TypeScript end-to-end
- OpenAPI documentation
- Comprehensive tests
- Clear code organization

## 🧪 Live Testing Scenarios

### Scenario A: Email Workflow
```
Prompt: "Send an email to team@company.com"
→ Creates: Trigger → Email Action
→ Execute: Shows email being sent (or mock)
```

### Scenario B: Sheets + Condition
```
Prompt: "Read from sheet and filter high priority leads"
→ Creates: Trigger → Sheets → Condition → Email
→ Show: Conditional branching in logs
```

### Scenario C: Error Handling
```
1. Create workflow with invalid email
2. Execute
3. Show: Error captured in logs, run marked as failed
```

## 📸 Screenshots Checklist

For documentation, capture:
- [ ] Workflow list page
- [ ] Prompt input generating workflow
- [ ] Canvas with multiple node types
- [ ] Node inspector panel
- [ ] Run details with logs
- [ ] API documentation
- [ ] Login page
- [ ] Runs history

## 🎤 Demo Script (5 minutes)

**Minute 1: Introduction**
"I'll demonstrate a workflow automation platform that lets you build workflows visually or by describing them in natural language."

**Minute 2: Prompt-to-Workflow**
"Watch as I type 'Read from Google Sheets and send WhatsApp notifications' and the system generates a complete workflow automatically."

**Minute 3: Visual Editing**
"The visual editor uses React Flow for an intuitive drag-and-drop experience. I can click any node to edit its properties, add connections, and see everything update in real-time."

**Minute 4: Execution**
"When I click Run, the backend executes each step sequentially, logging everything. The MCP tool adapters handle communication with external services like Gmail, Google Sheets, and WhatsApp."

**Minute 5: Architecture**
"The system uses Express.js with TypeScript on the backend, React with React Flow on the frontend, and PostgreSQL for persistence. All credentials are encrypted, and the entire workflow execution is audited."

## 🚀 Advanced Features to Mention

1. **n8n Integration** - Delegate complex operations to n8n
2. **Versioning** - Workflows track version numbers
3. **Credentials Management** - Secure, encrypted storage
4. **Validation** - Zod schemas validate all inputs
5. **Testing** - End-to-end tests prove functionality
6. **OpenAPI** - Auto-generated documentation

## 💡 Future Enhancements (if asked)

- Real-time collaboration (WebSockets)
- LLM-powered prompt generation
- More MCP adapters (Slack, Stripe, etc.)
- Workflow templates library
- Schedule-based triggers
- Webhook endpoints
- RBAC (role-based access control)
- Workflow marketplace

---

**Demo Duration:** 5-10 minutes  
**Preparation Time:** 5 minutes (ensure services running)  
**Difficulty:** Easy to Moderate
