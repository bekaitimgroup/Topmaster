import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// yearTo: null = still in production
const MAKES: {
  name: string;
  isLocal: boolean;
  sortOrder: number;
  models: { name: string; yearFrom?: number; yearTo?: number; sortOrder: number }[];
}[] = [
  // ── Uzbek local brands (UzAuto Motors) ──────────────────────────────────────
  {
    name: 'Chevrolet (UzAuto)',
    isLocal: true,
    sortOrder: 1,
    models: [
      { name: 'Spark',      yearFrom: 2005, sortOrder: 1 },
      { name: 'Cobalt',     yearFrom: 2012, sortOrder: 2 },
      { name: 'Nexia 3',    yearFrom: 2016, sortOrder: 3 },
      { name: 'Lacetti',    yearFrom: 2014, yearTo: 2022, sortOrder: 4 },
      { name: 'Malibu',     yearFrom: 2014, sortOrder: 5 },
      { name: 'Malibu 2',   yearFrom: 2018, sortOrder: 6 },
      { name: 'Tracker',    yearFrom: 2020, sortOrder: 7 },
      { name: 'Equinox',    yearFrom: 2023, sortOrder: 8 },
      { name: 'Captiva',    yearFrom: 2018, sortOrder: 9 },
      { name: 'Onix',       yearFrom: 2023, sortOrder: 10 },
      { name: 'Damas',      yearFrom: 1995, sortOrder: 11 },
      { name: 'Labo',       yearFrom: 2001, sortOrder: 12 },
    ],
  },
  {
    name: 'Ravon',
    isLocal: true,
    sortOrder: 2,
    models: [
      { name: 'R2',           yearFrom: 2016, yearTo: 2019, sortOrder: 1 },
      { name: 'R3 Nexia',    yearFrom: 2016, yearTo: 2019, sortOrder: 2 },
      { name: 'R4',           yearFrom: 2016, yearTo: 2019, sortOrder: 3 },
    ],
  },

  // ── Chinese brands ───────────────────────────────────────────────────────────
  {
    name: 'BYD',
    isLocal: false,
    sortOrder: 10,
    models: [
      { name: 'F0',        yearFrom: 2008, yearTo: 2015, sortOrder: 1 },
      { name: 'F3',        yearFrom: 2005, yearTo: 2020, sortOrder: 2 },
      { name: 'Song',      yearFrom: 2015, sortOrder: 3 },
      { name: 'Han',       yearFrom: 2020, sortOrder: 4 },
      { name: 'Atto 3',   yearFrom: 2021, sortOrder: 5 },
      { name: 'Seal',      yearFrom: 2022, sortOrder: 6 },
      { name: 'Dolphin',   yearFrom: 2021, sortOrder: 7 },
      { name: 'Yuan Plus', yearFrom: 2021, sortOrder: 8 },
      { name: 'Tang',      yearFrom: 2015, sortOrder: 9 },
    ],
  },
  {
    name: 'Chery',
    isLocal: false,
    sortOrder: 11,
    models: [
      { name: 'QQ',          yearFrom: 2003, yearTo: 2015, sortOrder: 1 },
      { name: 'Tiggo 2',    yearFrom: 2016, sortOrder: 2 },
      { name: 'Tiggo 4',    yearFrom: 2017, sortOrder: 3 },
      { name: 'Tiggo 7 Pro', yearFrom: 2020, sortOrder: 4 },
      { name: 'Tiggo 8 Pro', yearFrom: 2020, sortOrder: 5 },
      { name: 'Arrizo 5',   yearFrom: 2014, sortOrder: 6 },
      { name: 'Arrizo 8',   yearFrom: 2021, sortOrder: 7 },
    ],
  },
  {
    name: 'Geely',
    isLocal: false,
    sortOrder: 12,
    models: [
      { name: 'Emgrand',   yearFrom: 2009, sortOrder: 1 },
      { name: 'Atlas',     yearFrom: 2016, sortOrder: 2 },
      { name: 'Coolray',   yearFrom: 2019, sortOrder: 3 },
      { name: 'Tugella',   yearFrom: 2020, sortOrder: 4 },
      { name: 'Monjaro',   yearFrom: 2022, sortOrder: 5 },
      { name: 'Okavango',  yearFrom: 2020, sortOrder: 6 },
    ],
  },
  {
    name: 'Haval',
    isLocal: false,
    sortOrder: 13,
    models: [
      { name: 'H6',     yearFrom: 2011, sortOrder: 1 },
      { name: 'F7',     yearFrom: 2018, sortOrder: 2 },
      { name: 'Jolion', yearFrom: 2020, sortOrder: 3 },
      { name: 'M6',     yearFrom: 2016, sortOrder: 4 },
      { name: 'H9',     yearFrom: 2014, sortOrder: 5 },
      { name: 'Dargo',  yearFrom: 2021, sortOrder: 6 },
    ],
  },
  {
    name: 'JAC',
    isLocal: false,
    sortOrder: 14,
    models: [
      { name: 'J7',   yearFrom: 2019, sortOrder: 1 },
      { name: 'S3',   yearFrom: 2014, sortOrder: 2 },
      { name: 'S4',   yearFrom: 2018, sortOrder: 3 },
      { name: 'JS4',  yearFrom: 2021, sortOrder: 4 },
      { name: 'T8',   yearFrom: 2018, sortOrder: 5 },
    ],
  },
  {
    name: 'Lifan',
    isLocal: false,
    sortOrder: 15,
    models: [
      { name: 'X60',    yearFrom: 2011, sortOrder: 1 },
      { name: 'X70',    yearFrom: 2017, sortOrder: 2 },
      { name: '620',    yearFrom: 2008, yearTo: 2018, sortOrder: 3 },
      { name: '820',    yearFrom: 2014, yearTo: 2019, sortOrder: 4 },
      { name: 'Murman', yearFrom: 2019, sortOrder: 5 },
      { name: 'Myway',  yearFrom: 2019, sortOrder: 6 },
    ],
  },
  {
    name: 'Changan',
    isLocal: false,
    sortOrder: 16,
    models: [
      { name: 'Alsvin',  yearFrom: 2020, sortOrder: 1 },
      { name: 'CS35',    yearFrom: 2012, sortOrder: 2 },
      { name: 'CS55',    yearFrom: 2017, sortOrder: 3 },
      { name: 'CS75',    yearFrom: 2013, sortOrder: 4 },
      { name: 'Hunter',  yearFrom: 2020, sortOrder: 5 },
      { name: 'UNI-T',   yearFrom: 2020, sortOrder: 6 },
      { name: 'UNI-V',   yearFrom: 2021, sortOrder: 7 },
    ],
  },
  {
    name: 'Omoda',
    isLocal: false,
    sortOrder: 17,
    models: [
      { name: 'C5', yearFrom: 2021, sortOrder: 1 },
      { name: 'C9', yearFrom: 2022, sortOrder: 2 },
    ],
  },
  {
    name: 'Jetour',
    isLocal: false,
    sortOrder: 18,
    models: [
      { name: 'X70',     yearFrom: 2018, sortOrder: 1 },
      { name: 'X90',     yearFrom: 2019, sortOrder: 2 },
      { name: 'Dashing', yearFrom: 2022, sortOrder: 3 },
      { name: 'T2',      yearFrom: 2023, sortOrder: 4 },
    ],
  },
  {
    name: 'BAIC',
    isLocal: false,
    sortOrder: 19,
    models: [
      { name: 'X35',  yearFrom: 2016, sortOrder: 1 },
      { name: 'X55',  yearFrom: 2016, sortOrder: 2 },
      { name: 'X7',   yearFrom: 2020, sortOrder: 3 },
      { name: 'BJ20', yearFrom: 2016, sortOrder: 4 },
      { name: 'BJ40', yearFrom: 2013, sortOrder: 5 },
    ],
  },
  {
    name: 'Dongfeng (DFM)',
    isLocal: false,
    sortOrder: 20,
    models: [
      { name: 'AX7',    yearFrom: 2015, sortOrder: 1 },
      { name: 'AX4',    yearFrom: 2017, sortOrder: 2 },
      { name: 'Fenon',  yearFrom: 2021, sortOrder: 3 },
      { name: 'S500',   yearFrom: 2013, yearTo: 2018, sortOrder: 4 },
    ],
  },
  {
    name: 'Great Wall',
    isLocal: false,
    sortOrder: 21,
    models: [
      { name: 'Wingle 5', yearFrom: 2008, sortOrder: 1 },
      { name: 'Wingle 7', yearFrom: 2018, sortOrder: 2 },
      { name: 'Poer',     yearFrom: 2020, sortOrder: 3 },
      { name: 'Hover H5', yearFrom: 2010, yearTo: 2018, sortOrder: 4 },
    ],
  },
  {
    name: 'Foton',
    isLocal: false,
    sortOrder: 22,
    models: [
      { name: 'Tunland',  yearFrom: 2012, sortOrder: 1 },
      { name: 'Sauvana',  yearFrom: 2016, sortOrder: 2 },
      { name: 'Gratour',  yearFrom: 2015, sortOrder: 3 },
    ],
  },
  {
    name: 'MG (SAIC)',
    isLocal: false,
    sortOrder: 23,
    models: [
      { name: 'MG 5',  yearFrom: 2020, sortOrder: 1 },
      { name: 'MG 6',  yearFrom: 2010, sortOrder: 2 },
      { name: 'HS',    yearFrom: 2018, sortOrder: 3 },
      { name: 'ZS',    yearFrom: 2017, sortOrder: 4 },
      { name: 'RX5',   yearFrom: 2016, sortOrder: 5 },
      { name: 'ONE',   yearFrom: 2022, sortOrder: 6 },
    ],
  },
  {
    name: 'Lixiang (Li Auto)',
    isLocal: false,
    sortOrder: 24,
    models: [
      { name: 'L7',   yearFrom: 2022, sortOrder: 1 },
      { name: 'L8',   yearFrom: 2022, sortOrder: 2 },
      { name: 'L9',   yearFrom: 2022, sortOrder: 3 },
    ],
  },
  {
    name: 'Zeekr',
    isLocal: false,
    sortOrder: 25,
    models: [
      { name: '001',  yearFrom: 2021, sortOrder: 1 },
      { name: '009',  yearFrom: 2022, sortOrder: 2 },
      { name: 'X',    yearFrom: 2023, sortOrder: 3 },
    ],
  },
  {
    name: 'Exeed',
    isLocal: false,
    sortOrder: 26,
    models: [
      { name: 'TXL',  yearFrom: 2019, sortOrder: 1 },
      { name: 'VX',   yearFrom: 2021, sortOrder: 2 },
      { name: 'LX',   yearFrom: 2022, sortOrder: 3 },
    ],
  },

  // ── Korean brands ────────────────────────────────────────────────────────────
  {
    name: 'Hyundai',
    isLocal: false,
    sortOrder: 30,
    models: [
      { name: 'Accent',       yearFrom: 1994, sortOrder: 1 },
      { name: 'Elantra',      yearFrom: 1990, sortOrder: 2 },
      { name: 'Sonata',       yearFrom: 1985, sortOrder: 3 },
      { name: 'Tucson',       yearFrom: 2004, sortOrder: 4 },
      { name: 'Santa Fe',     yearFrom: 2000, sortOrder: 5 },
      { name: 'Creta',        yearFrom: 2015, sortOrder: 6 },
      { name: 'Palisade',     yearFrom: 2019, sortOrder: 7 },
      { name: 'ix35',         yearFrom: 2009, yearTo: 2017, sortOrder: 8 },
      { name: 'Staria',       yearFrom: 2021, sortOrder: 9 },
    ],
  },
  {
    name: 'Kia',
    isLocal: false,
    sortOrder: 31,
    models: [
      { name: 'Rio',       yearFrom: 2000, sortOrder: 1 },
      { name: 'Cerato',    yearFrom: 2003, sortOrder: 2 },
      { name: 'K5',        yearFrom: 2010, sortOrder: 3 },
      { name: 'Sportage',  yearFrom: 1993, sortOrder: 4 },
      { name: 'Seltos',    yearFrom: 2019, sortOrder: 5 },
      { name: 'Sorento',   yearFrom: 2002, sortOrder: 6 },
      { name: 'Carnival',  yearFrom: 1998, sortOrder: 7 },
      { name: 'Stinger',   yearFrom: 2017, sortOrder: 8 },
      { name: 'Telluride', yearFrom: 2019, sortOrder: 9 },
    ],
  },
  {
    name: 'Daewoo',
    isLocal: false,
    sortOrder: 32,
    models: [
      { name: 'Matiz',   yearFrom: 1998, yearTo: 2015, sortOrder: 1 },
      { name: 'Nexia',   yearFrom: 1994, yearTo: 2016, sortOrder: 2 },
      { name: 'Lacetti', yearFrom: 2002, yearTo: 2012, sortOrder: 3 },
      { name: 'Gentra',  yearFrom: 2013, sortOrder: 4 },
    ],
  },

  // ── Japanese brands ──────────────────────────────────────────────────────────
  {
    name: 'Toyota',
    isLocal: false,
    sortOrder: 40,
    models: [
      { name: 'Corolla',          yearFrom: 1966, sortOrder: 1 },
      { name: 'Camry',            yearFrom: 1982, sortOrder: 2 },
      { name: 'Yaris',            yearFrom: 1999, sortOrder: 3 },
      { name: 'RAV4',             yearFrom: 1994, sortOrder: 4 },
      { name: 'Highlander',       yearFrom: 2001, sortOrder: 5 },
      { name: 'Fortuner',         yearFrom: 2005, sortOrder: 6 },
      { name: 'Land Cruiser 200', yearFrom: 2007, yearTo: 2021, sortOrder: 7 },
      { name: 'Land Cruiser 300', yearFrom: 2021, sortOrder: 8 },
      { name: 'Prado 150',        yearFrom: 2009, sortOrder: 9 },
      { name: 'Hilux',            yearFrom: 1968, sortOrder: 10 },
      { name: 'Venza',            yearFrom: 2021, sortOrder: 11 },
      { name: 'Avalon',           yearFrom: 2019, sortOrder: 12 },
    ],
  },
  {
    name: 'Lexus',
    isLocal: false,
    sortOrder: 41,
    models: [
      { name: 'ES',  yearFrom: 1989, sortOrder: 1 },
      { name: 'RX',  yearFrom: 1998, sortOrder: 2 },
      { name: 'NX',  yearFrom: 2014, sortOrder: 3 },
      { name: 'GX',  yearFrom: 2002, sortOrder: 4 },
      { name: 'LX',  yearFrom: 1996, sortOrder: 5 },
      { name: 'LS',  yearFrom: 1989, sortOrder: 6 },
    ],
  },
  {
    name: 'Nissan',
    isLocal: false,
    sortOrder: 42,
    models: [
      { name: 'Sentra',    yearFrom: 1982, sortOrder: 1 },
      { name: 'Juke',      yearFrom: 2010, sortOrder: 2 },
      { name: 'Qashqai',   yearFrom: 2006, sortOrder: 3 },
      { name: 'X-Trail',   yearFrom: 2000, sortOrder: 4 },
      { name: 'Patrol',    yearFrom: 1951, sortOrder: 5 },
      { name: 'Navara',    yearFrom: 1986, sortOrder: 6 },
      { name: 'Teana',     yearFrom: 2003, yearTo: 2016, sortOrder: 7 },
      { name: 'Murano',    yearFrom: 2002, sortOrder: 8 },
    ],
  },
  {
    name: 'Honda',
    isLocal: false,
    sortOrder: 43,
    models: [
      { name: 'Civic',   yearFrom: 1972, sortOrder: 1 },
      { name: 'Accord',  yearFrom: 1976, sortOrder: 2 },
      { name: 'CR-V',    yearFrom: 1995, sortOrder: 3 },
      { name: 'Pilot',   yearFrom: 2002, sortOrder: 4 },
      { name: 'HR-V',    yearFrom: 1998, sortOrder: 5 },
    ],
  },
  {
    name: 'Mitsubishi',
    isLocal: false,
    sortOrder: 44,
    models: [
      { name: 'Outlander',    yearFrom: 2001, sortOrder: 1 },
      { name: 'Pajero',       yearFrom: 1981, sortOrder: 2 },
      { name: 'Pajero Sport', yearFrom: 1996, sortOrder: 3 },
      { name: 'L200',         yearFrom: 1978, sortOrder: 4 },
      { name: 'Eclipse Cross', yearFrom: 2017, sortOrder: 5 },
      { name: 'ASX',          yearFrom: 2010, sortOrder: 6 },
    ],
  },
  {
    name: 'Subaru',
    isLocal: false,
    sortOrder: 45,
    models: [
      { name: 'Outback',    yearFrom: 1994, sortOrder: 1 },
      { name: 'Forester',   yearFrom: 1997, sortOrder: 2 },
      { name: 'Legacy',     yearFrom: 1989, sortOrder: 3 },
      { name: 'XV / Crosstrek', yearFrom: 2011, sortOrder: 4 },
      { name: 'Impreza',    yearFrom: 1992, sortOrder: 5 },
    ],
  },
  {
    name: 'Mazda',
    isLocal: false,
    sortOrder: 46,
    models: [
      { name: 'Mazda 3',  yearFrom: 2003, sortOrder: 1 },
      { name: 'Mazda 6',  yearFrom: 2002, sortOrder: 2 },
      { name: 'CX-5',    yearFrom: 2012, sortOrder: 3 },
      { name: 'CX-9',    yearFrom: 2006, sortOrder: 4 },
      { name: 'CX-30',   yearFrom: 2019, sortOrder: 5 },
    ],
  },
  {
    name: 'Infiniti',
    isLocal: false,
    sortOrder: 47,
    models: [
      { name: 'Q50',   yearFrom: 2013, sortOrder: 1 },
      { name: 'QX50',  yearFrom: 2008, sortOrder: 2 },
      { name: 'QX60',  yearFrom: 2012, sortOrder: 3 },
      { name: 'QX80',  yearFrom: 2013, sortOrder: 4 },
      { name: 'FX35',  yearFrom: 2002, yearTo: 2013, sortOrder: 5 },
    ],
  },

  // ── European brands ──────────────────────────────────────────────────────────
  {
    name: 'Volkswagen',
    isLocal: false,
    sortOrder: 50,
    models: [
      { name: 'Polo',    yearFrom: 1975, sortOrder: 1 },
      { name: 'Golf',    yearFrom: 1974, sortOrder: 2 },
      { name: 'Passat',  yearFrom: 1973, sortOrder: 3 },
      { name: 'Tiguan',  yearFrom: 2007, sortOrder: 4 },
      { name: 'Touareg', yearFrom: 2002, sortOrder: 5 },
      { name: 'Jetta',   yearFrom: 1979, sortOrder: 6 },
    ],
  },
  {
    name: 'Mercedes-Benz',
    isLocal: false,
    sortOrder: 51,
    models: [
      { name: 'C-Class (W205/W206)', yearFrom: 2014, sortOrder: 1 },
      { name: 'E-Class (W212/W213)', yearFrom: 2009, sortOrder: 2 },
      { name: 'S-Class',  yearFrom: 1972, sortOrder: 3 },
      { name: 'GLE',      yearFrom: 2015, sortOrder: 4 },
      { name: 'GLS',      yearFrom: 2006, sortOrder: 5 },
      { name: 'GLC',      yearFrom: 2015, sortOrder: 6 },
      { name: 'Sprinter', yearFrom: 1995, sortOrder: 7 },
      { name: 'Vito',     yearFrom: 1996, sortOrder: 8 },
    ],
  },
  {
    name: 'BMW',
    isLocal: false,
    sortOrder: 52,
    models: [
      { name: '3 Series', yearFrom: 1975, sortOrder: 1 },
      { name: '5 Series', yearFrom: 1972, sortOrder: 2 },
      { name: '7 Series', yearFrom: 1977, sortOrder: 3 },
      { name: 'X3',       yearFrom: 2003, sortOrder: 4 },
      { name: 'X5',       yearFrom: 1999, sortOrder: 5 },
      { name: 'X6',       yearFrom: 2008, sortOrder: 6 },
      { name: 'X7',       yearFrom: 2018, sortOrder: 7 },
    ],
  },
  {
    name: 'Audi',
    isLocal: false,
    sortOrder: 53,
    models: [
      { name: 'A4',  yearFrom: 1994, sortOrder: 1 },
      { name: 'A6',  yearFrom: 1994, sortOrder: 2 },
      { name: 'A8',  yearFrom: 1994, sortOrder: 3 },
      { name: 'Q3',  yearFrom: 2011, sortOrder: 4 },
      { name: 'Q5',  yearFrom: 2008, sortOrder: 5 },
      { name: 'Q7',  yearFrom: 2005, sortOrder: 6 },
      { name: 'Q8',  yearFrom: 2018, sortOrder: 7 },
    ],
  },
  {
    name: 'Porsche',
    isLocal: false,
    sortOrder: 54,
    models: [
      { name: 'Cayenne',   yearFrom: 2002, sortOrder: 1 },
      { name: 'Macan',     yearFrom: 2014, sortOrder: 2 },
      { name: 'Panamera',  yearFrom: 2009, sortOrder: 3 },
      { name: '911',       yearFrom: 1963, sortOrder: 4 },
    ],
  },
  {
    name: 'Land Rover',
    isLocal: false,
    sortOrder: 55,
    models: [
      { name: 'Range Rover',       yearFrom: 1970, sortOrder: 1 },
      { name: 'Range Rover Sport', yearFrom: 2005, sortOrder: 2 },
      { name: 'Discovery',         yearFrom: 1989, sortOrder: 3 },
      { name: 'Defender',          yearFrom: 1983, sortOrder: 4 },
      { name: 'Freelander',        yearFrom: 1997, yearTo: 2015, sortOrder: 5 },
    ],
  },
  {
    name: 'Opel / Vauxhall',
    isLocal: false,
    sortOrder: 56,
    models: [
      { name: 'Astra',   yearFrom: 1991, sortOrder: 1 },
      { name: 'Vectra',  yearFrom: 1988, yearTo: 2008, sortOrder: 2 },
      { name: 'Zafira',  yearFrom: 1999, sortOrder: 3 },
      { name: 'Mokka',   yearFrom: 2012, sortOrder: 4 },
    ],
  },

  // ── American brands ──────────────────────────────────────────────────────────
  {
    name: 'Ford',
    isLocal: false,
    sortOrder: 60,
    models: [
      { name: 'Focus',    yearFrom: 1998, sortOrder: 1 },
      { name: 'Mondeo',   yearFrom: 1993, sortOrder: 2 },
      { name: 'Explorer', yearFrom: 1990, sortOrder: 3 },
      { name: 'F-150',    yearFrom: 1975, sortOrder: 4 },
      { name: 'Transit',  yearFrom: 1965, sortOrder: 5 },
      { name: 'Ranger',   yearFrom: 1983, sortOrder: 6 },
      { name: 'Kuga',     yearFrom: 2008, sortOrder: 7 },
    ],
  },
  {
    name: 'Jeep',
    isLocal: false,
    sortOrder: 61,
    models: [
      { name: 'Wrangler',    yearFrom: 1986, sortOrder: 1 },
      { name: 'Grand Cherokee', yearFrom: 1992, sortOrder: 2 },
      { name: 'Compass',     yearFrom: 2006, sortOrder: 3 },
      { name: 'Cherokee',    yearFrom: 1974, sortOrder: 4 },
    ],
  },

  // ── Russian brands ───────────────────────────────────────────────────────────
  {
    name: 'LADA (ВАЗ)',
    isLocal: false,
    sortOrder: 70,
    models: [
      { name: '2107',    yearFrom: 1982, yearTo: 2012, sortOrder: 1 },
      { name: 'Niva',    yearFrom: 1977, sortOrder: 2 },
      { name: 'Granta',  yearFrom: 2011, sortOrder: 3 },
      { name: 'Vesta',   yearFrom: 2015, sortOrder: 4 },
      { name: 'Largus',  yearFrom: 2012, sortOrder: 5 },
      { name: 'XRAY',    yearFrom: 2015, sortOrder: 6 },
    ],
  },
  {
    name: 'UAZ',
    isLocal: false,
    sortOrder: 71,
    models: [
      { name: 'Patriot', yearFrom: 2005, sortOrder: 1 },
      { name: 'Hunter',  yearFrom: 2003, sortOrder: 2 },
      { name: '469',     yearFrom: 1972, yearTo: 2003, sortOrder: 3 },
    ],
  },

  // ── Other / Custom ───────────────────────────────────────────────────────────
  {
    name: 'Boshqa marka / Другая марка',
    isLocal: false,
    sortOrder: 99,
    models: [
      { name: 'Boshqa model / Другая модель', sortOrder: 1 },
    ],
  },
];

async function main() {
  console.log('Clearing car data...');
  await prisma.carModel.deleteMany();
  await prisma.carMake.deleteMany();

  console.log('Seeding car makes and models...');
  let totalModels = 0;

  for (const make of MAKES) {
    const created = await prisma.carMake.create({
      data: {
        name: make.name,
        isLocal: make.isLocal,
        sortOrder: make.sortOrder,
      },
    });

    for (const model of make.models) {
      await prisma.carModel.create({
        data: {
          makeId: created.id,
          name: model.name,
          yearFrom: model.yearFrom,
          yearTo: model.yearTo,
          sortOrder: model.sortOrder,
        },
      });
    }

    const flag = make.isLocal ? '🇺🇿' : '  ';
    console.log(`  ${flag} ${make.name} (${make.models.length} models)`);
    totalModels += make.models.length;
  }

  console.log(`\n✅ Seeded ${MAKES.length} makes, ${totalModels} models`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
