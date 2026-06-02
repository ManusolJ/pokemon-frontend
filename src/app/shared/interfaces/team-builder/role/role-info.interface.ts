import { RoleKey } from './role-key.interface';
import { RoleTone } from './role-tone.interface';

export interface RoleInfo {
  readonly key: RoleKey;
  readonly label: string;
  readonly tone: RoleTone;
}
