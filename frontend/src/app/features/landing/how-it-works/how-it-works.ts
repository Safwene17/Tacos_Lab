import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { StepCard } from '../../../shared/components/step-card/step-card';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';
import { I18n } from '../../../core/i18n/i18n';
import type { AppIconName } from '../../../shared/components/icon/icon';

interface Step {
  step: number;
  icon: AppIconName;
  titleKey: string;
  descriptionKey: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [SectionTitle, StepCard, ScrollReveal],
  templateUrl: './how-it-works.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorks {
  readonly i18n = inject(I18n);

  readonly steps: readonly Step[] = [
    {
      step: 1,
      icon: 'taco',
      titleKey: 'how.step1Title',
      descriptionKey: 'how.step1Description',
    },
    {
      step: 2,
      icon: 'cheese',
      titleKey: 'how.step2Title',
      descriptionKey: 'how.step2Description',
    },
    {
      step: 3,
      icon: 'delivery',
      titleKey: 'how.step3Title',
      descriptionKey: 'how.step3Description',
    },
  ];

  revealDelay(index: number): number {
    return index * 120;
  }
}