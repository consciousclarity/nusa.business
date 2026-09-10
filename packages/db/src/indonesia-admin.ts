/**
 * Indonesia administrative geography — 38 provinces and 514 kabupaten/kota.
 *
 * Names and BPS codes adapted from kode-wilayah-id (MIT,
 * Copyright (c) 2025 Sumitro Aji Prabowo), itself compiled from BPS /
 * Kemendagri wilayah data. See docs/architecture/adr/007-province-hosts.md.
 *
 * Host grammar is unchanged: {kabupaten|kota}.{province}.nusa.business
 * The Island row is the province hub. Geographic island groups (Java,
 * Sumatra, …) are region hubs in seed-data, not this file.
 */
export type AdminProvince = {
  id: string;
  slug: string;
  name: string;
  bpsCode: string;
  region: string;
  tagline: string;
};

export type AdminRegency = {
  id: string;
  islandId: string;
  slug: string;
  name: string;
  type: "kabupaten" | "kota";
  bpsCode: string;
  summary: string;
};

export const ADMIN_PROVINCE_COUNT = 38;
export const ADMIN_REGENCY_COUNT = 514;

export const ADMIN_PROVINCES: AdminProvince[] = [
  {
    "id": "isl-aceh",
    "slug": "aceh",
    "name": "Aceh",
    "bpsCode": "11",
    "region": "sumatra",
    "tagline": "From Banda Aceh to the west-coast islands."
  },
  {
    "id": "isl-sumatera-utara",
    "slug": "sumatera-utara",
    "name": "Sumatera Utara",
    "bpsCode": "12",
    "region": "sumatra",
    "tagline": "Medan, Danau Toba, and the Batak highlands."
  },
  {
    "id": "isl-sumatera-barat",
    "slug": "sumatera-barat",
    "name": "Sumatera Barat",
    "bpsCode": "13",
    "region": "sumatra",
    "tagline": "Padang, Minangkabau, and the west-coast surf."
  },
  {
    "id": "isl-riau",
    "slug": "riau",
    "name": "Riau",
    "bpsCode": "14",
    "region": "sumatra",
    "tagline": "Pekanbaru, the strait, and mainland Riau."
  },
  {
    "id": "isl-jambi",
    "slug": "jambi",
    "name": "Jambi",
    "bpsCode": "15",
    "region": "sumatra",
    "tagline": "The Batanghari basin and Kerinci highlands."
  },
  {
    "id": "isl-sumatera-selatan",
    "slug": "sumatera-selatan",
    "name": "Sumatera Selatan",
    "bpsCode": "16",
    "region": "sumatra",
    "tagline": "Palembang and the Musi river cities."
  },
  {
    "id": "isl-bengkulu",
    "slug": "bengkulu",
    "name": "Bengkulu",
    "bpsCode": "17",
    "region": "sumatra",
    "tagline": "The southwest Sumatran coast."
  },
  {
    "id": "isl-lampung",
    "slug": "lampung",
    "name": "Lampung",
    "bpsCode": "18",
    "region": "sumatra",
    "tagline": "The southern gate of Sumatra."
  },
  {
    "id": "isl-kepulauan-bangka-belitung",
    "slug": "kepulauan-bangka-belitung",
    "name": "Kepulauan Bangka Belitung",
    "bpsCode": "19",
    "region": "sumatra",
    "tagline": "Tin islands, granite, and white-sand beaches."
  },
  {
    "id": "isl-kepulauan-riau",
    "slug": "kepulauan-riau",
    "name": "Kepulauan Riau",
    "bpsCode": "21",
    "region": "sumatra",
    "tagline": "Batam, Bintan, and the Riau archipelago."
  },
  {
    "id": "isl-dki-jakarta",
    "slug": "dki-jakarta",
    "name": "DKI Jakarta",
    "bpsCode": "31",
    "region": "java",
    "tagline": "The capital metro — five cities and Kepulauan Seribu."
  },
  {
    "id": "isl-jawa-barat",
    "slug": "jawa-barat",
    "name": "Jawa Barat",
    "bpsCode": "32",
    "region": "java",
    "tagline": "Bandung, the Priangan highlands, and the north coast."
  },
  {
    "id": "isl-jawa-tengah",
    "slug": "jawa-tengah",
    "name": "Jawa Tengah",
    "bpsCode": "33",
    "region": "java",
    "tagline": "Semarang, Solo, and the island’s cultural heartland."
  },
  {
    "id": "isl-di-yogyakarta",
    "slug": "di-yogyakarta",
    "name": "DI Yogyakarta",
    "bpsCode": "34",
    "region": "java",
    "tagline": "The sultanate, Malioboro, and the temple plains."
  },
  {
    "id": "isl-jawa-timur",
    "slug": "jawa-timur",
    "name": "Jawa Timur",
    "bpsCode": "35",
    "region": "java",
    "tagline": "Surabaya, Malang, and the east-Java coast."
  },
  {
    "id": "isl-banten",
    "slug": "banten",
    "name": "Banten",
    "bpsCode": "36",
    "region": "java",
    "tagline": "The west-Java strait, Tangerang, and Ujung Kulon."
  },
  {
    "id": "isl-bali",
    "slug": "bali",
    "name": "Bali",
    "bpsCode": "51",
    "region": "bali",
    "tagline": "Island of the Gods — local businesses for visitors and locals."
  },
  {
    "id": "isl-nusa-tenggara-barat",
    "slug": "nusa-tenggara-barat",
    "name": "Nusa Tenggara Barat",
    "bpsCode": "52",
    "region": "nusa-tenggara",
    "tagline": "Lombok, Sumbawa, and the Gili islands."
  },
  {
    "id": "isl-nusa-tenggara-timur",
    "slug": "nusa-tenggara-timur",
    "name": "Nusa Tenggara Timur",
    "bpsCode": "53",
    "region": "nusa-tenggara",
    "tagline": "Flores, Kupang, Komodo, and the dry islands."
  },
  {
    "id": "isl-kalimantan-barat",
    "slug": "kalimantan-barat",
    "name": "Kalimantan Barat",
    "bpsCode": "61",
    "region": "kalimantan",
    "tagline": "Pontianak and West Borneo’s rivers."
  },
  {
    "id": "isl-kalimantan-tengah",
    "slug": "kalimantan-tengah",
    "name": "Kalimantan Tengah",
    "bpsCode": "62",
    "region": "kalimantan",
    "tagline": "Palangka Raya and Central Borneo."
  },
  {
    "id": "isl-kalimantan-selatan",
    "slug": "kalimantan-selatan",
    "name": "Kalimantan Selatan",
    "bpsCode": "63",
    "region": "kalimantan",
    "tagline": "Banjarmasin and the southern rivers."
  },
  {
    "id": "isl-kalimantan-timur",
    "slug": "kalimantan-timur",
    "name": "Kalimantan Timur",
    "bpsCode": "64",
    "region": "kalimantan",
    "tagline": "Samarinda, Balikpapan, and the Mahakam."
  },
  {
    "id": "isl-kalimantan-utara",
    "slug": "kalimantan-utara",
    "name": "Kalimantan Utara",
    "bpsCode": "65",
    "region": "kalimantan",
    "tagline": "Tarakan and the northern Borneo coast."
  },
  {
    "id": "isl-sulawesi-utara",
    "slug": "sulawesi-utara",
    "name": "Sulawesi Utara",
    "bpsCode": "71",
    "region": "sulawesi",
    "tagline": "Manado, Bunaken, and Minahasa."
  },
  {
    "id": "isl-sulawesi-tengah",
    "slug": "sulawesi-tengah",
    "name": "Sulawesi Tengah",
    "bpsCode": "72",
    "region": "sulawesi",
    "tagline": "Palu and the central peninsula."
  },
  {
    "id": "isl-sulawesi-selatan",
    "slug": "sulawesi-selatan",
    "name": "Sulawesi Selatan",
    "bpsCode": "73",
    "region": "sulawesi",
    "tagline": "Makassar, Toraja, and the south peninsula."
  },
  {
    "id": "isl-sulawesi-tenggara",
    "slug": "sulawesi-tenggara",
    "name": "Sulawesi Tenggara",
    "bpsCode": "74",
    "region": "sulawesi",
    "tagline": "Kendari and the southeast islands."
  },
  {
    "id": "isl-gorontalo",
    "slug": "gorontalo",
    "name": "Gorontalo",
    "bpsCode": "75",
    "region": "sulawesi",
    "tagline": "The northern Tomini coast."
  },
  {
    "id": "isl-sulawesi-barat",
    "slug": "sulawesi-barat",
    "name": "Sulawesi Barat",
    "bpsCode": "76",
    "region": "sulawesi",
    "tagline": "Mamuju and the west-Sulawesi shore."
  },
  {
    "id": "isl-maluku",
    "slug": "maluku",
    "name": "Maluku",
    "bpsCode": "81",
    "region": "maluku",
    "tagline": "Ambon and the spice islands."
  },
  {
    "id": "isl-maluku-utara",
    "slug": "maluku-utara",
    "name": "Maluku Utara",
    "bpsCode": "82",
    "region": "maluku",
    "tagline": "Ternate, Tidore, and Halmahera."
  },
  {
    "id": "isl-papua-barat",
    "slug": "papua-barat",
    "name": "Papua Barat",
    "bpsCode": "91",
    "region": "papua",
    "tagline": "Manokwari and the Bird’s Head interior."
  },
  {
    "id": "isl-papua-barat-daya",
    "slug": "papua-barat-daya",
    "name": "Papua Barat Daya",
    "bpsCode": "92",
    "region": "papua",
    "tagline": "Sorong and the southwest Bird’s Head."
  },
  {
    "id": "isl-papua",
    "slug": "papua",
    "name": "Papua",
    "bpsCode": "94",
    "region": "papua",
    "tagline": "Jayapura and the northern Papua coast."
  },
  {
    "id": "isl-papua-selatan",
    "slug": "papua-selatan",
    "name": "Papua Selatan",
    "bpsCode": "95",
    "region": "papua",
    "tagline": "Merauke and the southern plains."
  },
  {
    "id": "isl-papua-tengah",
    "slug": "papua-tengah",
    "name": "Papua Tengah",
    "bpsCode": "96",
    "region": "papua",
    "tagline": "Nabire and the central highlands coast."
  },
  {
    "id": "isl-papua-pegunungan",
    "slug": "papua-pegunungan",
    "name": "Papua Pegunungan",
    "bpsCode": "97",
    "region": "papua",
    "tagline": "Jayawijaya and the high mountain valleys."
  }
];

export const ADMIN_REGENCIES: AdminRegency[] = [
  {
    "id": "pl-adm-1101",
    "islandId": "isl-aceh",
    "slug": "simeulue",
    "name": "Simeulue",
    "type": "kabupaten",
    "bpsCode": "1101",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1102",
    "islandId": "isl-aceh",
    "slug": "aceh-singkil",
    "name": "Aceh Singkil",
    "type": "kabupaten",
    "bpsCode": "1102",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1103",
    "islandId": "isl-aceh",
    "slug": "aceh-selatan",
    "name": "Aceh Selatan",
    "type": "kabupaten",
    "bpsCode": "1103",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1104",
    "islandId": "isl-aceh",
    "slug": "aceh-tenggara",
    "name": "Aceh Tenggara",
    "type": "kabupaten",
    "bpsCode": "1104",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1105",
    "islandId": "isl-aceh",
    "slug": "aceh-timur",
    "name": "Aceh Timur",
    "type": "kabupaten",
    "bpsCode": "1105",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1106",
    "islandId": "isl-aceh",
    "slug": "aceh-tengah",
    "name": "Aceh Tengah",
    "type": "kabupaten",
    "bpsCode": "1106",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1107",
    "islandId": "isl-aceh",
    "slug": "aceh-barat",
    "name": "Aceh Barat",
    "type": "kabupaten",
    "bpsCode": "1107",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1108",
    "islandId": "isl-aceh",
    "slug": "aceh-besar",
    "name": "Aceh Besar",
    "type": "kabupaten",
    "bpsCode": "1108",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1109",
    "islandId": "isl-aceh",
    "slug": "pidie",
    "name": "Pidie",
    "type": "kabupaten",
    "bpsCode": "1109",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1110",
    "islandId": "isl-aceh",
    "slug": "bireuen",
    "name": "Bireuen",
    "type": "kabupaten",
    "bpsCode": "1110",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1111",
    "islandId": "isl-aceh",
    "slug": "aceh-utara",
    "name": "Aceh Utara",
    "type": "kabupaten",
    "bpsCode": "1111",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1112",
    "islandId": "isl-aceh",
    "slug": "aceh-barat-daya",
    "name": "Aceh Barat Daya",
    "type": "kabupaten",
    "bpsCode": "1112",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1113",
    "islandId": "isl-aceh",
    "slug": "gayo-lues",
    "name": "Gayo Lues",
    "type": "kabupaten",
    "bpsCode": "1113",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1114",
    "islandId": "isl-aceh",
    "slug": "aceh-tamiang",
    "name": "Aceh Tamiang",
    "type": "kabupaten",
    "bpsCode": "1114",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1115",
    "islandId": "isl-aceh",
    "slug": "nagan-raya",
    "name": "Nagan Raya",
    "type": "kabupaten",
    "bpsCode": "1115",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1116",
    "islandId": "isl-aceh",
    "slug": "aceh-jaya",
    "name": "Aceh Jaya",
    "type": "kabupaten",
    "bpsCode": "1116",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1117",
    "islandId": "isl-aceh",
    "slug": "bener-meriah",
    "name": "Bener Meriah",
    "type": "kabupaten",
    "bpsCode": "1117",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1118",
    "islandId": "isl-aceh",
    "slug": "pidie-jaya",
    "name": "Pidie Jaya",
    "type": "kabupaten",
    "bpsCode": "1118",
    "summary": "Regency in Aceh."
  },
  {
    "id": "pl-adm-1171",
    "islandId": "isl-aceh",
    "slug": "banda-aceh",
    "name": "Banda Aceh",
    "type": "kota",
    "bpsCode": "1171",
    "summary": "City in Aceh."
  },
  {
    "id": "pl-adm-1172",
    "islandId": "isl-aceh",
    "slug": "sabang",
    "name": "Sabang",
    "type": "kota",
    "bpsCode": "1172",
    "summary": "City in Aceh."
  },
  {
    "id": "pl-adm-1173",
    "islandId": "isl-aceh",
    "slug": "langsa",
    "name": "Langsa",
    "type": "kota",
    "bpsCode": "1173",
    "summary": "City in Aceh."
  },
  {
    "id": "pl-adm-1174",
    "islandId": "isl-aceh",
    "slug": "lhokseumawe",
    "name": "Lhokseumawe",
    "type": "kota",
    "bpsCode": "1174",
    "summary": "City in Aceh."
  },
  {
    "id": "pl-adm-1175",
    "islandId": "isl-aceh",
    "slug": "subulussalam",
    "name": "Subulussalam",
    "type": "kota",
    "bpsCode": "1175",
    "summary": "City in Aceh."
  },
  {
    "id": "pl-adm-1201",
    "islandId": "isl-sumatera-utara",
    "slug": "nias",
    "name": "Nias",
    "type": "kabupaten",
    "bpsCode": "1201",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1202",
    "islandId": "isl-sumatera-utara",
    "slug": "mandailing-natal",
    "name": "Mandailing Natal",
    "type": "kabupaten",
    "bpsCode": "1202",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1203",
    "islandId": "isl-sumatera-utara",
    "slug": "tapanuli-selatan",
    "name": "Tapanuli Selatan",
    "type": "kabupaten",
    "bpsCode": "1203",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1204",
    "islandId": "isl-sumatera-utara",
    "slug": "tapanuli-tengah",
    "name": "Tapanuli Tengah",
    "type": "kabupaten",
    "bpsCode": "1204",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1205",
    "islandId": "isl-sumatera-utara",
    "slug": "tapanuli-utara",
    "name": "Tapanuli Utara",
    "type": "kabupaten",
    "bpsCode": "1205",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1206",
    "islandId": "isl-sumatera-utara",
    "slug": "toba",
    "name": "Toba",
    "type": "kabupaten",
    "bpsCode": "1206",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1207",
    "islandId": "isl-sumatera-utara",
    "slug": "labuhanbatu",
    "name": "Labuhanbatu",
    "type": "kabupaten",
    "bpsCode": "1207",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1208",
    "islandId": "isl-sumatera-utara",
    "slug": "asahan",
    "name": "Asahan",
    "type": "kabupaten",
    "bpsCode": "1208",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1209",
    "islandId": "isl-sumatera-utara",
    "slug": "simalungun",
    "name": "Simalungun",
    "type": "kabupaten",
    "bpsCode": "1209",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1210",
    "islandId": "isl-sumatera-utara",
    "slug": "dairi",
    "name": "Dairi",
    "type": "kabupaten",
    "bpsCode": "1210",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1211",
    "islandId": "isl-sumatera-utara",
    "slug": "karo",
    "name": "Karo",
    "type": "kabupaten",
    "bpsCode": "1211",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1212",
    "islandId": "isl-sumatera-utara",
    "slug": "deli-serdang",
    "name": "Deli Serdang",
    "type": "kabupaten",
    "bpsCode": "1212",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1213",
    "islandId": "isl-sumatera-utara",
    "slug": "langkat",
    "name": "Langkat",
    "type": "kabupaten",
    "bpsCode": "1213",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1214",
    "islandId": "isl-sumatera-utara",
    "slug": "nias-selatan",
    "name": "Nias Selatan",
    "type": "kabupaten",
    "bpsCode": "1214",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1215",
    "islandId": "isl-sumatera-utara",
    "slug": "humbang-hasundutan",
    "name": "Humbang Hasundutan",
    "type": "kabupaten",
    "bpsCode": "1215",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1216",
    "islandId": "isl-sumatera-utara",
    "slug": "pakpak-bharat",
    "name": "Pakpak Bharat",
    "type": "kabupaten",
    "bpsCode": "1216",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1217",
    "islandId": "isl-sumatera-utara",
    "slug": "samosir",
    "name": "Samosir",
    "type": "kabupaten",
    "bpsCode": "1217",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1218",
    "islandId": "isl-sumatera-utara",
    "slug": "serdang-bedagai",
    "name": "Serdang Bedagai",
    "type": "kabupaten",
    "bpsCode": "1218",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1219",
    "islandId": "isl-sumatera-utara",
    "slug": "batu-bara",
    "name": "Batu Bara",
    "type": "kabupaten",
    "bpsCode": "1219",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1220",
    "islandId": "isl-sumatera-utara",
    "slug": "padang-lawas-utara",
    "name": "Padang Lawas Utara",
    "type": "kabupaten",
    "bpsCode": "1220",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1221",
    "islandId": "isl-sumatera-utara",
    "slug": "padang-lawas",
    "name": "Padang Lawas",
    "type": "kabupaten",
    "bpsCode": "1221",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1222",
    "islandId": "isl-sumatera-utara",
    "slug": "labuhanbatu-selatan",
    "name": "Labuhanbatu Selatan",
    "type": "kabupaten",
    "bpsCode": "1222",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1223",
    "islandId": "isl-sumatera-utara",
    "slug": "labuhanbatu-utara",
    "name": "Labuhanbatu Utara",
    "type": "kabupaten",
    "bpsCode": "1223",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1224",
    "islandId": "isl-sumatera-utara",
    "slug": "nias-utara",
    "name": "Nias Utara",
    "type": "kabupaten",
    "bpsCode": "1224",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1225",
    "islandId": "isl-sumatera-utara",
    "slug": "nias-barat",
    "name": "Nias Barat",
    "type": "kabupaten",
    "bpsCode": "1225",
    "summary": "Regency in Sumatera Utara."
  },
  {
    "id": "pl-adm-1271",
    "islandId": "isl-sumatera-utara",
    "slug": "sibolga",
    "name": "Sibolga",
    "type": "kota",
    "bpsCode": "1271",
    "summary": "City in Sumatera Utara."
  },
  {
    "id": "pl-adm-1272",
    "islandId": "isl-sumatera-utara",
    "slug": "tanjung-balai",
    "name": "Tanjung Balai",
    "type": "kota",
    "bpsCode": "1272",
    "summary": "City in Sumatera Utara."
  },
  {
    "id": "pl-adm-1273",
    "islandId": "isl-sumatera-utara",
    "slug": "pematangsiantar",
    "name": "Pematangsiantar",
    "type": "kota",
    "bpsCode": "1273",
    "summary": "City in Sumatera Utara."
  },
  {
    "id": "pl-adm-1274",
    "islandId": "isl-sumatera-utara",
    "slug": "tebing-tinggi",
    "name": "Tebing Tinggi",
    "type": "kota",
    "bpsCode": "1274",
    "summary": "City in Sumatera Utara."
  },
  {
    "id": "pl-medan",
    "islandId": "isl-sumatera-utara",
    "slug": "medan",
    "name": "Medan",
    "type": "kota",
    "bpsCode": "1275",
    "summary": "City in Sumatera Utara."
  },
  {
    "id": "pl-adm-1276",
    "islandId": "isl-sumatera-utara",
    "slug": "binjai",
    "name": "Binjai",
    "type": "kota",
    "bpsCode": "1276",
    "summary": "City in Sumatera Utara."
  },
  {
    "id": "pl-adm-1277",
    "islandId": "isl-sumatera-utara",
    "slug": "padang-sidempuan",
    "name": "Padang Sidempuan",
    "type": "kota",
    "bpsCode": "1277",
    "summary": "City in Sumatera Utara."
  },
  {
    "id": "pl-adm-1278",
    "islandId": "isl-sumatera-utara",
    "slug": "gunungsitoli",
    "name": "Gunungsitoli",
    "type": "kota",
    "bpsCode": "1278",
    "summary": "City in Sumatera Utara."
  },
  {
    "id": "pl-adm-1301",
    "islandId": "isl-sumatera-barat",
    "slug": "kepulauan-mentawai",
    "name": "Kepulauan Mentawai",
    "type": "kabupaten",
    "bpsCode": "1301",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1302",
    "islandId": "isl-sumatera-barat",
    "slug": "pesisir-selatan",
    "name": "Pesisir Selatan",
    "type": "kabupaten",
    "bpsCode": "1302",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1303",
    "islandId": "isl-sumatera-barat",
    "slug": "kabupaten-solok",
    "name": "Solok",
    "type": "kabupaten",
    "bpsCode": "1303",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1304",
    "islandId": "isl-sumatera-barat",
    "slug": "sijunjung",
    "name": "Sijunjung",
    "type": "kabupaten",
    "bpsCode": "1304",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1305",
    "islandId": "isl-sumatera-barat",
    "slug": "tanah-datar",
    "name": "Tanah Datar",
    "type": "kabupaten",
    "bpsCode": "1305",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1306",
    "islandId": "isl-sumatera-barat",
    "slug": "padang-pariaman",
    "name": "Padang Pariaman",
    "type": "kabupaten",
    "bpsCode": "1306",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1307",
    "islandId": "isl-sumatera-barat",
    "slug": "agam",
    "name": "Agam",
    "type": "kabupaten",
    "bpsCode": "1307",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1308",
    "islandId": "isl-sumatera-barat",
    "slug": "lima-puluh-kota",
    "name": "Lima Puluh Kota",
    "type": "kabupaten",
    "bpsCode": "1308",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1309",
    "islandId": "isl-sumatera-barat",
    "slug": "pasaman",
    "name": "Pasaman",
    "type": "kabupaten",
    "bpsCode": "1309",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1310",
    "islandId": "isl-sumatera-barat",
    "slug": "solok-selatan",
    "name": "Solok Selatan",
    "type": "kabupaten",
    "bpsCode": "1310",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1311",
    "islandId": "isl-sumatera-barat",
    "slug": "dharmasraya",
    "name": "Dharmasraya",
    "type": "kabupaten",
    "bpsCode": "1311",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1312",
    "islandId": "isl-sumatera-barat",
    "slug": "pasaman-barat",
    "name": "Pasaman Barat",
    "type": "kabupaten",
    "bpsCode": "1312",
    "summary": "Regency in Sumatera Barat."
  },
  {
    "id": "pl-adm-1371",
    "islandId": "isl-sumatera-barat",
    "slug": "padang",
    "name": "Padang",
    "type": "kota",
    "bpsCode": "1371",
    "summary": "City in Sumatera Barat."
  },
  {
    "id": "pl-adm-1372",
    "islandId": "isl-sumatera-barat",
    "slug": "solok",
    "name": "Solok",
    "type": "kota",
    "bpsCode": "1372",
    "summary": "City in Sumatera Barat."
  },
  {
    "id": "pl-adm-1373",
    "islandId": "isl-sumatera-barat",
    "slug": "sawahlunto",
    "name": "Sawahlunto",
    "type": "kota",
    "bpsCode": "1373",
    "summary": "City in Sumatera Barat."
  },
  {
    "id": "pl-adm-1374",
    "islandId": "isl-sumatera-barat",
    "slug": "padang-panjang",
    "name": "Padang Panjang",
    "type": "kota",
    "bpsCode": "1374",
    "summary": "City in Sumatera Barat."
  },
  {
    "id": "pl-adm-1375",
    "islandId": "isl-sumatera-barat",
    "slug": "bukittinggi",
    "name": "Bukittinggi",
    "type": "kota",
    "bpsCode": "1375",
    "summary": "City in Sumatera Barat."
  },
  {
    "id": "pl-adm-1376",
    "islandId": "isl-sumatera-barat",
    "slug": "payakumbuh",
    "name": "Payakumbuh",
    "type": "kota",
    "bpsCode": "1376",
    "summary": "City in Sumatera Barat."
  },
  {
    "id": "pl-adm-1377",
    "islandId": "isl-sumatera-barat",
    "slug": "pariaman",
    "name": "Pariaman",
    "type": "kota",
    "bpsCode": "1377",
    "summary": "City in Sumatera Barat."
  },
  {
    "id": "pl-adm-1401",
    "islandId": "isl-riau",
    "slug": "kuantan-singingi",
    "name": "Kuantan Singingi",
    "type": "kabupaten",
    "bpsCode": "1401",
    "summary": "Regency in Riau."
  },
  {
    "id": "pl-adm-1402",
    "islandId": "isl-riau",
    "slug": "indragiri-hulu",
    "name": "Indragiri Hulu",
    "type": "kabupaten",
    "bpsCode": "1402",
    "summary": "Regency in Riau."
  },
  {
    "id": "pl-adm-1403",
    "islandId": "isl-riau",
    "slug": "indragiri-hilir",
    "name": "Indragiri Hilir",
    "type": "kabupaten",
    "bpsCode": "1403",
    "summary": "Regency in Riau."
  },
  {
    "id": "pl-adm-1404",
    "islandId": "isl-riau",
    "slug": "pelalawan",
    "name": "Pelalawan",
    "type": "kabupaten",
    "bpsCode": "1404",
    "summary": "Regency in Riau."
  },
  {
    "id": "pl-adm-1405",
    "islandId": "isl-riau",
    "slug": "siak",
    "name": "Siak",
    "type": "kabupaten",
    "bpsCode": "1405",
    "summary": "Regency in Riau."
  },
  {
    "id": "pl-adm-1406",
    "islandId": "isl-riau",
    "slug": "kampar",
    "name": "Kampar",
    "type": "kabupaten",
    "bpsCode": "1406",
    "summary": "Regency in Riau."
  },
  {
    "id": "pl-adm-1407",
    "islandId": "isl-riau",
    "slug": "rokan-hulu",
    "name": "Rokan Hulu",
    "type": "kabupaten",
    "bpsCode": "1407",
    "summary": "Regency in Riau."
  },
  {
    "id": "pl-adm-1408",
    "islandId": "isl-riau",
    "slug": "bengkalis",
    "name": "Bengkalis",
    "type": "kabupaten",
    "bpsCode": "1408",
    "summary": "Regency in Riau."
  },
  {
    "id": "pl-adm-1409",
    "islandId": "isl-riau",
    "slug": "rokan-hilir",
    "name": "Rokan Hilir",
    "type": "kabupaten",
    "bpsCode": "1409",
    "summary": "Regency in Riau."
  },
  {
    "id": "pl-adm-1410",
    "islandId": "isl-riau",
    "slug": "kepulauan-meranti",
    "name": "Kepulauan Meranti",
    "type": "kabupaten",
    "bpsCode": "1410",
    "summary": "Regency in Riau."
  },
  {
    "id": "pl-adm-1471",
    "islandId": "isl-riau",
    "slug": "pekanbaru",
    "name": "Pekanbaru",
    "type": "kota",
    "bpsCode": "1471",
    "summary": "City in Riau."
  },
  {
    "id": "pl-adm-1473",
    "islandId": "isl-riau",
    "slug": "dumai",
    "name": "Dumai",
    "type": "kota",
    "bpsCode": "1473",
    "summary": "City in Riau."
  },
  {
    "id": "pl-adm-1501",
    "islandId": "isl-jambi",
    "slug": "kerinci",
    "name": "Kerinci",
    "type": "kabupaten",
    "bpsCode": "1501",
    "summary": "Regency in Jambi."
  },
  {
    "id": "pl-adm-1502",
    "islandId": "isl-jambi",
    "slug": "merangin",
    "name": "Merangin",
    "type": "kabupaten",
    "bpsCode": "1502",
    "summary": "Regency in Jambi."
  },
  {
    "id": "pl-adm-1503",
    "islandId": "isl-jambi",
    "slug": "sarolangun",
    "name": "Sarolangun",
    "type": "kabupaten",
    "bpsCode": "1503",
    "summary": "Regency in Jambi."
  },
  {
    "id": "pl-adm-1504",
    "islandId": "isl-jambi",
    "slug": "batanghari",
    "name": "Batanghari",
    "type": "kabupaten",
    "bpsCode": "1504",
    "summary": "Regency in Jambi."
  },
  {
    "id": "pl-adm-1505",
    "islandId": "isl-jambi",
    "slug": "muaro-jambi",
    "name": "Muaro Jambi",
    "type": "kabupaten",
    "bpsCode": "1505",
    "summary": "Regency in Jambi."
  },
  {
    "id": "pl-adm-1506",
    "islandId": "isl-jambi",
    "slug": "tanjung-jabung-timur",
    "name": "Tanjung Jabung Timur",
    "type": "kabupaten",
    "bpsCode": "1506",
    "summary": "Regency in Jambi."
  },
  {
    "id": "pl-adm-1507",
    "islandId": "isl-jambi",
    "slug": "tanjung-jabung-barat",
    "name": "Tanjung Jabung Barat",
    "type": "kabupaten",
    "bpsCode": "1507",
    "summary": "Regency in Jambi."
  },
  {
    "id": "pl-adm-1508",
    "islandId": "isl-jambi",
    "slug": "tebo",
    "name": "Tebo",
    "type": "kabupaten",
    "bpsCode": "1508",
    "summary": "Regency in Jambi."
  },
  {
    "id": "pl-adm-1509",
    "islandId": "isl-jambi",
    "slug": "bungo",
    "name": "Bungo",
    "type": "kabupaten",
    "bpsCode": "1509",
    "summary": "Regency in Jambi."
  },
  {
    "id": "pl-adm-1571",
    "islandId": "isl-jambi",
    "slug": "jambi",
    "name": "Jambi",
    "type": "kota",
    "bpsCode": "1571",
    "summary": "City in Jambi."
  },
  {
    "id": "pl-adm-1572",
    "islandId": "isl-jambi",
    "slug": "sungai-penuh",
    "name": "Sungai Penuh",
    "type": "kota",
    "bpsCode": "1572",
    "summary": "City in Jambi."
  },
  {
    "id": "pl-adm-1601",
    "islandId": "isl-sumatera-selatan",
    "slug": "ogan-komering-ulu",
    "name": "Ogan Komering Ulu",
    "type": "kabupaten",
    "bpsCode": "1601",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1602",
    "islandId": "isl-sumatera-selatan",
    "slug": "ogan-komering-ilir",
    "name": "Ogan Komering Ilir",
    "type": "kabupaten",
    "bpsCode": "1602",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1603",
    "islandId": "isl-sumatera-selatan",
    "slug": "muara-enim",
    "name": "Muara Enim",
    "type": "kabupaten",
    "bpsCode": "1603",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1604",
    "islandId": "isl-sumatera-selatan",
    "slug": "lahat",
    "name": "Lahat",
    "type": "kabupaten",
    "bpsCode": "1604",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1605",
    "islandId": "isl-sumatera-selatan",
    "slug": "musi-rawas",
    "name": "Musi Rawas",
    "type": "kabupaten",
    "bpsCode": "1605",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1606",
    "islandId": "isl-sumatera-selatan",
    "slug": "musi-banyuasin",
    "name": "Musi Banyuasin",
    "type": "kabupaten",
    "bpsCode": "1606",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1607",
    "islandId": "isl-sumatera-selatan",
    "slug": "banyuasin",
    "name": "Banyuasin",
    "type": "kabupaten",
    "bpsCode": "1607",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1608",
    "islandId": "isl-sumatera-selatan",
    "slug": "ogan-komering-ulu-selatan",
    "name": "Ogan Komering Ulu Selatan",
    "type": "kabupaten",
    "bpsCode": "1608",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1609",
    "islandId": "isl-sumatera-selatan",
    "slug": "ogan-komering-ulu-timur",
    "name": "Ogan Komering Ulu Timur",
    "type": "kabupaten",
    "bpsCode": "1609",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1610",
    "islandId": "isl-sumatera-selatan",
    "slug": "ogan-ilir",
    "name": "Ogan Ilir",
    "type": "kabupaten",
    "bpsCode": "1610",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1611",
    "islandId": "isl-sumatera-selatan",
    "slug": "empat-lawang",
    "name": "Empat Lawang",
    "type": "kabupaten",
    "bpsCode": "1611",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1612",
    "islandId": "isl-sumatera-selatan",
    "slug": "penukal-abab-lematang-ilir",
    "name": "Penukal Abab Lematang Ilir",
    "type": "kabupaten",
    "bpsCode": "1612",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1613",
    "islandId": "isl-sumatera-selatan",
    "slug": "musi-rawas-utara",
    "name": "Musi Rawas Utara",
    "type": "kabupaten",
    "bpsCode": "1613",
    "summary": "Regency in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1671",
    "islandId": "isl-sumatera-selatan",
    "slug": "palembang",
    "name": "Palembang",
    "type": "kota",
    "bpsCode": "1671",
    "summary": "City in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1672",
    "islandId": "isl-sumatera-selatan",
    "slug": "prabumulih",
    "name": "Prabumulih",
    "type": "kota",
    "bpsCode": "1672",
    "summary": "City in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1673",
    "islandId": "isl-sumatera-selatan",
    "slug": "pagar-alam",
    "name": "Pagar Alam",
    "type": "kota",
    "bpsCode": "1673",
    "summary": "City in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1674",
    "islandId": "isl-sumatera-selatan",
    "slug": "lubuk-linggau",
    "name": "Lubuk Linggau",
    "type": "kota",
    "bpsCode": "1674",
    "summary": "City in Sumatera Selatan."
  },
  {
    "id": "pl-adm-1701",
    "islandId": "isl-bengkulu",
    "slug": "bengkulu-selatan",
    "name": "Bengkulu Selatan",
    "type": "kabupaten",
    "bpsCode": "1701",
    "summary": "Regency in Bengkulu."
  },
  {
    "id": "pl-adm-1702",
    "islandId": "isl-bengkulu",
    "slug": "rejang-lebong",
    "name": "Rejang Lebong",
    "type": "kabupaten",
    "bpsCode": "1702",
    "summary": "Regency in Bengkulu."
  },
  {
    "id": "pl-adm-1703",
    "islandId": "isl-bengkulu",
    "slug": "bengkulu-utara",
    "name": "Bengkulu Utara",
    "type": "kabupaten",
    "bpsCode": "1703",
    "summary": "Regency in Bengkulu."
  },
  {
    "id": "pl-adm-1704",
    "islandId": "isl-bengkulu",
    "slug": "kaur",
    "name": "Kaur",
    "type": "kabupaten",
    "bpsCode": "1704",
    "summary": "Regency in Bengkulu."
  },
  {
    "id": "pl-adm-1705",
    "islandId": "isl-bengkulu",
    "slug": "seluma",
    "name": "Seluma",
    "type": "kabupaten",
    "bpsCode": "1705",
    "summary": "Regency in Bengkulu."
  },
  {
    "id": "pl-adm-1706",
    "islandId": "isl-bengkulu",
    "slug": "muko-muko",
    "name": "Muko Muko",
    "type": "kabupaten",
    "bpsCode": "1706",
    "summary": "Regency in Bengkulu."
  },
  {
    "id": "pl-adm-1707",
    "islandId": "isl-bengkulu",
    "slug": "lebong",
    "name": "Lebong",
    "type": "kabupaten",
    "bpsCode": "1707",
    "summary": "Regency in Bengkulu."
  },
  {
    "id": "pl-adm-1708",
    "islandId": "isl-bengkulu",
    "slug": "kepahiang",
    "name": "Kepahiang",
    "type": "kabupaten",
    "bpsCode": "1708",
    "summary": "Regency in Bengkulu."
  },
  {
    "id": "pl-adm-1709",
    "islandId": "isl-bengkulu",
    "slug": "bengkulu-tengah",
    "name": "Bengkulu Tengah",
    "type": "kabupaten",
    "bpsCode": "1709",
    "summary": "Regency in Bengkulu."
  },
  {
    "id": "pl-adm-1771",
    "islandId": "isl-bengkulu",
    "slug": "bengkulu",
    "name": "Bengkulu",
    "type": "kota",
    "bpsCode": "1771",
    "summary": "City in Bengkulu."
  },
  {
    "id": "pl-adm-1801",
    "islandId": "isl-lampung",
    "slug": "lampung-barat",
    "name": "Lampung Barat",
    "type": "kabupaten",
    "bpsCode": "1801",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1802",
    "islandId": "isl-lampung",
    "slug": "tanggamus",
    "name": "Tanggamus",
    "type": "kabupaten",
    "bpsCode": "1802",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1803",
    "islandId": "isl-lampung",
    "slug": "lampung-selatan",
    "name": "Lampung Selatan",
    "type": "kabupaten",
    "bpsCode": "1803",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1804",
    "islandId": "isl-lampung",
    "slug": "lampung-timur",
    "name": "Lampung Timur",
    "type": "kabupaten",
    "bpsCode": "1804",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1805",
    "islandId": "isl-lampung",
    "slug": "lampung-tengah",
    "name": "Lampung Tengah",
    "type": "kabupaten",
    "bpsCode": "1805",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1806",
    "islandId": "isl-lampung",
    "slug": "lampung-utara",
    "name": "Lampung Utara",
    "type": "kabupaten",
    "bpsCode": "1806",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1807",
    "islandId": "isl-lampung",
    "slug": "way-kanan",
    "name": "Way Kanan",
    "type": "kabupaten",
    "bpsCode": "1807",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1808",
    "islandId": "isl-lampung",
    "slug": "tulang-bawang",
    "name": "Tulang Bawang",
    "type": "kabupaten",
    "bpsCode": "1808",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1809",
    "islandId": "isl-lampung",
    "slug": "pesawaran",
    "name": "Pesawaran",
    "type": "kabupaten",
    "bpsCode": "1809",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1810",
    "islandId": "isl-lampung",
    "slug": "pringsewu",
    "name": "Pringsewu",
    "type": "kabupaten",
    "bpsCode": "1810",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1811",
    "islandId": "isl-lampung",
    "slug": "mesuji",
    "name": "Mesuji",
    "type": "kabupaten",
    "bpsCode": "1811",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1812",
    "islandId": "isl-lampung",
    "slug": "tulang-bawang-barat",
    "name": "Tulang Bawang Barat",
    "type": "kabupaten",
    "bpsCode": "1812",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1813",
    "islandId": "isl-lampung",
    "slug": "pesisir-barat",
    "name": "Pesisir Barat",
    "type": "kabupaten",
    "bpsCode": "1813",
    "summary": "Regency in Lampung."
  },
  {
    "id": "pl-adm-1871",
    "islandId": "isl-lampung",
    "slug": "bandar-lampung",
    "name": "Bandar Lampung",
    "type": "kota",
    "bpsCode": "1871",
    "summary": "City in Lampung."
  },
  {
    "id": "pl-adm-1872",
    "islandId": "isl-lampung",
    "slug": "metro",
    "name": "Metro",
    "type": "kota",
    "bpsCode": "1872",
    "summary": "City in Lampung."
  },
  {
    "id": "pl-adm-1901",
    "islandId": "isl-kepulauan-bangka-belitung",
    "slug": "bangka",
    "name": "Bangka",
    "type": "kabupaten",
    "bpsCode": "1901",
    "summary": "Regency in Kepulauan Bangka Belitung."
  },
  {
    "id": "pl-adm-1902",
    "islandId": "isl-kepulauan-bangka-belitung",
    "slug": "belitung",
    "name": "Belitung",
    "type": "kabupaten",
    "bpsCode": "1902",
    "summary": "Regency in Kepulauan Bangka Belitung."
  },
  {
    "id": "pl-adm-1903",
    "islandId": "isl-kepulauan-bangka-belitung",
    "slug": "bangka-barat",
    "name": "Bangka Barat",
    "type": "kabupaten",
    "bpsCode": "1903",
    "summary": "Regency in Kepulauan Bangka Belitung."
  },
  {
    "id": "pl-adm-1904",
    "islandId": "isl-kepulauan-bangka-belitung",
    "slug": "bangka-tengah",
    "name": "Bangka Tengah",
    "type": "kabupaten",
    "bpsCode": "1904",
    "summary": "Regency in Kepulauan Bangka Belitung."
  },
  {
    "id": "pl-adm-1905",
    "islandId": "isl-kepulauan-bangka-belitung",
    "slug": "bangka-selatan",
    "name": "Bangka Selatan",
    "type": "kabupaten",
    "bpsCode": "1905",
    "summary": "Regency in Kepulauan Bangka Belitung."
  },
  {
    "id": "pl-adm-1906",
    "islandId": "isl-kepulauan-bangka-belitung",
    "slug": "belitung-timur",
    "name": "Belitung Timur",
    "type": "kabupaten",
    "bpsCode": "1906",
    "summary": "Regency in Kepulauan Bangka Belitung."
  },
  {
    "id": "pl-adm-1971",
    "islandId": "isl-kepulauan-bangka-belitung",
    "slug": "pangkal-pinang",
    "name": "Pangkal Pinang",
    "type": "kota",
    "bpsCode": "1971",
    "summary": "City in Kepulauan Bangka Belitung."
  },
  {
    "id": "pl-adm-2101",
    "islandId": "isl-kepulauan-riau",
    "slug": "karimun",
    "name": "Karimun",
    "type": "kabupaten",
    "bpsCode": "2101",
    "summary": "Regency in Kepulauan Riau."
  },
  {
    "id": "pl-adm-2102",
    "islandId": "isl-kepulauan-riau",
    "slug": "bintan",
    "name": "Bintan",
    "type": "kabupaten",
    "bpsCode": "2102",
    "summary": "Regency in Kepulauan Riau."
  },
  {
    "id": "pl-adm-2103",
    "islandId": "isl-kepulauan-riau",
    "slug": "natuna",
    "name": "Natuna",
    "type": "kabupaten",
    "bpsCode": "2103",
    "summary": "Regency in Kepulauan Riau."
  },
  {
    "id": "pl-adm-2104",
    "islandId": "isl-kepulauan-riau",
    "slug": "lingga",
    "name": "Lingga",
    "type": "kabupaten",
    "bpsCode": "2104",
    "summary": "Regency in Kepulauan Riau."
  },
  {
    "id": "pl-adm-2105",
    "islandId": "isl-kepulauan-riau",
    "slug": "kepulauan-anambas",
    "name": "Kepulauan Anambas",
    "type": "kabupaten",
    "bpsCode": "2105",
    "summary": "Regency in Kepulauan Riau."
  },
  {
    "id": "pl-adm-2171",
    "islandId": "isl-kepulauan-riau",
    "slug": "batam",
    "name": "Batam",
    "type": "kota",
    "bpsCode": "2171",
    "summary": "City in Kepulauan Riau."
  },
  {
    "id": "pl-adm-2172",
    "islandId": "isl-kepulauan-riau",
    "slug": "tanjung-pinang",
    "name": "Tanjung Pinang",
    "type": "kota",
    "bpsCode": "2172",
    "summary": "City in Kepulauan Riau."
  },
  {
    "id": "pl-adm-3101",
    "islandId": "isl-dki-jakarta",
    "slug": "kepulauan-seribu",
    "name": "Kepulauan Seribu",
    "type": "kabupaten",
    "bpsCode": "3101",
    "summary": "Regency in DKI Jakarta."
  },
  {
    "id": "pl-adm-3171",
    "islandId": "isl-dki-jakarta",
    "slug": "jakarta-selatan",
    "name": "Jakarta Selatan",
    "type": "kota",
    "bpsCode": "3171",
    "summary": "City in DKI Jakarta."
  },
  {
    "id": "pl-adm-3172",
    "islandId": "isl-dki-jakarta",
    "slug": "jakarta-timur",
    "name": "Jakarta Timur",
    "type": "kota",
    "bpsCode": "3172",
    "summary": "City in DKI Jakarta."
  },
  {
    "id": "pl-adm-3173",
    "islandId": "isl-dki-jakarta",
    "slug": "jakarta-pusat",
    "name": "Jakarta Pusat",
    "type": "kota",
    "bpsCode": "3173",
    "summary": "City in DKI Jakarta."
  },
  {
    "id": "pl-adm-3174",
    "islandId": "isl-dki-jakarta",
    "slug": "jakarta-barat",
    "name": "Jakarta Barat",
    "type": "kota",
    "bpsCode": "3174",
    "summary": "City in DKI Jakarta."
  },
  {
    "id": "pl-adm-3175",
    "islandId": "isl-dki-jakarta",
    "slug": "jakarta-utara",
    "name": "Jakarta Utara",
    "type": "kota",
    "bpsCode": "3175",
    "summary": "City in DKI Jakarta."
  },
  {
    "id": "pl-adm-3201",
    "islandId": "isl-jawa-barat",
    "slug": "kabupaten-bogor",
    "name": "Bogor",
    "type": "kabupaten",
    "bpsCode": "3201",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3202",
    "islandId": "isl-jawa-barat",
    "slug": "kabupaten-sukabumi",
    "name": "Sukabumi",
    "type": "kabupaten",
    "bpsCode": "3202",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3203",
    "islandId": "isl-jawa-barat",
    "slug": "cianjur",
    "name": "Cianjur",
    "type": "kabupaten",
    "bpsCode": "3203",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3204",
    "islandId": "isl-jawa-barat",
    "slug": "kabupaten-bandung",
    "name": "Bandung",
    "type": "kabupaten",
    "bpsCode": "3204",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3205",
    "islandId": "isl-jawa-barat",
    "slug": "garut",
    "name": "Garut",
    "type": "kabupaten",
    "bpsCode": "3205",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3206",
    "islandId": "isl-jawa-barat",
    "slug": "kabupaten-tasikmalaya",
    "name": "Tasikmalaya",
    "type": "kabupaten",
    "bpsCode": "3206",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3207",
    "islandId": "isl-jawa-barat",
    "slug": "ciamis",
    "name": "Ciamis",
    "type": "kabupaten",
    "bpsCode": "3207",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3208",
    "islandId": "isl-jawa-barat",
    "slug": "kuningan",
    "name": "Kuningan",
    "type": "kabupaten",
    "bpsCode": "3208",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3209",
    "islandId": "isl-jawa-barat",
    "slug": "kabupaten-cirebon",
    "name": "Cirebon",
    "type": "kabupaten",
    "bpsCode": "3209",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3210",
    "islandId": "isl-jawa-barat",
    "slug": "majalengka",
    "name": "Majalengka",
    "type": "kabupaten",
    "bpsCode": "3210",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3211",
    "islandId": "isl-jawa-barat",
    "slug": "sumedang",
    "name": "Sumedang",
    "type": "kabupaten",
    "bpsCode": "3211",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3212",
    "islandId": "isl-jawa-barat",
    "slug": "indramayu",
    "name": "Indramayu",
    "type": "kabupaten",
    "bpsCode": "3212",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3213",
    "islandId": "isl-jawa-barat",
    "slug": "subang",
    "name": "Subang",
    "type": "kabupaten",
    "bpsCode": "3213",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3214",
    "islandId": "isl-jawa-barat",
    "slug": "purwakarta",
    "name": "Purwakarta",
    "type": "kabupaten",
    "bpsCode": "3214",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3215",
    "islandId": "isl-jawa-barat",
    "slug": "karawang",
    "name": "Karawang",
    "type": "kabupaten",
    "bpsCode": "3215",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3216",
    "islandId": "isl-jawa-barat",
    "slug": "kabupaten-bekasi",
    "name": "Bekasi",
    "type": "kabupaten",
    "bpsCode": "3216",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3217",
    "islandId": "isl-jawa-barat",
    "slug": "bandung-barat",
    "name": "Bandung Barat",
    "type": "kabupaten",
    "bpsCode": "3217",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3218",
    "islandId": "isl-jawa-barat",
    "slug": "pangandaran",
    "name": "Pangandaran",
    "type": "kabupaten",
    "bpsCode": "3218",
    "summary": "Regency in Jawa Barat."
  },
  {
    "id": "pl-adm-3271",
    "islandId": "isl-jawa-barat",
    "slug": "bogor",
    "name": "Bogor",
    "type": "kota",
    "bpsCode": "3271",
    "summary": "City in Jawa Barat."
  },
  {
    "id": "pl-adm-3272",
    "islandId": "isl-jawa-barat",
    "slug": "sukabumi",
    "name": "Sukabumi",
    "type": "kota",
    "bpsCode": "3272",
    "summary": "City in Jawa Barat."
  },
  {
    "id": "pl-bandung",
    "islandId": "isl-jawa-barat",
    "slug": "bandung",
    "name": "Bandung",
    "type": "kota",
    "bpsCode": "3273",
    "summary": "City in Jawa Barat."
  },
  {
    "id": "pl-adm-3274",
    "islandId": "isl-jawa-barat",
    "slug": "cirebon",
    "name": "Cirebon",
    "type": "kota",
    "bpsCode": "3274",
    "summary": "City in Jawa Barat."
  },
  {
    "id": "pl-adm-3275",
    "islandId": "isl-jawa-barat",
    "slug": "bekasi",
    "name": "Bekasi",
    "type": "kota",
    "bpsCode": "3275",
    "summary": "City in Jawa Barat."
  },
  {
    "id": "pl-adm-3276",
    "islandId": "isl-jawa-barat",
    "slug": "depok",
    "name": "Depok",
    "type": "kota",
    "bpsCode": "3276",
    "summary": "City in Jawa Barat."
  },
  {
    "id": "pl-adm-3277",
    "islandId": "isl-jawa-barat",
    "slug": "cimahi",
    "name": "Cimahi",
    "type": "kota",
    "bpsCode": "3277",
    "summary": "City in Jawa Barat."
  },
  {
    "id": "pl-adm-3278",
    "islandId": "isl-jawa-barat",
    "slug": "tasikmalaya",
    "name": "Tasikmalaya",
    "type": "kota",
    "bpsCode": "3278",
    "summary": "City in Jawa Barat."
  },
  {
    "id": "pl-adm-3279",
    "islandId": "isl-jawa-barat",
    "slug": "banjar",
    "name": "Banjar",
    "type": "kota",
    "bpsCode": "3279",
    "summary": "City in Jawa Barat."
  },
  {
    "id": "pl-adm-3301",
    "islandId": "isl-jawa-tengah",
    "slug": "cilacap",
    "name": "Cilacap",
    "type": "kabupaten",
    "bpsCode": "3301",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3302",
    "islandId": "isl-jawa-tengah",
    "slug": "banyumas",
    "name": "Banyumas",
    "type": "kabupaten",
    "bpsCode": "3302",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3303",
    "islandId": "isl-jawa-tengah",
    "slug": "purbalingga",
    "name": "Purbalingga",
    "type": "kabupaten",
    "bpsCode": "3303",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3304",
    "islandId": "isl-jawa-tengah",
    "slug": "banjarnegara",
    "name": "Banjarnegara",
    "type": "kabupaten",
    "bpsCode": "3304",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3305",
    "islandId": "isl-jawa-tengah",
    "slug": "kebumen",
    "name": "Kebumen",
    "type": "kabupaten",
    "bpsCode": "3305",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3306",
    "islandId": "isl-jawa-tengah",
    "slug": "purworejo",
    "name": "Purworejo",
    "type": "kabupaten",
    "bpsCode": "3306",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3307",
    "islandId": "isl-jawa-tengah",
    "slug": "wonosobo",
    "name": "Wonosobo",
    "type": "kabupaten",
    "bpsCode": "3307",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3308",
    "islandId": "isl-jawa-tengah",
    "slug": "kabupaten-magelang",
    "name": "Magelang",
    "type": "kabupaten",
    "bpsCode": "3308",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3309",
    "islandId": "isl-jawa-tengah",
    "slug": "boyolali",
    "name": "Boyolali",
    "type": "kabupaten",
    "bpsCode": "3309",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3310",
    "islandId": "isl-jawa-tengah",
    "slug": "klaten",
    "name": "Klaten",
    "type": "kabupaten",
    "bpsCode": "3310",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3311",
    "islandId": "isl-jawa-tengah",
    "slug": "sukoharjo",
    "name": "Sukoharjo",
    "type": "kabupaten",
    "bpsCode": "3311",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3312",
    "islandId": "isl-jawa-tengah",
    "slug": "wonogiri",
    "name": "Wonogiri",
    "type": "kabupaten",
    "bpsCode": "3312",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3313",
    "islandId": "isl-jawa-tengah",
    "slug": "karanganyar",
    "name": "Karanganyar",
    "type": "kabupaten",
    "bpsCode": "3313",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3314",
    "islandId": "isl-jawa-tengah",
    "slug": "sragen",
    "name": "Sragen",
    "type": "kabupaten",
    "bpsCode": "3314",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3315",
    "islandId": "isl-jawa-tengah",
    "slug": "grobogan",
    "name": "Grobogan",
    "type": "kabupaten",
    "bpsCode": "3315",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3316",
    "islandId": "isl-jawa-tengah",
    "slug": "blora",
    "name": "Blora",
    "type": "kabupaten",
    "bpsCode": "3316",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3317",
    "islandId": "isl-jawa-tengah",
    "slug": "rembang",
    "name": "Rembang",
    "type": "kabupaten",
    "bpsCode": "3317",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3318",
    "islandId": "isl-jawa-tengah",
    "slug": "pati",
    "name": "Pati",
    "type": "kabupaten",
    "bpsCode": "3318",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3319",
    "islandId": "isl-jawa-tengah",
    "slug": "kudus",
    "name": "Kudus",
    "type": "kabupaten",
    "bpsCode": "3319",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3320",
    "islandId": "isl-jawa-tengah",
    "slug": "jepara",
    "name": "Jepara",
    "type": "kabupaten",
    "bpsCode": "3320",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3321",
    "islandId": "isl-jawa-tengah",
    "slug": "demak",
    "name": "Demak",
    "type": "kabupaten",
    "bpsCode": "3321",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3322",
    "islandId": "isl-jawa-tengah",
    "slug": "kabupaten-semarang",
    "name": "Semarang",
    "type": "kabupaten",
    "bpsCode": "3322",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3323",
    "islandId": "isl-jawa-tengah",
    "slug": "temanggung",
    "name": "Temanggung",
    "type": "kabupaten",
    "bpsCode": "3323",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3324",
    "islandId": "isl-jawa-tengah",
    "slug": "kendal",
    "name": "Kendal",
    "type": "kabupaten",
    "bpsCode": "3324",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3325",
    "islandId": "isl-jawa-tengah",
    "slug": "batang",
    "name": "Batang",
    "type": "kabupaten",
    "bpsCode": "3325",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3326",
    "islandId": "isl-jawa-tengah",
    "slug": "kabupaten-pekalongan",
    "name": "Pekalongan",
    "type": "kabupaten",
    "bpsCode": "3326",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3327",
    "islandId": "isl-jawa-tengah",
    "slug": "pemalang",
    "name": "Pemalang",
    "type": "kabupaten",
    "bpsCode": "3327",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3328",
    "islandId": "isl-jawa-tengah",
    "slug": "kabupaten-tegal",
    "name": "Tegal",
    "type": "kabupaten",
    "bpsCode": "3328",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3329",
    "islandId": "isl-jawa-tengah",
    "slug": "brebes",
    "name": "Brebes",
    "type": "kabupaten",
    "bpsCode": "3329",
    "summary": "Regency in Jawa Tengah."
  },
  {
    "id": "pl-adm-3371",
    "islandId": "isl-jawa-tengah",
    "slug": "magelang",
    "name": "Magelang",
    "type": "kota",
    "bpsCode": "3371",
    "summary": "City in Jawa Tengah."
  },
  {
    "id": "pl-adm-3372",
    "islandId": "isl-jawa-tengah",
    "slug": "surakarta",
    "name": "Surakarta",
    "type": "kota",
    "bpsCode": "3372",
    "summary": "City in Jawa Tengah."
  },
  {
    "id": "pl-adm-3373",
    "islandId": "isl-jawa-tengah",
    "slug": "salatiga",
    "name": "Salatiga",
    "type": "kota",
    "bpsCode": "3373",
    "summary": "City in Jawa Tengah."
  },
  {
    "id": "pl-adm-3374",
    "islandId": "isl-jawa-tengah",
    "slug": "semarang",
    "name": "Semarang",
    "type": "kota",
    "bpsCode": "3374",
    "summary": "City in Jawa Tengah."
  },
  {
    "id": "pl-adm-3375",
    "islandId": "isl-jawa-tengah",
    "slug": "pekalongan",
    "name": "Pekalongan",
    "type": "kota",
    "bpsCode": "3375",
    "summary": "City in Jawa Tengah."
  },
  {
    "id": "pl-adm-3376",
    "islandId": "isl-jawa-tengah",
    "slug": "tegal",
    "name": "Tegal",
    "type": "kota",
    "bpsCode": "3376",
    "summary": "City in Jawa Tengah."
  },
  {
    "id": "pl-adm-3401",
    "islandId": "isl-di-yogyakarta",
    "slug": "kulon-progo",
    "name": "Kulon Progo",
    "type": "kabupaten",
    "bpsCode": "3401",
    "summary": "Regency in DI Yogyakarta."
  },
  {
    "id": "pl-adm-3402",
    "islandId": "isl-di-yogyakarta",
    "slug": "bantul",
    "name": "Bantul",
    "type": "kabupaten",
    "bpsCode": "3402",
    "summary": "Regency in DI Yogyakarta."
  },
  {
    "id": "pl-adm-3403",
    "islandId": "isl-di-yogyakarta",
    "slug": "gunungkidul",
    "name": "Gunungkidul",
    "type": "kabupaten",
    "bpsCode": "3403",
    "summary": "Regency in DI Yogyakarta."
  },
  {
    "id": "pl-adm-3404",
    "islandId": "isl-di-yogyakarta",
    "slug": "sleman",
    "name": "Sleman",
    "type": "kabupaten",
    "bpsCode": "3404",
    "summary": "Regency in DI Yogyakarta."
  },
  {
    "id": "pl-yogya",
    "islandId": "isl-di-yogyakarta",
    "slug": "yogyakarta",
    "name": "Yogyakarta",
    "type": "kota",
    "bpsCode": "3471",
    "summary": "City in DI Yogyakarta."
  },
  {
    "id": "pl-adm-3501",
    "islandId": "isl-jawa-timur",
    "slug": "pacitan",
    "name": "Pacitan",
    "type": "kabupaten",
    "bpsCode": "3501",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3502",
    "islandId": "isl-jawa-timur",
    "slug": "ponorogo",
    "name": "Ponorogo",
    "type": "kabupaten",
    "bpsCode": "3502",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3503",
    "islandId": "isl-jawa-timur",
    "slug": "trenggalek",
    "name": "Trenggalek",
    "type": "kabupaten",
    "bpsCode": "3503",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3504",
    "islandId": "isl-jawa-timur",
    "slug": "tulungagung",
    "name": "Tulungagung",
    "type": "kabupaten",
    "bpsCode": "3504",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3505",
    "islandId": "isl-jawa-timur",
    "slug": "kabupaten-blitar",
    "name": "Blitar",
    "type": "kabupaten",
    "bpsCode": "3505",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3506",
    "islandId": "isl-jawa-timur",
    "slug": "kabupaten-kediri",
    "name": "Kediri",
    "type": "kabupaten",
    "bpsCode": "3506",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3507",
    "islandId": "isl-jawa-timur",
    "slug": "kabupaten-malang",
    "name": "Malang",
    "type": "kabupaten",
    "bpsCode": "3507",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3508",
    "islandId": "isl-jawa-timur",
    "slug": "lumajang",
    "name": "Lumajang",
    "type": "kabupaten",
    "bpsCode": "3508",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3509",
    "islandId": "isl-jawa-timur",
    "slug": "jember",
    "name": "Jember",
    "type": "kabupaten",
    "bpsCode": "3509",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3510",
    "islandId": "isl-jawa-timur",
    "slug": "banyuwangi",
    "name": "Banyuwangi",
    "type": "kabupaten",
    "bpsCode": "3510",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3511",
    "islandId": "isl-jawa-timur",
    "slug": "bondowoso",
    "name": "Bondowoso",
    "type": "kabupaten",
    "bpsCode": "3511",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3512",
    "islandId": "isl-jawa-timur",
    "slug": "situbondo",
    "name": "Situbondo",
    "type": "kabupaten",
    "bpsCode": "3512",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3513",
    "islandId": "isl-jawa-timur",
    "slug": "kabupaten-probolinggo",
    "name": "Probolinggo",
    "type": "kabupaten",
    "bpsCode": "3513",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3514",
    "islandId": "isl-jawa-timur",
    "slug": "kabupaten-pasuruan",
    "name": "Pasuruan",
    "type": "kabupaten",
    "bpsCode": "3514",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3515",
    "islandId": "isl-jawa-timur",
    "slug": "sidoarjo",
    "name": "Sidoarjo",
    "type": "kabupaten",
    "bpsCode": "3515",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3516",
    "islandId": "isl-jawa-timur",
    "slug": "kabupaten-mojokerto",
    "name": "Mojokerto",
    "type": "kabupaten",
    "bpsCode": "3516",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3517",
    "islandId": "isl-jawa-timur",
    "slug": "jombang",
    "name": "Jombang",
    "type": "kabupaten",
    "bpsCode": "3517",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3518",
    "islandId": "isl-jawa-timur",
    "slug": "nganjuk",
    "name": "Nganjuk",
    "type": "kabupaten",
    "bpsCode": "3518",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3519",
    "islandId": "isl-jawa-timur",
    "slug": "kabupaten-madiun",
    "name": "Madiun",
    "type": "kabupaten",
    "bpsCode": "3519",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3520",
    "islandId": "isl-jawa-timur",
    "slug": "magetan",
    "name": "Magetan",
    "type": "kabupaten",
    "bpsCode": "3520",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3521",
    "islandId": "isl-jawa-timur",
    "slug": "ngawi",
    "name": "Ngawi",
    "type": "kabupaten",
    "bpsCode": "3521",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3522",
    "islandId": "isl-jawa-timur",
    "slug": "bojonegoro",
    "name": "Bojonegoro",
    "type": "kabupaten",
    "bpsCode": "3522",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3523",
    "islandId": "isl-jawa-timur",
    "slug": "tuban",
    "name": "Tuban",
    "type": "kabupaten",
    "bpsCode": "3523",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3524",
    "islandId": "isl-jawa-timur",
    "slug": "lamongan",
    "name": "Lamongan",
    "type": "kabupaten",
    "bpsCode": "3524",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3525",
    "islandId": "isl-jawa-timur",
    "slug": "gresik",
    "name": "Gresik",
    "type": "kabupaten",
    "bpsCode": "3525",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3526",
    "islandId": "isl-jawa-timur",
    "slug": "bangkalan",
    "name": "Bangkalan",
    "type": "kabupaten",
    "bpsCode": "3526",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3527",
    "islandId": "isl-jawa-timur",
    "slug": "sampang",
    "name": "Sampang",
    "type": "kabupaten",
    "bpsCode": "3527",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3528",
    "islandId": "isl-jawa-timur",
    "slug": "pamekasan",
    "name": "Pamekasan",
    "type": "kabupaten",
    "bpsCode": "3528",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3529",
    "islandId": "isl-jawa-timur",
    "slug": "sumenep",
    "name": "Sumenep",
    "type": "kabupaten",
    "bpsCode": "3529",
    "summary": "Regency in Jawa Timur."
  },
  {
    "id": "pl-adm-3571",
    "islandId": "isl-jawa-timur",
    "slug": "kediri",
    "name": "Kediri",
    "type": "kota",
    "bpsCode": "3571",
    "summary": "City in Jawa Timur."
  },
  {
    "id": "pl-adm-3572",
    "islandId": "isl-jawa-timur",
    "slug": "blitar",
    "name": "Blitar",
    "type": "kota",
    "bpsCode": "3572",
    "summary": "City in Jawa Timur."
  },
  {
    "id": "pl-adm-3573",
    "islandId": "isl-jawa-timur",
    "slug": "malang",
    "name": "Malang",
    "type": "kota",
    "bpsCode": "3573",
    "summary": "City in Jawa Timur."
  },
  {
    "id": "pl-adm-3574",
    "islandId": "isl-jawa-timur",
    "slug": "probolinggo",
    "name": "Probolinggo",
    "type": "kota",
    "bpsCode": "3574",
    "summary": "City in Jawa Timur."
  },
  {
    "id": "pl-adm-3575",
    "islandId": "isl-jawa-timur",
    "slug": "pasuruan",
    "name": "Pasuruan",
    "type": "kota",
    "bpsCode": "3575",
    "summary": "City in Jawa Timur."
  },
  {
    "id": "pl-adm-3576",
    "islandId": "isl-jawa-timur",
    "slug": "mojokerto",
    "name": "Mojokerto",
    "type": "kota",
    "bpsCode": "3576",
    "summary": "City in Jawa Timur."
  },
  {
    "id": "pl-adm-3577",
    "islandId": "isl-jawa-timur",
    "slug": "madiun",
    "name": "Madiun",
    "type": "kota",
    "bpsCode": "3577",
    "summary": "City in Jawa Timur."
  },
  {
    "id": "pl-surabaya",
    "islandId": "isl-jawa-timur",
    "slug": "surabaya",
    "name": "Surabaya",
    "type": "kota",
    "bpsCode": "3578",
    "summary": "City in Jawa Timur."
  },
  {
    "id": "pl-adm-3579",
    "islandId": "isl-jawa-timur",
    "slug": "batu",
    "name": "Batu",
    "type": "kota",
    "bpsCode": "3579",
    "summary": "City in Jawa Timur."
  },
  {
    "id": "pl-adm-3601",
    "islandId": "isl-banten",
    "slug": "pandeglang",
    "name": "Pandeglang",
    "type": "kabupaten",
    "bpsCode": "3601",
    "summary": "Regency in Banten."
  },
  {
    "id": "pl-adm-3602",
    "islandId": "isl-banten",
    "slug": "lebak",
    "name": "Lebak",
    "type": "kabupaten",
    "bpsCode": "3602",
    "summary": "Regency in Banten."
  },
  {
    "id": "pl-adm-3603",
    "islandId": "isl-banten",
    "slug": "kabupaten-tangerang",
    "name": "Tangerang",
    "type": "kabupaten",
    "bpsCode": "3603",
    "summary": "Regency in Banten."
  },
  {
    "id": "pl-adm-3604",
    "islandId": "isl-banten",
    "slug": "kabupaten-serang",
    "name": "Serang",
    "type": "kabupaten",
    "bpsCode": "3604",
    "summary": "Regency in Banten."
  },
  {
    "id": "pl-adm-3671",
    "islandId": "isl-banten",
    "slug": "tangerang",
    "name": "Tangerang",
    "type": "kota",
    "bpsCode": "3671",
    "summary": "City in Banten."
  },
  {
    "id": "pl-adm-3672",
    "islandId": "isl-banten",
    "slug": "cilegon",
    "name": "Cilegon",
    "type": "kota",
    "bpsCode": "3672",
    "summary": "City in Banten."
  },
  {
    "id": "pl-adm-3673",
    "islandId": "isl-banten",
    "slug": "serang",
    "name": "Serang",
    "type": "kota",
    "bpsCode": "3673",
    "summary": "City in Banten."
  },
  {
    "id": "pl-adm-3674",
    "islandId": "isl-banten",
    "slug": "tangerang-selatan",
    "name": "Tangerang Selatan",
    "type": "kota",
    "bpsCode": "3674",
    "summary": "City in Banten."
  },
  {
    "id": "pl-adm-5101",
    "islandId": "isl-bali",
    "slug": "jembrana",
    "name": "Jembrana",
    "type": "kabupaten",
    "bpsCode": "5101",
    "summary": "Regency in Bali."
  },
  {
    "id": "pl-adm-5102",
    "islandId": "isl-bali",
    "slug": "tabanan",
    "name": "Tabanan",
    "type": "kabupaten",
    "bpsCode": "5102",
    "summary": "Regency in Bali."
  },
  {
    "id": "pl-badung",
    "islandId": "isl-bali",
    "slug": "badung",
    "name": "Badung",
    "type": "kabupaten",
    "bpsCode": "5103",
    "summary": "Regency in Bali."
  },
  {
    "id": "pl-gianyar",
    "islandId": "isl-bali",
    "slug": "gianyar",
    "name": "Gianyar",
    "type": "kabupaten",
    "bpsCode": "5104",
    "summary": "Regency in Bali."
  },
  {
    "id": "pl-adm-5105",
    "islandId": "isl-bali",
    "slug": "klungkung",
    "name": "Klungkung",
    "type": "kabupaten",
    "bpsCode": "5105",
    "summary": "Regency in Bali."
  },
  {
    "id": "pl-adm-5106",
    "islandId": "isl-bali",
    "slug": "bangli",
    "name": "Bangli",
    "type": "kabupaten",
    "bpsCode": "5106",
    "summary": "Regency in Bali."
  },
  {
    "id": "pl-karangasem",
    "islandId": "isl-bali",
    "slug": "karangasem",
    "name": "Karangasem",
    "type": "kabupaten",
    "bpsCode": "5107",
    "summary": "Regency in Bali."
  },
  {
    "id": "pl-buleleng",
    "islandId": "isl-bali",
    "slug": "buleleng",
    "name": "Buleleng",
    "type": "kabupaten",
    "bpsCode": "5108",
    "summary": "Regency in Bali."
  },
  {
    "id": "pl-denpasar",
    "islandId": "isl-bali",
    "slug": "denpasar",
    "name": "Denpasar",
    "type": "kota",
    "bpsCode": "5171",
    "summary": "City in Bali."
  },
  {
    "id": "pl-adm-5201",
    "islandId": "isl-nusa-tenggara-barat",
    "slug": "lombok-barat",
    "name": "Lombok Barat",
    "type": "kabupaten",
    "bpsCode": "5201",
    "summary": "Regency in Nusa Tenggara Barat."
  },
  {
    "id": "pl-lombok-tengah",
    "islandId": "isl-nusa-tenggara-barat",
    "slug": "lombok-tengah",
    "name": "Lombok Tengah",
    "type": "kabupaten",
    "bpsCode": "5202",
    "summary": "Regency in Nusa Tenggara Barat."
  },
  {
    "id": "pl-adm-5203",
    "islandId": "isl-nusa-tenggara-barat",
    "slug": "lombok-timur",
    "name": "Lombok Timur",
    "type": "kabupaten",
    "bpsCode": "5203",
    "summary": "Regency in Nusa Tenggara Barat."
  },
  {
    "id": "pl-adm-5204",
    "islandId": "isl-nusa-tenggara-barat",
    "slug": "sumbawa",
    "name": "Sumbawa",
    "type": "kabupaten",
    "bpsCode": "5204",
    "summary": "Regency in Nusa Tenggara Barat."
  },
  {
    "id": "pl-adm-5205",
    "islandId": "isl-nusa-tenggara-barat",
    "slug": "dompu",
    "name": "Dompu",
    "type": "kabupaten",
    "bpsCode": "5205",
    "summary": "Regency in Nusa Tenggara Barat."
  },
  {
    "id": "pl-adm-5206",
    "islandId": "isl-nusa-tenggara-barat",
    "slug": "kabupaten-bima",
    "name": "Bima",
    "type": "kabupaten",
    "bpsCode": "5206",
    "summary": "Regency in Nusa Tenggara Barat."
  },
  {
    "id": "pl-adm-5207",
    "islandId": "isl-nusa-tenggara-barat",
    "slug": "sumbawa-barat",
    "name": "Sumbawa Barat",
    "type": "kabupaten",
    "bpsCode": "5207",
    "summary": "Regency in Nusa Tenggara Barat."
  },
  {
    "id": "pl-lombok-utara",
    "islandId": "isl-nusa-tenggara-barat",
    "slug": "lombok-utara",
    "name": "Lombok Utara",
    "type": "kabupaten",
    "bpsCode": "5208",
    "summary": "Regency in Nusa Tenggara Barat."
  },
  {
    "id": "pl-adm-5271",
    "islandId": "isl-nusa-tenggara-barat",
    "slug": "mataram",
    "name": "Mataram",
    "type": "kota",
    "bpsCode": "5271",
    "summary": "City in Nusa Tenggara Barat."
  },
  {
    "id": "pl-adm-5272",
    "islandId": "isl-nusa-tenggara-barat",
    "slug": "bima",
    "name": "Bima",
    "type": "kota",
    "bpsCode": "5272",
    "summary": "City in Nusa Tenggara Barat."
  },
  {
    "id": "pl-adm-5301",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "sumba-barat",
    "name": "Sumba Barat",
    "type": "kabupaten",
    "bpsCode": "5301",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5302",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "sumba-timur",
    "name": "Sumba Timur",
    "type": "kabupaten",
    "bpsCode": "5302",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5303",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "kabupaten-kupang",
    "name": "Kupang",
    "type": "kabupaten",
    "bpsCode": "5303",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5304",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "timor-tengah-selatan",
    "name": "Timor Tengah Selatan",
    "type": "kabupaten",
    "bpsCode": "5304",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5305",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "timor-tengah-utara",
    "name": "Timor Tengah Utara",
    "type": "kabupaten",
    "bpsCode": "5305",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5306",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "belu",
    "name": "Belu",
    "type": "kabupaten",
    "bpsCode": "5306",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5307",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "alor",
    "name": "Alor",
    "type": "kabupaten",
    "bpsCode": "5307",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5308",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "lembata",
    "name": "Lembata",
    "type": "kabupaten",
    "bpsCode": "5308",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5309",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "flores-timur",
    "name": "Flores Timur",
    "type": "kabupaten",
    "bpsCode": "5309",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5310",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "sikka",
    "name": "Sikka",
    "type": "kabupaten",
    "bpsCode": "5310",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5311",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "ende",
    "name": "Ende",
    "type": "kabupaten",
    "bpsCode": "5311",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5312",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "ngada",
    "name": "Ngada",
    "type": "kabupaten",
    "bpsCode": "5312",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5313",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "manggarai",
    "name": "Manggarai",
    "type": "kabupaten",
    "bpsCode": "5313",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5314",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "rote-ndao",
    "name": "Rote Ndao",
    "type": "kabupaten",
    "bpsCode": "5314",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5315",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "manggarai-barat",
    "name": "Manggarai Barat",
    "type": "kabupaten",
    "bpsCode": "5315",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5316",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "sumba-tengah",
    "name": "Sumba Tengah",
    "type": "kabupaten",
    "bpsCode": "5316",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5317",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "sumba-barat-daya",
    "name": "Sumba Barat Daya",
    "type": "kabupaten",
    "bpsCode": "5317",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5318",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "nagekeo",
    "name": "Nagekeo",
    "type": "kabupaten",
    "bpsCode": "5318",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5319",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "manggarai-timur",
    "name": "Manggarai Timur",
    "type": "kabupaten",
    "bpsCode": "5319",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5320",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "sabu-raijua",
    "name": "Sabu Raijua",
    "type": "kabupaten",
    "bpsCode": "5320",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5321",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "malaka",
    "name": "Malaka",
    "type": "kabupaten",
    "bpsCode": "5321",
    "summary": "Regency in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-5371",
    "islandId": "isl-nusa-tenggara-timur",
    "slug": "kupang",
    "name": "Kupang",
    "type": "kota",
    "bpsCode": "5371",
    "summary": "City in Nusa Tenggara Timur."
  },
  {
    "id": "pl-adm-6101",
    "islandId": "isl-kalimantan-barat",
    "slug": "sambas",
    "name": "Sambas",
    "type": "kabupaten",
    "bpsCode": "6101",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6102",
    "islandId": "isl-kalimantan-barat",
    "slug": "bengkayang",
    "name": "Bengkayang",
    "type": "kabupaten",
    "bpsCode": "6102",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6103",
    "islandId": "isl-kalimantan-barat",
    "slug": "landak",
    "name": "Landak",
    "type": "kabupaten",
    "bpsCode": "6103",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6104",
    "islandId": "isl-kalimantan-barat",
    "slug": "mempawah",
    "name": "Mempawah",
    "type": "kabupaten",
    "bpsCode": "6104",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6105",
    "islandId": "isl-kalimantan-barat",
    "slug": "sanggau",
    "name": "Sanggau",
    "type": "kabupaten",
    "bpsCode": "6105",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6106",
    "islandId": "isl-kalimantan-barat",
    "slug": "ketapang",
    "name": "Ketapang",
    "type": "kabupaten",
    "bpsCode": "6106",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6107",
    "islandId": "isl-kalimantan-barat",
    "slug": "sintang",
    "name": "Sintang",
    "type": "kabupaten",
    "bpsCode": "6107",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6108",
    "islandId": "isl-kalimantan-barat",
    "slug": "kapuas-hulu",
    "name": "Kapuas Hulu",
    "type": "kabupaten",
    "bpsCode": "6108",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6109",
    "islandId": "isl-kalimantan-barat",
    "slug": "sekadau",
    "name": "Sekadau",
    "type": "kabupaten",
    "bpsCode": "6109",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6110",
    "islandId": "isl-kalimantan-barat",
    "slug": "melawi",
    "name": "Melawi",
    "type": "kabupaten",
    "bpsCode": "6110",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6111",
    "islandId": "isl-kalimantan-barat",
    "slug": "kayong-utara",
    "name": "Kayong Utara",
    "type": "kabupaten",
    "bpsCode": "6111",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6112",
    "islandId": "isl-kalimantan-barat",
    "slug": "kubu-raya",
    "name": "Kubu Raya",
    "type": "kabupaten",
    "bpsCode": "6112",
    "summary": "Regency in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6171",
    "islandId": "isl-kalimantan-barat",
    "slug": "pontianak",
    "name": "Pontianak",
    "type": "kota",
    "bpsCode": "6171",
    "summary": "City in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6172",
    "islandId": "isl-kalimantan-barat",
    "slug": "singkawang",
    "name": "Singkawang",
    "type": "kota",
    "bpsCode": "6172",
    "summary": "City in Kalimantan Barat."
  },
  {
    "id": "pl-adm-6201",
    "islandId": "isl-kalimantan-tengah",
    "slug": "kotawaringin-barat",
    "name": "Kotawaringin Barat",
    "type": "kabupaten",
    "bpsCode": "6201",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6202",
    "islandId": "isl-kalimantan-tengah",
    "slug": "kotawaringin-timur",
    "name": "Kotawaringin Timur",
    "type": "kabupaten",
    "bpsCode": "6202",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6203",
    "islandId": "isl-kalimantan-tengah",
    "slug": "kapuas",
    "name": "Kapuas",
    "type": "kabupaten",
    "bpsCode": "6203",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6204",
    "islandId": "isl-kalimantan-tengah",
    "slug": "barito-selatan",
    "name": "Barito Selatan",
    "type": "kabupaten",
    "bpsCode": "6204",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6205",
    "islandId": "isl-kalimantan-tengah",
    "slug": "barito-utara",
    "name": "Barito Utara",
    "type": "kabupaten",
    "bpsCode": "6205",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6206",
    "islandId": "isl-kalimantan-tengah",
    "slug": "sukamara",
    "name": "Sukamara",
    "type": "kabupaten",
    "bpsCode": "6206",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6207",
    "islandId": "isl-kalimantan-tengah",
    "slug": "lamandau",
    "name": "Lamandau",
    "type": "kabupaten",
    "bpsCode": "6207",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6208",
    "islandId": "isl-kalimantan-tengah",
    "slug": "seruyan",
    "name": "Seruyan",
    "type": "kabupaten",
    "bpsCode": "6208",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6209",
    "islandId": "isl-kalimantan-tengah",
    "slug": "katingan",
    "name": "Katingan",
    "type": "kabupaten",
    "bpsCode": "6209",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6210",
    "islandId": "isl-kalimantan-tengah",
    "slug": "pulang-pisau",
    "name": "Pulang Pisau",
    "type": "kabupaten",
    "bpsCode": "6210",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6211",
    "islandId": "isl-kalimantan-tengah",
    "slug": "gunung-mas",
    "name": "Gunung Mas",
    "type": "kabupaten",
    "bpsCode": "6211",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6212",
    "islandId": "isl-kalimantan-tengah",
    "slug": "barito-timur",
    "name": "Barito Timur",
    "type": "kabupaten",
    "bpsCode": "6212",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6213",
    "islandId": "isl-kalimantan-tengah",
    "slug": "murung-raya",
    "name": "Murung Raya",
    "type": "kabupaten",
    "bpsCode": "6213",
    "summary": "Regency in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6271",
    "islandId": "isl-kalimantan-tengah",
    "slug": "palangkaraya",
    "name": "Palangkaraya",
    "type": "kota",
    "bpsCode": "6271",
    "summary": "City in Kalimantan Tengah."
  },
  {
    "id": "pl-adm-6301",
    "islandId": "isl-kalimantan-selatan",
    "slug": "tanah-laut",
    "name": "Tanah Laut",
    "type": "kabupaten",
    "bpsCode": "6301",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6302",
    "islandId": "isl-kalimantan-selatan",
    "slug": "kotabaru",
    "name": "Kotabaru",
    "type": "kabupaten",
    "bpsCode": "6302",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6303",
    "islandId": "isl-kalimantan-selatan",
    "slug": "banjar",
    "name": "Banjar",
    "type": "kabupaten",
    "bpsCode": "6303",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6304",
    "islandId": "isl-kalimantan-selatan",
    "slug": "barito-kuala",
    "name": "Barito Kuala",
    "type": "kabupaten",
    "bpsCode": "6304",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6305",
    "islandId": "isl-kalimantan-selatan",
    "slug": "tapin",
    "name": "Tapin",
    "type": "kabupaten",
    "bpsCode": "6305",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6306",
    "islandId": "isl-kalimantan-selatan",
    "slug": "hulu-sungai-selatan",
    "name": "Hulu Sungai Selatan",
    "type": "kabupaten",
    "bpsCode": "6306",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6307",
    "islandId": "isl-kalimantan-selatan",
    "slug": "hulu-sungai-tengah",
    "name": "Hulu Sungai Tengah",
    "type": "kabupaten",
    "bpsCode": "6307",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6308",
    "islandId": "isl-kalimantan-selatan",
    "slug": "hulu-sungai-utara",
    "name": "Hulu Sungai Utara",
    "type": "kabupaten",
    "bpsCode": "6308",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6309",
    "islandId": "isl-kalimantan-selatan",
    "slug": "tabalong",
    "name": "Tabalong",
    "type": "kabupaten",
    "bpsCode": "6309",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6310",
    "islandId": "isl-kalimantan-selatan",
    "slug": "tanah-bumbu",
    "name": "Tanah Bumbu",
    "type": "kabupaten",
    "bpsCode": "6310",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6311",
    "islandId": "isl-kalimantan-selatan",
    "slug": "balangan",
    "name": "Balangan",
    "type": "kabupaten",
    "bpsCode": "6311",
    "summary": "Regency in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6371",
    "islandId": "isl-kalimantan-selatan",
    "slug": "banjarmasin",
    "name": "Banjarmasin",
    "type": "kota",
    "bpsCode": "6371",
    "summary": "City in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6372",
    "islandId": "isl-kalimantan-selatan",
    "slug": "banjarbaru",
    "name": "Banjarbaru",
    "type": "kota",
    "bpsCode": "6372",
    "summary": "City in Kalimantan Selatan."
  },
  {
    "id": "pl-adm-6401",
    "islandId": "isl-kalimantan-timur",
    "slug": "paser",
    "name": "Paser",
    "type": "kabupaten",
    "bpsCode": "6401",
    "summary": "Regency in Kalimantan Timur."
  },
  {
    "id": "pl-adm-6402",
    "islandId": "isl-kalimantan-timur",
    "slug": "kutai-barat",
    "name": "Kutai Barat",
    "type": "kabupaten",
    "bpsCode": "6402",
    "summary": "Regency in Kalimantan Timur."
  },
  {
    "id": "pl-adm-6403",
    "islandId": "isl-kalimantan-timur",
    "slug": "kutai-kartanegara",
    "name": "Kutai Kartanegara",
    "type": "kabupaten",
    "bpsCode": "6403",
    "summary": "Regency in Kalimantan Timur."
  },
  {
    "id": "pl-adm-6404",
    "islandId": "isl-kalimantan-timur",
    "slug": "kutai-timur",
    "name": "Kutai Timur",
    "type": "kabupaten",
    "bpsCode": "6404",
    "summary": "Regency in Kalimantan Timur."
  },
  {
    "id": "pl-adm-6405",
    "islandId": "isl-kalimantan-timur",
    "slug": "berau",
    "name": "Berau",
    "type": "kabupaten",
    "bpsCode": "6405",
    "summary": "Regency in Kalimantan Timur."
  },
  {
    "id": "pl-adm-6409",
    "islandId": "isl-kalimantan-timur",
    "slug": "penajam-paser-utara",
    "name": "Penajam Paser Utara",
    "type": "kabupaten",
    "bpsCode": "6409",
    "summary": "Regency in Kalimantan Timur."
  },
  {
    "id": "pl-adm-6411",
    "islandId": "isl-kalimantan-timur",
    "slug": "mahakam-ulu",
    "name": "Mahakam Ulu",
    "type": "kabupaten",
    "bpsCode": "6411",
    "summary": "Regency in Kalimantan Timur."
  },
  {
    "id": "pl-adm-6471",
    "islandId": "isl-kalimantan-timur",
    "slug": "balikpapan",
    "name": "Balikpapan",
    "type": "kota",
    "bpsCode": "6471",
    "summary": "City in Kalimantan Timur."
  },
  {
    "id": "pl-adm-6472",
    "islandId": "isl-kalimantan-timur",
    "slug": "samarinda",
    "name": "Samarinda",
    "type": "kota",
    "bpsCode": "6472",
    "summary": "City in Kalimantan Timur."
  },
  {
    "id": "pl-adm-6474",
    "islandId": "isl-kalimantan-timur",
    "slug": "bontang",
    "name": "Bontang",
    "type": "kota",
    "bpsCode": "6474",
    "summary": "City in Kalimantan Timur."
  },
  {
    "id": "pl-adm-6501",
    "islandId": "isl-kalimantan-utara",
    "slug": "malinau",
    "name": "Malinau",
    "type": "kabupaten",
    "bpsCode": "6501",
    "summary": "Regency in Kalimantan Utara."
  },
  {
    "id": "pl-adm-6502",
    "islandId": "isl-kalimantan-utara",
    "slug": "bulungan",
    "name": "Bulungan",
    "type": "kabupaten",
    "bpsCode": "6502",
    "summary": "Regency in Kalimantan Utara."
  },
  {
    "id": "pl-adm-6503",
    "islandId": "isl-kalimantan-utara",
    "slug": "tana-tidung",
    "name": "Tana Tidung",
    "type": "kabupaten",
    "bpsCode": "6503",
    "summary": "Regency in Kalimantan Utara."
  },
  {
    "id": "pl-adm-6504",
    "islandId": "isl-kalimantan-utara",
    "slug": "nunukan",
    "name": "Nunukan",
    "type": "kabupaten",
    "bpsCode": "6504",
    "summary": "Regency in Kalimantan Utara."
  },
  {
    "id": "pl-adm-6571",
    "islandId": "isl-kalimantan-utara",
    "slug": "tarakan",
    "name": "Tarakan",
    "type": "kota",
    "bpsCode": "6571",
    "summary": "City in Kalimantan Utara."
  },
  {
    "id": "pl-adm-7101",
    "islandId": "isl-sulawesi-utara",
    "slug": "bolaang-mongondow",
    "name": "Bolaang Mongondow",
    "type": "kabupaten",
    "bpsCode": "7101",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7102",
    "islandId": "isl-sulawesi-utara",
    "slug": "minahasa",
    "name": "Minahasa",
    "type": "kabupaten",
    "bpsCode": "7102",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7103",
    "islandId": "isl-sulawesi-utara",
    "slug": "kepulauan-sangihe",
    "name": "Kepulauan Sangihe",
    "type": "kabupaten",
    "bpsCode": "7103",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7104",
    "islandId": "isl-sulawesi-utara",
    "slug": "kepulauan-talaud",
    "name": "Kepulauan Talaud",
    "type": "kabupaten",
    "bpsCode": "7104",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7105",
    "islandId": "isl-sulawesi-utara",
    "slug": "minahasa-selatan",
    "name": "Minahasa Selatan",
    "type": "kabupaten",
    "bpsCode": "7105",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7106",
    "islandId": "isl-sulawesi-utara",
    "slug": "minahasa-utara",
    "name": "Minahasa Utara",
    "type": "kabupaten",
    "bpsCode": "7106",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7107",
    "islandId": "isl-sulawesi-utara",
    "slug": "bolaang-mongondow-utara",
    "name": "Bolaang Mongondow Utara",
    "type": "kabupaten",
    "bpsCode": "7107",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7108",
    "islandId": "isl-sulawesi-utara",
    "slug": "kepulauan-siau-tagulandang-biaro",
    "name": "Kepulauan Siau Tagulandang Biaro",
    "type": "kabupaten",
    "bpsCode": "7108",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7109",
    "islandId": "isl-sulawesi-utara",
    "slug": "minahasa-tenggara",
    "name": "Minahasa Tenggara",
    "type": "kabupaten",
    "bpsCode": "7109",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7110",
    "islandId": "isl-sulawesi-utara",
    "slug": "bolaang-mongondow-selatan",
    "name": "Bolaang Mongondow Selatan",
    "type": "kabupaten",
    "bpsCode": "7110",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7111",
    "islandId": "isl-sulawesi-utara",
    "slug": "bolaang-mongondow-timur",
    "name": "Bolaang Mongondow Timur",
    "type": "kabupaten",
    "bpsCode": "7111",
    "summary": "Regency in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7171",
    "islandId": "isl-sulawesi-utara",
    "slug": "manado",
    "name": "Manado",
    "type": "kota",
    "bpsCode": "7171",
    "summary": "City in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7172",
    "islandId": "isl-sulawesi-utara",
    "slug": "bitung",
    "name": "Bitung",
    "type": "kota",
    "bpsCode": "7172",
    "summary": "City in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7173",
    "islandId": "isl-sulawesi-utara",
    "slug": "tomohon",
    "name": "Tomohon",
    "type": "kota",
    "bpsCode": "7173",
    "summary": "City in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7174",
    "islandId": "isl-sulawesi-utara",
    "slug": "kotamobagu",
    "name": "Kotamobagu",
    "type": "kota",
    "bpsCode": "7174",
    "summary": "City in Sulawesi Utara."
  },
  {
    "id": "pl-adm-7201",
    "islandId": "isl-sulawesi-tengah",
    "slug": "banggai-kepulauan",
    "name": "Banggai Kepulauan",
    "type": "kabupaten",
    "bpsCode": "7201",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7202",
    "islandId": "isl-sulawesi-tengah",
    "slug": "banggai",
    "name": "Banggai",
    "type": "kabupaten",
    "bpsCode": "7202",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7203",
    "islandId": "isl-sulawesi-tengah",
    "slug": "morowali",
    "name": "Morowali",
    "type": "kabupaten",
    "bpsCode": "7203",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7204",
    "islandId": "isl-sulawesi-tengah",
    "slug": "poso",
    "name": "Poso",
    "type": "kabupaten",
    "bpsCode": "7204",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7205",
    "islandId": "isl-sulawesi-tengah",
    "slug": "donggala",
    "name": "Donggala",
    "type": "kabupaten",
    "bpsCode": "7205",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7206",
    "islandId": "isl-sulawesi-tengah",
    "slug": "toli-toli",
    "name": "Toli Toli",
    "type": "kabupaten",
    "bpsCode": "7206",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7207",
    "islandId": "isl-sulawesi-tengah",
    "slug": "buol",
    "name": "Buol",
    "type": "kabupaten",
    "bpsCode": "7207",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7208",
    "islandId": "isl-sulawesi-tengah",
    "slug": "parigi-moutong",
    "name": "Parigi Moutong",
    "type": "kabupaten",
    "bpsCode": "7208",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7209",
    "islandId": "isl-sulawesi-tengah",
    "slug": "tojo-una-una",
    "name": "Tojo Una Una",
    "type": "kabupaten",
    "bpsCode": "7209",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7210",
    "islandId": "isl-sulawesi-tengah",
    "slug": "sigi",
    "name": "Sigi",
    "type": "kabupaten",
    "bpsCode": "7210",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7211",
    "islandId": "isl-sulawesi-tengah",
    "slug": "banggai-laut",
    "name": "Banggai Laut",
    "type": "kabupaten",
    "bpsCode": "7211",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7212",
    "islandId": "isl-sulawesi-tengah",
    "slug": "morowali-utara",
    "name": "Morowali Utara",
    "type": "kabupaten",
    "bpsCode": "7212",
    "summary": "Regency in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7271",
    "islandId": "isl-sulawesi-tengah",
    "slug": "palu",
    "name": "Palu",
    "type": "kota",
    "bpsCode": "7271",
    "summary": "City in Sulawesi Tengah."
  },
  {
    "id": "pl-adm-7301",
    "islandId": "isl-sulawesi-selatan",
    "slug": "kepulauan-selayar",
    "name": "Kepulauan Selayar",
    "type": "kabupaten",
    "bpsCode": "7301",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7302",
    "islandId": "isl-sulawesi-selatan",
    "slug": "bulukumba",
    "name": "Bulukumba",
    "type": "kabupaten",
    "bpsCode": "7302",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7303",
    "islandId": "isl-sulawesi-selatan",
    "slug": "bantaeng",
    "name": "Bantaeng",
    "type": "kabupaten",
    "bpsCode": "7303",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7304",
    "islandId": "isl-sulawesi-selatan",
    "slug": "jeneponto",
    "name": "Jeneponto",
    "type": "kabupaten",
    "bpsCode": "7304",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7305",
    "islandId": "isl-sulawesi-selatan",
    "slug": "takalar",
    "name": "Takalar",
    "type": "kabupaten",
    "bpsCode": "7305",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7306",
    "islandId": "isl-sulawesi-selatan",
    "slug": "gowa",
    "name": "Gowa",
    "type": "kabupaten",
    "bpsCode": "7306",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7307",
    "islandId": "isl-sulawesi-selatan",
    "slug": "sinjai",
    "name": "Sinjai",
    "type": "kabupaten",
    "bpsCode": "7307",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7308",
    "islandId": "isl-sulawesi-selatan",
    "slug": "maros",
    "name": "Maros",
    "type": "kabupaten",
    "bpsCode": "7308",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7309",
    "islandId": "isl-sulawesi-selatan",
    "slug": "pangkajene-dan-kepulauan",
    "name": "Pangkajene Dan Kepulauan",
    "type": "kabupaten",
    "bpsCode": "7309",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7310",
    "islandId": "isl-sulawesi-selatan",
    "slug": "barru",
    "name": "Barru",
    "type": "kabupaten",
    "bpsCode": "7310",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7311",
    "islandId": "isl-sulawesi-selatan",
    "slug": "bone",
    "name": "Bone",
    "type": "kabupaten",
    "bpsCode": "7311",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7312",
    "islandId": "isl-sulawesi-selatan",
    "slug": "soppeng",
    "name": "Soppeng",
    "type": "kabupaten",
    "bpsCode": "7312",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7313",
    "islandId": "isl-sulawesi-selatan",
    "slug": "wajo",
    "name": "Wajo",
    "type": "kabupaten",
    "bpsCode": "7313",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7314",
    "islandId": "isl-sulawesi-selatan",
    "slug": "sidenreng-rappang",
    "name": "Sidenreng Rappang",
    "type": "kabupaten",
    "bpsCode": "7314",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7315",
    "islandId": "isl-sulawesi-selatan",
    "slug": "pinrang",
    "name": "Pinrang",
    "type": "kabupaten",
    "bpsCode": "7315",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7316",
    "islandId": "isl-sulawesi-selatan",
    "slug": "enrekang",
    "name": "Enrekang",
    "type": "kabupaten",
    "bpsCode": "7316",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7317",
    "islandId": "isl-sulawesi-selatan",
    "slug": "luwu",
    "name": "Luwu",
    "type": "kabupaten",
    "bpsCode": "7317",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7318",
    "islandId": "isl-sulawesi-selatan",
    "slug": "tana-toraja",
    "name": "Tana Toraja",
    "type": "kabupaten",
    "bpsCode": "7318",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7322",
    "islandId": "isl-sulawesi-selatan",
    "slug": "luwu-utara",
    "name": "Luwu Utara",
    "type": "kabupaten",
    "bpsCode": "7322",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7325",
    "islandId": "isl-sulawesi-selatan",
    "slug": "luwu-timur",
    "name": "Luwu Timur",
    "type": "kabupaten",
    "bpsCode": "7325",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7326",
    "islandId": "isl-sulawesi-selatan",
    "slug": "toraja-utara",
    "name": "Toraja Utara",
    "type": "kabupaten",
    "bpsCode": "7326",
    "summary": "Regency in Sulawesi Selatan."
  },
  {
    "id": "pl-makassar",
    "islandId": "isl-sulawesi-selatan",
    "slug": "makassar",
    "name": "Makassar",
    "type": "kota",
    "bpsCode": "7371",
    "summary": "City in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7372",
    "islandId": "isl-sulawesi-selatan",
    "slug": "parepare",
    "name": "Parepare",
    "type": "kota",
    "bpsCode": "7372",
    "summary": "City in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7373",
    "islandId": "isl-sulawesi-selatan",
    "slug": "palopo",
    "name": "Palopo",
    "type": "kota",
    "bpsCode": "7373",
    "summary": "City in Sulawesi Selatan."
  },
  {
    "id": "pl-adm-7401",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "buton",
    "name": "Buton",
    "type": "kabupaten",
    "bpsCode": "7401",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7402",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "muna",
    "name": "Muna",
    "type": "kabupaten",
    "bpsCode": "7402",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7403",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "konawe",
    "name": "Konawe",
    "type": "kabupaten",
    "bpsCode": "7403",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7404",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "kolaka",
    "name": "Kolaka",
    "type": "kabupaten",
    "bpsCode": "7404",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7405",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "konawe-selatan",
    "name": "Konawe Selatan",
    "type": "kabupaten",
    "bpsCode": "7405",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7406",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "bombana",
    "name": "Bombana",
    "type": "kabupaten",
    "bpsCode": "7406",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7407",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "wakatobi",
    "name": "Wakatobi",
    "type": "kabupaten",
    "bpsCode": "7407",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7408",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "kolaka-utara",
    "name": "Kolaka Utara",
    "type": "kabupaten",
    "bpsCode": "7408",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7409",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "buton-utara",
    "name": "Buton Utara",
    "type": "kabupaten",
    "bpsCode": "7409",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7410",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "konawe-utara",
    "name": "Konawe Utara",
    "type": "kabupaten",
    "bpsCode": "7410",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7411",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "kolaka-timur",
    "name": "Kolaka Timur",
    "type": "kabupaten",
    "bpsCode": "7411",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7412",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "konawe-kepulauan",
    "name": "Konawe Kepulauan",
    "type": "kabupaten",
    "bpsCode": "7412",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7413",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "muna-barat",
    "name": "Muna Barat",
    "type": "kabupaten",
    "bpsCode": "7413",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7414",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "buton-tengah",
    "name": "Buton Tengah",
    "type": "kabupaten",
    "bpsCode": "7414",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7415",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "buton-selatan",
    "name": "Buton Selatan",
    "type": "kabupaten",
    "bpsCode": "7415",
    "summary": "Regency in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7471",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "kendari",
    "name": "Kendari",
    "type": "kota",
    "bpsCode": "7471",
    "summary": "City in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7472",
    "islandId": "isl-sulawesi-tenggara",
    "slug": "bau-bau",
    "name": "Bau Bau",
    "type": "kota",
    "bpsCode": "7472",
    "summary": "City in Sulawesi Tenggara."
  },
  {
    "id": "pl-adm-7501",
    "islandId": "isl-gorontalo",
    "slug": "boalemo",
    "name": "Boalemo",
    "type": "kabupaten",
    "bpsCode": "7501",
    "summary": "Regency in Gorontalo."
  },
  {
    "id": "pl-adm-7502",
    "islandId": "isl-gorontalo",
    "slug": "kabupaten-gorontalo",
    "name": "Gorontalo",
    "type": "kabupaten",
    "bpsCode": "7502",
    "summary": "Regency in Gorontalo."
  },
  {
    "id": "pl-adm-7503",
    "islandId": "isl-gorontalo",
    "slug": "pohuwato",
    "name": "Pohuwato",
    "type": "kabupaten",
    "bpsCode": "7503",
    "summary": "Regency in Gorontalo."
  },
  {
    "id": "pl-adm-7504",
    "islandId": "isl-gorontalo",
    "slug": "bone-bolango",
    "name": "Bone Bolango",
    "type": "kabupaten",
    "bpsCode": "7504",
    "summary": "Regency in Gorontalo."
  },
  {
    "id": "pl-adm-7505",
    "islandId": "isl-gorontalo",
    "slug": "gorontalo-utara",
    "name": "Gorontalo Utara",
    "type": "kabupaten",
    "bpsCode": "7505",
    "summary": "Regency in Gorontalo."
  },
  {
    "id": "pl-adm-7571",
    "islandId": "isl-gorontalo",
    "slug": "gorontalo",
    "name": "Gorontalo",
    "type": "kota",
    "bpsCode": "7571",
    "summary": "City in Gorontalo."
  },
  {
    "id": "pl-adm-7601",
    "islandId": "isl-sulawesi-barat",
    "slug": "majene",
    "name": "Majene",
    "type": "kabupaten",
    "bpsCode": "7601",
    "summary": "Regency in Sulawesi Barat."
  },
  {
    "id": "pl-adm-7602",
    "islandId": "isl-sulawesi-barat",
    "slug": "polewali-mandar",
    "name": "Polewali Mandar",
    "type": "kabupaten",
    "bpsCode": "7602",
    "summary": "Regency in Sulawesi Barat."
  },
  {
    "id": "pl-adm-7603",
    "islandId": "isl-sulawesi-barat",
    "slug": "mamasa",
    "name": "Mamasa",
    "type": "kabupaten",
    "bpsCode": "7603",
    "summary": "Regency in Sulawesi Barat."
  },
  {
    "id": "pl-adm-7604",
    "islandId": "isl-sulawesi-barat",
    "slug": "mamuju",
    "name": "Mamuju",
    "type": "kabupaten",
    "bpsCode": "7604",
    "summary": "Regency in Sulawesi Barat."
  },
  {
    "id": "pl-adm-7605",
    "islandId": "isl-sulawesi-barat",
    "slug": "pasangkayu",
    "name": "Pasangkayu",
    "type": "kabupaten",
    "bpsCode": "7605",
    "summary": "Regency in Sulawesi Barat."
  },
  {
    "id": "pl-adm-7606",
    "islandId": "isl-sulawesi-barat",
    "slug": "mamuju-tengah",
    "name": "Mamuju Tengah",
    "type": "kabupaten",
    "bpsCode": "7606",
    "summary": "Regency in Sulawesi Barat."
  },
  {
    "id": "pl-adm-8101",
    "islandId": "isl-maluku",
    "slug": "kepulauan-tanimbar",
    "name": "Kepulauan Tanimbar",
    "type": "kabupaten",
    "bpsCode": "8101",
    "summary": "Regency in Maluku."
  },
  {
    "id": "pl-adm-8102",
    "islandId": "isl-maluku",
    "slug": "maluku-tenggara",
    "name": "Maluku Tenggara",
    "type": "kabupaten",
    "bpsCode": "8102",
    "summary": "Regency in Maluku."
  },
  {
    "id": "pl-adm-8103",
    "islandId": "isl-maluku",
    "slug": "maluku-tengah",
    "name": "Maluku Tengah",
    "type": "kabupaten",
    "bpsCode": "8103",
    "summary": "Regency in Maluku."
  },
  {
    "id": "pl-adm-8104",
    "islandId": "isl-maluku",
    "slug": "buru",
    "name": "Buru",
    "type": "kabupaten",
    "bpsCode": "8104",
    "summary": "Regency in Maluku."
  },
  {
    "id": "pl-adm-8105",
    "islandId": "isl-maluku",
    "slug": "kepulauan-aru",
    "name": "Kepulauan Aru",
    "type": "kabupaten",
    "bpsCode": "8105",
    "summary": "Regency in Maluku."
  },
  {
    "id": "pl-adm-8106",
    "islandId": "isl-maluku",
    "slug": "seram-bagian-barat",
    "name": "Seram Bagian Barat",
    "type": "kabupaten",
    "bpsCode": "8106",
    "summary": "Regency in Maluku."
  },
  {
    "id": "pl-adm-8107",
    "islandId": "isl-maluku",
    "slug": "seram-bagian-timur",
    "name": "Seram Bagian Timur",
    "type": "kabupaten",
    "bpsCode": "8107",
    "summary": "Regency in Maluku."
  },
  {
    "id": "pl-adm-8108",
    "islandId": "isl-maluku",
    "slug": "maluku-barat-daya",
    "name": "Maluku Barat Daya",
    "type": "kabupaten",
    "bpsCode": "8108",
    "summary": "Regency in Maluku."
  },
  {
    "id": "pl-adm-8109",
    "islandId": "isl-maluku",
    "slug": "buru-selatan",
    "name": "Buru Selatan",
    "type": "kabupaten",
    "bpsCode": "8109",
    "summary": "Regency in Maluku."
  },
  {
    "id": "pl-adm-8171",
    "islandId": "isl-maluku",
    "slug": "ambon",
    "name": "Ambon",
    "type": "kota",
    "bpsCode": "8171",
    "summary": "City in Maluku."
  },
  {
    "id": "pl-adm-8172",
    "islandId": "isl-maluku",
    "slug": "tual",
    "name": "Tual",
    "type": "kota",
    "bpsCode": "8172",
    "summary": "City in Maluku."
  },
  {
    "id": "pl-adm-8201",
    "islandId": "isl-maluku-utara",
    "slug": "halmahera-barat",
    "name": "Halmahera Barat",
    "type": "kabupaten",
    "bpsCode": "8201",
    "summary": "Regency in Maluku Utara."
  },
  {
    "id": "pl-adm-8202",
    "islandId": "isl-maluku-utara",
    "slug": "halmahera-tengah",
    "name": "Halmahera Tengah",
    "type": "kabupaten",
    "bpsCode": "8202",
    "summary": "Regency in Maluku Utara."
  },
  {
    "id": "pl-adm-8203",
    "islandId": "isl-maluku-utara",
    "slug": "kepulauan-sula",
    "name": "Kepulauan Sula",
    "type": "kabupaten",
    "bpsCode": "8203",
    "summary": "Regency in Maluku Utara."
  },
  {
    "id": "pl-adm-8204",
    "islandId": "isl-maluku-utara",
    "slug": "halmahera-selatan",
    "name": "Halmahera Selatan",
    "type": "kabupaten",
    "bpsCode": "8204",
    "summary": "Regency in Maluku Utara."
  },
  {
    "id": "pl-adm-8205",
    "islandId": "isl-maluku-utara",
    "slug": "halmahera-utara",
    "name": "Halmahera Utara",
    "type": "kabupaten",
    "bpsCode": "8205",
    "summary": "Regency in Maluku Utara."
  },
  {
    "id": "pl-adm-8206",
    "islandId": "isl-maluku-utara",
    "slug": "halmahera-timur",
    "name": "Halmahera Timur",
    "type": "kabupaten",
    "bpsCode": "8206",
    "summary": "Regency in Maluku Utara."
  },
  {
    "id": "pl-adm-8207",
    "islandId": "isl-maluku-utara",
    "slug": "pulau-morotai",
    "name": "Pulau Morotai",
    "type": "kabupaten",
    "bpsCode": "8207",
    "summary": "Regency in Maluku Utara."
  },
  {
    "id": "pl-adm-8208",
    "islandId": "isl-maluku-utara",
    "slug": "pulau-taliabu",
    "name": "Pulau Taliabu",
    "type": "kabupaten",
    "bpsCode": "8208",
    "summary": "Regency in Maluku Utara."
  },
  {
    "id": "pl-adm-8271",
    "islandId": "isl-maluku-utara",
    "slug": "ternate",
    "name": "Ternate",
    "type": "kota",
    "bpsCode": "8271",
    "summary": "City in Maluku Utara."
  },
  {
    "id": "pl-adm-8272",
    "islandId": "isl-maluku-utara",
    "slug": "tidore-kepulauan",
    "name": "Tidore Kepulauan",
    "type": "kota",
    "bpsCode": "8272",
    "summary": "City in Maluku Utara."
  },
  {
    "id": "pl-adm-9101",
    "islandId": "isl-papua-barat",
    "slug": "fak-fak",
    "name": "Fak Fak",
    "type": "kabupaten",
    "bpsCode": "9101",
    "summary": "Regency in Papua Barat."
  },
  {
    "id": "pl-adm-9102",
    "islandId": "isl-papua-barat",
    "slug": "kaimana",
    "name": "Kaimana",
    "type": "kabupaten",
    "bpsCode": "9102",
    "summary": "Regency in Papua Barat."
  },
  {
    "id": "pl-adm-9103",
    "islandId": "isl-papua-barat",
    "slug": "teluk-wondama",
    "name": "Teluk Wondama",
    "type": "kabupaten",
    "bpsCode": "9103",
    "summary": "Regency in Papua Barat."
  },
  {
    "id": "pl-adm-9104",
    "islandId": "isl-papua-barat",
    "slug": "teluk-bintuni",
    "name": "Teluk Bintuni",
    "type": "kabupaten",
    "bpsCode": "9104",
    "summary": "Regency in Papua Barat."
  },
  {
    "id": "pl-adm-9105",
    "islandId": "isl-papua-barat",
    "slug": "manokwari",
    "name": "Manokwari",
    "type": "kabupaten",
    "bpsCode": "9105",
    "summary": "Regency in Papua Barat."
  },
  {
    "id": "pl-adm-9111",
    "islandId": "isl-papua-barat",
    "slug": "manokwari-selatan",
    "name": "Manokwari Selatan",
    "type": "kabupaten",
    "bpsCode": "9111",
    "summary": "Regency in Papua Barat."
  },
  {
    "id": "pl-adm-9112",
    "islandId": "isl-papua-barat",
    "slug": "pegunungan-arfak",
    "name": "Pegunungan Arfak",
    "type": "kabupaten",
    "bpsCode": "9112",
    "summary": "Regency in Papua Barat."
  },
  {
    "id": "pl-adm-9201",
    "islandId": "isl-papua-barat-daya",
    "slug": "raja-ampat",
    "name": "Raja Ampat",
    "type": "kabupaten",
    "bpsCode": "9201",
    "summary": "Regency in Papua Barat Daya."
  },
  {
    "id": "pl-adm-9202",
    "islandId": "isl-papua-barat-daya",
    "slug": "kabupaten-sorong",
    "name": "Sorong",
    "type": "kabupaten",
    "bpsCode": "9202",
    "summary": "Regency in Papua Barat Daya."
  },
  {
    "id": "pl-adm-9203",
    "islandId": "isl-papua-barat-daya",
    "slug": "sorong-selatan",
    "name": "Sorong Selatan",
    "type": "kabupaten",
    "bpsCode": "9203",
    "summary": "Regency in Papua Barat Daya."
  },
  {
    "id": "pl-adm-9204",
    "islandId": "isl-papua-barat-daya",
    "slug": "maybrat",
    "name": "Maybrat",
    "type": "kabupaten",
    "bpsCode": "9204",
    "summary": "Regency in Papua Barat Daya."
  },
  {
    "id": "pl-adm-9205",
    "islandId": "isl-papua-barat-daya",
    "slug": "tambrauw",
    "name": "Tambrauw",
    "type": "kabupaten",
    "bpsCode": "9205",
    "summary": "Regency in Papua Barat Daya."
  },
  {
    "id": "pl-adm-9271",
    "islandId": "isl-papua-barat-daya",
    "slug": "sorong",
    "name": "Sorong",
    "type": "kota",
    "bpsCode": "9271",
    "summary": "City in Papua Barat Daya."
  },
  {
    "id": "pl-adm-9403",
    "islandId": "isl-papua",
    "slug": "kabupaten-jayapura",
    "name": "Jayapura",
    "type": "kabupaten",
    "bpsCode": "9403",
    "summary": "Regency in Papua."
  },
  {
    "id": "pl-adm-9408",
    "islandId": "isl-papua",
    "slug": "kepulauan-yapen",
    "name": "Kepulauan Yapen",
    "type": "kabupaten",
    "bpsCode": "9408",
    "summary": "Regency in Papua."
  },
  {
    "id": "pl-adm-9409",
    "islandId": "isl-papua",
    "slug": "biak-numfor",
    "name": "Biak Numfor",
    "type": "kabupaten",
    "bpsCode": "9409",
    "summary": "Regency in Papua."
  },
  {
    "id": "pl-adm-9419",
    "islandId": "isl-papua",
    "slug": "sarmi",
    "name": "Sarmi",
    "type": "kabupaten",
    "bpsCode": "9419",
    "summary": "Regency in Papua."
  },
  {
    "id": "pl-adm-9420",
    "islandId": "isl-papua",
    "slug": "keerom",
    "name": "Keerom",
    "type": "kabupaten",
    "bpsCode": "9420",
    "summary": "Regency in Papua."
  },
  {
    "id": "pl-adm-9426",
    "islandId": "isl-papua",
    "slug": "waropen",
    "name": "Waropen",
    "type": "kabupaten",
    "bpsCode": "9426",
    "summary": "Regency in Papua."
  },
  {
    "id": "pl-adm-9427",
    "islandId": "isl-papua",
    "slug": "supiori",
    "name": "Supiori",
    "type": "kabupaten",
    "bpsCode": "9427",
    "summary": "Regency in Papua."
  },
  {
    "id": "pl-adm-9428",
    "islandId": "isl-papua",
    "slug": "mamberamo-raya",
    "name": "Mamberamo Raya",
    "type": "kabupaten",
    "bpsCode": "9428",
    "summary": "Regency in Papua."
  },
  {
    "id": "pl-adm-9471",
    "islandId": "isl-papua",
    "slug": "jayapura",
    "name": "Jayapura",
    "type": "kota",
    "bpsCode": "9471",
    "summary": "City in Papua."
  },
  {
    "id": "pl-adm-9501",
    "islandId": "isl-papua-selatan",
    "slug": "merauke",
    "name": "Merauke",
    "type": "kabupaten",
    "bpsCode": "9501",
    "summary": "Regency in Papua Selatan."
  },
  {
    "id": "pl-adm-9502",
    "islandId": "isl-papua-selatan",
    "slug": "boven-digoel",
    "name": "Boven Digoel",
    "type": "kabupaten",
    "bpsCode": "9502",
    "summary": "Regency in Papua Selatan."
  },
  {
    "id": "pl-adm-9503",
    "islandId": "isl-papua-selatan",
    "slug": "mappi",
    "name": "Mappi",
    "type": "kabupaten",
    "bpsCode": "9503",
    "summary": "Regency in Papua Selatan."
  },
  {
    "id": "pl-adm-9504",
    "islandId": "isl-papua-selatan",
    "slug": "asmat",
    "name": "Asmat",
    "type": "kabupaten",
    "bpsCode": "9504",
    "summary": "Regency in Papua Selatan."
  },
  {
    "id": "pl-adm-9601",
    "islandId": "isl-papua-tengah",
    "slug": "mimika",
    "name": "Mimika",
    "type": "kabupaten",
    "bpsCode": "9601",
    "summary": "Regency in Papua Tengah."
  },
  {
    "id": "pl-adm-9602",
    "islandId": "isl-papua-tengah",
    "slug": "dogiyai",
    "name": "Dogiyai",
    "type": "kabupaten",
    "bpsCode": "9602",
    "summary": "Regency in Papua Tengah."
  },
  {
    "id": "pl-adm-9603",
    "islandId": "isl-papua-tengah",
    "slug": "deiyai",
    "name": "Deiyai",
    "type": "kabupaten",
    "bpsCode": "9603",
    "summary": "Regency in Papua Tengah."
  },
  {
    "id": "pl-adm-9604",
    "islandId": "isl-papua-tengah",
    "slug": "nabire",
    "name": "Nabire",
    "type": "kabupaten",
    "bpsCode": "9604",
    "summary": "Regency in Papua Tengah."
  },
  {
    "id": "pl-adm-9605",
    "islandId": "isl-papua-tengah",
    "slug": "paniai",
    "name": "Paniai",
    "type": "kabupaten",
    "bpsCode": "9605",
    "summary": "Regency in Papua Tengah."
  },
  {
    "id": "pl-adm-9606",
    "islandId": "isl-papua-tengah",
    "slug": "intan-jaya",
    "name": "Intan Jaya",
    "type": "kabupaten",
    "bpsCode": "9606",
    "summary": "Regency in Papua Tengah."
  },
  {
    "id": "pl-adm-9607",
    "islandId": "isl-papua-tengah",
    "slug": "puncak",
    "name": "Puncak",
    "type": "kabupaten",
    "bpsCode": "9607",
    "summary": "Regency in Papua Tengah."
  },
  {
    "id": "pl-adm-9608",
    "islandId": "isl-papua-tengah",
    "slug": "puncak-jaya",
    "name": "Puncak Jaya",
    "type": "kabupaten",
    "bpsCode": "9608",
    "summary": "Regency in Papua Tengah."
  },
  {
    "id": "pl-adm-9701",
    "islandId": "isl-papua-pegunungan",
    "slug": "nduga",
    "name": "Nduga",
    "type": "kabupaten",
    "bpsCode": "9701",
    "summary": "Regency in Papua Pegunungan."
  },
  {
    "id": "pl-adm-9702",
    "islandId": "isl-papua-pegunungan",
    "slug": "jayawijaya",
    "name": "Jayawijaya",
    "type": "kabupaten",
    "bpsCode": "9702",
    "summary": "Regency in Papua Pegunungan."
  },
  {
    "id": "pl-adm-9703",
    "islandId": "isl-papua-pegunungan",
    "slug": "lanny-jaya",
    "name": "Lanny Jaya",
    "type": "kabupaten",
    "bpsCode": "9703",
    "summary": "Regency in Papua Pegunungan."
  },
  {
    "id": "pl-adm-9704",
    "islandId": "isl-papua-pegunungan",
    "slug": "tolikara",
    "name": "Tolikara",
    "type": "kabupaten",
    "bpsCode": "9704",
    "summary": "Regency in Papua Pegunungan."
  },
  {
    "id": "pl-adm-9705",
    "islandId": "isl-papua-pegunungan",
    "slug": "mamberamo-tengah",
    "name": "Mamberamo Tengah",
    "type": "kabupaten",
    "bpsCode": "9705",
    "summary": "Regency in Papua Pegunungan."
  },
  {
    "id": "pl-adm-9706",
    "islandId": "isl-papua-pegunungan",
    "slug": "yalimo",
    "name": "Yalimo",
    "type": "kabupaten",
    "bpsCode": "9706",
    "summary": "Regency in Papua Pegunungan."
  },
  {
    "id": "pl-adm-9707",
    "islandId": "isl-papua-pegunungan",
    "slug": "yahukimo",
    "name": "Yahukimo",
    "type": "kabupaten",
    "bpsCode": "9707",
    "summary": "Regency in Papua Pegunungan."
  },
  {
    "id": "pl-adm-9708",
    "islandId": "isl-papua-pegunungan",
    "slug": "pegunungan-bintang",
    "name": "Pegunungan Bintang",
    "type": "kabupaten",
    "bpsCode": "9708",
    "summary": "Regency in Papua Pegunungan."
  }
];
