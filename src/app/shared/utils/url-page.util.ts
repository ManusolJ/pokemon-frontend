import { Signal, inject, signal } from '@angular/core';

import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { map } from 'rxjs';

export interface UrlPage {
  set(page: number): void;
  readonly page: Signal<number>;
}

export function urlPage(onUrlChange: () => void = () => undefined): UrlPage {
  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const page = signal(readPage(route.snapshot.queryParamMap));

  route.queryParamMap.pipe(map(readPage), takeUntilDestroyed()).subscribe((next) => {
    if (next !== page()) {
      page.set(next);
      onUrlChange();
    }
  });

  return {
    page: page.asReadonly(),
    set(next: number): void {
      if (next === page()) {
        return;
      }
      page.set(next);
      void router.navigate([], {
        relativeTo: route,
        queryParams: { page: pageParam(next) },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    },
  };
}

export function pageParam(page: number): number | null {
  return page > 0 ? page + 1 : null;
}

function readPage(params: ParamMap): number {
  const value = Number(params.get('page'));
  return Number.isInteger(value) && value > 1 ? value - 1 : 0;
}
