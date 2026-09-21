export type GarmentAnalysis = {
  category: string;
  primaryColor: string;
  material: string;
  silhouette: string;
  formality: string;
  season: string;
};

export const garmentAnalysisFields = [
  { key: "category", label: "Category" },
  { key: "primaryColor", label: "Primary color" },
  { key: "material", label: "Material" },
  { key: "silhouette", label: "Silhouette" },
  { key: "formality", label: "Formality" },
  { key: "season", label: "Season" },
] as const satisfies ReadonlyArray<{
  key: keyof GarmentAnalysis;
  label: string;
}>;

export const occasions = [
  { id: "casual", label: "Casual" },
  { id: "work", label: "Work" },
  { id: "date", label: "Date" },
  { id: "party", label: "Party" },
  { id: "wedding-guest", label: "Wedding Guest" },
  { id: "vacation", label: "Vacation" },
] as const;

export const weatherOptions = [
  { id: "warm", label: "Warm" },
  { id: "mild", label: "Mild" },
  { id: "cold", label: "Cold" },
] as const;

export const styleDirections = [
  { id: "minimal", label: "Minimal" },
  { id: "classic", label: "Classic" },
  { id: "trendy", label: "Trendy" },
  { id: "edgy", label: "Edgy" },
  { id: "feminine", label: "Feminine" },
] as const;

export type Occasion = (typeof occasions)[number]["id"];
export type Weather = (typeof weatherOptions)[number]["id"];
export type StyleDirection = (typeof styleDirections)[number]["id"];

export type StylingPreferences = {
  occasions: Occasion[];
  weather: Weather | null;
  styleDirection: StyleDirection | null;
};

export type FlowStep =
  | "upload"
  | "preview"
  | "analyzing"
  | "analysis-error"
  | "details"
  | "preferences"
  | "complete";
