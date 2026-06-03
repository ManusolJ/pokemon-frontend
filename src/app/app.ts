import { Toast } from 'primeng/toast';

import { Navbar } from '@shared/components/navbar/navbar';
import { Footer } from '@shared/components/footer/footer';

import { RouterOutlet } from '@angular/router';
import { Component, signal } from '@angular/core';

@Component({
  imports: [Navbar, Footer, Toast, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('pokemon-team-builder');
}
