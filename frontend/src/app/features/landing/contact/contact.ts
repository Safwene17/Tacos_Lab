import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionTitle, ScrollReveal, Icon],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  readonly contactInfo = {
    phone: '+40 (0) 256 123 456',
    email: 'hello@tacoslab.ro',
    address: '42 Strada Mihai Eminescu, Timisoara, Romania 300205',
    hours: {
      weekdays: '11:00 AM - 11:00 PM',
      weekends: '12:00 PM - 12:00 AM',
    },
  };
}