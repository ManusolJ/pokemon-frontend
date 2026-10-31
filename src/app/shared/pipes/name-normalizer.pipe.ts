import { displayName } from '@shared/utils/display-name.util';

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameNormalizer',
})
export class NameNormalizerPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? displayName(value) : '';
  }
}
