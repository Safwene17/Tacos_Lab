import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Badge } from '../../../shared/components/badge/badge';
import { Icon } from '../../../shared/components/icon/icon';


@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [Badge, Icon],
  templateUrl: './hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {

  readonly heroImage = '/assets/images/hero.jpg';
}