import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ERROR_MESSAGES, ErrorType } from './error.constants';

/**
 * Structured error object for consistent error handling throughout the app
 */
export interface AppError {
  type: ErrorType;
  status?: number;
  message: string;
  details?: Record<string, string>;
  originalError?: unknown;
}

/**
 * Service for handling and translating API errors into user-friendly messages
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  /**
   * Get HTTP status error message
   */
  private getHttpStatusMessage(status: number): string {
    const statusMessages: Record<string, string> = {
      '0': 'Cannot reach the backend. Check API URL, backend server, or CORS.',
      '400': 'Invalid request. Please check your input.',
      '401': 'Unauthorized. Please log in again.',
      '403': 'Access denied. You do not have permission to perform this action.',
      '404': 'The requested resource was not found.',
      '409': 'Conflict. The resource may already exist or has been modified.',
      '422': 'Unable to process the request. Please check your input.',
      '429': 'Too many requests. Please wait a moment and try again.',
      '500': 'Server error. Please try again later.',
      '502': 'Bad gateway. Please try again later.',
      '503': 'Service unavailable. Please try again later.',
      '504': 'Gateway timeout. Please try again later.',
    };

    return statusMessages[String(status)] ?? ERROR_MESSAGES['UNKNOWN_ERROR'];
  }

  /**
   * Parse HTTP error response and return structured error
   */
  parseHttpError(error: HttpErrorResponse): AppError {
    const status = error.status;

    // Handle network errors (status 0)
    if (status === 0) {
      return {
        type: ErrorType.NETWORK,
        status,
        message: this.getHttpStatusMessage(0),
        originalError: error,
      };
    }

    // Handle authentication errors
    if (status === 401) {
      return {
        type: ErrorType.AUTHENTICATION,
        status,
        message: this.getAuthErrorMessage(error),
        originalError: error,
      };
    }

    // Handle authorization errors
    if (status === 403) {
      return {
        type: ErrorType.AUTHORIZATION,
        status,
        message: this.getHttpStatusMessage(403),
        originalError: error,
      };
    }

    // Handle not found
    if (status === 404) {
      return {
        type: ErrorType.NOT_FOUND,
        status,
        message: this.getHttpStatusMessage(404),
        originalError: error,
      };
    }

    // Handle validation errors (400, 422)
    if (status === 400 || status === 422) {
      return {
        type: ErrorType.VALIDATION,
        status,
        message: error.error?.message ?? this.getHttpStatusMessage(status),
        details: error.error?.errors ?? undefined,
        originalError: error,
      };
    }

    // Handle server errors (5xx)
    if (status >= 500) {
      return {
        type: ErrorType.SERVER,
        status,
        message: this.getHttpStatusMessage(status),
        originalError: error,
      };
    }

    // Handle other HTTP errors
    return {
      type: ErrorType.UNKNOWN,
      status,
      message: error.error?.message ?? this.getHttpStatusMessage(status),
      originalError: error,
    };
  }

  /**
   * Parse any error type and return structured error
   */
  parseError(error: unknown): AppError {
    // Handle HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      return this.parseHttpError(error);
    }

    // Handle Error objects
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message,
        originalError: error,
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        type: ErrorType.UNKNOWN,
        message: error,
        originalError: error,
      };
    }

    // Fallback
    return {
      type: ErrorType.UNKNOWN,
      message: ERROR_MESSAGES['UNEXPECTED_ERROR'],
      originalError: error,
    };
  }

  /**
   * Get user-friendly error message from structured error
   */
  getUserMessage(appError: AppError): string {
    return appError.message;
  }

  /**
   * Extract validation error details
   */
  getValidationErrors(appError: AppError): Record<string, string> {
    return appError.details ?? {};
  }

  /**
   * Get specific error message for auth errors
   */
  private getAuthErrorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;

    if (message?.toLowerCase().includes('token')) {
      return ERROR_MESSAGES['TOKEN_EXPIRED'];
    }

    if (message?.toLowerCase().includes('invalid')) {
      return ERROR_MESSAGES['INVALID_CREDENTIALS'];
    }

    return ERROR_MESSAGES['INVALID_CREDENTIALS'];
  }
}
