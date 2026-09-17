/**
 * Error messages and HTTP status code mappings for consistent error handling
 */

export const HTTP_STATUS_ERRORS: Record<number, string> = {
  0: 'Cannot reach the backend. Check API URL, backend server, or CORS.',
  400: 'Invalid request. Please check your input.',
  401: 'Unauthorized. Please log in again.',
  403: 'Access denied. You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'Conflict. The resource may already exist or has been modified.',
  422: 'Unable to process the request. Please check your input.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error. Please try again later.',
  502: 'Bad gateway. Please try again later.',
  503: 'Service unavailable. Please try again later.',
  504: 'Gateway timeout. Please try again later.',
};

/**
 * Specific error scenarios with friendly messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access denied.',
  TOKEN_EXPIRED: 'Your session has expired. Please refresh the page.',
  INVALID_TOKEN: 'Your session is invalid. Please log in again.',

  // Menu/Products
  NO_PRODUCTS_FOUND: 'No products found. Try adjusting your filters.',
  PRODUCT_NOT_FOUND: 'The product you are looking for does not exist.',
  NO_CATEGORIES_FOUND: 'No menu categories available at the moment.',
  FAILED_TO_LOAD_MENU: 'Failed to load menu. Please try again.',

  // Password Change
  PASSWORD_CHANGE_FAILED: 'Failed to change password. Please try again.',
  OLD_PASSWORD_INCORRECT: 'Your current password is incorrect.',
  PASSWORD_MISMATCH: 'Passwords do not match. Please try again.',
  WEAK_PASSWORD: 'Password must be at least 8 characters long.',
  PASSWORD_VALIDATION_FAILED: 'Password does not meet requirements.',

  // Form & Validation
  VALIDATION_ERROR: 'Please correct the errors in the form.',
  FORM_INVALID: 'Invalid form. Please check all fields.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',

  // Network & Server
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Our team has been notified. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',

  // Generic
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
  UNKNOWN_ERROR: 'An error occurred. Please try again.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
};

/**
 * Error type identifiers for categorizing errors
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}
