export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
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

export type PostgisGeometry = PostgisPoint | PostgisPolygon;
