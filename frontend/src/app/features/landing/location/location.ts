import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { ScrollReveal } from '../../../core/directives/scroll-reveal';
import { Icon } from '../../../shared/components/icon/icon';
import { I18n } from '../../../core/i18n/i18n';
import { environment } from '../../../../environments/environment.development';

const GOOGLE_MAPS_LOCATION_URL =
  'https://maps.app.goo.gl/wkhX9Sz9M5fp9c7K7';

/**
 * Replace YOUR_GOOGLE_MAPS_EMBED_API_KEY with your restricted Google Maps Embed API key.
 *
 * Best practice:
 * - Enable Maps Embed API in Google Cloud.
 * - Restrict this key to your production domain.
 * - Do not use the short maps.app.goo.gl URL as iframe src.
 */
const GOOGLE_MAPS_EMBED_URL =
  `https://www.google.com/maps/embed/v1/place?key=${environment.googleMapsEmbedApiKey}&q=Le%20Tacos%2C%20Timi%C8%99oara%2C%20Romania&zoom=17`;

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [SectionTitle, ScrollReveal, Icon],
  templateUrl: './location.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Location {
  private readonly sanitizer = inject(DomSanitizer);

  readonly i18n = inject(I18n);
  readonly mapsUrl = GOOGLE_MAPS_LOCATION_URL;

  readonly mapEmbedUrl: SafeResourceUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(GOOGLE_MAPS_EMBED_URL);
}