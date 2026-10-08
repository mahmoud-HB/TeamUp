/**
 * Global constants for sports, levels, availability, etc.
 */

export const SPORTS_LABELS: Record<string, string> = {
  football: "Football",
  basketball: "Basketball",
  tennis: "Tennis",
  volleyball: "Volleyball",
  handball: "Handball",
  rugby: "Rugby",
  hockey: "Hockey",
  swimming: "Natation",
  athletics: "Athlétisme",
  badminton: "Badminton",
  golf: "Golf",
  cycling: "Cyclisme",
  boxing: "Boxe",
  martial_arts: "Arts Martiaux",
};

export const LEVELS: Record<string, string> = {
  beginner: "Débutant",
  amateur: "Amateur",
  semi_pro: "Semi-professionnel",
  pro: "Professionnel",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  free: "Libre",
  under_contract: "Sous contrat",
  on_loan: "En prêt",
};

export const POSITIONS: Record<string, string> = {
  // Football
  "Attaquant": "Attaquant",
  "Ailier": "Ailier",
  "Milieu de terrain": "Milieu de terrain",
  "Défenseur latéral": "Défenseur latéral",
  "Défenseur central": "Défenseur central",
  "Gardien de but": "Gardien de but",
  
  // Basketball
  "Point Guard": "Point Guard",
  "Shooting Guard": "Shooting Guard",
  "Small Forward": "Small Forward",
  "Power Forward": "Power Forward",
  "Center": "Center",
  
  // Tennis
  "Simple": "Simple",
  "Double": "Double",
  
  // Other sports
  "Autre": "Autre",
};

export const SPORTS: string[] = Object.keys(SPORTS_LABELS);

export const COUNTRIES: Record<string, string> = {
  FR: "France",
  GB: "United Kingdom",
  DE: "Germany",
  ES: "Spain",
  IT: "Italy",
  PT: "Portugal",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  PL: "Poland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  CZ: "Czech Republic",
  HU: "Hungary",
  RO: "Romania",
  GR: "Greece",
  TR: "Turkey",
  UA: "Ukraine",
  RU: "Russia",
  US: "United States",
  CA: "Canada",
  BR: "Brazil",
  AR: "Argentina",
  MX: "Mexico",
  AU: "Australia",
  JP: "Japan",
  CN: "China",
  IN: "India",
  ZA: "South Africa",
};
