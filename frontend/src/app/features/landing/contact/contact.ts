import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';

const WOLT_URL =
  'https://wolt.com/en/rou/timisoara/restaurant/le-tacos-67e2deb28fc8436783be3e23';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionTitle, ScrollReveal],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  readonly woltUrl = WOLT_URL;
}