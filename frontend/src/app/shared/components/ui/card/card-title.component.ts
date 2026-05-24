import { Component } from '@angular/core';

@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `<h3 class="text-lg font-semibold text-gray-900 dark:text-white"><ng-content></ng-content></h3>`,
  styles: []
})
export class CardTitleComponent {}
