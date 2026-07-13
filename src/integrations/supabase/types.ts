export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dokumentasi: {
        Row: {
          caption: string | null
          created_at: string
          dipilih_wa: boolean
          file_name: string | null
          file_path: string
          id: string
          laporan_id: string
          mime_type: string | null
          ukuran: number | null
          updated_at: string
          urutan: number
          user_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          dipilih_wa?: boolean
          file_name?: string | null
          file_path: string
          id?: string
          laporan_id: string
          mime_type?: string | null
          ukuran?: number | null
          updated_at?: string
          urutan?: number
          user_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          dipilih_wa?: boolean
          file_name?: string | null
          file_path?: string
          id?: string
          laporan_id?: string
          mime_type?: string | null
          ukuran?: number | null
          updated_at?: string
          urutan?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dokumentasi_laporan_id_fkey"
            columns: ["laporan_id"]
            isOneToOne: false
            referencedRelation: "laporan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dokumentasi_user_profile_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      laporan: {
        Row: {
          created_at: string
          data_dinamis: Json
          dokumentasi: Json
          hasil_kegiatan: string | null
          hasil_pelaksanaan: string | null
          id: string
          jam: string | null
          jenis_kegiatan: string | null
          latar_belakang: string | null
          maksud_tujuan: string | null
          nama_kegiatan: string
          no_sp: string | null
          pelaksana: Json
          pembuat_nama: string | null
          perihal_sp: string | null
          seksi: string | null
          status: string
          status_spj: string
          status_wa: string
          sumber_dana: string | null
          tanggal: string
          tanggal_sp: string | null
          tempat: Json
          updated_at: string
          user_id: string | null
          hasil_penutup: string | null
        }
        Insert: {
          created_at?: string
          data_dinamis?: Json
          dokumentasi?: Json
          hasil_kegiatan?: string | null
          hasil_pelaksanaan?: string | null
          id?: string
          jam?: string | null
          jenis_kegiatan?: string | null
          latar_belakang?: string | null
          maksud_tujuan?: string | null
          nama_kegiatan: string
          no_sp?: string | null
          pelaksana?: Json
          pembuat_nama?: string | null
          perihal_sp?: string | null
          seksi?: string | null
          status?: string
          status_spj?: string
          status_wa?: string
          sumber_dana?: string | null
          tanggal: string
          tanggal_sp?: string | null
          tempat?: Json
          updated_at?: string
          user_id?: string | null
          hasil_penutup?: string | null
        }
        Update: {
          created_at?: string
          data_dinamis?: Json
          dokumentasi?: Json
          hasil_kegiatan?: string | null
          hasil_pelaksanaan?: string | null
          id?: string
          jam?: string | null
          jenis_kegiatan?: string | null
          latar_belakang?: string | null
          maksud_tujuan?: string | null
          nama_kegiatan?: string
          no_sp?: string | null
          pelaksana?: Json
          pembuat_nama?: string | null
          perihal_sp?: string | null
          seksi?: string | null
          status?: string
          status_spj?: string
          status_wa?: string
          sumber_dana?: string | null
          tanggal?: string
          tanggal_sp?: string | null
          tempat?: Json
          updated_at?: string
          user_id?: string | null
          hasil_penutup?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "laporan_user_profile_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pegawai: {
        Row: {
          aktif: boolean
          created_at: string
          gelar: string | null
          id: string
          jabatan: string | null
          nama: string
          nip: string | null
          pangkat: string | null
          seksi: string | null
          updated_at: string
          urutan_hierarki: number
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          gelar?: string | null
          id?: string
          jabatan?: string | null
          nama: string
          nip?: string | null
          pangkat?: string | null
          seksi?: string | null
          updated_at?: string
          urutan_hierarki?: number
        }
        Update: {
          aktif?: boolean
          created_at?: string
          gelar?: string | null
          id?: string
          jabatan?: string | null
          nama?: string
          nip?: string | null
          pangkat?: string | null
          seksi?: string | null
          updated_at?: string
          urutan_hierarki?: number
        }
        Relationships: []
      }
      pengaturan: {
        Row: {
          id: number
          logo_url: string | null
          nama_instansi: string
          nama_kepala: string
          template_laporan: string | null
          updated_at: string
          wa_tujuan: string | null
        }
        Insert: {
          id?: number
          logo_url?: string | null
          nama_instansi?: string
          nama_kepala?: string
          template_laporan?: string | null
          updated_at?: string
          wa_tujuan?: string | null
        }
        Update: {
          id?: number
          logo_url?: string | null
          nama_instansi?: string
          nama_kepala?: string
          template_laporan?: string | null
          updated_at?: string
          wa_tujuan?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nama: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nama?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_profile_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_can_view_all_reports: { Args: never; Returns: boolean }
      current_user_is_admin: { Args: never; Returns: boolean }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "pegawai" | "pimpinan"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "pegawai", "pimpinan"],
    },
  },
} as const
