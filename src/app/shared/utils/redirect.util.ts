const DEFAULT_REDIRECT = '/';
const PROTOCOL_RELATIVE_PREFIX = '//';
const PATH_PREFIX = '/';

export function safeRedirect(target: string | null | undefined): string {
  if (!target || !target.startsWith(PATH_PREFIX) || target.startsWith(PROTOCOL_RELATIVE_PREFIX)) {
    return DEFAULT_REDIRECT;
  }
  return target;
}
