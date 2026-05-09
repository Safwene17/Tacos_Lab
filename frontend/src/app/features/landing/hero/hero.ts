import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Badge } from '../../../shared/components/badge/badge';
import { Icon } from '../../../shared/components/icon/icon';
import { I18n } from '../../../core/i18n/i18n';

const WOLT_URL =
  'https://wolt.com/en/rou/timisoara/restaurant/le-tacos-67e2deb28fc8436783be3e23';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [Badge, Icon],
  templateUrl: './hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  readonly i18n = inject(I18n);

  readonly woltUrl = WOLT_URL;
  readonly heroImage = '/assets/images/hero-le-tacos1.jpg';
}