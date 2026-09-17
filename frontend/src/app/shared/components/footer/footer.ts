import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Icon } from '../icon/icon';

interface FooterLink {
  label: string;
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
  readonly mapsUrl = GOOGLE_MAPS_LOCATION_URL;

  readonly links: readonly FooterLink[] = [
    { label: 'Menu', href: '#menu' },
    { label: 'About', href: '#about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Order', href: '#contact' },
  ];
}