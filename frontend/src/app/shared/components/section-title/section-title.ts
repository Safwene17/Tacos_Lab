import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SectionTitleAlign = 'left' | 'center';

@Component({
  selector: 'app-section-title',
  standalone: true,
  templateUrl: './section-title.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionTitle {
  /**
   * Main section heading.
   */
  readonly title = input.required<string>();

  /**
   * Optional supporting text displayed below the heading.
   */
  readonly subtitle = input<string>();

  /**
   * Alignment of the section title.
   */
  readonly align = input<SectionTitleAlign>('center');

  readonly wrapperClasses = computed(() =>
    this.align() === 'center'
      ? 'mx-auto mb-14 max-w-3xl text-center'
      : 'mb-12 max-w-3xl text-left',
  );
}