import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle-button',
  standalone: true,
  templateUrl: './theme-toggle-button.component.html',
  imports: [CommonModule]
})
export class ThemeToggleButtonComponent {
  private themeService = inject(ThemeService);
  theme$ = this.themeService.theme$;

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}