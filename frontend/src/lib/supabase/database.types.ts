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

export type Database = {
  public: {
    Tables: {
      garments: {
        Row: GarmentRow;
        Insert: GarmentInsert;
        Update: GarmentUpdate;
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
