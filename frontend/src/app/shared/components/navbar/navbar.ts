import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

interface NavLink {
  label: string;
  href: string;
}

const WOLT_URL =
  'https://wolt.com/en/rou/timisoara/restaurant/le-tacos-67e2deb28fc8436783be3e23';

const LOGO_IMAGE = '/assets/images/logo-le-tacos.jpg';

@Component({
  selector: 'app-navbar',
  standalone: true,
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
  readonly menuOpen = signal(false);
  readonly woltUrl = WOLT_URL;
  readonly logoImage = LOGO_IMAGE;

  readonly navLinks: readonly NavLink[] = [
    { label: 'Menu', href: '#menu' },
    { label: 'About', href: '#about' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Contact', href: '#contact' },
  ];

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}