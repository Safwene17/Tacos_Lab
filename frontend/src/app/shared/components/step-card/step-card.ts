import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon, type AppIconName } from '../icon/icon';

@Component({
  selector: 'app-step-card',
  standalone: true,
  imports: [Icon],
  templateUrl: './step-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepCard {
  readonly step = input.required<number>();
  readonly icon = input.required<AppIconName>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();

  readonly paddedStep = computed(() => this.step().toString().padStart(2, '0'));
}