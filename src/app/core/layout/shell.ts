import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from '../theme.service';
import { NAV_ITEMS } from './nav-items';

@Component({
  selector: 'app-shell',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    ConfirmDialogModule,
    DrawerModule,
    ToastModule,
    TooltipModule,
  ],
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly theme = inject(ThemeService);
  protected readonly navItems = NAV_ITEMS;
  protected readonly mobileMenuOpen = signal(false);
}
