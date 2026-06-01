import { UserRead } from '@shared/interfaces/pokemon/user/user-read.interface';

export type ConfirmKind = 'disable' | 'reactivate' | 'delete';

export interface ConfirmRequest {
  readonly kind: ConfirmKind;
  readonly user?: UserRead;
  readonly batchIds?: readonly number[];
}
