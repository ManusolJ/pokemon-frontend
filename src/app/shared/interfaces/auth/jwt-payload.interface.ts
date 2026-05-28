export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  authorities: string[];
  type: 'access' | 'refresh';
}
