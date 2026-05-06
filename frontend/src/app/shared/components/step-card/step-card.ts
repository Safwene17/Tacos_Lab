import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-step-card',
  standalone: true,
  templateUrl: './step-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepCard {
  /**
   * Numeric step order.
   */
  readonly step = input.required<number>();

  /**
   * Emoji or short visual icon for the step.
   */
  readonly icon = input.required<string>();

  /**
   * Step title.
   */
  readonly title = input.required<string>();

  /**
   * Step description.
   */
  readonly description = input.required<string>();

  readonly paddedStep = computed(() => this.step().toString().padStart(2, '0'));
}