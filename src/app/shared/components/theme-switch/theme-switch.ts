import { ThemeService } from '@core/services/theme.service';

import { placeUnder } from '@shared/utils/popover.util';
import { ThemePreference } from '@shared/interfaces/ui/generic/theme-preference.interface';

import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';

interface ThemeOption {
  value: ThemePreference;
  label: string;
  icon: string;
}

let nextId = 0;

@Component({
  selector: 'app-theme-switch',
  templateUrl: './theme-switch.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitch {
  private readonly themeService = inject(ThemeService);

  private readonly menu = viewChild.required<ElementRef<HTMLElement>>('menu');
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected readonly menuId = `theme-menu-${nextId++}`;

  protected readonly preference = this.themeService.preference;
  protected readonly resolved = this.themeService.resolved;

  protected readonly options: readonly ThemeOption[] = [
    { value: 'system', label: 'System', icon: 'pi-desktop' },
    { value: 'light', label: 'Light', icon: 'pi-sun' },
    { value: 'dark', label: 'Dark', icon: 'pi-moon' },
  ];

  protected reposition(): void {
    placeUnder(this.trigger().nativeElement, this.menu().nativeElement);
  }

  protected select(value: ThemePreference): void {
    this.themeService.setPreference(value);
    this.menu().nativeElement.hidePopover();
  }
}
