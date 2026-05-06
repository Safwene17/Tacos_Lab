import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeVariant = 'gold' | 'yellow' | 'ghost';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  /**
   * Text displayed inside the badge.
   */
  readonly label = input.required<string>();

  /**
   * Visual badge style.
   */
  readonly variant = input<BadgeVariant>('gold');

  readonly classes = computed(() => {
    const base =
      'inline-flex w-fit items-center rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.24em] shadow-[0_10px_35px_rgba(0,0,0,0.32)] backdrop-blur-md sm:text-xs';

    const variants: Record<BadgeVariant, string> = {
      gold: 'border-brand-gold/30 bg-black/35 text-brand-yellow',
      yellow: 'border-brand-yellow/35 bg-brand-yellow/10 text-brand-yellow',
      ghost: 'border-white/15 bg-black/25 text-brand-white/78',
    };

    return `${base} ${variants[this.variant()]}`;
  });
}