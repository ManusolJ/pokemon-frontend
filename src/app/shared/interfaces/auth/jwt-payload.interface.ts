export interface JwtPayload {
  sub: string;
  username?: string;
  iat: number;
  exp: number;
  authorities: string[];
  type: 'access' | 'refresh';
}
