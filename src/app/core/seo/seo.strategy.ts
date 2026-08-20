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
    const description =
      this.resolveData<string>(snapshot.root, 'description') ?? DEFAULT_DESCRIPTION;

    const canonicalOverride = this.resolveData<string>(snapshot.root, 'canonical');
    const canonical = SITE_ORIGIN + (canonicalOverride ?? this.canonicalPath(snapshot.url));

    this.title.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.updateRobots(this.isNoindex(snapshot.root));
    this.updateCanonical(canonical);
  }

  private resolveData<T>(route: ActivatedRouteSnapshot, key: string): T | null {
    let current: ActivatedRouteSnapshot | null = route;
    let found: T | null = null;

    while (current) {
      const candidate = current.data?.[key];
      if (candidate !== undefined && candidate !== null) {
        found = candidate as T;
      }
      current = current.firstChild;
    }

    return found;
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
