import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardTitleComponent } from '../../../ui/card/card-title.component';
import { CardDescriptionComponent } from '../../../ui/card/card-description.component';

@Component({
  selector: 'app-card-link-two',
  standalone: true,
  imports: [
    RouterModule,
    CardTitleComponent,
    CardDescriptionComponent,
],
  templateUrl: './card-link-two.component.html',
  styles: ``
})
export class CardLinkTwoComponent {

}
