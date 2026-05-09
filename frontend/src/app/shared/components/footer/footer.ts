import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../../../core/i18n/i18n';
import { Icon } from '../icon/icon';

interface FooterLink {
  labelKey: string;
  href: string;
}

const GOOGLE_MAPS_LOCATION_URL =
  'https://maps.app.goo.gl/wkhX9Sz9M5fp9c7K7';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [Icon],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly i18n = inject(I18n);
  readonly mapsUrl = GOOGLE_MAPS_LOCATION_URL;

  readonly links: readonly FooterLink[] = [
    { labelKey: 'nav.menu', href: '#menu' },
    { labelKey: 'nav.about', href: '#about' },
    { labelKey: 'nav.how', href: '#how-it-works' },
    { labelKey: 'nav.order', href: '#contact' },
  ];
}