import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
  input,
} from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollReveal implements OnInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private observer?: IntersectionObserver;

  /**
   * Delay in milliseconds before the reveal animation starts.
   */
  readonly delay = input<number>(0, {
    alias: 'appScrollRevealDelay',
  });

  ngOnInit(): void {
    const element = this.elementRef.nativeElement;

    this.renderer.setStyle(element, 'opacity', '0');
    this.renderer.setStyle(element, 'transform', 'translateY(20px)');
    this.renderer.setStyle(
      element,
      'transition',
      'opacity 700ms ease, transform 700ms ease',
    );
    this.renderer.setStyle(element, 'transition-delay', `${this.delay()}ms`);

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        this.renderer.setStyle(element, 'opacity', '1');
        this.renderer.setStyle(element, 'transform', 'translateY(0)');
        this.observer?.unobserve(element);
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -60px 0px',
      },
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}