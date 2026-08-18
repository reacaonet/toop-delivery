import { AppError, errorHandler, notFoundHandler } from '../middleware/errorHandler';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create an error with message and statusCode', () => {
      const error = new AppError('Not found', 404);
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should allow custom isOperational', () => {
      const error = new AppError('DB Error', 500, false);
      expect(error.isOperational).toBe(false);
    });

    it('should be an instance of Error', () => {
      const error = new AppError('Test', 400);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('errorHandler', () => {
    it('should return AppError with its status code', () => {
      const req = {} as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      const error = new AppError('Validation failed', 422);
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
      });
    });

    it('should return 500 for unknown errors', () => {
      const req = {} as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      const error = new Error('Unexpected');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404', () => {
      const req = {} as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Route not found',
      });
    });
  });
});
