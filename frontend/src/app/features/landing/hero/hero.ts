import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Badge } from '../../../shared/components/badge/badge';

const WOLT_URL =
  'https://wolt.com/en/rou/timisoara/restaurant/le-tacos-67e2deb28fc8436783be3e23';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [Badge],
  templateUrl: './hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  readonly woltUrl = WOLT_URL;
  readonly heroImage = '/assets/images/hero-le-tacos1.jpg';
}