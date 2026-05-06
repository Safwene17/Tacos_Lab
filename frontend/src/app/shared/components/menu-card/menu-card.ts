import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { MenuItem } from '../../../features/landing/data/menu.data';

@Component({
  selector: 'app-menu-card',
  standalone: true,
  templateUrl: './menu-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCard {
  /**
   * Menu item rendered by the card.
   */
  readonly item = input.required<MenuItem>();
}