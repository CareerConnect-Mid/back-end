const handle404 = require('../src/error-handlers/404');
const errorHandler = require('../src/error-handlers/500'); 

describe('handle404 middleware', () => {
    test('should respond with a 404 status and error message', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      
      handle404({}, mockRes, {});
  
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 404,
        message: 'Sorry, we could not find what you were looking for',
      });
    });
  });

  describe('Error Handling Middleware', () => {
    test('should respond with a 500 status and error message', () => {
      const mockError = new Error('Test error message');
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      
      errorHandler(mockError, {}, mockRes, {});
  
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 500,
        message: 'Test error message',
      });
    });
  });