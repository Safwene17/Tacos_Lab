import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { App } from './app/app';
import { appRoutes } from './app/app.routes';
import { authInterceptor } from './app/core/auth/auth.interceptor';
import { errorInterceptor } from './app/core/error/error.interceptor';
import { environment } from './environments/environment';
import { provideApi } from './app/core/api/provide-api';

bootstrapApplication(App, {
  providers: [
    provideAnimations(),

    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),

    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    
    // Provide API with environment-based base URL
    provideApi({
      basePath: environment.apiBaseUrl,
      withCredentials: true,
    }),
  ],
}).catch((error: unknown) => {
  throw error;
});