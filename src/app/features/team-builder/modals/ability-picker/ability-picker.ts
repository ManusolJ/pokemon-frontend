import { AbilityRead } from '@shared/interfaces/pokemon/ability/ability-read.interface';
import { AbilityEmbed } from '@shared/interfaces/pokemon/ability/ability-embed.interface';

import { AbilityService } from '@core/services/ability.service';

import { Modal } from '@shared/components/modal/modal';

import { TitleCasePipe } from '@angular/common';

import { SkeletonModule } from 'primeng/skeleton';

import { forkJoin, map, of } from 'rxjs';

import { rxResource } from '@angular/core/rxjs-interop';
import {
  input,
  inject,
  output,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

interface AbilityEntry {
  readonly read: AbilityRead;
  readonly isHidden: boolean;
}

@Component({
  imports: [Modal, TitleCasePipe, SkeletonModule],
  selector: 'app-ability-picker',
  styleUrl: './ability-picker.css',
  templateUrl: './ability-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbilityPicker {
  private readonly abilityService = inject(AbilityService);

  readonly open = input.required<boolean>();
  readonly abilities = input<readonly AbilityEmbed[]>([]);
  readonly currentAbilityId = input<number | null>(null);

  readonly closed = output<void>();
  readonly picked = output<AbilityRead | null>();

  private readonly entriesResource = rxResource({
    params: () => ({
      open: this.open(),
      embeds: this.abilities(),
    }),
    stream: ({ params }) => {
      if (!params.open || params.embeds.length === 0) {
        return of<AbilityEntry[]>([]);
      }
      const requests = params.embeds.map((embed) =>
        this.abilityService
          .getOneAbility({ id: embed.ability.id })
          .pipe(map((read) => ({ read, isHidden: embed.isHidden }))),
      );
      return forkJoin(requests);
    },
    defaultValue: [],
  });

  protected readonly entries = computed<readonly AbilityEntry[]>(() => this.entriesResource.value());
  protected readonly loading = computed(() => this.entriesResource.isLoading());

  protected readonly skeletons = computed<readonly void[]>(() =>
    Array.from({ length: Math.max(1, this.abilities().length) }),
  );

  protected isCurrent(read: AbilityRead): boolean {
    return this.currentAbilityId() === read.id;
  }

  protected onPick(read: AbilityRead): void {
    this.picked.emit(read);
  }

  protected clearAbility(): void {
    this.picked.emit(null);
  }
}
