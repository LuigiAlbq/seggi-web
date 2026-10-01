import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

const STORAGE_KEY = 'seggi-theme';
export const DARK_MODE_CLASS = 'app-dark';

/** Alterna entre tema claro e escuro (classe `app-dark` no <html>, usada pelo PrimeNG e Tailwind). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly dark = signal(this.initialPreference());

  constructor() {
    effect(() => {
      const dark = this.dark();
      this.document.documentElement.classList.toggle(DARK_MODE_CLASS, dark);
      try {
        localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
      } catch {
        // Storage indisponível (modo privado etc.): só não persiste a preferência.
      }
    });
  }

  toggle(): void {
    this.dark.update((dark) => !dark);
  }

  private initialPreference(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return saved === 'dark';
      }
    } catch {
      // Ignora e cai na preferência do sistema.
    }
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
  }
}
