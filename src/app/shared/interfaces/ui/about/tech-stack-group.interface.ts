import { TechStackItem } from './tech-stack-item.interface';

export interface TechStackGroup {
  readonly label: string;
  readonly items: readonly TechStackItem[];
}
