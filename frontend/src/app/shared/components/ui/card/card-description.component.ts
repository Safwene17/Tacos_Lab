import { Component } from '@angular/core';

@Component({
  selector: 'app-card-description',
  standalone: true,
  template: `<p class="mt-2 text-sm text-gray-600 dark:text-gray-400"><ng-content></ng-content></p>`,
  styles: []
})
export class CardDescriptionComponent {}
