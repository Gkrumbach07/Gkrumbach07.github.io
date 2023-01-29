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
          details: string | null
          id: number
          lastUpdated: string | null
          link: string | null
          pinned: boolean
          status: Database["public"]["Enums"]["status"]
          title: string
        }
        Insert: {
          details?: string | null
          id?: number
          lastUpdated?: string | null
          link?: string | null
          pinned?: boolean
          status: Database["public"]["Enums"]["status"]
          title: string
        }
        Update: {
          details?: string | null
          id?: number
          lastUpdated?: string | null
          link?: string | null
          pinned?: boolean
          status?: Database["public"]["Enums"]["status"]
          title?: string
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
      trails: {
        Row: {
          accessibil: string | null
          admin_org: string | null
          allowed_sn: string | null
          allowed_te: string | null
          attributes: string | null
          atv_accpt_: string | null
          atv_manage: string | null
          atv_restri: string | null
          bicycle_ac: string | null
          bicycle_ma: string | null
          bicycle_re: string | null
          bmp: number | null
          emp: number | null
          fourwd_acc: string | null
          fourwd_man: string | null
          fourwd_res: string | null
          geom: unknown | null
          gis_miles: number | null
          hiker_pe_1: string | null
          hiker_pe_2: string | null
          hiker_pede: string | null
          id: number
          managing_o: string | null
          minimum_tr: string | null
          motor_wa_1: string | null
          motor_wa_2: string | null
          motor_wate: string | null
          motorcyc_1: string | null
          motorcyc_2: string | null
          motorcycle: string | null
          mvum_symbo: number | null
          national_t: number | null
          nonmotor_1: string | null
          nonmotor_2: string | null
          nonmotor_w: string | null
          objectid: number | null
          pack_sad_1: string | null
          pack_sad_2: string | null
          pack_saddl: string | null
          security_i: string | null
          segment_le: number | null
          shape_leng: number | null
          snow_motor: string | null
          snowmobi_1: string | null
          snowmobi_2: string | null
          snowmobile: string | null
          snowshoe_a: string | null
          snowshoe_m: string | null
          snowshoe_r: string | null
          special_mg: string | null
          surface_fi: string | null
          terra_base: string | null
          terra_moto: string | null
          trail_clas: string | null
          trail_cn: string | null
          trail_name: string | null
          trail_no: string | null
          trail_surf: string | null
          trail_type: string | null
          typical__1: string | null
          typical__2: string | null
          typical_tr: string | null
          water_moto: string | null
          xcountry_1: string | null
          xcountry_2: string | null
          xcountry_s: string | null
        }
        Insert: {
          accessibil?: string | null
          admin_org?: string | null
          allowed_sn?: string | null
          allowed_te?: string | null
          attributes?: string | null
          atv_accpt_?: string | null
          atv_manage?: string | null
          atv_restri?: string | null
          bicycle_ac?: string | null
          bicycle_ma?: string | null
          bicycle_re?: string | null
          bmp?: number | null
          emp?: number | null
          fourwd_acc?: string | null
          fourwd_man?: string | null
          fourwd_res?: string | null
          geom?: unknown | null
          gis_miles?: number | null
          hiker_pe_1?: string | null
          hiker_pe_2?: string | null
          hiker_pede?: string | null
          id?: number
          managing_o?: string | null
          minimum_tr?: string | null
          motor_wa_1?: string | null
          motor_wa_2?: string | null
          motor_wate?: string | null
          motorcyc_1?: string | null
          motorcyc_2?: string | null
          motorcycle?: string | null
          mvum_symbo?: number | null
          national_t?: number | null
          nonmotor_1?: string | null
          nonmotor_2?: string | null
          nonmotor_w?: string | null
          objectid?: number | null
          pack_sad_1?: string | null
          pack_sad_2?: string | null
          pack_saddl?: string | null
          security_i?: string | null
          segment_le?: number | null
          shape_leng?: number | null
          snow_motor?: string | null
          snowmobi_1?: string | null
          snowmobi_2?: string | null
          snowmobile?: string | null
          snowshoe_a?: string | null
          snowshoe_m?: string | null
          snowshoe_r?: string | null
          special_mg?: string | null
          surface_fi?: string | null
          terra_base?: string | null
          terra_moto?: string | null
          trail_clas?: string | null
          trail_cn?: string | null
          trail_name?: string | null
          trail_no?: string | null
          trail_surf?: string | null
          trail_type?: string | null
          typical__1?: string | null
          typical__2?: string | null
          typical_tr?: string | null
          water_moto?: string | null
          xcountry_1?: string | null
          xcountry_2?: string | null
          xcountry_s?: string | null
        }
        Update: {
          accessibil?: string | null
          admin_org?: string | null
          allowed_sn?: string | null
          allowed_te?: string | null
          attributes?: string | null
          atv_accpt_?: string | null
          atv_manage?: string | null
          atv_restri?: string | null
          bicycle_ac?: string | null
          bicycle_ma?: string | null
          bicycle_re?: string | null
          bmp?: number | null
          emp?: number | null
          fourwd_acc?: string | null
          fourwd_man?: string | null
          fourwd_res?: string | null
          geom?: unknown | null
          gis_miles?: number | null
          hiker_pe_1?: string | null
          hiker_pe_2?: string | null
          hiker_pede?: string | null
          id?: number
          managing_o?: string | null
          minimum_tr?: string | null
          motor_wa_1?: string | null
          motor_wa_2?: string | null
          motor_wate?: string | null
          motorcyc_1?: string | null
          motorcyc_2?: string | null
          motorcycle?: string | null
          mvum_symbo?: number | null
          national_t?: number | null
          nonmotor_1?: string | null
          nonmotor_2?: string | null
          nonmotor_w?: string | null
          objectid?: number | null
          pack_sad_1?: string | null
          pack_sad_2?: string | null
          pack_saddl?: string | null
          security_i?: string | null
          segment_le?: number | null
          shape_leng?: number | null
          snow_motor?: string | null
          snowmobi_1?: string | null
          snowmobi_2?: string | null
          snowmobile?: string | null
          snowshoe_a?: string | null
          snowshoe_m?: string | null
          snowshoe_r?: string | null
          special_mg?: string | null
          surface_fi?: string | null
          terra_base?: string | null
          terra_moto?: string | null
          trail_clas?: string | null
          trail_cn?: string | null
          trail_name?: string | null
          trail_no?: string | null
          trail_surf?: string | null
          trail_type?: string | null
          typical__1?: string | null
          typical__2?: string | null
          typical_tr?: string | null
          water_moto?: string | null
          xcountry_1?: string | null
          xcountry_2?: string | null
          xcountry_s?: string | null
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
      trails: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
    }
    Enums: {
      status: "upcoming" | "active" | "inactive" | "done"
    }
  }
}