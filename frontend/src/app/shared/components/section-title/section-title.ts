import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SectionTitleAlign = 'left' | 'center';

@Component({
  selector: 'app-section-title',
  standalone: true,
  templateUrl: './section-title.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionTitle {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly align = input<SectionTitleAlign>('center');

  readonly wrapperClasses = computed(() =>
    this.align() === 'center'
      ? 'mx-auto mb-14 max-w-3xl text-center'
      : 'mb-12 max-w-3xl text-left',
  );
}