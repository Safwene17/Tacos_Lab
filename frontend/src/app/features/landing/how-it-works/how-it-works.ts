import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { StepCard } from '../../../shared/components/step-card/step-card';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';

import type { AppIconName } from '../../../shared/components/icon/icon';

interface Step {
  step: number;
  icon: AppIconName;
  title: string;
  description: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [SectionTitle, StepCard, ScrollReveal],
  templateUrl: './how-it-works.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorks {


  readonly steps: readonly Step[] = [
    {
      step: 1,
      icon: 'taco',
      title: 'Browse Menu',
      description: 'Explore our delicious selection of authentic Mexican dishes',
    },
    {
      step: 2,
      icon: 'cheese',
      title: 'Choose Items',
      description: 'Pick your favorite tacos and customize to your liking',
    },
    {
      step: 3,
      icon: 'delivery',
      title: 'Fast Delivery',
      description: 'Receive your hot, fresh tacos at your doorstep',
    },
  ];

  revealDelay(index: number): number {
    return index * 120;
  }
}