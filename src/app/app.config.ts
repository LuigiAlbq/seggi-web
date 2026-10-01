import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { provideApi } from './core/api/generated';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { PRIMENG_PT_BR } from './core/primeng-pt-br';
import { DARK_MODE_CLASS } from './core/theme.service';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    provideApi(environment.apiBaseUrl),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: `.${DARK_MODE_CLASS}`,
          cssLayer: { name: 'primeng', order: 'theme, base, primeng' },
        },
      },
      translation: PRIMENG_PT_BR,
      license: environment.primeuiLicense || undefined,
    }),
    MessageService,
    ConfirmationService,
  ],
};
