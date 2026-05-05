import { Response } from 'express';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: unknown
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  static badRequest(res: Response, message: string, errors?: unknown): Response {
    return ApiResponse.error(res, message, 400, errors);
  }

  static unauthorized(res: Response, message = 'Unauthorized'): Response {
    return ApiResponse.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden'): Response {
    return ApiResponse.error(res, message, 403);
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return ApiResponse.error(res, message, 404);
  }

  static conflict(res: Response, message: string): Response {
    return ApiResponse.error(res, message, 409);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: { total: number; page: number; limit: number; totalPages: number },
    message = 'Success'
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}
