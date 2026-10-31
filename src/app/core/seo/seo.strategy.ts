import { inject, Injectable } from '@angular/core';

import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { SeoService } from './seo.service';

@Injectable()
export class SeoStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const description = this.resolveData<string>(snapshot.root, 'description') ?? undefined;
    const canonicalOverride = this.resolveData<string>(snapshot.root, 'canonical');

    this.seo.setPage(this.buildTitle(snapshot) ?? null, description);
    this.seo.setCanonical(canonicalOverride ?? this.canonicalPath(snapshot.url));
    this.seo.setNoindex(this.isNoindex(snapshot.root));
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

  private canonicalPath(url: string): string {
    const [pathAndQuery] = url.split('#');
    const [rawPath, query] = pathAndQuery.split('?');
    const path = rawPath === '/' ? '/' : rawPath.replace(/\/$/, '');
    const page = Number(new URLSearchParams(query).get('page'));
    return Number.isInteger(page) && page > 1 ? `${path}?page=${page}` : path;
  }
}
