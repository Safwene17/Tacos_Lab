import { ChangeDetectionStrategy, Component } from '@angular/core';

interface FooterLink {
  label: string;
  href: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly links: readonly FooterLink[] = [
    { label: 'Menu', href: '#menu' },
    { label: 'About', href: '#about' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Order', href: '#contact' },
  ];
}