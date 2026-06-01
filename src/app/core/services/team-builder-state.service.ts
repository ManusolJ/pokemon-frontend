import { TeamMember } from '@shared/interfaces/team-builder/team-member.interface';

import { computed, Injectable, signal } from '@angular/core';

import { PersistedState } from '@shared/interfaces/team-builder/persisted-state.interface';

const SLOT_COUNT = 6;
const STORAGE_KEY = 'teamBuilderState';

function emptySlots(): ReadonlyArray<TeamMember | null> {
  return Array.from({ length: SLOT_COUNT }, () => null);
}

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class TeamBuilderStateService {
  private readonly _teamName = signal('');
  private readonly _isPrivate = signal(true);
  private readonly _activeIndex = signal<number | null>(null);
  private readonly _members = signal<ReadonlyArray<TeamMember | null>>(emptySlots());

  readonly teamName = this._teamName.asReadonly();
  readonly isPrivate = this._isPrivate.asReadonly();
  readonly members = this._members.asReadonly();
  readonly activeIndex = this._activeIndex.asReadonly();

  readonly activeMember = computed<TeamMember | null>(() => {
    const i = this._activeIndex();
    return i === null ? null : (this._members()[i] ?? null);
  });

  readonly isDirty = computed(
    () => this._members().some((m) => m !== null) || this._teamName() !== '' || !this._isPrivate(),
  );

  constructor() {
    const saved = loadState();
    if (saved) {
      this._teamName.set(saved.teamName);
      this._isPrivate.set(saved.isPrivate);
      this._members.set(saved.members);
      this._activeIndex.set(saved.activeIndex);
    }
  }

  setTeamName(name: string): void {
    this._teamName.set(name);
    this.persist();
  }

  togglePrivate(): void {
    this._isPrivate.update((v) => !v);
    this.persist();
  }

  setActiveIndex(index: number | null): void {
    this._activeIndex.set(index);
    this.persist();
  }

  addMember(slot: number, member: TeamMember): void {
    this._members.update((arr) => arr.map((m, i) => (i === slot ? member : m)));
    this._activeIndex.set(slot);
    this.persist();
  }

  updateActiveMember(updated: TeamMember): void {
    const i = this._activeIndex();
    if (i === null) return;
    this._members.update((arr) => arr.map((m, idx) => (idx === i ? updated : m)));
    this.persist();
  }

  removeMember(slot: number): void {
    this._members.update((arr) => arr.map((m, i) => (i === slot ? null : m)));
    if (this._activeIndex() === slot) {
      const next = this._members().findIndex((m) => m !== null);
      this._activeIndex.set(next === -1 ? null : next);
    }
    this.persist();
  }

  reset(): void {
    this._teamName.set('');
    this._isPrivate.set(true);
    this._activeIndex.set(null);
    this._members.set(emptySlots());
    localStorage.removeItem(STORAGE_KEY);
  }

  private persist(): void {
    const state: PersistedState = {
      teamName: this._teamName(),
      isPrivate: this._isPrivate(),
      members: this._members(),
      activeIndex: this._activeIndex(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
