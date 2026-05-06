import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { StepCard } from '../../../shared/components/step-card/step-card';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';

interface Step {
  step: number;
  icon: string;
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
      icon: '🌮',
      title: 'Choose your taco',
      description: 'Pick your size and favorite filling: M, L or XL.',
    },
    {
      step: 2,
      icon: '🧀',
      title: 'Make it yours',
      description: 'Enjoy grilled meats, crispy fries, melted cheese, and bold sauces.',
    },
    {
      step: 3,
      icon: '🛵',
      title: 'Order on Wolt',
      description: 'Get your Le Tacos delivered quickly in Timișoara.',
    },
  ];

  revealDelay(index: number): number {
    return index * 120;
  }
}