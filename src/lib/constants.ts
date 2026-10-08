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
