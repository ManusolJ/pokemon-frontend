import { environment } from '@environments/environment';

export function spriteUrl(path: string | null | undefined): string {
  return path ? `${environment.spritesBaseUrl}${path}` : '';
}
