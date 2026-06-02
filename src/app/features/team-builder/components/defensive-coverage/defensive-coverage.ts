import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { TeamMember } from '@shared/interfaces/team-builder/team-member.interface';
import { SegmentTone } from '@shared/interfaces/team-builder/analysis/segment-tone.interface';
import { AttackerRow } from '@shared/interfaces/team-builder/analysis/attacker-row.interface';
import { BucketCounts } from '@shared/interfaces/team-builder/analysis/bucket-counts.interface';
import { EffectivenessChart } from '@shared/interfaces/team-builder/analysis/effectiveness-chart.interface';

import { getTypeColor } from '@shared/utils/get-type-color.util';
import { buildDefensiveCoverage } from '@shared/utils/analysis.util';

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const TEAM_SLOT_COUNT = 6;
const EMPTY_BUCKET: BucketCounts = { super: 0, neutral: 0, resist: 0, immune: 0 };

@Component({
  imports: [],
  selector: 'app-defensive-coverage',
  styleUrl: './defensive-coverage.css',
  templateUrl: './defensive-coverage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefensiveCoverage {
  readonly loading = input<boolean>(false);
  readonly chart = input.required<EffectivenessChart>();
  readonly allTypes = input.required<readonly TypeRead[]>();
  readonly members = input.required<ReadonlyArray<TeamMember | null>>();

  protected readonly rows = computed<readonly AttackerRow[]>(() => this.buildRows());

  protected readonly weakTypeCount = computed(
    () => this.rows().filter((row) => row.weak > 0).length,
  );

  protected readonly resistTypeCount = computed(
    () => this.rows().filter((row) => row.resist > 0 || row.immune > 0).length,
  );

  protected getTypeColor(type: string): string {
    return getTypeColor(type);
  }

  private buildRows(): readonly AttackerRow[] {
    const counts = buildDefensiveCoverage(this.members(), this.chart(), this.allTypes());
    const rows = this.allTypes().map((type) => this.toAttackerRow(type, counts));
    rows.sort(
      (a, b) =>
        b.weak - a.weak ||
        b.resist - a.resist ||
        b.immune - a.immune ||
        a.type.localeCompare(b.type),
    );
    return rows;
  }

  private toAttackerRow(type: TypeRead, counts: ReadonlyMap<string, BucketCounts>): AttackerRow {
    const key = type.name.toLowerCase();
    const bucket = counts.get(key) ?? EMPTY_BUCKET;
    return {
      type: key,
      weak: bucket.super,
      neutral: bucket.neutral,
      resist: bucket.resist,
      immune: bucket.immune,
      segments: this.buildSegments(bucket),
    };
  }

  private buildSegments(bucket: BucketCounts): readonly SegmentTone[] {
    const segments: SegmentTone[] = [];
    this.appendRepeated(segments, 'weak', bucket.super);
    this.appendRepeated(segments, 'neutral', bucket.neutral);
    this.appendRepeated(segments, 'resist', bucket.resist);
    this.appendRepeated(segments, 'immune', bucket.immune);
    while (segments.length < TEAM_SLOT_COUNT) {
      segments.push('empty');
    }
    return segments;
  }

  private appendRepeated(target: SegmentTone[], tone: SegmentTone, count: number): void {
    for (let i = 0; i < count; i++) {
      target.push(tone);
    }
  }
}
