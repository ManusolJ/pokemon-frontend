import { RoleKey } from './role-key.interface';
import { ClassificationContext } from './classification-context.inteface';

export interface RoleRule {
  readonly role: (context: ClassificationContext) => RoleKey;
  readonly matches: (context: ClassificationContext) => boolean;
}
