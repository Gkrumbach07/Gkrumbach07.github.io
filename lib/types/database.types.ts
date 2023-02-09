export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      campsites: {
        Row: {
          cmt: string | null
          desc: string | null
          ele: number | null
          geom: unknown | null
          id: number
          lake_id: number | null
          lake_name: string | null
          link1_href: string | null
          name: string | null
          rating: number | null
          status: string | null
        }
        Insert: {
          cmt?: string | null
          desc?: string | null
          ele?: number | null
          geom?: unknown | null
          id?: number
          lake_id?: number | null
          lake_name?: string | null
          link1_href?: string | null
          name?: string | null
          rating?: number | null
          status?: string | null
        }
        Update: {
          cmt?: string | null
          desc?: string | null
          ele?: number | null
          geom?: unknown | null
          id?: number
          lake_id?: number | null
          lake_name?: string | null
          link1_href?: string | null
          name?: string | null
          rating?: number | null
          status?: string | null
        }
      }
      lakes: {
        Row: {
          geom: unknown | null
          id: number
          name: string | null
          osm_id: string | null
        }
        Insert: {
          geom?: unknown | null
          id?: number
          name?: string | null
          osm_id?: string | null
        }
        Update: {
          geom?: unknown | null
          id?: number
          name?: string | null
          osm_id?: string | null
        }
      }
      portages: {
        Row: {
          cmt: string | null
          desc: string | null
          geom: unknown | null
          id: number
          link1_href: string | null
          link1_text: string | null
          link1_type: string | null
          link2_href: string | null
          link2_text: string | null
          link2_type: string | null
          name: string | null
          number: number | null
          src: string | null
          type: string | null
        }
        Insert: {
          cmt?: string | null
          desc?: string | null
          geom?: unknown | null
          id?: number
          link1_href?: string | null
          link1_text?: string | null
          link1_type?: string | null
          link2_href?: string | null
          link2_text?: string | null
          link2_type?: string | null
          name?: string | null
          number?: number | null
          src?: string | null
          type?: string | null
        }
        Update: {
          cmt?: string | null
          desc?: string | null
          geom?: unknown | null
          id?: number
          link1_href?: string | null
          link1_text?: string | null
          link1_type?: string | null
          link2_href?: string | null
          link2_text?: string | null
          link2_type?: string | null
          name?: string | null
          number?: number | null
          src?: string | null
          type?: string | null
        }
      }
      waterways: {
        Row: {
          geom: unknown | null
          id: number
          name: string | null
          osm_id: string | null
          waterway: string | null
        }
        Insert: {
          geom?: unknown | null
          id?: number
          name?: string | null
          osm_id?: string | null
          waterway?: string | null
        }
        Update: {
          geom?: unknown | null
          id?: number
          name?: string | null
          osm_id?: string | null
          waterway?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      campsites: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      lakes: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      portages: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      trails: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      waterways: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
    }
    Enums: {
      status: "upcoming" | "active" | "inactive" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}