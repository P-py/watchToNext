export interface Session {
  sub: string;
  displayName: string;
  email: string | null;
  roles: string[];
}
