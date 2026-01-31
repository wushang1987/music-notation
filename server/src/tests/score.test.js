import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import User from '../models/User';

const createVerifiedUserAndToken = async () => {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = {
    username: `score-user-${unique}`,
    email: `score-${unique}@example.com`,
    password: 'Password123!',
  };

  await request(app).post('/api/auth/register').send(payload);
  const user = await User.findOne({ email: payload.email });
  await request(app).get(`/api/auth/verify/${user.verificationToken}`);

  const login = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: payload.password,
  });

  return { token: login.body.token, user, payload };
};

describe('Score API Integration Tests', () => {
  it('creates a new score for an authenticated user', async () => {
    const { token } = await createVerifiedUserAndToken();

    const res = await request(app)
      .post('/api/scores')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Score',
        content: '<score>test</score>',
        notationType: 'abcjs',
        isPublic: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Score');
    expect(res.body.isPublic).toBe(true);
  });

  it('retrieves a list of public scores', async () => {
    const { token } = await createVerifiedUserAndToken();

    // Ensure at least one score exists
    await request(app)
      .post('/api/scores')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Another Score',
        content: '<score>another</score>',
        notationType: 'abcjs',
        isPublic: true,
      });

    const res = await request(app).get('/api/scores');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.scores)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });
});
