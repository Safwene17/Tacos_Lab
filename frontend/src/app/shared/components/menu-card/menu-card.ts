import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { MenuItem } from '../../../features/landing/data/menu.data';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-menu-card',
  standalone: true,
  imports: [Icon],
  templateUrl: './menu-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCard {
  readonly item = input.required<MenuItem>();
}