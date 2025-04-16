export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      feedback: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          rating: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          rating: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          rating?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          dependants: number | null
          email: string
          existing_loans: number | null
          first_name: string | null
          gross_income: number | null
          id: string
          last_name: string | null
          marital_status: string | null
          partner_income: number | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          borrowing_capacity: number | null
          purchase_timeframe: string | null
          loan_amount: number | null
          interest_rate: number | null
          loan_term: string | null
          repayment_frequency: string | null
          loan_type: string | null
          additional_repayments: number | null
          monthly_repayment: number | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          dependants?: number | null
          email: string
          existing_loans?: number | null
          first_name?: string | null
          gross_income?: number | null
          id: string
          last_name?: string | null
          marital_status?: string | null
          partner_income?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          borrowing_capacity?: number | null
          purchase_timeframe?: string | null
          loan_amount?: number | null
          interest_rate?: number | null
          loan_term?: string | null
          repayment_frequency?: string | null
          loan_type?: string | null
          additional_repayments?: number | null
          monthly_repayment?: number | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          dependants?: number | null
          email?: string
          existing_loans?: number | null
          first_name?: string | null
          gross_income?: number | null
          id?: string
          last_name?: string | null
          marital_status?: string | null
          partner_income?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          borrowing_capacity?: number | null
          purchase_timeframe?: string | null
          loan_amount?: number | null
          interest_rate?: number | null
          loan_term?: string | null
          repayment_frequency?: string | null
          loan_type?: string | null
          additional_repayments?: number | null
          monthly_repayment?: number | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          area: number
          baths: number
          beds: number
          created_at: string
          description: string | null
          features: string[] | null
          growth_rate: number | null
          id: string
          image_url: string | null
          name: string
          price: number
          rental_yield: number | null
        }
        Insert: {
          address: string
          area: number
          baths: number
          beds: number
          created_at?: string
          description?: string | null
          features?: string[] | null
          growth_rate?: number | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          rental_yield?: number | null
        }
        Update: {
          address?: string
          area?: number
          baths?: number
          beds?: number
          created_at?: string
          description?: string | null
          features?: string[] | null
          growth_rate?: number | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          rental_yield?: number | null
        }
        Relationships: []
      }
      saved_properties: {
        Row: {
          created_at: string
          id: string
          property_id: string
          purchased: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          purchased?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          purchased?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_properties_user_id_fkey"
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
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "client" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["client", "admin"],
    },
  },
} as const
