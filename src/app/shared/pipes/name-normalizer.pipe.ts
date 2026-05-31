import { Pipe, PipeTransform } from '@angular/core';

const SPACE = ' ';
const SEPARATOR_PATTERN = /[-_]/g;

@Pipe({
  name: 'nameNormalizer',
})
export class NameNormalizerPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return value.replace(SEPARATOR_PATTERN, SPACE);
  }
}
