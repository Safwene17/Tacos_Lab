import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { App } from './app/app';
import { appRoutes } from './app/app.routes';

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
  ],
}).catch((error: unknown) => {
  throw error;
});