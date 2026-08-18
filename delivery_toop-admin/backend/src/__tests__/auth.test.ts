process.env.JWT_SECRET = 'test-secret';
process.env.JWT_SECRET_REFRESH = 'test-refresh-secret';
process.env.MONGO_ADMIN_USER = 'test';
process.env.MONGO_ADMIN_PASSWORD = 'test';
process.env.URL_MONGO = 'localhost:27017';

jest.mock('../models/User', () => ({
  UserModel: {
    findById: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ active: true }),
    }),
  },
}));

describe('Auth Middleware', () => {
  const auth = require('../middleware/auth');
  const { authenticate, generateToken, generateRefreshToken, verifyRefreshToken } = auth;

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { _id: '123', email: 'test@test.com', role: 'admin' };
      const token = generateToken(payload);

      expect(typeof token).toBe('string');
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'test-secret') as any;
      expect(decoded._id).toBe('123');
      expect(decoded.email).toBe('test@test.com');
      expect(decoded.role).toBe('admin');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload = { _id: '123', email: 'test@test.com', role: 'admin' };
      const token = generateRefreshToken(payload);

      expect(typeof token).toBe('string');
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'test-refresh-secret') as any;
      expect(decoded._id).toBe('123');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const payload = { _id: '123', email: 'test@test.com', role: 'admin' };
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded._id).toBe('123');
      expect(decoded.email).toBe('test@test.com');
    });

    it('should throw on invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });

  describe('authenticate middleware', () => {
    it('should return 401 if no token provided', async () => {
      const req = { headers: {} } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token has wrong format', async () => {
      const req = { headers: { authorization: 'InvalidFormat' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      const req = { headers: { authorization: 'Bearer invalid-token' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next and set req.user if token is valid', async () => {
      const jwt = require('jsonwebtoken');
      const payload = { _id: '123', email: 'test@test.com', role: 'admin' };
      const token = jwt.sign(payload, 'test-secret');

      const req = { headers: { authorization: `Bearer ${token}` } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user._id).toBe('123');
      expect(req.user.email).toBe('test@test.com');
    });
  });
});
