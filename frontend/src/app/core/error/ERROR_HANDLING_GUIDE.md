## Error Handling System Documentation

### Overview
A comprehensive, centralized error handling system for the Tacos Lab frontend that catches, standardizes, and displays HTTP errors to users with user-friendly messages.

### Architecture

#### 1. **Error Constants** (`error.constants.ts`)
Centralized error message definitions:
- `HTTP_STATUS_ERRORS`: Messages for HTTP status codes (0, 400, 401, 403, 404, 409, 422, 429, 5xx)
- `ERROR_MESSAGES`: Specific scenario messages (invalid credentials, session expired, no products found, etc.)
- `ErrorType` enum: Categorizes errors (NETWORK, VALIDATION, AUTHENTICATION, AUTHORIZATION, NOT_FOUND, SERVER, UNKNOWN)

#### 2. **Error Handler Service** (`error-handler.service.ts`)
Core service for error parsing and standardization:
- `parseHttpError()`: Converts HttpErrorResponse to structured AppError
- `parseError()`: Handles any error type (Error, string, HttpErrorResponse)
- `getUserMessage()`: Returns user-friendly message
- `getValidationErrors()`: Extracts field-level validation errors
- Private methods for auth error detection

**Structured Error Object (AppError):**
```typescript
interface AppError {
  type: ErrorType;           // Category for routing
  status?: number;           // HTTP status code
  message: string;           // User-friendly message
  details?: Record<string, string>; // Field-level validation errors
  originalError?: unknown;   // Original error for debugging
}
```

#### 3. **Error Interceptor** (`error.interceptor.ts`)
Global HTTP error interceptor:
- Catches all HTTP errors automatically
- Displays toast notifications to users
- Suppresses duplicate notifications for endpoints that handle errors themselves
- Re-throws errors so components can handle them additionally

**Suppressed endpoints** (handle errors in component):
- `/api/auth/login` - Login component has custom error handling
- `/api/auth/refresh` - Token refresh flow handles errors
- `/api/auth/force-change-password` - Password change has custom handling
- `/api/auth/change-password` - Password change has custom handling

### Usage Patterns

#### Pattern 1: Component with API Call
```typescript
export class ProductDetail {
  private readonly menuApi = inject(PublicMenuControllerApiService);
  private readonly errorHandler = inject(ErrorHandlerService);
  
  readonly error = signal<string | null>(null);
  
  loadMenu(): void {
    this.menuApi.menu(language, language)
      .subscribe({
        next: (response) => {
          // Handle success
        },
        error: (error: unknown) => {
          const appError = this.errorHandler.parseError(error);
          this.error.set(appError.message);
        },
      });
  }
}
```

#### Pattern 2: Form Submission with Validation
```typescript
export class LoginComponent {
  private readonly authApi = inject(AuthControllerApiService);
  private readonly errorHandler = inject(ErrorHandlerService);
  
  submit(): void {
    this.authApi.login(request)
      .subscribe({
        next: (response) => {
          // Handle success
          toast.success('Welcome!');
        },
        error: (error: unknown) => {
          const appError = this.errorHandler.parseError(error);
          
          // Display validation errors if any
          if (appError.type === ErrorType.VALIDATION) {
            const validationErrors = this.errorHandler.getValidationErrors(appError);
            Object.entries(validationErrors).forEach(([field, message]) => {
              this.form.get(field)?.setErrors({ server: message });
            });
          }
          
          // Note: Toast is shown automatically by error interceptor
        },
      });
  }
}
```

#### Pattern 3: No Custom Error Handling (Auto-Handled by Interceptor)
```typescript
export class MenuListComponent {
  readonly items = signal<MenuItem[]>([]);
  readonly loading = signal(false);
  
  loadItems(): void {
    this.loading.set(true);
    this.menuApi.items()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.items.set(response.data ?? []);
        },
        // Error handling is automatic - user sees toast automatically
      });
  }
}
```

### Error Handling Flow

```
API Request
    ↓
Response with error
    ↓
Error Interceptor catches error
    ↓
ErrorHandlerService.parseError() standardizes it
    ↓
Toast notification shown to user
    ↓
Error re-thrown to component
    ↓
Component-specific error handling (optional)
```

### Error Message Examples

| Scenario | Message |
|----------|---------|
| Wrong password | "Invalid email or password." |
| No products | "No products found. Try adjusting your filters." |
| Network down | "Cannot reach the backend. Check API URL, backend server, or CORS." |
| Session expired | "Your session has expired. Please log in again." |
| Server error | "Server error. Please try again later." |
| Validation error | "Please correct the errors in the form." + field details |

### Extending the System

#### Add New Error Scenarios
1. Update `ERROR_MESSAGES` in `error.constants.ts`:
```typescript
export const ERROR_MESSAGES: Record<string, string> = {
  // ... existing
  CUSTOM_SCENARIO: 'Descriptive error message.',
};
```

2. Use in error handler or components:
```typescript
if (specificCondition) {
  return ERROR_MESSAGES['CUSTOM_SCENARIO'];
}
```

#### Suppress Errors for New Endpoints
Update `shouldSuppressErrorNotification()` in `error.interceptor.ts`:
```typescript
if (cleanUrl.endsWith('/api/new/endpoint')) {
  return true;
}
```

#### Custom Error Display UI
Instead of toast, create a custom error dialog:
```typescript
// In error interceptor
const appError = errorHandler.parseError(error);
this.errorDialogService.show(appError.message);
```

### Integration Points

- **main.ts**: Registered in HTTP interceptor pipeline
- **Components**: Can inject `ErrorHandlerService` for custom handling
- **Toast Display**: Uses `ngx-sonner` library (already in project)
- **Backend**: Works with structured `ApiResponse<T>` from backend

### Testing Scenarios

Test cases to verify error handling:
1. Network failure (status 0)
2. Invalid credentials (401)
3. Access denied (403)
4. Resource not found (404)
5. Validation errors (400/422 with field errors)
6. Server errors (500+)
7. Multiple concurrent errors
8. Recovery and retry scenarios

### Bundle Impact
- Error constants: ~2KB
- Error handler service: ~3KB
- Error interceptor: ~1.5KB
- **Total: ~6.5KB** (negligible impact on bundle size)

### Future Enhancements
- Error logging service integration (Sentry, LogRocket, etc.)
- Retry logic for recoverable errors
- User-facing error tracking dashboard
- Localization support for error messages
- Advanced validation error highlighting
- Error recovery suggestions (e.g., "Try refreshing the page")
