export type GarmentRow = {
  id: string;
  user_id: string;
  image_path: string;
  category: string;
  primary_color: string;
  material: string | null;
  silhouette: string | null;
  formality: string | null;
  season: string | null;
  created_at: string;
  updated_at: string;
};

export type GarmentInsert = {
  id?: string;
  user_id?: string;
  image_path: string;
  category: string;
  primary_color: string;
  material?: string | null;
  silhouette?: string | null;
  formality?: string | null;
  season?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GarmentUpdate = Partial<GarmentInsert>;

export type SavedLookRow = {
  id: string;
  user_id: string;
  title: string;
  occasion: string;
  rationale: string;
  fingerprint: string;
  created_at: string;
  updated_at: string;
};

export type SavedLookItemRow = {
  id: string;
  saved_look_id: string;
  garment_id: string;
  position: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      garments: {
        Row: GarmentRow;
        Insert: GarmentInsert;
        Update: GarmentUpdate;
        Relationships: [];
      };
      saved_looks: {
        Row: SavedLookRow;
        Insert: Partial<SavedLookRow> & {
          title: string;
          rationale: string;
          fingerprint: string;
        };
        Update: Partial<SavedLookRow>;
        Relationships: [];
      };
      saved_look_items: {
        Row: SavedLookItemRow;
        Insert: Partial<SavedLookItemRow> & {
          saved_look_id: string;
          garment_id: string;
          position: number;
        };
        Update: Partial<SavedLookItemRow>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
