import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';
import { Icon } from '../../../shared/components/icon/icon';
import { I18n } from '../../../core/i18n/i18n';

const WOLT_URL =
  'https://wolt.com/en/rou/timisoara/restaurant/le-tacos-67e2deb28fc8436783be3e23';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionTitle, ScrollReveal, Icon],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  readonly i18n = inject(I18n);
  readonly woltUrl = WOLT_URL;
}