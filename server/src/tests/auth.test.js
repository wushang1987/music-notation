import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import User from '../models/User';

// Mock email utilities to avoid actual sending
vi.mock('../utils/email', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
  sendResetPasswordEmail: vi.fn().mockResolvedValue(true),
}));

const createUserPayload = () => {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    username: `user-${unique}`,
    email: `user-${unique}@example.com`,
    password: 'Password123!',
  };
};

const registerUser = async (overrides = {}) => {
  const payload = { ...createUserPayload(), ...overrides };
  const res = await request(app).post('/api/auth/register').send(payload);
  const user = await User.findOne({ email: payload.email });
  return { payload, response: res, user };
};

const verifyUserThroughAPI = async (user) => {
  const token = user.verificationToken;
  const res = await request(app).get(`/api/auth/verify/${token}`);
  const refreshedUser = await User.findById(user._id);
  return { response: res, user: refreshedUser };
};

describe('Auth API Integration Tests', () => {
  it('registers a new user and returns profile data', async () => {
    const { payload, response, user } = await registerUser();

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(payload.email);
    expect(user).toBeTruthy();
    expect(user.isVerified).toBe(false);
  });

  it('rejects login attempts before email verification', async () => {
    const { payload } = await registerUser();

    const res = await request(app).post('/api/auth/login').send({
      email: payload.email,
      password: payload.password,
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/verify/i);
  });

  it('verifies email and updates user state', async () => {
    const { user } = await registerUser();
    const { response, user: verifiedUser } = await verifyUserThroughAPI(user);

    expect(response.status).toBe(200);
    expect(verifiedUser.isVerified).toBe(true);
    expect(verifiedUser.verificationToken).toBeUndefined();
  });

  it('allows login after verification', async () => {
    const { payload, user } = await registerUser();
    await verifyUserThroughAPI(user);

    const res = await request(app).post('/api/auth/login').send({
      email: payload.email,
      password: payload.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(payload.email);
  });

  it('rejects login with incorrect password', async () => {
    const { payload, user } = await registerUser();
    await verifyUserThroughAPI(user);

    const res = await request(app).post('/api/auth/login').send({
      email: payload.email,
      password: 'WrongPassword!1',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });
});
