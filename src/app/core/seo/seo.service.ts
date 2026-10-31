import { DOCUMENT, inject, Injectable } from '@angular/core';

import { Meta, Title } from '@angular/platform-browser';

export const SITE_NAME = 'PokeTeam Builder';
export const SITE_ORIGIN = 'https://pokemon-team-builder.com';

const DEFAULT_TITLE = `${SITE_NAME} - Competitive Team Builder & Pokédex`;
export const DEFAULT_DESCRIPTION =
  'Build competitive Pokémon teams with full EV and IV spreads, analyse type coverage and roles, and browse a complete Pokédex of 1,025 species and 919 moves.';

const MAX_DESCRIPTION_LENGTH = 160;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  setPage(title: string | null, description: string = DEFAULT_DESCRIPTION): void {
    const pageTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
    const pageDescription = truncate(description, MAX_DESCRIPTION_LENGTH);

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: pageDescription });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: pageDescription });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: pageDescription });
  }

  setCanonical(path: string): void {
    const href = SITE_ORIGIN + path;
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', href);
    this.meta.updateTag({ property: 'og:url', content: href });
  }

  setNoindex(noindex: boolean): void {
    if (noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
      return;
    }

    this.meta.removeTag('name="robots"');
  }
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) {
    return clean;
  }
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:]$/, '')}…`;
}
