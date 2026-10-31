import { ThemePreference } from '@shared/interfaces/ui/generic/theme-preference.interface';

import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'ptb-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const THEME_COLOR: Record<'light' | 'dark', string> = {
  dark: '#0e1014',
  light: '#f7f7f6',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia(DARK_QUERY);

  private readonly systemDark = signal(this.media?.matches ?? true);

  readonly preference = signal<ThemePreference>(readStored());

  readonly resolved = computed<'light' | 'dark'>(() => {
    const preference = this.preference();
    if (preference === 'system') {
      return this.systemDark() ? 'dark' : 'light';
    }
    return preference;
  });

  constructor() {
    this.media?.addEventListener('change', (event) => this.systemDark.set(event.matches));

    effect(() => {
      const theme = this.resolved();
      const root = this.document.documentElement;

      root.setAttribute('data-theme', theme);
      root.classList.toggle('dark', theme === 'dark');
      this.document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', THEME_COLOR[theme]);
    });
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);

    try {
      if (preference === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, preference);
      }
    } catch {}
  }
}

function readStored(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}
