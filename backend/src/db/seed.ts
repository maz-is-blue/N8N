import bcrypt from 'bcryptjs';
import pool from '../config/database';

async function seed() {
  try {
    console.log('Seeding database...');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      ['demo@example.com', hashedPassword, 'user']
    );
    const userId = userResult.rows[0].id;
    console.log('✅ Created demo user: demo@example.com / demo123');

    // Create sample workflow
    const sampleWorkflow = {
      id: 'wf_clean_notify',
      name: 'Clean & Notify: Sheets → WA + Email',
      nodes: [
        {
          id: 't1',
          type: 'trigger.manual',
          props: { label: 'Manual Trigger' },
          position: { x: 100, y: 100 }
        },
        {
          id: 's1',
          type: 'action.google_sheets.read',
          props: {
            sheet: 'Leads!A1:F',
            credentialRef: 'G_SHEETS_DEFAULT',
            filter: "status == 'pending'"
          },
          position: { x: 100, y: 200 }
        },
        {
          id: 'x1',
          type: 'transform',
          props: {
            steps: [
              { op: 'trim', fields: ['name', 'email', 'phone'] },
              { op: 'titleCase', fields: ['name'] },
              { op: 'normalizePhone', country: 'MY', field: 'phone' }
            ]
          },
          position: { x: 100, y: 300 }
        },
        {
          id: 'c1',
          type: 'condition',
          props: { expr: 'len($.cleanRows) > 0' },
          position: { x: 100, y: 400 }
        },
        {
          id: 'w1',
          type: 'action.whatsapp.send',
          props: {
            toField: 'phone',
            messageTemplate: 'Hi {{name}}, thanks for your enquiry. We received your email {{email}}.'
          },
          position: { x: 50, y: 500 }
        },
        {
          id: 'e1',
          type: 'action.email.send',
          props: {
            to: ['owner@company.com'],
            subject: 'Cleaned Leads Summary',
            body: 'Processed {{len($.cleanRows)}} rows.',
            attachCSVFrom: '$.cleanRows'
          },
          position: { x: 250, y: 500 }
        }
      ],
      edges: [
        { id: 'e1', source: 't1', target: 's1' },
        { id: 'e2', source: 's1', target: 'x1' },
        { id: 'e3', source: 'x1', target: 'c1' },
        { id: 'e4', source: 'c1', target: 'w1', when: 'true' },
        { id: 'e5', source: 'c1', target: 'e1', when: 'true' }
      ],
      version: 1
    };

    await pool.query(
      `INSERT INTO workflows (user_id, name, description, json, version) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [
        userId,
        sampleWorkflow.name,
        'Demo workflow that reads from Google Sheets, transforms data, and sends notifications via WhatsApp and Email',
        JSON.stringify(sampleWorkflow),
        1
      ]
    );
    console.log('✅ Created sample workflow');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDemo credentials:');
    console.log('  Email: demo@example.com');
    console.log('  Password: demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

