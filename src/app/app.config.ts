import { SeoStrategy } from '@core/seo/seo.strategy';

import { jwtInterceptor } from '@core/interceptors/jwt.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';

import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

import { ROUTES } from './app.routes';

import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { provideRouter, TitleStrategy } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

const PokemonAura = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ee5a5a',
      600: '#e2474a',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f4f5f7',
          100: '#e8eaee',
          200: '#c7ccd4',
          300: '#9aa1ad',
          400: '#646b78',
          500: '#3a3f49',
          600: '#272b33',
          700: '#1b1f27',
          800: '#15181e',
          900: '#0e1014',
          950: '#090a0d',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideRouter(ROUTES),
    { provide: TitleStrategy, useClass: SeoStrategy },
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({
      theme: {
        preset: PokemonAura,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, utilities',
          },
        },
      },
    }),
  ],
};
