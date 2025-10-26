import { Node, Edge } from 'reactflow';

export interface GeneratedWorkflow {
  nodes: Node[];
  edges: Edge[];
  name: string;
  description: string;
}

export function promptToWorkflow(prompt: string): GeneratedWorkflow {
  const lowerPrompt = prompt.toLowerCase();

  // Detect workflow type based on keywords
  if (lowerPrompt.includes('google sheets') || lowerPrompt.includes('spreadsheet')) {
    if (lowerPrompt.includes('whatsapp') || lowerPrompt.includes('email')) {
      return generateSheetsNotificationWorkflow(prompt);
    }
    return generateSheetsWorkflow(prompt);
  }

  if (lowerPrompt.includes('form') || lowerPrompt.includes('lead')) {
    return generateLeadIntakeWorkflow(prompt);
  }

  if (lowerPrompt.includes('email') && lowerPrompt.includes('send')) {
    return generateEmailWorkflow(prompt);
  }

  if (lowerPrompt.includes('n8n') || lowerPrompt.includes('workflow')) {
    return generateN8nWorkflow(prompt);
  }

  // Default: simple workflow
  return generateDefaultWorkflow(prompt);
}

function generateSheetsNotificationWorkflow(prompt: string): GeneratedWorkflow {
  const hasWhatsApp = prompt.toLowerCase().includes('whatsapp');
  const hasEmail = prompt.toLowerCase().includes('email');

  const nodes: Node[] = [
    {
      id: 't1',
      type: 'trigger',
      position: { x: 100, y: 50 },
      data: {
        label: 'Manual Trigger',
        type: 'trigger.manual',
        props: { label: 'Start Workflow' },
      },
    },
    {
      id: 's1',
      type: 'action',
      position: { x: 100, y: 150 },
      data: {
        label: 'Read Google Sheets',
        type: 'action.google_sheets.read',
        props: {
          sheet: 'Leads!A1:F',
          credentialRef: 'G_SHEETS_DEFAULT',
          filter: "status == 'pending'",
          hasHeaders: true,
        },
      },
    },
    {
      id: 'x1',
      type: 'transform',
      position: { x: 100, y: 250 },
      data: {
        label: 'Transform Data',
        type: 'transform',
        props: {
          steps: [
            { op: 'trim', fields: ['name', 'email', 'phone'] },
            { op: 'titleCase', fields: ['name'] },
            { op: 'normalizePhone', country: 'MY', field: 'phone' },
          ],
        },
      },
    },
    {
      id: 'c1',
      type: 'condition',
      position: { x: 100, y: 350 },
      data: {
        label: 'Check Data',
        type: 'condition',
        props: {
          expr: '$.rows && $.rows.length > 0',
        },
      },
    },
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 't1', target: 's1' },
    { id: 'e2', source: 's1', target: 'x1' },
    { id: 'e3', source: 'x1', target: 'c1' },
  ];

  let yOffset = 450;
  let nodeCount = nodes.length;

  if (hasWhatsApp) {
    nodes.push({
      id: 'w1',
      type: 'action',
      position: { x: hasEmail ? 50 : 100, y: yOffset },
      data: {
        label: 'Send WhatsApp',
        type: 'action.whatsapp.send',
        props: {
          toField: 'phone',
          messageTemplate: 'Hi {{name}}, thanks for your enquiry!',
        },
      },
    });
    edges.push({ id: `e${nodeCount + 1}`, source: 'c1', target: 'w1', label: 'true' });
    nodeCount++;
  }

  if (hasEmail) {
    nodes.push({
      id: 'e1_node',
      type: 'action',
      position: { x: hasWhatsApp ? 250 : 100, y: yOffset },
      data: {
        label: 'Send Email',
        type: 'action.email.send',
        props: {
          to: ['owner@company.com'],
          subject: 'New Leads Summary',
          body: 'Processed leads from Google Sheets',
          attachCSVFrom: 'rows',
        },
      },
    });
    edges.push({ id: `e${nodeCount + 1}`, source: 'c1', target: 'e1_node', label: 'true' });
  }

  return {
    nodes,
    edges,
    name: 'Clean & Notify: Sheets → Notifications',
    description: 'Read data from Google Sheets, transform it, and send notifications',
  };
}

function generateLeadIntakeWorkflow(prompt: string): GeneratedWorkflow {
  const nodes: Node[] = [
    {
      id: 't1',
      type: 'trigger',
      position: { x: 100, y: 50 },
      data: {
        label: 'Form Submitted',
        type: 'trigger.form_submitted',
        props: { formKey: 'leadForm' },
      },
    },
    {
      id: 'a1',
      type: 'action',
      position: { x: 100, y: 150 },
      data: {
        label: 'Save to Sheets',
        type: 'action.google_sheets.append_row',
        props: {
          sheet: 'Leads!A:E',
          values: ['{{lead.name}}', '{{lead.email}}', '{{lead.phone}}', '{{lead.company}}'],
        },
      },
    },
    {
      id: 'c1',
      type: 'condition',
      position: { x: 100, y: 250 },
      data: {
        label: 'High Priority?',
        type: 'condition',
        props: {
          expr: "{{lead.priority}} == 'high'",
        },
      },
    },
    {
      id: 'a2',
      type: 'action',
      position: { x: 100, y: 350 },
      data: {
        label: 'Notify Sales',
        type: 'action.email.send',
        props: {
          to: '{{lead.ownerEmail}}',
          subject: 'High Priority Lead',
          body: 'New lead: {{lead.name}} from {{lead.company}}',
        },
      },
    },
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 't1', target: 'a1' },
    { id: 'e2', source: 'a1', target: 'c1' },
    { id: 'e3', source: 'c1', target: 'a2', label: 'true' },
  ];

  return {
    nodes,
    edges,
    name: 'Lead Intake Workflow',
    description: 'Process form submissions and notify sales team',
  };
}

function generateEmailWorkflow(prompt: string): GeneratedWorkflow {
  const nodes: Node[] = [
    {
      id: 't1',
      type: 'trigger',
      position: { x: 100, y: 50 },
      data: {
        label: 'Manual Trigger',
        type: 'trigger.manual',
        props: {},
      },
    },
    {
      id: 'a1',
      type: 'action',
      position: { x: 100, y: 150 },
      data: {
        label: 'Send Email',
        type: 'action.email.send',
        props: {
          to: 'recipient@example.com',
          subject: 'Your Subject',
          body: 'Email body content',
        },
      },
    },
  ];

  const edges: Edge[] = [{ id: 'e1', source: 't1', target: 'a1' }];

  return {
    nodes,
    edges,
    name: 'Email Workflow',
    description: 'Send an email',
  };
}

function generateN8nWorkflow(prompt: string): GeneratedWorkflow {
  const nodes: Node[] = [
    {
      id: 't1',
      type: 'trigger',
      position: { x: 100, y: 50 },
      data: {
        label: 'Manual Trigger',
        type: 'trigger.manual',
        props: {},
      },
    },
    {
      id: 'n1',
      type: 'external',
      position: { x: 100, y: 150 },
      data: {
        label: 'n8n Workflow',
        type: 'external.n8n',
        props: {
          workflowId: 'your-workflow-id',
          secretRef: 'N8N_SECRET',
        },
      },
    },
  ];

  const edges: Edge[] = [{ id: 'e1', source: 't1', target: 'n1' }];

  return {
    nodes,
    edges,
    name: 'n8n Integration',
    description: 'Trigger n8n workflow',
  };
}

function generateDefaultWorkflow(prompt: string): GeneratedWorkflow {
  const nodes: Node[] = [
    {
      id: 't1',
      type: 'trigger',
      position: { x: 100, y: 50 },
      data: {
        label: 'Manual Trigger',
        type: 'trigger.manual',
        props: { description: prompt },
      },
    },
    {
      id: 'a1',
      type: 'action',
      position: { x: 100, y: 150 },
      data: {
        label: 'Action Node',
        type: 'action.custom',
        props: { description: 'Configure this action' },
      },
    },
  ];

  const edges: Edge[] = [{ id: 'e1', source: 't1', target: 'a1' }];

  return {
    nodes,
    edges,
    name: 'Custom Workflow',
    description: prompt || 'A custom workflow',
  };
}
