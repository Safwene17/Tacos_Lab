import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';
import { Icon, type AppIconName } from '../../../shared/components/icon/icon';


interface AboutStat {
  icon: AppIconName;
  label: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SectionTitle, ScrollReveal, Icon],
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {


  readonly aboutImage = '/assets/images/tacos-image.jpg';

  readonly stats: readonly AboutStat[] = [
    { icon: 'taco', label: 'Variety' },
    { icon: 'cheese', label: 'Quality' },
    { icon: 'delivery', label: 'Speed' },
    { icon: 'star', label: 'Authentic' },
  ];
}