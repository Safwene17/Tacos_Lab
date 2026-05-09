import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { Hero } from './hero/hero';
import { Menu } from './menu/menu';
import { HowItWorks } from './how-it-works/how-it-works';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { Location } from './location/location';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [Navbar, Hero, Menu, HowItWorks, About, Location, Contact, Footer],
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {}