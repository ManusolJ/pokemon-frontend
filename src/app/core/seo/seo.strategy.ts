import { inject, Injectable } from '@angular/core';

import { Meta, Title } from '@angular/platform-browser';

import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

const SITE_NAME = 'PokeTeam Builder';
const SITE_ORIGIN = 'https://pokemon-team-builder.com';

const DEFAULT_TITLE = `${SITE_NAME} - Competitive Team Builder & Pokedex`;
const DEFAULT_DESCRIPTION =
  'Build competitive Pokemon teams with full EV and IV spreads, analyse type coverage and roles, and browse a complete Pokedex of 1,025 species and 919 moves.';

@Injectable()
export class SeoStrategy extends TitleStrategy {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const routeTitle = this.buildTitle(snapshot);
    const pageTitle = routeTitle ? `${routeTitle} · ${SITE_NAME}` : DEFAULT_TITLE;
    const description = this.resolveDescription(snapshot.root) ?? DEFAULT_DESCRIPTION;

    this.title.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: SITE_ORIGIN + snapshot.url });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.updateRobots(this.isNoindex(snapshot.root));
    this.updateCanonical(SITE_ORIGIN + this.canonicalPath(snapshot.url));
  }

  private isNoindex(route: ActivatedRouteSnapshot): boolean {
    let current: ActivatedRouteSnapshot | null = route;

    while (current) {
      if (current.data?.['noindex'] === true) {
        return true;
      }
      current = current.firstChild;
    }

    return false;
  }

  private updateRobots(noindex: boolean): void {
    if (noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
      return;
    }

    this.meta.removeTag('name="robots"');
  }

  private resolveDescription(route: ActivatedRouteSnapshot): string | null {
    let deepest: ActivatedRouteSnapshot | null = route;
    let description: string | null = null;

    while (deepest) {
      const candidate = deepest.data?.['description'];
      if (typeof candidate === 'string' && candidate.length > 0) {
        description = candidate;
      }
      deepest = deepest.firstChild;
    }

    return description;
  }

  private canonicalPath(url: string): string {
    const [path] = url.split(/[?#]/);
    return path === '/' ? '/' : path.replace(/\/$/, '');
  }

  private updateCanonical(href: string): void {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }

    link.setAttribute('href', href);
  }
}
