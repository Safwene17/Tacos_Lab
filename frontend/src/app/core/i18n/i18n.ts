import { Injectable, computed, signal } from '@angular/core';

export type AppLanguage = 'en' | 'ro';

type TranslationDictionary = Record<AppLanguage, Record<string, string>>;

const STORAGE_KEY = 'le-tacos-language';

const TRANSLATIONS: TranslationDictionary = {
  en: {
    'language.current': 'English',
    'language.next': 'RO',

    'nav.menu': 'Menu',
    'nav.about': 'About',
    'nav.how': 'How it works',
    'nav.location': 'Location',
    'nav.contact': 'Contact',
    'nav.order': 'Order on Wolt',
    'nav.logoSubtitle': 'Original French Tacos',

    'hero.badge': 'Original French Tacos • Timișoara',
    'hero.titleLine1': 'Taste the',
    'hero.titleLine2': 'Original',
    'hero.subtitle':
      'Loaded French tacos with melted cheese, crispy fries, grilled meats, and bold sauces — crafted for serious cravings in Timișoara.',
    'hero.primaryCta': 'Order on Wolt',
    'hero.secondaryCta': 'Explore Menu',
    'hero.pillDelivery': 'Delivery via Wolt',
    'hero.pillCheese': 'Melted cheese',
    'hero.pillSizes': 'M, L & XL sizes',
    'hero.cardSignatureTitle': 'Signature',
    'hero.cardSignatureText':
      'Golden melted cheese, crispy topping, and a warm grilled wrap.',
    'hero.cardDeliveryTitle': 'Fast Delivery',
    'hero.cardDeliveryText': 'Order quickly through Wolt and enjoy Le Tacos at home.',
    'hero.cardPortionsTitle': 'Big Portions',
    'hero.cardPortionsText': 'Choose M, L or XL depending on your hunger level.',

    'menu.title': 'Our Menu',
    'menu.subtitle':
      'Choose your size, pick your favorite filling, and let the melted cheese do the rest.',
    'menu.tabAll': 'All',
    'menu.tabM': 'M 350g',
    'menu.tabL': 'L 450g',
    'menu.tabXL': 'XL',
    'menu.tabBowls': 'Bowls',
    'menu.tabSides': 'Sides',
    'menu.tabDrinks': 'Drinks',
    'menu.popular': 'Popular',
    'menu.description':
      'Melted cheese, crispy fries, grilled meat, and signature sauce inside a warm French tacos wrap.',
    'menu.comingSoonTitle': 'Coming soon',
    'menu.comingSoonText': 'This category will be available soon at Le Tacos.',

    'how.title': 'How to order?',
    'how.subtitle':
      'Simple, fast, and generous — your French tacos is only a few clicks away.',
    'how.step1Title': 'Choose your taco',
    'how.step1Description': 'Pick your size and favorite filling: M, L or XL.',
    'how.step2Title': 'Make it yours',
    'how.step2Description':
      'Enjoy grilled meats, crispy fries, melted cheese, and bold sauces.',
    'how.step3Title': 'Order on Wolt',
    'how.step3Description': 'Get your Le Tacos delivered quickly in Timișoara.',

    'about.title': 'Born in France, served in Timișoara',
    'about.subtitle':
      'A bold French tacos experience built around generous portions, melted cheese, crispy fries, and grilled meats.',
    'about.p1':
      'Le Tacos brings the modern French tacos experience to Timișoara: a warm grilled wrap loaded with crispy fries, rich cheese sauce, flavorful meats, and bold sauces made for serious cravings.',
    'about.p2':
      'Whether you want a quick lunch, a late-night comfort meal, or a big order with friends, our tacos are designed to feel generous, satisfying, and easy to order through Wolt.',
    'about.statSizes': 'M, L & XL tacos',
    'about.statCheese': 'Signature melted cheese',
    'about.statDelivery': 'Wolt delivery available',
    'about.statOriginal': 'Original French Tacos',
    'about.imageLabel': 'Signature grilled French tacos',

    'location.title': 'Find us in Timișoara',
    'location.subtitle':
      'Visit Le Tacos or order directly through Wolt. Here is where to find us.',
    'location.cardTitle': 'Le Tacos',
    'location.description':
      'Original French Tacos in Timișoara, Romania. Check availability, opening hours, and delivery options directly on Wolt or Google Maps.',
    'location.addressTitle': 'Location',
    'location.addressText': 'Timișoara, Romania',
    'location.deliveryTitle': 'Delivery',
    'location.deliveryText': 'Available via Wolt',
    'location.hoursTitle': 'Opening hours',
    'location.hoursText': 'Check live hours on Google Maps',
    'location.mapsCta': 'Open in Google Maps',
    'location.mapTitle': 'Le Tacos location in Timișoara',

    'contact.title': 'Ready to order?',
    'contact.subtitle': 'Find Le Tacos in Timișoara and order directly through Wolt.',
    'contact.locationTitle': 'Location',
    'contact.locationText': 'Timișoara, Romania',
    'contact.orderTitle': 'Order via',
    'contact.orderText': 'Wolt delivery',
    'contact.availabilityTitle': 'Availability',
    'contact.availabilityText': 'Check live on Wolt',
    'contact.cta': 'Order on Wolt',

    'footer.tagline': 'Original French Tacos • Timișoara',
    'footer.location': 'Timișoara, Romania',
    'footer.maps': 'Open in Google Maps',
    'footer.description':
      'Loaded French tacos with melted cheese, crispy fries, grilled meats, and bold sauces.',
    'footer.rights': '© 2026 Le Tacos. All rights reserved.',
  },

  ro: {
    'language.current': 'Română',
    'language.next': 'EN',

    'nav.menu': 'Meniu',
    'nav.about': 'Despre',
    'nav.how': 'Cum comanzi',
    'nav.location': 'Locație',
    'nav.contact': 'Contact',
    'nav.order': 'Comandă pe Wolt',
    'nav.logoSubtitle': 'Original French Tacos',

    'hero.badge': 'Original French Tacos • Timișoara',
    'hero.titleLine1': 'Gustul',
    'hero.titleLine2': 'Original',
    'hero.subtitle':
      'French tacos cu brânză topită, cartofi crocanți, carne la grill și sosuri intense — creat pentru pofte serioase în Timișoara.',
    'hero.primaryCta': 'Comandă pe Wolt',
    'hero.secondaryCta': 'Vezi meniul',
    'hero.pillDelivery': 'Livrare prin Wolt',
    'hero.pillCheese': 'Brânză topită',
    'hero.pillSizes': 'Mărimi M, L & XL',
    'hero.cardSignatureTitle': 'Signature',
    'hero.cardSignatureText':
      'Brânză topită, topping crocant și wrap cald, rumenit la grill.',
    'hero.cardDeliveryTitle': 'Livrare rapidă',
    'hero.cardDeliveryText': 'Comandă rapid prin Wolt și savurează Le Tacos acasă.',
    'hero.cardPortionsTitle': 'Porții generoase',
    'hero.cardPortionsText': 'Alege M, L sau XL în funcție de cât de foame îți este.',

    'menu.title': 'Meniul nostru',
    'menu.subtitle':
      'Alege mărimea, carnea preferată și lasă brânza topită să facă restul.',
    'menu.tabAll': 'Toate',
    'menu.tabM': 'M 350g',
    'menu.tabL': 'L 450g',
    'menu.tabXL': 'XL',
    'menu.tabBowls': 'Bowls',
    'menu.tabSides': 'Sides',
    'menu.tabDrinks': 'Băuturi',
    'menu.popular': 'Popular',
    'menu.description':
      'Brânză topită, cartofi crocanți, carne la grill și sos signature într-un wrap cald French tacos.',
    'menu.comingSoonTitle': 'În curând',
    'menu.comingSoonText':
      'Această categorie va fi disponibilă în curând la Le Tacos.',

    'how.title': 'Cum comanzi?',
    'how.subtitle':
      'Simplu, rapid și generos — French tacos-ul tău este la doar câteva clickuri distanță.',
    'how.step1Title': 'Alege tacos-ul',
    'how.step1Description': 'Alege mărimea și umplutura preferată: M, L sau XL.',
    'how.step2Title': 'Personalizează-l',
    'how.step2Description':
      'Bucură-te de carne la grill, cartofi crocanți, brânză topită și sosuri intense.',
    'how.step3Title': 'Comandă pe Wolt',
    'how.step3Description': 'Primește Le Tacos rapid prin livrare în Timișoara.',

    'about.title': 'Născut în Franța, servit în Timișoara',
    'about.subtitle':
      'O experiență French tacos construită în jurul porțiilor generoase, brânzei topite, cartofilor crocanți și cărnii la grill.',
    'about.p1':
      'Le Tacos aduce experiența modernă French tacos în Timișoara: un wrap cald, rumenit la grill, umplut cu cartofi crocanți, sos de brânză, carne savuroasă și sosuri intense.',
    'about.p2':
      'Fie că vrei un prânz rapid, o masă de seară sau o comandă mare cu prietenii, tacos-urile noastre sunt gândite să fie generoase, sățioase și ușor de comandat prin Wolt.',
    'about.statSizes': 'Tacos M, L & XL',
    'about.statCheese': 'Brânză topită signature',
    'about.statDelivery': 'Livrare disponibilă prin Wolt',
    'about.statOriginal': 'Original French Tacos',
    'about.imageLabel': 'French tacos rumenit la grill',

    'location.title': 'Găsește-ne în Timișoara',
    'location.subtitle':
      'Vizitează Le Tacos sau comandă direct prin Wolt. Aici ne poți găsi.',
    'location.cardTitle': 'Le Tacos',
    'location.description':
      'Original French Tacos în Timișoara, România. Verifică disponibilitatea, programul și opțiunile de livrare direct pe Wolt sau Google Maps.',
    'location.addressTitle': 'Locație',
    'location.addressText': 'Timișoara, România',
    'location.deliveryTitle': 'Livrare',
    'location.deliveryText': 'Disponibilă prin Wolt',
    'location.hoursTitle': 'Program',
    'location.hoursText': 'Verifică programul live pe Google Maps',
    'location.mapsCta': 'Deschide în Google Maps',
    'location.mapTitle': 'Locația Le Tacos în Timișoara',

    'contact.title': 'Gata să comanzi?',
    'contact.subtitle': 'Găsește Le Tacos în Timișoara și comandă direct prin Wolt.',
    'contact.locationTitle': 'Locație',
    'contact.locationText': 'Timișoara, România',
    'contact.orderTitle': 'Comandă prin',
    'contact.orderText': 'Livrare Wolt',
    'contact.availabilityTitle': 'Program',
    'contact.availabilityText': 'Verifică disponibilitatea pe Wolt',
    'contact.cta': 'Comandă pe Wolt',

    'footer.tagline': 'Original French Tacos • Timișoara',
    'footer.location': 'Timișoara, România',
    'footer.maps': 'Deschide în Google Maps',
    'footer.description':
      'French tacos cu brânză topită, cartofi crocanți, carne la grill și sosuri intense.',
    'footer.rights': '© 2026 Le Tacos. Toate drepturile rezervate.',
  },
};

@Injectable({
  providedIn: 'root',
})
export class I18n {
  readonly language = signal<AppLanguage>(this.getInitialLanguage());

  readonly nextLanguageLabel = computed(() =>
    this.language() === 'en'
      ? TRANSLATIONS.en['language.next']
      : TRANSLATIONS.ro['language.next'],
  );

  t(key: string): string {
    return TRANSLATIONS[this.language()][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language);
      document.documentElement.lang = language;
    }
  }

  toggleLanguage(): void {
    this.setLanguage(this.language() === 'en' ? 'ro' : 'en');
  }

  private getInitialLanguage(): AppLanguage {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

    if (savedLanguage === 'en' || savedLanguage === 'ro') {
      document.documentElement.lang = savedLanguage;
      return savedLanguage;
    }

    const browserLanguage = window.navigator.language.toLowerCase();
    const language: AppLanguage = browserLanguage.startsWith('ro') ? 'ro' : 'en';

    document.documentElement.lang = language;
    return language;
  }
}