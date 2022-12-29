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
      projects: {
        Row: {
          id: number
          title: string
          link: string | null
          lastUpdated: string | null
          status: Database["public"]["Enums"]["status"]
          details: string | null
          pinned: boolean
        }
        Insert: {
          id?: number
          title: string
          link?: string | null
          lastUpdated?: string | null
          status: Database["public"]["Enums"]["status"]
          details?: string | null
          pinned?: boolean
        }
        Update: {
          id?: number
          title?: string
          link?: string | null
          lastUpdated?: string | null
          status?: Database["public"]["Enums"]["status"]
          details?: string | null
          pinned?: boolean
        }
      }
      projects_tags: {
        Row: {
          project_id: number
          tag_id: string
        }
        Insert: {
          project_id: number
          tag_id: string
        }
        Update: {
          project_id?: number
          tag_id?: string
        }
      }
      tags: {
        Row: {
          name: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      status: "upcoming" | "active" | "inactive" | "done"
    }
  }
}