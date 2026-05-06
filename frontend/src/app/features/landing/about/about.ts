import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';

interface AboutStat {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SectionTitle, ScrollReveal],
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  readonly aboutImage = '/assets/images/tacos-image.jpg';

  readonly stats: readonly AboutStat[] = [
    { icon: '🌮', label: 'M, L & XL tacos' },
    { icon: '🧀', label: 'Signature melted cheese' },
    { icon: '🛵', label: 'Wolt delivery available' },
    { icon: '⭐', label: 'Original French Tacos' },
  ];
}