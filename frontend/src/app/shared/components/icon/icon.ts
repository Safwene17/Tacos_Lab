import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AppIconName =
  | 'taco'
  | 'cheese'
  | 'delivery'
  | 'star'
  | 'location'
  | 'clock'
  | 'flag'
  | 'globe'
  | 'arrowRight';

export type AppIconSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<AppIconName>();
  readonly size = input<AppIconSize>('md');

  readonly classes = computed(() => {
    const sizes: Record<AppIconSize, string> = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-7 w-7',
      xl: 'h-10 w-10',
    };

    return `${sizes[this.size()]} shrink-0`;
  });
}