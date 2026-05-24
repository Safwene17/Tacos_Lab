import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { App } from './app/app';
import { appRoutes } from './app/app.routes';
import { authInterceptor } from './app/core/auth/auth.interceptor';

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

    provideHttpClient(withInterceptors([authInterceptor])),
  ],
}).catch((error: unknown) => {
  throw error;
});