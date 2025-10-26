import request from 'supertest';
import app from '../index';
import pool from '../config/database';

describe('Workflow API', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Create test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test_${Date.now()}@example.com`,
        password: 'test123',
      });

    authToken = registerRes.body.token;
    userId = registerRes.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await pool.end();
  });

  describe('POST /api/workflows', () => {
    it('should create a new workflow', async () => {
      const res = await request(app)
        .post('/api/workflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Workflow',
          description: 'A test workflow',
          json: {
            nodes: [
              {
                id: 't1',
                type: 'trigger.manual',
                props: {},
              },
            ],
            edges: [],
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.workflow).toHaveProperty('id');
      expect(res.body.workflow.name).toBe('Test Workflow');
    });
  });

  describe('GET /api/workflows', () => {
    it('should get all workflows for user', async () => {
      const res = await request(app)
        .get('/api/workflows')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.workflows).toBeInstanceOf(Array);
    });
  });

  describe('Workflow Execution', () => {
    it('should execute a simple workflow end-to-end', async () => {
      // Create a test workflow
      const createRes = await request(app)
        .post('/api/workflows')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'E2E Test Workflow',
          json: {
            nodes: [
              {
                id: 't1',
                type: 'trigger.manual',
                props: {},
                position: { x: 0, y: 0 },
              },
              {
                id: 'a1',
                type: 'transform',
                props: {
                  steps: [
                    {
                      op: 'trim',
                      fields: ['name'],
                    },
                  ],
                },
                position: { x: 0, y: 100 },
              },
            ],
            edges: [
              {
                id: 'e1',
                source: 't1',
                target: 'a1',
              },
            ],
          },
        });

      const workflowId = createRes.body.workflow.id;

      // Execute the workflow
      const execRes = await request(app)
        .post(`/api/executions/workflows/${workflowId}/execute`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          triggerData: {
            name: '  Test User  ',
          },
        });

      expect(execRes.status).toBe(200);
      expect(execRes.body).toHaveProperty('runId');
      expect(execRes.body.status).toBe('completed');

      // Get run details
      const runRes = await request(app)
        .get(`/api/executions/runs/${execRes.body.runId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(runRes.status).toBe(200);
      expect(runRes.body.run.status).toBe('completed');
      expect(runRes.body.steps).toBeInstanceOf(Array);
      expect(runRes.body.steps.length).toBeGreaterThan(0);
    });
  });
});
