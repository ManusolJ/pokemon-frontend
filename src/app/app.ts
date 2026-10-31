import { Toast } from 'primeng/toast';

import { Navbar } from '@shared/components/navbar/navbar';
import { Footer } from '@shared/components/footer/footer';

import { ThemeService } from '@core/services/theme.service';

import { RouterOutlet } from '@angular/router';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

@Component({
  imports: [Navbar, Footer, Toast, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    inject(ThemeService);
  }
}
