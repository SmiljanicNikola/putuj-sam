export type Category =
  'Sve' | 'Priroda' | 'Planine' | 'Gradovi' | 'Jezera i reke' | 'Kultura' | 'Smeštaj'
export type Region = 'Zapadna Srbija' | 'Istočna Srbija' | 'Vojvodina' | 'Centralna Srbija'
export interface Place {
  id: string
  name: string
  subtitle: string
  region: Region
  category: Category
  image: string
  imageAlt: string
  coordinates: [number, number]
  description: string
  highlights: string[]
  tip: string
  duration: string
  source: string
  badge?: string
  imageIsIllustrative?: boolean
}

export const destinations: Place[] = [
  {
    id: 'tara',
    name: 'Nacionalni park Tara',
    subtitle: 'Tamo gde se diše punim plućima.',
    region: 'Zapadna Srbija',
    category: 'Planine',
    image: '/images/tara.jpg',
    imageAlt: 'Zelene livade i šume Mitrovca na Tari',
    coordinates: [43.915, 19.417],
    description:
      'Jutro među borovima, staze koje vode kroz tišinu i pogled na Drinu koji ostaje u sećanju. Tara je mesto za sporiji korak, duge šetnje i mali predah od svakodnevice.',
    highlights: ['Vidikovac Banjska stena', 'Šumske staze oko Mitrovca', 'Jezero Zaovine'],
    tip: 'Za Banjska stena vidikovac ponesi udobnu obuću. Pre polaska proveri stanje staza kod uprave nacionalnog parka.',
    duration: '2–3 dana',
    source: 'https://nptara.rs/',
    badge: 'Naš izbor',
  },
  {
    id: 'uvac',
    name: 'Meandri Uvca',
    subtitle: 'Priroda je ovde nadmašila sebe.',
    region: 'Zapadna Srbija',
    category: 'Jezera i reke',
    image: '/images/uvac.jpg',
    imageAlt: 'Meandri reke Uvac i beloglavi sup iznad kanjona',
    coordinates: [43.35, 19.967],
    description:
      'Reka koja crta krivine između zelenih brda i beloglavi supovi visoko iznad kanjona. Uvac se najbolje upoznaje bez žurbe, sa vidikovca ili tokom organizovane plovidbe.',
    highlights: [
      'Pogled sa vidikovca Molitva',
      'Organizovana plovidba rezervatom',
      'Posmatranje beloglavih supova',
    ],
    tip: 'Plovidbu dogovori sa ovlašćenim lokalnim organizatorom. Poštuj pravila rezervata i drži odstojanje od ptica.',
    duration: '1–2 dana',
    source: 'https://www.uvac.org.rs/',
    badge: 'Vredi skrenuti',
  },
  {
    id: 'golubac',
    name: 'Golubačka tvrđava',
    subtitle: 'Deset kula. Bezbroj priča.',
    region: 'Istočna Srbija',
    category: 'Kultura',
    image: '/images/golubac.jpg',
    imageAlt: 'Srednjovekovna Golubačka tvrđava na obali Dunava',
    coordinates: [44.66, 21.677],
    description:
      'Na ulazu u Đerdapsku klisuru, kule Golubačke tvrđave izrastaju iz stene iznad Dunava. Spoji obilazak istorijskog kompleksa sa šetnjom obalom i pauzom uz pogled na reku.',
    highlights: ['Obilazak tvrđave', 'Šetnja uz Dunav', 'Nastavak puta ka Đerdapu'],
    tip: 'Proveri aktuelno radno vreme i pravila obilaska zona na zvaničnom sajtu pre posete.',
    duration: '1 dan',
    source: 'https://tvrdjavagolubackigrad.rs/',
  },
  {
    id: 'drina',
    name: 'Drina i Bajina Bašta',
    subtitle: 'Jedna reka, hiljadu nijansi zelene.',
    region: 'Zapadna Srbija',
    category: 'Jezera i reke',
    image: '/images/drina.jpg',
    imageAlt: 'Zelena reka Drina između šumovitih brda',
    coordinates: [43.975, 19.553],
    description:
      'Reka prati put, a put vodi ka malim pauzama koje se pamte. Bajina Bašta je dobra polazna tačka za Drinu, Perućac i uspon ka Tari.',
    highlights: ['Kućica na Drini', 'Jezero Perućac', 'Izlet do reke Vrelo'],
    tip: 'Za aktivnosti na vodi izaberi registrovanog organizatora i proveri vremenske uslove.',
    duration: '1–2 dana',
    source: 'https://taradrina.com/',
  },
  {
    id: 'fruska-gora',
    name: 'Fruška gora',
    subtitle: 'Malo šume. Malo vina. Mnogo mira.',
    region: 'Vojvodina',
    category: 'Priroda',
    image: '/images/fruska-gora.jpg',
    imageAlt: 'Šumovit pejzaž Fruške gore',
    coordinates: [45.153, 19.717],
    description:
      'Šumske staze, manastiri i vinogradi, na dohvat ruke od Novog Sada. Fruška gora je jednostavna ideja za dan u prirodi ili vikend koji spaja šetnju i lokalne ukuse.',
    highlights: ['Šetnja označenim stazama', 'Fruškogorski manastiri', 'Sremski Karlovci'],
    tip: 'Biraj označene staze i proveri obaveštenja nacionalnog parka. Degustacije u vinarijama zakaži unapred.',
    duration: '1–2 dana',
    source: 'https://www.npfruskagora.co.rs/',
  },
  {
    id: 'novi-sad',
    name: 'Novi Sad',
    subtitle: 'Grad za šetnju, kafu i još jednu priču.',
    region: 'Vojvodina',
    category: 'Gradovi',
    image: '/images/novi-sad.jpg',
    imageAlt: 'Istorijska arhitektura centra Novog Sada',
    coordinates: [45.255, 19.845],
    description:
      'Prošetaj centrom, pređi Dunav i popni se do Petrovaradinske tvrđave. Novi Sad ima dovoljno ritma za gradski vikend i dovoljno mirnih kutaka da ga provedeš svojim tempom.',
    highlights: ['Petrovaradinska tvrđava', 'Dunavski park', 'Zmaj Jovina i Dunavska ulica'],
    tip: 'Za pogled na grad sa tvrđave odvoji vreme pred zalazak sunca.',
    duration: '1–2 dana',
    source: 'https://novisad.travel/',
  },
  {
    id: 'zlatibor',
    name: 'Zlatibor',
    subtitle: 'Iza poznatih mesta čekaju nova.',
    region: 'Zapadna Srbija',
    category: 'Planine',
    image: '/images/zlatibor.jpg',
    imageAlt: 'Ribničko jezero i planinski pejzaž Zlatibora',
    coordinates: [43.725, 19.699],
    description:
      'Zlatibor ima i mirniju stranu: otvorene livade, jezera i sela puna lokalnih priča. Napravi svoju kombinaciju šetnje, izleta i domaće kuhinje.',
    highlights: ['Ribničko jezero', 'Stopića pećina', 'Muzej Staro selo u Sirogojnu'],
    tip: 'Za obilazak pećine i muzeja proveri radno vreme. Za mirniji boravak istraži okolna sela.',
    duration: '2–3 dana',
    source: 'https://www.zlatibor.org.rs/',
  },
  {
    id: 'studenica',
    name: 'Manastir Studenica',
    subtitle: 'Susret sa osam vekova istorije.',
    region: 'Centralna Srbija',
    category: 'Kultura',
    image: '/images/studenica.jpg',
    imageAlt: 'Bogorodičina crkva manastira Studenica',
    coordinates: [43.486, 20.532],
    description:
      'Beli mermer, srednjovekovne freske i dolina okružena šumom. Studenica je mesto na kome se kulturno nasleđe upoznaje u tišini i sa poštovanjem.',
    highlights: ['Bogorodičina crkva', 'Srednjovekovne freske', 'Dolina reke Studenice'],
    tip: 'Poštuj pravila aktivnog manastira, primereno se obuci i pitaj pre fotografisanja unutrašnjosti.',
    duration: '1 dan',
    source: 'https://whc.unesco.org/en/list/389/',
  },
  {
    id: 'rtanj',
    name: 'Rtanj',
    subtitle: 'Planina kojoj se uvek vraćaš.',
    region: 'Istočna Srbija',
    category: 'Planine',
    image: '/images/rtanj.jpg',
    imageAlt: 'Prepoznatljiv vrh Šiljak na planini Rtanj',
    coordinates: [43.774, 21.894],
    description:
      'Prepoznatljiva silueta Rtnja mami pogled i pre nego što stigneš do njegovih staza. Podnožje je za lagan predah, a uspon na Šiljak za iskusnije planinare.',
    highlights: ['Pogled na vrh Šiljak', 'Šetnje u podnožju', 'Izlet do Sokobanje'],
    tip: 'Uspon na Šiljak zahteva kondiciju i odgovarajuću opremu. Proveri prognozu i razmisli o lokalnom vodiču.',
    duration: '1–2 dana',
    source: 'https://www.serbia.travel/',
  },
  {
    id: 'mokra-gora',
    name: 'Mokra Gora',
    subtitle: 'Putovanje koje usporava vreme.',
    region: 'Zapadna Srbija',
    category: 'Priroda',
    image: '/images/mokra-gora.jpg',
    imageAlt: 'Voz Šarganske osmice na stanici u Mokroj Gori',
    coordinates: [43.793, 19.508],
    description:
      'Pruga vijuga između brda, a drvene kuće čuvaju drugačiji ritam dana. Spoji Mokru Goru sa Tarom ili joj pokloni ceo vikend.',
    highlights: ['Šarganska osmica', 'Drvengrad', 'Šetnje između planinskih sela'],
    tip: 'Vožnju Šarganskom osmicom rezerviši preko zvaničnog prevoznika; red vožnje zavisi od sezone.',
    duration: '1–2 dana',
    source: 'https://www.srbvoz.rs/',
  },
]

// Add accommodation profiles here only after agreement with the owner.
export const stays: Place[] = []

export const allPlaces = [...destinations, ...stays]
export const regions: Region[] = [
  'Zapadna Srbija',
  'Istočna Srbija',
  'Vojvodina',
  'Centralna Srbija',
]
export const categories: Category[] = [
  'Sve',
  'Priroda',
  'Planine',
  'Gradovi',
  'Jezera i reke',
  'Kultura',
]
export const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj')
export const mapsLink = (place: Place) =>
  `https://www.google.com/maps/search/?api=1&query=${place.coordinates.join(',')}`
export const routeLink = (places: Place[], origin = 'Beograd') => {
  const params = new URLSearchParams({
    api: '1',
    origin,
    destination: places.at(-1)!.coordinates.join(','),
    travelmode: 'driving',
  })
  if (places.length > 1)
    params.set(
      'waypoints',
      places
        .slice(0, -1)
        .map((p) => p.coordinates.join(','))
        .join('|'),
    )
  return `https://www.google.com/maps/dir/?${params}`
}
