import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';
import { Icon, type AppIconName } from '../../../shared/components/icon/icon';
import { I18n } from '../../../core/i18n/i18n';

interface AboutStat {
  icon: AppIconName;
  labelKey: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SectionTitle, ScrollReveal, Icon],
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  readonly i18n = inject(I18n);

  readonly aboutImage = '/assets/images/tacos-image.jpg';

  readonly stats: readonly AboutStat[] = [
    { icon: 'taco', labelKey: 'about.statSizes' },
    { icon: 'cheese', labelKey: 'about.statCheese' },
    { icon: 'delivery', labelKey: 'about.statDelivery' },
    { icon: 'star', labelKey: 'about.statOriginal' },
  ];
}