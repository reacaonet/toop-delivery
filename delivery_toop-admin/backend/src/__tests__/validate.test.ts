import { z } from 'zod';
import { validate } from '../middleware/validate';

describe('Validate Middleware', () => {
  const mockReq = (body: any) => ({ body, query: {}, params: {} }) as any;
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const schema = z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
  });

  it('should call next if validation passes', () => {
    const next = jest.fn();
    const req = mockReq({ email: 'test@test.com', password: '123456' });
    const res = mockRes();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if validation fails', () => {
    const next = jest.fn();
    const req = mockReq({ email: 'invalid', password: '12' });
    const res = mockRes();

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Validation error',
      })
    );
  });

  it('should return 400 for missing required fields', () => {
    const next = jest.fn();
    const req = mockReq({});
    const res = mockRes();

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
