import type {
  AvailabilityStatus,
  SportLevel,
  Visibility,
} from "@/lib/validations/athlete-profile";

export type MockMedia = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl: string;
  label: string;
};

export type MockPalmaresEntry = {
  id: string;
  season: string;
  title: string;
  competition: string;
};

export type MockCareerEntry = {
  id: string;
  period: string;
  club: string;
  level: SportLevel;
};

export type MockStat = {
  label: string;
  value: string;
};

export type MockAthleteSport = {
  sportSlug: string;
  positionLabelFr: string;
  positionLabelEn: string;
  level: SportLevel;
};

export type MockAthlete = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  coverColor: string;
  bio: string;
  country: string;
  countryFlag: string;
  birthDate: string;
  heightCm: number;
  weightKg: number;
  dominantSide: "left" | "right" | "both";
  availability: AvailabilityStatus;
  mobility: boolean;
  visibility: Visibility;
  verified: boolean;
  isMinor: boolean;
  currentClub: string;
  sports: MockAthleteSport[];
  stats: MockStat[];
  palmares: MockPalmaresEntry[];
  career: MockCareerEntry[];
  media: MockMedia[];
  languages: string[];
};

export type MockRecruiterOrg = {
  id: string;
  name: string;
  type: "club" | "recruiter";
  country: string;
  verified: boolean;
  logoColor: string;
  description: string;
};

export type MockOffer = {
  id: string;
  orgId: string;
  title: string;
  sportSlug: string;
  positionLabelFr: string;
  level: SportLevel;
  location: string;
  description: string;
};
