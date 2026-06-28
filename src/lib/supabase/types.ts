
/** JSON value type used by Supabase. */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      game_throw: {
        Row: {
          id: number;
          name: string;
          throw: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          throw: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          throw?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// PostGIS geometry types
export interface PostgisPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface PostgisPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

/** PostGIS geometry union type. */
export type PostgisGeometry = PostgisPoint | PostgisPolygon;
