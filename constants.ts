import { Role, Region, Cluster } from "./types";

export const ROLES: Role[] = [Role.TDR, Role.MDR, Role.BA_LT, Role.Admin];

export const REGIONS: Region[] = [
  Region.CENTRAL,
];

export const CLUSTERS: Cluster[] = [
  Cluster.NORTH_WEST,
  Cluster.NORTHERN_CAPE,
  Cluster.FREE_STATE,
];

// Mapping "Ofs" to Free State for the dropdown logic logic, 
// keeping "Ofs" as the key used in the specific selection logic.
export const ONBOARD_CLUSTERS = ["North West", "Northern Cape", "Ofs"];

export const MAINPLACES_OFS = [
"Aletta", "Ashbury", "Austin's Post", "Balkfontein", "Batho", "Bethlehem CBD", "Bethlehem Suburbs", "Blomanda", 
"Bob Rogers Park", "Bohlokong", "Bolokanang", "Borwa", "Bosdraai", "Botshabelo 1", "Botshabelo 2", "Botshabelo 3", 
"Botshabelo F", "Dan Pienaar", "Deals Gift Ah", "Deurgezien Small Holdings", "Dihlabeng Nu", "Dipelaneng", "Ditlhake", 
"Ditshehlong", "Elsburg", "Fateng Tse Ntsho", "Feloane Trust", "Fichardt Park", "Free State Saaiplaas Gold Mine", 
"Ghost Park", "Gladstone", "Gomvlei", "Grasslands", "Grasslands Sonskyn", "Groenebloem", "Groenpunt Resort", 
"Gunhill Panorama", "Hani Park", "Heilbron", "Hennenman Ventersburg", "Hillsboro", "Hlohlolwane", "Hopefield", 
"Hospitaal Park", "Itumeleng", "J B Mafora", "Jakkalskop", "Kgubetswana", "Kommandodrif", "Kopanong", "Kransfontein", 
"Kroonstad CBD", "Kroonstad Central", "Kroonvaal", "Kutloanong", "Kwakwatsi", "Ladybrand", "Langenhoven Park", 
"Leeubult Mine", "Lephoi", "Leratswana", "Mabula", "Mafahlaneng", "Mahlatswetsa", "Majemasweu", "Makeleketle", 
"Malebogo", "Mamafubedu", "Mangaung", "Mantsopa", "Maokeng", "Mashaeng", "Masilo", "Matlakeng", "Mautse", "Meloding", 
"Meloding Farms", "Meqheleng Zone 8", "Metsimaholo", "Modderpoort", "Mohokare", "Mokodumela", "Mokwallo", "Mokwena Selosesha", 
"Monyakeng", "Moqhaka Rural", "Morojaneng", "Nala", "Namahadi", "Ngwathe", "Nketoana", "Ntha", "Ntswanatsatsi", 
"Odendaalsrus", "Petra Dam", "Petsana", "Phahameng", "Phathakahle", "Poding-tse-rolo", "President Brand Gold Mine", 
"Qibing", "Rammulotsi", "Refengkgotso", "Riebeeckstad Orange Grove", "Rodenbeck Kopanong", "Rustfontein", "Saaiplaas", 
"Sasolburg CBD", "Selosesha", "Serfontein", "Setsoto", "Steenwerp", "Steynsrus", "Sussanaskop", "Teisesville", 
"Thabong East", "Thabong Rural", "Thabong Sp", "Thabong West", "Thorisong Vuka", "Tikwana", "Tswaraganang", "Tumahole", 
"Tweedoorns Dam", "Uitzigt", "Universitas", "Vaal Park", "Vaal South Reefs Gold Mine", "Vegkop", "Verkeerdevlei", 
"Vierfontein", "Voorspoed Diamantmyn", "Welkom CBD", "Willem Pretorius Wildtuin", "Wolwehoek", "Wonderkop", "Zamdela"
];

export const MAINPLACES_NORTH_WEST = [
"Alabama", "Bakerville", "Bathobatho", "Bodibe", "Boitumelong", "Bophelong", "Cachet", "Carletonville CBD", "Cooke Mine", 
"Dassierand", "Delareyville", "Dihatshwane", "Disaneng-masibi", "Ditsobotla", "Dominionville", "East Driefontein Mine", 
"Ellaton", "Elsburg Gold Mine", "Flamwood", "Fochville", "Ganyesa", "Geysdorp", "Glen Una Eenzaamheid", "Goedgevonden", 
"Golf View", "Goudvlakte West", "Greater Taung", "Huhudi", "Ikageng", "Ikageng1", "Ipelegeng", "Itekeng", "Jouberton", 
"Kagisano", "Kanana", "Kgakala", "Kgwedimopitlo", "Khuma", "Khunotswana", "Khunwana", "Khutsong", "Khutsong South", 
"Klersdorp CBD", "Klipdrift", "Kloof Gold Mine", "Koedoesfontein", "Kopela", "Lebaleng", "Lekwa-teemane", "Leopard Park", 
"Letlhakane", "Letsopa", "Libanon Gold Mine", "Lindequesdrif", "Logageng", "Lomanyaneng", "Lonely Park", "Lourenspark", 
"Lower Majeakgoro", "Madibogo Pan", "Mafikeng CBD", "Magogoe", "Makgabana (madibe)", "Manamolele", "Matlosana", 
"Merafong City", "Mmabatho", "Molelema", "Motsoseng Seweding", "Naledi", "Naledi Nu", "Orkney CBD", "Outlying Flamwood", 
"Phitshane", "Pochindustria", "Pomfret", "Potchefstroom CBD", "Promosa", "Pudumoe Unit 1", "Ramasodi Mohlabeng", 
"Rietfontein", "Riviera Park", "Rulaganyang", "Rural Klersdorp", "Rural Orkney", "Setlagole", "Simunye", "Slurry", 
"Southey", "Stilfontein", "Syferbult", "Tambo Section", "Taung", "Tlakgameng", "Tlhabologang", "Tlokwe City Council", 
"Tshepong", "Tshing", "Tswaing", "Tswelelang", "Umzimhle", "Utlwanang", "Vleikop Ah", "Vryburg CBD", "Wedela", 
"Westonaria", "Wilgeboom", "Wolwespruit Nature Reserve"
];

export const MAINPLACES_NORTHERN_CAPE = [
"Bendell", "Blydeville Middelpos", "Breipaas", "Colesberg", "Colville", "De Aar", "Dibeng", "Dinopeng", "Galeshwe", 
"Green Point", "Hanover", "Heuningvlei", "Ikhutseng", "Kai !garib", "Kamden", "Kareeberg", "Kathu", "Khara Hais", 
"Kimberley CBD", "Kleinhardt", "Kuruman", "Lemnertsville", "Lime Acres", "Lotlhakane", "Makalaneng", "Maruping", 
"Mataleng", "Mier", "Moshaweng", "Mothibi", "Nakop", "New Bright", "Nickershoop", "Nuwerus", "Paballelo Belview", 
"Pampierstad", "Platfontein", "Pofadder", "Postmansburg", "Proteaville", "Renosterberg", "Richmond", "Rietvale", 
"Roodepan", "Salt Lake", "Schmidtsdrif", "Sedibeng", "Siyancuma", "Southridge", "Steynville", "Stutterheim", 
"Tidimalo", "Tsantsabane", "Tsantsabane Nu", "Ubuntu", "Uitsig", "Upington", "Upington CBD", "Valspan", "Van Zylsrus", 
"Vosburg", "Walhsig", "Wonderwerk"
];