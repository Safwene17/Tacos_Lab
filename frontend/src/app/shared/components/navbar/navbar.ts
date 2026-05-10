import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { I18n } from '../../../core/i18n/i18n';
import { Icon } from '../icon/icon';

interface NavLink {
  labelKey: string;
  href: string;
}

const WOLT_URL = 'https://wolt.com/en/rou/timisoara/restaurant/le-tacos-67e2deb28fc8436783be3e23';

const LOGO_IMAGE = '/assets/images/logo-le-tacos.jpg';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [Icon],
  templateUrl: './navbar.html',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-12px)',
        }),
        animate(
          '220ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          }),
        ),
      ]),
      transition(':leave', [
        animate(
          '180ms ease-in',
          style({
            opacity: 0,
            transform: 'translateY(-12px)',
          }),
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly i18n = inject(I18n);

  readonly menuOpen = signal(false);
  readonly woltUrl = WOLT_URL;
  readonly logoImage = LOGO_IMAGE;

  readonly navLinks: readonly NavLink[] = [
    { labelKey: 'nav.menu', href: '#menu' },
    { labelKey: 'nav.how', href: '#how-it-works' },

    { labelKey: 'nav.about', href: '#about' },
    { labelKey: 'nav.location', href: '#location' },
    { labelKey: 'nav.contact', href: '#contact' },
  ];
  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }
}
