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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_actions_log: {
        Row: {
          action_details: Json
          action_type: string
          admin_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          target_user_id: string
        }
        Insert: {
          action_details: Json
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          target_user_id: string
        }
        Update: {
          action_details?: Json
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activity_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_credentials: {
        Row: {
          admin_user_id: string | null
          created_at: string | null
          email: string
          id: string
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_credentials_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_dashboard_settings: {
        Row: {
          admin_user_id: string | null
          created_at: string
          id: string
          notifications_enabled: boolean | null
          settings: Json | null
          sidebar_collapsed: boolean | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string
          id?: string
          notifications_enabled?: boolean | null
          settings?: Json | null
          sidebar_collapsed?: boolean | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string
          id?: string
          notifications_enabled?: boolean | null
          settings?: Json | null
          sidebar_collapsed?: boolean | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_dashboard_settings_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_user_id: string | null
          created_at: string
          expires_at: string
          id: string
          secret_code: string
          used_at: string | null
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          secret_code: string
          used_at?: string | null
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          secret_code?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          last_login: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changed_at: string
          changed_by: string
          details: Json | null
          id: string
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by: string
          details?: Json | null
          id?: string
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string
          details?: Json | null
          id?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      blockchain_identities: {
        Row: {
          blockchain_address: string | null
          created_at: string | null
          did: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          blockchain_address?: string | null
          created_at?: string | null
          did?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          blockchain_address?: string | null
          created_at?: string | null
          did?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      carbon_footprint_metrics: {
        Row: {
          carbon_emissions_kg: number | null
          compute_region: string | null
          energy_consumption_kwh: number | null
          measurement_id: string
          renewable_energy_percentage: number | null
          timestamp: string | null
        }
        Insert: {
          carbon_emissions_kg?: number | null
          compute_region?: string | null
          energy_consumption_kwh?: number | null
          measurement_id?: string
          renewable_energy_percentage?: number | null
          timestamp?: string | null
        }
        Update: {
          carbon_emissions_kg?: number | null
          compute_region?: string | null
          energy_consumption_kwh?: number | null
          measurement_id?: string
          renewable_energy_percentage?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      channel_participants: {
        Row: {
          channel_id: string | null
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_participants_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      client_filter_preferences: {
        Row: {
          amenities_required: string[] | null
          bicycle_types: string[] | null
          created_at: string | null
          floor_level_preference: string | null
          furnished_required: boolean | null
          id: string
          lifestyle_tags: string[] | null
          location_zones: string[] | null
          max_bathrooms: number | null
          max_bedrooms: number | null
          max_distance_to_beach: number | null
          max_distance_to_cowork: number | null
          max_price: number | null
          max_size_m2: number | null
          max_transport_budget: number | null
          min_bathrooms: number | null
          min_bedrooms: number | null
          min_internet_speed: string | null
          min_parking_spaces: number | null
          min_price: number | null
          min_size_m2: number | null
          motorcycle_types: string[] | null
          needs_bicycle: boolean | null
          needs_motorcycle: boolean | null
          pet_friendly_required: boolean | null
          preferred_lease_end_date: string | null
          preferred_lease_start_date: string | null
          preferred_listing_types: string[] | null
          preferred_pool_types: string[] | null
          preferred_tulum_locations: string[] | null
          preferred_unit_types: string[] | null
          property_types: string[] | null
          rental_duration: string | null
          requires_balcony: boolean | null
          requires_common_areas: boolean | null
          requires_coworking_space: boolean | null
          requires_elevator: boolean | null
          requires_gym: boolean | null
          requires_jacuzzi: boolean | null
          requires_lockoff_unit: boolean | null
          requires_private_rooftop: boolean | null
          requires_security_onsite: boolean | null
          requires_solar_panels: boolean | null
          requires_subletting_allowed: boolean | null
          services_included: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amenities_required?: string[] | null
          bicycle_types?: string[] | null
          created_at?: string | null
          floor_level_preference?: string | null
          furnished_required?: boolean | null
          id?: string
          lifestyle_tags?: string[] | null
          location_zones?: string[] | null
          max_bathrooms?: number | null
          max_bedrooms?: number | null
          max_distance_to_beach?: number | null
          max_distance_to_cowork?: number | null
          max_price?: number | null
          max_size_m2?: number | null
          max_transport_budget?: number | null
          min_bathrooms?: number | null
          min_bedrooms?: number | null
          min_internet_speed?: string | null
          min_parking_spaces?: number | null
          min_price?: number | null
          min_size_m2?: number | null
          motorcycle_types?: string[] | null
          needs_bicycle?: boolean | null
          needs_motorcycle?: boolean | null
          pet_friendly_required?: boolean | null
          preferred_lease_end_date?: string | null
          preferred_lease_start_date?: string | null
          preferred_listing_types?: string[] | null
          preferred_pool_types?: string[] | null
          preferred_tulum_locations?: string[] | null
          preferred_unit_types?: string[] | null
          property_types?: string[] | null
          rental_duration?: string | null
          requires_balcony?: boolean | null
          requires_common_areas?: boolean | null
          requires_coworking_space?: boolean | null
          requires_elevator?: boolean | null
          requires_gym?: boolean | null
          requires_jacuzzi?: boolean | null
          requires_lockoff_unit?: boolean | null
          requires_private_rooftop?: boolean | null
          requires_security_onsite?: boolean | null
          requires_solar_panels?: boolean | null
          requires_subletting_allowed?: boolean | null
          services_included?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amenities_required?: string[] | null
          bicycle_types?: string[] | null
          created_at?: string | null
          floor_level_preference?: string | null
          furnished_required?: boolean | null
          id?: string
          lifestyle_tags?: string[] | null
          location_zones?: string[] | null
          max_bathrooms?: number | null
          max_bedrooms?: number | null
          max_distance_to_beach?: number | null
          max_distance_to_cowork?: number | null
          max_price?: number | null
          max_size_m2?: number | null
          max_transport_budget?: number | null
          min_bathrooms?: number | null
          min_bedrooms?: number | null
          min_internet_speed?: string | null
          min_parking_spaces?: number | null
          min_price?: number | null
          min_size_m2?: number | null
          motorcycle_types?: string[] | null
          needs_bicycle?: boolean | null
          needs_motorcycle?: boolean | null
          pet_friendly_required?: boolean | null
          preferred_lease_end_date?: string | null
          preferred_lease_start_date?: string | null
          preferred_listing_types?: string[] | null
          preferred_pool_types?: string[] | null
          preferred_tulum_locations?: string[] | null
          preferred_unit_types?: string[] | null
          property_types?: string[] | null
          rental_duration?: string | null
          requires_balcony?: boolean | null
          requires_common_areas?: boolean | null
          requires_coworking_space?: boolean | null
          requires_elevator?: boolean | null
          requires_gym?: boolean | null
          requires_jacuzzi?: boolean | null
          requires_lockoff_unit?: boolean | null
          requires_private_rooftop?: boolean | null
          requires_security_onsite?: boolean | null
          requires_solar_panels?: boolean | null
          requires_subletting_allowed?: boolean | null
          services_included?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_preferences_detailed: {
        Row: {
          background_check_completed: boolean | null
          budget_max: number | null
          budget_min: number | null
          communication_style: string | null
          created_at: string | null
          credit_score_range: string | null
          employment_status: string | null
          id: string
          income_documents_provided: boolean | null
          income_verification: boolean | null
          languages_spoken: string[] | null
          lease_duration_preference: string | null
          lifestyle_compatibility: string[] | null
          move_in_flexibility: string | null
          occupation_category: string | null
          party_frequency: string | null
          pet_ownership: boolean | null
          pet_types: string[] | null
          previous_landlord_references: boolean | null
          smoking_preference: string | null
          social_media_verified: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          background_check_completed?: boolean | null
          budget_max?: number | null
          budget_min?: number | null
          communication_style?: string | null
          created_at?: string | null
          credit_score_range?: string | null
          employment_status?: string | null
          id?: string
          income_documents_provided?: boolean | null
          income_verification?: boolean | null
          languages_spoken?: string[] | null
          lease_duration_preference?: string | null
          lifestyle_compatibility?: string[] | null
          move_in_flexibility?: string | null
          occupation_category?: string | null
          party_frequency?: string | null
          pet_ownership?: boolean | null
          pet_types?: string[] | null
          previous_landlord_references?: boolean | null
          smoking_preference?: string | null
          social_media_verified?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          background_check_completed?: boolean | null
          budget_max?: number | null
          budget_min?: number | null
          communication_style?: string | null
          created_at?: string | null
          credit_score_range?: string | null
          employment_status?: string | null
          id?: string
          income_documents_provided?: boolean | null
          income_verification?: boolean | null
          languages_spoken?: string[] | null
          lease_duration_preference?: string | null
          lifestyle_compatibility?: string[] | null
          move_in_flexibility?: string | null
          occupation_category?: string | null
          party_frequency?: string | null
          pet_ownership?: boolean | null
          pet_types?: string[] | null
          previous_landlord_references?: boolean | null
          smoking_preference?: string | null
          social_media_verified?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_preferences_detailed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_preferences_detailed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_preferences_detailed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string | null
          gender: string | null
          id: number
          interests: string[] | null
          location: Json | null
          name: string | null
          preferred_activities: string[] | null
          profile_images: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string | null
          gender?: string | null
          id?: never
          interests?: string[] | null
          location?: Json | null
          name?: string | null
          preferred_activities?: string[] | null
          profile_images?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string | null
          gender?: string | null
          id?: never
          interests?: string[] | null
          location?: Json | null
          name?: string | null
          preferred_activities?: string[] | null
          profile_images?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      communication_channels: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          type?: string | null
        }
        Relationships: []
      }
      contract_signatures: {
        Row: {
          contract_id: string
          id: string
          ip_address: unknown | null
          signature_data: string
          signature_type: Database["public"]["Enums"]["signature_type"]
          signed_at: string | null
          signer_id: string
          user_agent: string | null
        }
        Insert: {
          contract_id: string
          id?: string
          ip_address?: unknown | null
          signature_data: string
          signature_type: Database["public"]["Enums"]["signature_type"]
          signed_at?: string | null
          signer_id: string
          user_agent?: string | null
        }
        Update: {
          contract_id?: string
          id?: string
          ip_address?: unknown | null
          signature_data?: string
          signature_type?: Database["public"]["Enums"]["signature_type"]
          signed_at?: string | null
          signer_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "digital_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message_text: string
          message_type: string | null
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_text: string
          message_type?: string | null
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_text?: string
          message_type?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_starters: {
        Row: {
          conversations_started: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          conversations_started?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          conversations_started?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          client_id: string
          created_at: string
          id: string
          last_message_at: string | null
          listing_id: string | null
          match_id: string | null
          owner_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          match_id?: string | null
          owner_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          match_id?: string | null
          owner_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_listing_id"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_listing_id"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_listing_id"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_match_id"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_access_logs: {
        Row: {
          action: string | null
          details: Json | null
          id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          details?: Json | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          details?: Json | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      data_lake_metadata: {
        Row: {
          compression_type: string | null
          data_type: string | null
          data_volume_bytes: number | null
          id: string
          ingestion_timestamp: string | null
          processing_status: string | null
          source_system: string | null
        }
        Insert: {
          compression_type?: string | null
          data_type?: string | null
          data_volume_bytes?: number | null
          id?: string
          ingestion_timestamp?: string | null
          processing_status?: string | null
          source_system?: string | null
        }
        Update: {
          compression_type?: string | null
          data_type?: string | null
          data_volume_bytes?: number | null
          id?: string
          ingestion_timestamp?: string | null
          processing_status?: string | null
          source_system?: string | null
        }
        Relationships: []
      }
      deal_status_tracking: {
        Row: {
          client_id: string
          completed_at: string | null
          contract_id: string
          created_at: string | null
          id: string
          listing_id: string | null
          owner_id: string
          signed_by_client_at: string | null
          signed_by_owner_at: string | null
          status: Database["public"]["Enums"]["deal_status"] | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          contract_id: string
          created_at?: string | null
          id?: string
          listing_id?: string | null
          owner_id: string
          signed_by_client_at?: string | null
          signed_by_owner_at?: string | null
          status?: Database["public"]["Enums"]["deal_status"] | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          contract_id?: string
          created_at?: string | null
          id?: string
          listing_id?: string | null
          owner_id?: string
          signed_by_client_at?: string | null
          signed_by_owner_at?: string | null
          status?: Database["public"]["Enums"]["deal_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_status_tracking_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "digital_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_contracts: {
        Row: {
          client_id: string | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string | null
          created_by: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          listing_id: string | null
          mime_type: string
          owner_id: string
          status: Database["public"]["Enums"]["deal_status"] | null
          terms_and_conditions: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at?: string | null
          created_by: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          listing_id?: string | null
          mime_type?: string
          owner_id: string
          status?: Database["public"]["Enums"]["deal_status"] | null
          terms_and_conditions?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string | null
          created_by?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          listing_id?: string | null
          mime_type?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["deal_status"] | null
          terms_and_conditions?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dispute_reports: {
        Row: {
          admin_notes: string | null
          contract_id: string
          created_at: string | null
          description: string
          id: string
          issue_type: string
          reported_against: string
          reported_by: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          contract_id: string
          created_at?: string | null
          description: string
          id?: string
          issue_type: string
          reported_against: string
          reported_by: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          contract_id?: string
          created_at?: string | null
          description?: string
          id?: string
          issue_type?: string
          reported_against?: string
          reported_by?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_reports_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "digital_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      edge_compute_nodes: {
        Row: {
          computational_capacity: number | null
          last_sync: string | null
          network_latency_ms: number | null
          node_id: string
          region: string | null
          status: string | null
        }
        Insert: {
          computational_capacity?: number | null
          last_sync?: string | null
          network_latency_ms?: number | null
          node_id?: string
          region?: string | null
          status?: string | null
        }
        Update: {
          computational_capacity?: number | null
          last_sync?: string | null
          network_latency_ms?: number | null
          node_id?: string
          region?: string | null
          status?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          listing_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          status: string
          updated_at: string | null
          user_id: string
          verification_notes: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          status?: string
          updated_at?: string | null
          user_id: string
          verification_notes?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          verification_notes?: string | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          direction: string | null
          id: string
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          direction?: string | null
          id?: string
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          direction?: string | null
          id?: string
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          additional_rules: string | null
          address: string | null
          amenities: string[] | null
          availability_calendar: Json | null
          availability_date: string | null
          balcony_count: number | null
          baths: number | null
          battery_range: number | null
          beds: number | null
          berths: number | null
          brake_type: string | null
          brand: string | null
          category: string | null
          city: string | null
          color: string | null
          common_areas: boolean | null
          condition: string | null
          contacts: number | null
          coworking_space: boolean | null
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          description_full: string | null
          description_short: string | null
          distance_to_beach: number | null
          distance_to_cowork: number | null
          electric_assist: boolean | null
          elevator: boolean | null
          engine_cc: number | null
          engines: string | null
          equipment: Json | null
          featured_image_url: string | null
          floor_level: number | null
          floorplan_url: string | null
          frame_material: string | null
          frame_size: string | null
          fuel_type: string | null
          furnished: boolean | null
          gear_type: string | null
          gym: boolean | null
          heating: boolean | null
          hoa_fees: number | null
          house_rules: string[] | null
          hull_material: string | null
          id: string
          ideal_tenant_description: string | null
          images: string[] | null
          included_utilities: string[] | null
          internet_speed: string | null
          is_active: boolean | null
          is_featured: boolean | null
          jacuzzi: boolean | null
          latitude: number | null
          lease_end_date: string | null
          lease_start_date: string | null
          lease_terms: string | null
          length_m: number | null
          levels: number | null
          license_required: string | null
          lifestyle_compatible: string[] | null
          likes: number | null
          listing_category: string | null
          listing_for: string | null
          listing_type: string | null
          location_accuracy: number | null
          location_zone: string | null
          lockoff_unit: boolean | null
          longitude: number | null
          max_occupants: number | null
          max_passengers: number | null
          mileage: number | null
          min_rental_term_months: number | null
          mode: string | null
          model: string | null
          move_in_date: string | null
          nearby_attractions: string[] | null
          neighborhood: string | null
          neighborhood_description: string | null
          open_house_dates: string[] | null
          owner_id: string
          parking_spaces: number | null
          pet_friendly: boolean | null
          pool_type: string | null
          price: number | null
          private_rooftop: boolean | null
          property_description: string | null
          property_type: string | null
          rental_duration_type: string | null
          rental_rates: Json | null
          rules: string[] | null
          sea_mountain_view: boolean | null
          security_onsite: boolean | null
          services_included: string[] | null
          smart_home: boolean | null
          solar_panels: boolean | null
          square_footage: number | null
          status: Database["public"]["Enums"]["listing_status"] | null
          subletting_allowed: boolean | null
          title: string | null
          transmission: string | null
          transportation_access: string[] | null
          tulum_location: string | null
          unit_type: string | null
          vehicle_type: string | null
          video_url: string | null
          view_count: number | null
          views: number | null
          washer_dryer: boolean | null
          wheel_size: number | null
          year: number | null
          year_built: number | null
        }
        Insert: {
          additional_rules?: string | null
          address?: string | null
          amenities?: string[] | null
          availability_calendar?: Json | null
          availability_date?: string | null
          balcony_count?: number | null
          baths?: number | null
          battery_range?: number | null
          beds?: number | null
          berths?: number | null
          brake_type?: string | null
          brand?: string | null
          category?: string | null
          city?: string | null
          color?: string | null
          common_areas?: boolean | null
          condition?: string | null
          contacts?: number | null
          coworking_space?: boolean | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          description_full?: string | null
          description_short?: string | null
          distance_to_beach?: number | null
          distance_to_cowork?: number | null
          electric_assist?: boolean | null
          elevator?: boolean | null
          engine_cc?: number | null
          engines?: string | null
          equipment?: Json | null
          featured_image_url?: string | null
          floor_level?: number | null
          floorplan_url?: string | null
          frame_material?: string | null
          frame_size?: string | null
          fuel_type?: string | null
          furnished?: boolean | null
          gear_type?: string | null
          gym?: boolean | null
          heating?: boolean | null
          hoa_fees?: number | null
          house_rules?: string[] | null
          hull_material?: string | null
          id?: string
          ideal_tenant_description?: string | null
          images?: string[] | null
          included_utilities?: string[] | null
          internet_speed?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          jacuzzi?: boolean | null
          latitude?: number | null
          lease_end_date?: string | null
          lease_start_date?: string | null
          lease_terms?: string | null
          length_m?: number | null
          levels?: number | null
          license_required?: string | null
          lifestyle_compatible?: string[] | null
          likes?: number | null
          listing_category?: string | null
          listing_for?: string | null
          listing_type?: string | null
          location_accuracy?: number | null
          location_zone?: string | null
          lockoff_unit?: boolean | null
          longitude?: number | null
          max_occupants?: number | null
          max_passengers?: number | null
          mileage?: number | null
          min_rental_term_months?: number | null
          mode?: string | null
          model?: string | null
          move_in_date?: string | null
          nearby_attractions?: string[] | null
          neighborhood?: string | null
          neighborhood_description?: string | null
          open_house_dates?: string[] | null
          owner_id: string
          parking_spaces?: number | null
          pet_friendly?: boolean | null
          pool_type?: string | null
          price?: number | null
          private_rooftop?: boolean | null
          property_description?: string | null
          property_type?: string | null
          rental_duration_type?: string | null
          rental_rates?: Json | null
          rules?: string[] | null
          sea_mountain_view?: boolean | null
          security_onsite?: boolean | null
          services_included?: string[] | null
          smart_home?: boolean | null
          solar_panels?: boolean | null
          square_footage?: number | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          subletting_allowed?: boolean | null
          title?: string | null
          transmission?: string | null
          transportation_access?: string[] | null
          tulum_location?: string | null
          unit_type?: string | null
          vehicle_type?: string | null
          video_url?: string | null
          view_count?: number | null
          views?: number | null
          washer_dryer?: boolean | null
          wheel_size?: number | null
          year?: number | null
          year_built?: number | null
        }
        Update: {
          additional_rules?: string | null
          address?: string | null
          amenities?: string[] | null
          availability_calendar?: Json | null
          availability_date?: string | null
          balcony_count?: number | null
          baths?: number | null
          battery_range?: number | null
          beds?: number | null
          berths?: number | null
          brake_type?: string | null
          brand?: string | null
          category?: string | null
          city?: string | null
          color?: string | null
          common_areas?: boolean | null
          condition?: string | null
          contacts?: number | null
          coworking_space?: boolean | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          description_full?: string | null
          description_short?: string | null
          distance_to_beach?: number | null
          distance_to_cowork?: number | null
          electric_assist?: boolean | null
          elevator?: boolean | null
          engine_cc?: number | null
          engines?: string | null
          equipment?: Json | null
          featured_image_url?: string | null
          floor_level?: number | null
          floorplan_url?: string | null
          frame_material?: string | null
          frame_size?: string | null
          fuel_type?: string | null
          furnished?: boolean | null
          gear_type?: string | null
          gym?: boolean | null
          heating?: boolean | null
          hoa_fees?: number | null
          house_rules?: string[] | null
          hull_material?: string | null
          id?: string
          ideal_tenant_description?: string | null
          images?: string[] | null
          included_utilities?: string[] | null
          internet_speed?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          jacuzzi?: boolean | null
          latitude?: number | null
          lease_end_date?: string | null
          lease_start_date?: string | null
          lease_terms?: string | null
          length_m?: number | null
          levels?: number | null
          license_required?: string | null
          lifestyle_compatible?: string[] | null
          likes?: number | null
          listing_category?: string | null
          listing_for?: string | null
          listing_type?: string | null
          location_accuracy?: number | null
          location_zone?: string | null
          lockoff_unit?: boolean | null
          longitude?: number | null
          max_occupants?: number | null
          max_passengers?: number | null
          mileage?: number | null
          min_rental_term_months?: number | null
          mode?: string | null
          model?: string | null
          move_in_date?: string | null
          nearby_attractions?: string[] | null
          neighborhood?: string | null
          neighborhood_description?: string | null
          open_house_dates?: string[] | null
          owner_id?: string
          parking_spaces?: number | null
          pet_friendly?: boolean | null
          pool_type?: string | null
          price?: number | null
          private_rooftop?: boolean | null
          property_description?: string | null
          property_type?: string | null
          rental_duration_type?: string | null
          rental_rates?: Json | null
          rules?: string[] | null
          sea_mountain_view?: boolean | null
          security_onsite?: boolean | null
          services_included?: string[] | null
          smart_home?: boolean | null
          solar_panels?: boolean | null
          square_footage?: number | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          subletting_allowed?: boolean | null
          title?: string | null
          transmission?: string | null
          transportation_access?: string[] | null
          tulum_location?: string | null
          unit_type?: string | null
          vehicle_type?: string | null
          video_url?: string | null
          view_count?: number | null
          views?: number | null
          washer_dryer?: boolean | null
          wheel_size?: number | null
          year?: number | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      location_intelligence: {
        Row: {
          crime_rate: number | null
          id: string
          location: unknown | null
          neighborhood_score: number | null
          property_id: string | null
          walkability_score: number | null
        }
        Insert: {
          crime_rate?: number | null
          id?: string
          location?: unknown | null
          neighborhood_score?: number | null
          property_id?: string | null
          walkability_score?: number | null
        }
        Update: {
          crime_rate?: number | null
          id?: string
          location?: unknown | null
          neighborhood_score?: number | null
          property_id?: string | null
          walkability_score?: number | null
        }
        Relationships: []
      }
      match_conversations: {
        Row: {
          id: number
          is_read: boolean | null
          match_id: number | null
          message_text: string
          message_type: string | null
          sender_id: string | null
          sent_at: string | null
        }
        Insert: {
          id?: never
          is_read?: boolean | null
          match_id?: number | null
          message_text: string
          message_type?: string | null
          sender_id?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: never
          is_read?: boolean | null
          match_id?: number | null
          message_text?: string
          message_type?: string | null
          sender_id?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "property_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          client_id: string
          client_liked_at: string | null
          conversation_started: boolean | null
          created_at: string
          id: string
          is_mutual: boolean | null
          listing_id: string | null
          match_score: number | null
          owner_id: string
          owner_liked_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          client_liked_at?: string | null
          conversation_started?: boolean | null
          created_at?: string
          id?: string
          is_mutual?: boolean | null
          listing_id?: string | null
          match_score?: number | null
          owner_id: string
          owner_liked_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_liked_at?: string | null
          conversation_started?: boolean | null
          created_at?: string
          id?: string
          is_mutual?: boolean | null
          listing_id?: string | null
          match_score?: number | null
          owner_id?: string
          owner_liked_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_matches_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_matches_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_matches_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_matches_listing_id"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_matches_listing_id"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_matches_listing_id"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_matches_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_matches_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_matches_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          listing_id: string | null
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id: string
          is_read?: boolean | null
          listing_id?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          listing_id?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mexico_locations: {
        Row: {
          city: string
          created_at: string
          id: string
          neighborhoods: string[] | null
          state: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          neighborhoods?: string[] | null
          state: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          neighborhoods?: string[] | null
          state?: string
        }
        Relationships: []
      }
      mfa_methods: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          method: string | null
          secret: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          method?: string | null
          secret?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          method?: string | null
          secret?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      microservice_registry: {
        Row: {
          deployment_region: string | null
          endpoint_url: string | null
          health_status: string | null
          last_heartbeat: string | null
          service_id: string
          service_name: string | null
          version: string | null
        }
        Insert: {
          deployment_region?: string | null
          endpoint_url?: string | null
          health_status?: string | null
          last_heartbeat?: string | null
          service_id?: string
          service_name?: string | null
          version?: string | null
        }
        Update: {
          deployment_region?: string | null
          endpoint_url?: string | null
          health_status?: string | null
          last_heartbeat?: string | null
          service_id?: string
          service_name?: string | null
          version?: string | null
        }
        Relationships: []
      }
      ml_model_registry: {
        Row: {
          deployed_timestamp: string | null
          model_id: string
          model_name: string | null
          model_type: string | null
          performance_metrics: Json | null
          training_dataset_hash: string | null
          version: string | null
        }
        Insert: {
          deployed_timestamp?: string | null
          model_id?: string
          model_name?: string | null
          model_type?: string | null
          performance_metrics?: Json | null
          training_dataset_hash?: string | null
          version?: string | null
        }
        Update: {
          deployed_timestamp?: string | null
          model_id?: string
          model_name?: string | null
          model_type?: string | null
          performance_metrics?: Json | null
          training_dataset_hash?: string | null
          version?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          email_enabled: boolean | null
          notification_frequency: string | null
          push_enabled: boolean | null
          sms_enabled: boolean | null
          user_id: string
        }
        Insert: {
          email_enabled?: boolean | null
          notification_frequency?: string | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          user_id: string
        }
        Update: {
          email_enabled?: boolean | null
          notification_frequency?: string | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          read: boolean | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          message?: string | null
          read?: boolean | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_client_matches: {
        Row: {
          client_id: string | null
          client_notes: string | null
          communication_log: Json | null
          compatibility_factors: Json | null
          created_at: string | null
          id: string
          last_contact_date: string | null
          listing_id: string | null
          match_score: number | null
          next_follow_up_date: string | null
          owner_id: string | null
          owner_notes: string | null
          priority_level: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          client_notes?: string | null
          communication_log?: Json | null
          compatibility_factors?: Json | null
          created_at?: string | null
          id?: string
          last_contact_date?: string | null
          listing_id?: string | null
          match_score?: number | null
          next_follow_up_date?: string | null
          owner_id?: string | null
          owner_notes?: string | null
          priority_level?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          client_notes?: string | null
          communication_log?: Json | null
          compatibility_factors?: Json | null
          created_at?: string | null
          id?: string
          last_contact_date?: string | null
          listing_id?: string | null
          match_score?: number | null
          next_follow_up_date?: string | null
          owner_id?: string | null
          owner_notes?: string | null
          priority_level?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_client_matches_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_client_matches_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_client_matches_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_client_matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_client_matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_client_matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_client_matches_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_client_matches_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_client_matches_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_client_preferences: {
        Row: {
          allows_extra_guests: boolean | null
          allows_parties: boolean | null
          allows_pets: boolean | null
          cleanliness_important: boolean | null
          compatible_lifestyle_tags: string[] | null
          created_at: string | null
          id: string
          languages_spoken: string[] | null
          listing_id: string | null
          max_age: number | null
          max_extra_guests: number | null
          maximum_stay_days: number | null
          min_age: number | null
          minimum_stay_days: number | null
          no_smoking: boolean | null
          preferred_nationalities: string[] | null
          preferred_occupations: string[] | null
          punctual_payments_required: boolean | null
          quiet_hours_required: boolean | null
          requires_references: boolean | null
          respects_building_rules: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allows_extra_guests?: boolean | null
          allows_parties?: boolean | null
          allows_pets?: boolean | null
          cleanliness_important?: boolean | null
          compatible_lifestyle_tags?: string[] | null
          created_at?: string | null
          id?: string
          languages_spoken?: string[] | null
          listing_id?: string | null
          max_age?: number | null
          max_extra_guests?: number | null
          maximum_stay_days?: number | null
          min_age?: number | null
          minimum_stay_days?: number | null
          no_smoking?: boolean | null
          preferred_nationalities?: string[] | null
          preferred_occupations?: string[] | null
          punctual_payments_required?: boolean | null
          quiet_hours_required?: boolean | null
          requires_references?: boolean | null
          respects_building_rules?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allows_extra_guests?: boolean | null
          allows_parties?: boolean | null
          allows_pets?: boolean | null
          cleanliness_important?: boolean | null
          compatible_lifestyle_tags?: string[] | null
          created_at?: string | null
          id?: string
          languages_spoken?: string[] | null
          listing_id?: string | null
          max_age?: number | null
          max_extra_guests?: number | null
          maximum_stay_days?: number | null
          min_age?: number | null
          minimum_stay_days?: number | null
          no_smoking?: boolean | null
          preferred_nationalities?: string[] | null
          preferred_occupations?: string[] | null
          punctual_payments_required?: boolean | null
          quiet_hours_required?: boolean | null
          requires_references?: boolean | null
          respects_building_rules?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_client_preferences_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_client_preferences_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_client_preferences_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_likes: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_super_like: boolean | null
          listing_id: string | null
          owner_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_super_like?: boolean | null
          listing_id?: string | null
          owner_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_super_like?: boolean | null
          listing_id?: string | null
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_likes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_likes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_likes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_likes_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_likes_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_likes_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_likes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_likes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_likes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_properties: {
        Row: {
          amenities: string[] | null
          capacity: number | null
          created_at: string | null
          description: string | null
          id: number
          location: Json | null
          operating_hours: Json | null
          owner_id: string | null
          price_range: string | null
          property_images: string[] | null
          property_name: string
          property_type: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: never
          location?: Json | null
          operating_hours?: Json | null
          owner_id?: string | null
          price_range?: string | null
          property_images?: string[] | null
          property_name: string
          property_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: never
          location?: Json | null
          operating_hours?: Json | null
          owner_id?: string | null
          price_range?: string | null
          property_images?: string[] | null
          property_name?: string
          property_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      package_usage: {
        Row: {
          created_at: string | null
          id: string
          messages_sent_this_week: number | null
          month_start_date: string | null
          package_type: string
          properties_posted_this_month: number | null
          super_likes_used_this_month: number | null
          updated_at: string | null
          user_id: string
          week_start_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages_sent_this_week?: number | null
          month_start_date?: string | null
          package_type: string
          properties_posted_this_month?: number | null
          super_likes_used_this_month?: number | null
          updated_at?: string | null
          user_id: string
          week_start_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages_sent_this_week?: number | null
          month_start_date?: string | null
          package_type?: string
          properties_posted_this_month?: number | null
          super_likes_used_this_month?: number | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_activations: {
        Row: {
          activated_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          payment_id: string | null
          payment_provider: string | null
          payment_status: string | null
          plan_id: string
          plan_name: string
          price: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          plan_id: string
          plan_name: string
          price: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          plan_id?: string
          plan_name?: string
          price?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_providers: {
        Row: {
          api_key: string | null
          id: string
          is_active: boolean | null
          name: string | null
          webhook_secret: string | null
        }
        Insert: {
          api_key?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          webhook_secret?: string | null
        }
        Update: {
          api_key?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          webhook_secret?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          provider_id: string | null
          status: string | null
          transaction_type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider_id?: string | null
          status?: string | null
          transaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider_id?: string | null
          status?: string | null
          transaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      paypal_credentials: {
        Row: {
          client_id: string
          created_at: string
          id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: never
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: never
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paypal_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paypal_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paypal_credentials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      paypal_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: number
          status: string
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: never
          status: string
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: never
          status?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paypal_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paypal_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paypal_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_logs: {
        Row: {
          execution_time: number | null
          id: string
          log_time: string
          query: string | null
        }
        Insert: {
          execution_time?: number | null
          id?: string
          log_time?: string
          query?: string | null
        }
        Update: {
          execution_time?: number | null
          id?: string
          log_time?: string
          query?: string | null
        }
        Relationships: []
      }
      profile_photos: {
        Row: {
          created_at: string
          id: string
          photo_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_update_logs: {
        Row: {
          created_at: string | null
          id: number
          update_details: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          update_details: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          update_details?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about_me: string | null
          additional_notes: string | null
          age: number | null
          amenities_wanted: string[] | null
          avatar_url: string | null
          background_check_available: boolean | null
          background_check_required: boolean | null
          bio: string | null
          broker_showcase_photos: string[] | null
          broker_tier: string | null
          broker_verified: boolean | null
          budget: number | null
          budget_max: number | null
          budget_min: number | null
          business_type: string | null
          buy_budget_max: number | null
          buy_budget_min: number | null
          buyer_intent: string | null
          city: string | null
          client_age_max: number | null
          client_age_min: number | null
          client_budget_max: number | null
          client_budget_min: number | null
          client_description: string | null
          contact_phone: string | null
          cooking_skills: string | null
          country_of_residence: string | null
          created_at: string | null
          credit_score_range: string | null
          data_sensitivity_level: string | null
          drinking: string | null
          drinking_policy: string | null
          education: string | null
          email: string | null
          email_verified: boolean | null
          emergency_contact: string | null
          employment_status: string | null
          employment_type: string | null
          ethnicity: string | null
          exercise_frequency: string | null
          financing_preference: string[] | null
          flexible_dates: boolean | null
          full_name: string | null
          furnished_preference: string | null
          gender: string | null
          guest_policy: string | null
          has_kids: boolean | null
          has_pets: boolean | null
          has_references: boolean | null
          height: number | null
          hobbies_interests: string[] | null
          id: string
          ideal_move_in_date: string | null
          images: string[] | null
          income_range: string | null
          interested_in_buying: boolean | null
          interests: string[] | null
          is_active: boolean
          is_public: boolean | null
          languages_spoken: string[] | null
          last_security_audit: string | null
          latitude: number | null
          lease_duration: string | null
          license_number: string | null
          lifestyle_description: string | null
          lifestyle_tags: string[] | null
          location: string | null
          location_accuracy: number | null
          location_preference: string | null
          location_updated_at: string | null
          longitude: number | null
          looking_for: string | null
          max_bathrooms: number | null
          max_bedrooms: number | null
          max_budget: number | null
          max_occupants_preference: number | null
          max_stay_preference: number | null
          min_bathrooms: number | null
          min_bedrooms: number | null
          minimum_credit_score: string | null
          monthly_income: string | null
          monthly_income_range: string | null
          move_in_date: string | null
          nationality: string | null
          occupation: string | null
          onboarding_completed: boolean | null
          owner_looking_for: string | null
          package: string | null
          party_friendly: boolean | null
          party_policy: string | null
          password_complexity_score: number | null
          pet_policy_owner: string | null
          pet_preference: boolean | null
          pet_types: string[] | null
          phone: string | null
          preferences: string[] | null
          preferred_activities: string[] | null
          preferred_bathrooms: number | null
          preferred_bedrooms: number | null
          preferred_buy_city: string | null
          preferred_buy_country: string | null
          preferred_buy_neighborhood: string | null
          preferred_listing_type: string | null
          preferred_locations: string[] | null
          preferred_occupations: string[] | null
          preferred_property_types: string[] | null
          previous_rental_history: string | null
          privacy_settings: Json | null
          profession: string | null
          profile_photo_url: string | null
          property_description: string | null
          property_location: string | null
          property_photos: string[] | null
          property_preferences: Json | null
          property_specialties: string[] | null
          property_type_want: string | null
          reason_for_moving: string | null
          references_text: string | null
          relationship_status: string | null
          rental_duration_preference: string | null
          rental_philosophy: string | null
          required_amenities: string[] | null
          role: string | null
          sexual_orientation: string | null
          size_preference: string | null
          smoking: boolean | null
          smoking_policy: string | null
          smoking_policy_owner: string | null
          social_level: string | null
          social_media_verification: string | null
          specializations: string[] | null
          theme_preference: string | null
          travel_frequency: string | null
          updated_at: string | null
          usage_intent: string | null
          verified: boolean | null
          work_location: string | null
          work_schedule: string | null
          years_experience: number | null
          years_of_experience: number | null
        }
        Insert: {
          about_me?: string | null
          additional_notes?: string | null
          age?: number | null
          amenities_wanted?: string[] | null
          avatar_url?: string | null
          background_check_available?: boolean | null
          background_check_required?: boolean | null
          bio?: string | null
          broker_showcase_photos?: string[] | null
          broker_tier?: string | null
          broker_verified?: boolean | null
          budget?: number | null
          budget_max?: number | null
          budget_min?: number | null
          business_type?: string | null
          buy_budget_max?: number | null
          buy_budget_min?: number | null
          buyer_intent?: string | null
          city?: string | null
          client_age_max?: number | null
          client_age_min?: number | null
          client_budget_max?: number | null
          client_budget_min?: number | null
          client_description?: string | null
          contact_phone?: string | null
          cooking_skills?: string | null
          country_of_residence?: string | null
          created_at?: string | null
          credit_score_range?: string | null
          data_sensitivity_level?: string | null
          drinking?: string | null
          drinking_policy?: string | null
          education?: string | null
          email?: string | null
          email_verified?: boolean | null
          emergency_contact?: string | null
          employment_status?: string | null
          employment_type?: string | null
          ethnicity?: string | null
          exercise_frequency?: string | null
          financing_preference?: string[] | null
          flexible_dates?: boolean | null
          full_name?: string | null
          furnished_preference?: string | null
          gender?: string | null
          guest_policy?: string | null
          has_kids?: boolean | null
          has_pets?: boolean | null
          has_references?: boolean | null
          height?: number | null
          hobbies_interests?: string[] | null
          id: string
          ideal_move_in_date?: string | null
          images?: string[] | null
          income_range?: string | null
          interested_in_buying?: boolean | null
          interests?: string[] | null
          is_active?: boolean
          is_public?: boolean | null
          languages_spoken?: string[] | null
          last_security_audit?: string | null
          latitude?: number | null
          lease_duration?: string | null
          license_number?: string | null
          lifestyle_description?: string | null
          lifestyle_tags?: string[] | null
          location?: string | null
          location_accuracy?: number | null
          location_preference?: string | null
          location_updated_at?: string | null
          longitude?: number | null
          looking_for?: string | null
          max_bathrooms?: number | null
          max_bedrooms?: number | null
          max_budget?: number | null
          max_occupants_preference?: number | null
          max_stay_preference?: number | null
          min_bathrooms?: number | null
          min_bedrooms?: number | null
          minimum_credit_score?: string | null
          monthly_income?: string | null
          monthly_income_range?: string | null
          move_in_date?: string | null
          nationality?: string | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          owner_looking_for?: string | null
          package?: string | null
          party_friendly?: boolean | null
          party_policy?: string | null
          password_complexity_score?: number | null
          pet_policy_owner?: string | null
          pet_preference?: boolean | null
          pet_types?: string[] | null
          phone?: string | null
          preferences?: string[] | null
          preferred_activities?: string[] | null
          preferred_bathrooms?: number | null
          preferred_bedrooms?: number | null
          preferred_buy_city?: string | null
          preferred_buy_country?: string | null
          preferred_buy_neighborhood?: string | null
          preferred_listing_type?: string | null
          preferred_locations?: string[] | null
          preferred_occupations?: string[] | null
          preferred_property_types?: string[] | null
          previous_rental_history?: string | null
          privacy_settings?: Json | null
          profession?: string | null
          profile_photo_url?: string | null
          property_description?: string | null
          property_location?: string | null
          property_photos?: string[] | null
          property_preferences?: Json | null
          property_specialties?: string[] | null
          property_type_want?: string | null
          reason_for_moving?: string | null
          references_text?: string | null
          relationship_status?: string | null
          rental_duration_preference?: string | null
          rental_philosophy?: string | null
          required_amenities?: string[] | null
          role?: string | null
          sexual_orientation?: string | null
          size_preference?: string | null
          smoking?: boolean | null
          smoking_policy?: string | null
          smoking_policy_owner?: string | null
          social_level?: string | null
          social_media_verification?: string | null
          specializations?: string[] | null
          theme_preference?: string | null
          travel_frequency?: string | null
          updated_at?: string | null
          usage_intent?: string | null
          verified?: boolean | null
          work_location?: string | null
          work_schedule?: string | null
          years_experience?: number | null
          years_of_experience?: number | null
        }
        Update: {
          about_me?: string | null
          additional_notes?: string | null
          age?: number | null
          amenities_wanted?: string[] | null
          avatar_url?: string | null
          background_check_available?: boolean | null
          background_check_required?: boolean | null
          bio?: string | null
          broker_showcase_photos?: string[] | null
          broker_tier?: string | null
          broker_verified?: boolean | null
          budget?: number | null
          budget_max?: number | null
          budget_min?: number | null
          business_type?: string | null
          buy_budget_max?: number | null
          buy_budget_min?: number | null
          buyer_intent?: string | null
          city?: string | null
          client_age_max?: number | null
          client_age_min?: number | null
          client_budget_max?: number | null
          client_budget_min?: number | null
          client_description?: string | null
          contact_phone?: string | null
          cooking_skills?: string | null
          country_of_residence?: string | null
          created_at?: string | null
          credit_score_range?: string | null
          data_sensitivity_level?: string | null
          drinking?: string | null
          drinking_policy?: string | null
          education?: string | null
          email?: string | null
          email_verified?: boolean | null
          emergency_contact?: string | null
          employment_status?: string | null
          employment_type?: string | null
          ethnicity?: string | null
          exercise_frequency?: string | null
          financing_preference?: string[] | null
          flexible_dates?: boolean | null
          full_name?: string | null
          furnished_preference?: string | null
          gender?: string | null
          guest_policy?: string | null
          has_kids?: boolean | null
          has_pets?: boolean | null
          has_references?: boolean | null
          height?: number | null
          hobbies_interests?: string[] | null
          id?: string
          ideal_move_in_date?: string | null
          images?: string[] | null
          income_range?: string | null
          interested_in_buying?: boolean | null
          interests?: string[] | null
          is_active?: boolean
          is_public?: boolean | null
          languages_spoken?: string[] | null
          last_security_audit?: string | null
          latitude?: number | null
          lease_duration?: string | null
          license_number?: string | null
          lifestyle_description?: string | null
          lifestyle_tags?: string[] | null
          location?: string | null
          location_accuracy?: number | null
          location_preference?: string | null
          location_updated_at?: string | null
          longitude?: number | null
          looking_for?: string | null
          max_bathrooms?: number | null
          max_bedrooms?: number | null
          max_budget?: number | null
          max_occupants_preference?: number | null
          max_stay_preference?: number | null
          min_bathrooms?: number | null
          min_bedrooms?: number | null
          minimum_credit_score?: string | null
          monthly_income?: string | null
          monthly_income_range?: string | null
          move_in_date?: string | null
          nationality?: string | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          owner_looking_for?: string | null
          package?: string | null
          party_friendly?: boolean | null
          party_policy?: string | null
          password_complexity_score?: number | null
          pet_policy_owner?: string | null
          pet_preference?: boolean | null
          pet_types?: string[] | null
          phone?: string | null
          preferences?: string[] | null
          preferred_activities?: string[] | null
          preferred_bathrooms?: number | null
          preferred_bedrooms?: number | null
          preferred_buy_city?: string | null
          preferred_buy_country?: string | null
          preferred_buy_neighborhood?: string | null
          preferred_listing_type?: string | null
          preferred_locations?: string[] | null
          preferred_occupations?: string[] | null
          preferred_property_types?: string[] | null
          previous_rental_history?: string | null
          privacy_settings?: Json | null
          profession?: string | null
          profile_photo_url?: string | null
          property_description?: string | null
          property_location?: string | null
          property_photos?: string[] | null
          property_preferences?: Json | null
          property_specialties?: string[] | null
          property_type_want?: string | null
          reason_for_moving?: string | null
          references_text?: string | null
          relationship_status?: string | null
          rental_duration_preference?: string | null
          rental_philosophy?: string | null
          required_amenities?: string[] | null
          role?: string | null
          sexual_orientation?: string | null
          size_preference?: string | null
          smoking?: boolean | null
          smoking_policy?: string | null
          smoking_policy_owner?: string | null
          social_level?: string | null
          social_media_verification?: string | null
          specializations?: string[] | null
          theme_preference?: string | null
          travel_frequency?: string | null
          updated_at?: string | null
          usage_intent?: string | null
          verified?: boolean | null
          work_location?: string | null
          work_schedule?: string | null
          years_experience?: number | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          accessibility_features: Json | null
          active: boolean | null
          amenities: string[] | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          description: string | null
          energy_efficiency_rating: string | null
          id: number
          images: string[] | null
          insurance_details: Json | null
          last_renovation_date: string | null
          location: Json | null
          maintenance_history: Json | null
          occupancy_rate: number | null
          owner_id: string | null
          price: number | null
          price_history: Json | null
          property_documents: Json | null
          property_status: string | null
          property_type: string | null
          square_meters: number | null
          title: string
          updated_at: string | null
          virtual_tour_url: string | null
        }
        Insert: {
          accessibility_features?: Json | null
          active?: boolean | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          description?: string | null
          energy_efficiency_rating?: string | null
          id?: never
          images?: string[] | null
          insurance_details?: Json | null
          last_renovation_date?: string | null
          location?: Json | null
          maintenance_history?: Json | null
          occupancy_rate?: number | null
          owner_id?: string | null
          price?: number | null
          price_history?: Json | null
          property_documents?: Json | null
          property_status?: string | null
          property_type?: string | null
          square_meters?: number | null
          title: string
          updated_at?: string | null
          virtual_tour_url?: string | null
        }
        Update: {
          accessibility_features?: Json | null
          active?: boolean | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          description?: string | null
          energy_efficiency_rating?: string | null
          id?: never
          images?: string[] | null
          insurance_details?: Json | null
          last_renovation_date?: string | null
          location?: Json | null
          maintenance_history?: Json | null
          occupancy_rate?: number | null
          owner_id?: string | null
          price?: number | null
          price_history?: Json | null
          property_documents?: Json | null
          property_status?: string | null
          property_type?: string | null
          square_meters?: number | null
          title?: string
          updated_at?: string | null
          virtual_tour_url?: string | null
        }
        Relationships: []
      }
      property_availability: {
        Row: {
          blocked_reason: string | null
          created_at: string | null
          end_date: string
          id: number
          is_available: boolean | null
          property_id: number | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          blocked_reason?: string | null
          created_at?: string | null
          end_date: string
          id?: never
          is_available?: boolean | null
          property_id?: number | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          blocked_reason?: string | null
          created_at?: string | null
          end_date?: string
          id?: never
          is_available?: boolean | null
          property_id?: number | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_comments: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          listing_id: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id: string
          listing_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_comments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_comments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_comments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          listing_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_features: {
        Row: {
          created_at: string | null
          feature: string | null
          id: string
          listing_id: string | null
        }
        Insert: {
          created_at?: string | null
          feature?: string | null
          id: string
          listing_id?: string | null
        }
        Update: {
          created_at?: string | null
          feature?: string | null
          id?: string
          listing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_features_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_features_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_features_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          listing_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          image_url?: string | null
          listing_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          listing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
        ]
      }
      property_interactions: {
        Row: {
          created_at: string | null
          id: number
          interaction_type: string | null
          matched: boolean | null
          property_id: number | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          interaction_type?: string | null
          matched?: boolean | null
          property_id?: number | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          interaction_type?: string | null
          matched?: boolean | null
          property_id?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_interactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_match_messages: {
        Row: {
          created_at: string | null
          id: number
          is_read: boolean | null
          match_id: number | null
          message: string
          sender_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          match_id?: number | null
          message: string
          sender_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          match_id?: number | null
          message?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_match_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "property_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      property_matches: {
        Row: {
          created_at: string | null
          id: number
          match_score: number | null
          owner_notes: string | null
          property_id: number | null
          status: string | null
          tenant_id: string | null
          tenant_notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          match_score?: number | null
          owner_notes?: string | null
          property_id?: number | null
          status?: string | null
          tenant_id?: string | null
          tenant_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          match_score?: number | null
          owner_notes?: string | null
          property_id?: number | null
          status?: string | null
          tenant_id?: string | null
          tenant_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_matches_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_ratings: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          listing_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_ratings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ratings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ratings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_recommendations: {
        Row: {
          id: number
          property_id: number | null
          recommendation_score: number | null
          recommended_at: string | null
          user_id: string | null
          viewed: boolean | null
        }
        Insert: {
          id?: never
          property_id?: number | null
          recommendation_score?: number | null
          recommended_at?: string | null
          user_id?: string | null
          viewed?: boolean | null
        }
        Update: {
          id?: never
          property_id?: number | null
          recommendation_score?: number | null
          recommended_at?: string | null
          user_id?: string | null
          viewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "property_recommendations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_reports: {
        Row: {
          created_at: string | null
          id: string
          report_details: string | null
          report_reason: string
          reported_listing_id: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_details?: string | null
          report_reason: string
          reported_listing_id: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          report_details?: string | null
          report_reason?: string
          reported_listing_id?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_reports_reported_listing_id_fkey"
            columns: ["reported_listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reports_reported_listing_id_fkey"
            columns: ["reported_listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reports_reported_listing_id_fkey"
            columns: ["reported_listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
        ]
      }
      property_swipes: {
        Row: {
          id: number
          is_active: boolean | null
          match_status: string | null
          property_id: number | null
          swipe_timestamp: string | null
          swipe_type: string | null
          swiper_id: string | null
        }
        Insert: {
          id?: never
          is_active?: boolean | null
          match_status?: string | null
          property_id?: number | null
          swipe_timestamp?: string | null
          swipe_type?: string | null
          swiper_id?: string | null
        }
        Update: {
          id?: never
          is_active?: boolean | null
          match_status?: string | null
          property_id?: number | null
          swipe_timestamp?: string | null
          swipe_type?: string | null
          swiper_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_swipes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_tours: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          tour_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          listing_id?: string | null
          tour_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          tour_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_tours_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_tours_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_tours_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_tours_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_tours_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_tours_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_viewing_requests: {
        Row: {
          created_at: string | null
          id: number
          notes: string | null
          owner_id: string | null
          property_id: number | null
          proposed_datetime: string
          requester_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          notes?: string | null
          owner_id?: string | null
          property_id?: number | null
          proposed_datetime: string
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          notes?: string | null
          owner_id?: string | null
          property_id?: number | null
          proposed_datetime?: string
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_viewing_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_encryption_keys: {
        Row: {
          created_at: string | null
          expiration_timestamp: string | null
          id: string
          key_strength: number | null
          key_type: string | null
          private_key_encrypted: string | null
          public_key: string | null
        }
        Insert: {
          created_at?: string | null
          expiration_timestamp?: string | null
          id?: string
          key_strength?: number | null
          key_type?: string | null
          private_key_encrypted?: string | null
          public_key?: string | null
        }
        Update: {
          created_at?: string | null
          expiration_timestamp?: string | null
          id?: string
          key_strength?: number | null
          key_type?: string | null
          private_key_encrypted?: string | null
          public_key?: string | null
        }
        Relationships: []
      }
      rate_limit_log: {
        Row: {
          created_at: string | null
          id: number
          identifier: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          identifier: string
        }
        Update: {
          created_at?: string | null
          id?: never
          identifier?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_count: number | null
          action_type: string
          id: number
          last_action_timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action_count?: number | null
          action_type: string
          id?: never
          last_action_timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action_count?: number | null
          action_type?: string
          id?: never
          last_action_timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          listing_id: string | null
          rating: number | null
          reviewer_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id: string
          listing_id?: string | null
          rating?: number | null
          reviewer_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          rating?: number | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_browse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filters: {
        Row: {
          category: string
          created_at: string
          filters: Json
          id: string
          mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          filters?: Json
          id?: string
          mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          filters?: Json
          id?: string
          mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          last_matched_at: string | null
          search_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          last_matched_at?: string | null
          search_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          last_matched_at?: string | null
          search_name?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action_details: Json | null
          action_type: string
          id: number
          ip_address: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          id?: never
          ip_address?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          id?: never
          ip_address?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_event_logs: {
        Row: {
          created_at: string | null
          event_details: string
          event_type: string
          id: number
          ip_address: unknown | null
        }
        Insert: {
          created_at?: string | null
          event_details: string
          event_type: string
          id?: never
          ip_address?: unknown | null
        }
        Update: {
          created_at?: string | null
          event_details?: string
          event_type?: string
          id?: never
          ip_address?: unknown | null
        }
        Relationships: []
      }
      service_circuit_breaker: {
        Row: {
          current_failures: number | null
          failure_threshold: number | null
          last_failure_timestamp: string | null
          recovery_strategy: string | null
          service_name: string
        }
        Insert: {
          current_failures?: number | null
          failure_threshold?: number | null
          last_failure_timestamp?: string | null
          recovery_strategy?: string | null
          service_name: string
        }
        Update: {
          current_failures?: number | null
          failure_threshold?: number | null
          last_failure_timestamp?: string | null
          recovery_strategy?: string | null
          service_name?: string
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      subscription_packages: {
        Row: {
          created_at: string | null
          features: Json | null
          id: number
          is_active: boolean | null
          max_daily_matches: number | null
          max_property_listings: number | null
          max_property_views: number | null
          name: string
          price: number | null
          tier: string | null
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: never
          is_active?: boolean | null
          max_daily_matches?: number | null
          max_property_listings?: number | null
          max_property_views?: number | null
          name: string
          price?: number | null
          tier?: string | null
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: never
          is_active?: boolean | null
          max_daily_matches?: number | null
          max_property_listings?: number | null
          max_property_views?: number | null
          name?: string
          price?: number | null
          tier?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          access_client_filters: boolean
          boosted_visibility: boolean
          can_message: boolean
          can_see_who_liked_profile: boolean
          can_see_who_viewed_profile: boolean
          can_superlike: boolean
          created_at: string
          current_likes_made_today: number
          current_messages_made_this_month: number
          current_posts_made: number
          engagement_analytics: boolean
          highlighted_profile: boolean
          id: string
          max_likes_per_day: number
          max_messages_per_month: number
          max_posts_per_month: number
          max_saved_properties: number
          paypal_order_id: string | null
          paypal_subscription_id: string | null
          plan_expiry_date: string | null
          plan_type: string
          premium_filter_badge: boolean
          status: string
          updated_at: string
          user_id: string
          verified_broker: boolean
          visibility_power: number
        }
        Insert: {
          access_client_filters?: boolean
          boosted_visibility?: boolean
          can_message?: boolean
          can_see_who_liked_profile?: boolean
          can_see_who_viewed_profile?: boolean
          can_superlike?: boolean
          created_at?: string
          current_likes_made_today?: number
          current_messages_made_this_month?: number
          current_posts_made?: number
          engagement_analytics?: boolean
          highlighted_profile?: boolean
          id?: string
          max_likes_per_day?: number
          max_messages_per_month?: number
          max_posts_per_month?: number
          max_saved_properties?: number
          paypal_order_id?: string | null
          paypal_subscription_id?: string | null
          plan_expiry_date?: string | null
          plan_type: string
          premium_filter_badge?: boolean
          status?: string
          updated_at?: string
          user_id: string
          verified_broker?: boolean
          visibility_power?: number
        }
        Update: {
          access_client_filters?: boolean
          boosted_visibility?: boolean
          can_message?: boolean
          can_see_who_liked_profile?: boolean
          can_see_who_viewed_profile?: boolean
          can_superlike?: boolean
          created_at?: string
          current_likes_made_today?: number
          current_messages_made_this_month?: number
          current_posts_made?: number
          engagement_analytics?: boolean
          highlighted_profile?: boolean
          id?: string
          max_likes_per_day?: number
          max_messages_per_month?: number
          max_posts_per_month?: number
          max_saved_properties?: number
          paypal_order_id?: string | null
          paypal_subscription_id?: string | null
          plan_expiry_date?: string | null
          plan_type?: string
          premium_filter_badge?: boolean
          status?: string
          updated_at?: string
          user_id?: string
          verified_broker?: boolean
          visibility_power?: number
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          attachment_urls: string[] | null
          category: string | null
          created_at: string
          id: string
          message: string
          priority: string | null
          status: string
          subject: string | null
          updated_at: string
          user_email: string | null
          user_id: string
          user_role: string | null
        }
        Insert: {
          attachment_urls?: string[] | null
          category?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_email?: string | null
          user_id: string
          user_role?: string | null
        }
        Update: {
          attachment_urls?: string[] | null
          category?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_email?: string | null
          user_id?: string
          user_role?: string | null
        }
        Relationships: []
      }
      swipe_analytics: {
        Row: {
          average_time_per_profile: number | null
          conversations_started: number | null
          created_at: string | null
          date: string | null
          filter_usage_count: number | null
          id: string
          likes_given: number | null
          matches_created: number | null
          passes_given: number | null
          super_likes_given: number | null
          total_swipes: number | null
          user_id: string | null
          user_role: string
        }
        Insert: {
          average_time_per_profile?: number | null
          conversations_started?: number | null
          created_at?: string | null
          date?: string | null
          filter_usage_count?: number | null
          id?: string
          likes_given?: number | null
          matches_created?: number | null
          passes_given?: number | null
          super_likes_given?: number | null
          total_swipes?: number | null
          user_id?: string | null
          user_role: string
        }
        Update: {
          average_time_per_profile?: number | null
          conversations_started?: number | null
          created_at?: string | null
          date?: string | null
          filter_usage_count?: number | null
          id?: string
          likes_given?: number | null
          matches_created?: number | null
          passes_given?: number | null
          super_likes_given?: number | null
          total_swipes?: number | null
          user_id?: string | null
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipe_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipe_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipe_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          action: string
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_swipes_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_swipes_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_swipes_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_trace_logs: {
        Row: {
          child_service: string | null
          error_rate: number | null
          latency_ms: number | null
          parent_service: string | null
          timestamp: string | null
          trace_id: string
        }
        Insert: {
          child_service?: string | null
          error_rate?: number | null
          latency_ms?: number | null
          parent_service?: string | null
          timestamp?: string | null
          trace_id?: string
        }
        Update: {
          child_service?: string | null
          error_rate?: number | null
          latency_ms?: number | null
          parent_service?: string | null
          timestamp?: string | null
          trace_id?: string
        }
        Relationships: []
      }
      tenant_profiles: {
        Row: {
          additional_info: string | null
          created_at: string | null
          id: number
          max_budget: number | null
          monthly_income: number | null
          move_in_date: string | null
          occupation: string | null
          preferred_location: Json | null
          preferred_property_type: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_info?: string | null
          created_at?: string | null
          id?: never
          max_budget?: number | null
          monthly_income?: number | null
          move_in_date?: string | null
          occupation?: string | null
          preferred_location?: Json | null
          preferred_property_type?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_info?: string | null
          created_at?: string | null
          id?: never
          max_budget?: number | null
          monthly_income?: number | null
          move_in_date?: string | null
          occupation?: string | null
          preferred_location?: Json | null
          preferred_property_type?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          id: string
          key: string | null
          language_code: string | null
          namespace: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key?: string | null
          language_code?: string | null
          namespace?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string | null
          language_code?: string | null
          namespace?: string | null
          value?: string | null
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          action: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id: string
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_tracking: {
        Row: {
          action: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id: string
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_authentication_methods: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          last_login: string | null
          provider: string | null
          provider_user_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          last_login?: string | null
          provider?: string | null
          provider_user_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          last_login?: string | null
          provider?: string | null
          provider_user_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_block_list: {
        Row: {
          blocked_user_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          blocked_user_id?: string | null
          created_at?: string | null
          id: string
          user_id?: string | null
        }
        Update: {
          blocked_user_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_block_list_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_block_list_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_block_list_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_block_list_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_block_list_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_block_list_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          block_reason: string | null
          blocked_at: string | null
          blocked_id: string | null
          blocker_id: string | null
          id: number
        }
        Insert: {
          block_reason?: string | null
          blocked_at?: string | null
          blocked_id?: string | null
          blocker_id?: string | null
          id?: never
        }
        Update: {
          block_reason?: string | null
          blocked_at?: string | null
          blocked_id?: string | null
          blocker_id?: string | null
          id?: never
        }
        Relationships: []
      }
      user_complaints: {
        Row: {
          assigned_admin_id: string | null
          complainant_id: string
          complaint_type: string
          conversation_id: string | null
          created_at: string
          description: string
          evidence_urls: string[] | null
          id: string
          reported_user_id: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          assigned_admin_id?: string | null
          complainant_id: string
          complaint_type: string
          conversation_id?: string | null
          created_at?: string
          description: string
          evidence_urls?: string[] | null
          id?: string
          reported_user_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          assigned_admin_id?: string | null
          complainant_id?: string
          complaint_type?: string
          conversation_id?: string | null
          created_at?: string
          description?: string
          evidence_urls?: string[] | null
          id?: string
          reported_user_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_complaints_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_complaints_complainant_id_fkey"
            columns: ["complainant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_complaints_complainant_id_fkey"
            columns: ["complainant_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_complaints_complainant_id_fkey"
            columns: ["complainant_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_complaints_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_complaints_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_complaints_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_complaints_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consent_logs: {
        Row: {
          accepted_at: string | null
          consent_type: string | null
          id: string
          ip_address: unknown | null
          user_id: string | null
          version: string | null
        }
        Insert: {
          accepted_at?: string | null
          consent_type?: string | null
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
          version?: string | null
        }
        Update: {
          accepted_at?: string | null
          consent_type?: string | null
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
          version?: string | null
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          admin_notes: string | null
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_path: string
          id: string
          status: Database["public"]["Enums"]["document_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_path: string
          id?: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_path?: string
          id?: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          feedback: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          feedback?: string | null
          id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          feedback?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          created_at: string | null
          id: number
          initiator_id: string | null
          interaction_type: string | null
          property_id: number | null
          target_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          initiator_id?: string | null
          interaction_type?: string | null
          property_id?: number | null
          target_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          initiator_id?: string | null
          interaction_type?: string | null
          property_id?: number | null
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_likes: {
        Row: {
          category: string | null
          id: number
          is_liked: boolean | null
          liked_at: string | null
          liked_id: string | null
          liker_id: string | null
          metadata: Json | null
        }
        Insert: {
          category?: string | null
          id?: never
          is_liked?: boolean | null
          liked_at?: string | null
          liked_id?: string | null
          liker_id?: string | null
          metadata?: Json | null
        }
        Update: {
          category?: string | null
          id?: never
          is_liked?: boolean | null
          liked_at?: string | null
          liked_id?: string | null
          liker_id?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          push_notifications: boolean | null
          sms_notifications: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_package_overrides: {
        Row: {
          admin_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          original_package: string | null
          override_package: string
          override_reason: string | null
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          original_package?: string | null
          override_package: string
          override_reason?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          original_package?: string | null
          override_package?: string
          override_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_package_overrides_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_package_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_package_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_package_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_payment_methods: {
        Row: {
          created_at: string | null
          id: string
          payment_details: Json | null
          payment_type: string | null
          subscription_package_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          payment_details?: Json | null
          payment_type?: string | null
          subscription_package_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_details?: Json | null
          payment_type?: string | null
          subscription_package_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferred_location: string | null
          preferred_price_range: number[] | null
          preferred_property_type: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          preferred_location?: string | null
          preferred_price_range?: number[] | null
          preferred_property_type?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preferred_location?: string | null
          preferred_price_range?: number[] | null
          preferred_property_type?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_privacy_settings: {
        Row: {
          allow_messages: boolean | null
          created_at: string | null
          id: string
          profile_visibility: string | null
          user_id: string | null
        }
        Insert: {
          allow_messages?: boolean | null
          created_at?: string | null
          id: string
          profile_visibility?: string | null
          user_id?: string | null
        }
        Update: {
          allow_messages?: boolean | null
          created_at?: string | null
          id?: string
          profile_visibility?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_privacy_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_privacy_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_privacy_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: number
          is_banned: boolean | null
          last_active_at: string | null
          location: Json | null
          phone: string | null
          profile_image_url: string | null
          role: string
          subscription_expires_at: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: never
          is_banned?: boolean | null
          last_active_at?: string | null
          location?: Json | null
          phone?: string | null
          profile_image_url?: string | null
          role: string
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: never
          is_banned?: boolean | null
          last_active_at?: string | null
          location?: Json | null
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      user_push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string | null
          id: string
          report_details: string | null
          report_reason: string
          reported_user_id: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_details?: string | null
          report_reason: string
          reported_user_id: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          report_details?: string | null
          report_reason?: string
          reported_user_id?: string
          reporter_id?: string
          status?: string
        }
        Relationships: []
      }
      user_restrictions: {
        Row: {
          admin_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          reason: string
          restriction_type: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason: string
          restriction_type: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string
          restriction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_restrictions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restrictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restrictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_restrictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_search_preferences: {
        Row: {
          accessibility_needs: Json | null
          amenities: Json | null
          created_at: string | null
          id: number
          max_price: number | null
          min_price: number | null
          preferred_locations: Json | null
          property_types: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accessibility_needs?: Json | null
          amenities?: Json | null
          created_at?: string | null
          id?: never
          max_price?: number | null
          min_price?: number | null
          preferred_locations?: Json | null
          property_types?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accessibility_needs?: Json | null
          amenities?: Json | null
          created_at?: string | null
          id?: never
          max_price?: number | null
          min_price?: number | null
          preferred_locations?: Json | null
          property_types?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          notification_preferences: Json | null
          theme: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          notification_preferences?: Json | null
          theme?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_preferences?: Json | null
          theme?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: number
          is_active: boolean | null
          package_id: number | null
          payment_status: string | null
          start_date: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: never
          is_active?: boolean | null
          package_id?: number | null
          payment_status?: string | null
          start_date?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: never
          is_active?: boolean | null
          package_id?: number | null
          payment_status?: string | null
          start_date?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_warnings: {
        Row: {
          acknowledged_at: string | null
          admin_id: string
          created_at: string
          id: string
          message: string
          user_id: string
          warning_type: string
        }
        Insert: {
          acknowledged_at?: string | null
          admin_id: string
          created_at?: string
          id?: string
          message: string
          user_id: string
          warning_type: string
        }
        Update: {
          acknowledged_at?: string | null
          admin_id?: string
          created_at?: string
          id?: string
          message?: string
          user_id?: string
          warning_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_warnings_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_warnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_warnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_warnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string
          id: string
          profile_data: Json | null
          subscription_tier: string
          user_type: string
        }
        Insert: {
          email: string
          id?: string
          profile_data?: Json | null
          subscription_tier: string
          user_type: string
        }
        Update: {
          email?: string
          id?: string
          profile_data?: Json | null
          subscription_tier?: string
          user_type?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          location: string
          name: string
          owner_id: string
          price: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          location: string
          name: string
          owner_id: string
          price: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          owner_id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      listings_browse: {
        Row: {
          amenities: string[] | null
          baths: number | null
          beds: number | null
          city: string | null
          created_at: string | null
          description: string | null
          id: string | null
          images: string[] | null
          is_active: boolean | null
          neighborhood: string | null
          owner_id: string | null
          price: number | null
          property_type: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string | null
        }
        Insert: {
          amenities?: string[] | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: string[] | null
          is_active?: boolean | null
          neighborhood?: string | null
          owner_id?: string | null
          price?: number | null
          property_type?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string | null
        }
        Update: {
          amenities?: string[] | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: string[] | null
          is_active?: boolean | null
          neighborhood?: string | null
          owner_id?: string | null
          price?: number | null
          property_type?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings_public: {
        Row: {
          amenities: string[] | null
          availability_status: string | null
          baths: number | null
          beds: number | null
          city: string | null
          contact_method: string | null
          created_at: string | null
          description: string | null
          furnished: boolean | null
          id: string | null
          images: string[] | null
          neighborhood: string | null
          pet_friendly: boolean | null
          price: number | null
          property_type: string | null
          square_footage: number | null
          title: string | null
        }
        Insert: {
          amenities?: string[] | null
          availability_status?: never
          baths?: number | null
          beds?: number | null
          city?: string | null
          contact_method?: never
          created_at?: string | null
          description?: string | null
          furnished?: boolean | null
          id?: string | null
          images?: string[] | null
          neighborhood?: string | null
          pet_friendly?: boolean | null
          price?: number | null
          property_type?: string | null
          square_footage?: number | null
          title?: string | null
        }
        Update: {
          amenities?: string[] | null
          availability_status?: never
          baths?: number | null
          beds?: number | null
          city?: string | null
          contact_method?: never
          created_at?: string | null
          description?: string | null
          furnished?: boolean | null
          id?: string | null
          images?: string[] | null
          neighborhood?: string | null
          pet_friendly?: boolean | null
          price?: number | null
          property_type?: string | null
          square_footage?: number | null
          title?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          budget_max: number | null
          budget_min: number | null
          full_name: string | null
          gender: string | null
          has_pets: boolean | null
          id: string | null
          images: string[] | null
          interests: string[] | null
          is_active: boolean | null
          latitude: number | null
          lifestyle_tags: string[] | null
          location: string | null
          longitude: number | null
          monthly_income: string | null
          nationality: string | null
          occupation: string | null
          onboarding_completed: boolean | null
          preferred_activities: string[] | null
          preferred_property_types: string[] | null
          role: string | null
          verified: boolean | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          budget_max?: number | null
          budget_min?: number | null
          full_name?: string | null
          gender?: string | null
          has_pets?: boolean | null
          id?: string | null
          images?: string[] | null
          interests?: string[] | null
          is_active?: boolean | null
          latitude?: number | null
          lifestyle_tags?: string[] | null
          location?: string | null
          longitude?: number | null
          monthly_income?: string | null
          nationality?: string | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          preferred_activities?: string[] | null
          preferred_property_types?: string[] | null
          role?: string | null
          verified?: boolean | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          budget_max?: number | null
          budget_min?: number | null
          full_name?: string | null
          gender?: string | null
          has_pets?: boolean | null
          id?: string | null
          images?: string[] | null
          interests?: string[] | null
          is_active?: boolean | null
          latitude?: number | null
          lifestyle_tags?: string[] | null
          location?: string | null
          longitude?: number | null
          monthly_income?: string | null
          nationality?: string | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          preferred_activities?: string[] | null
          preferred_property_types?: string[] | null
          role?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          general_location: string | null
          id: string | null
          role: string | null
          verified: boolean | null
        }
        Insert: {
          age?: number | null
          avatar_url?: never
          created_at?: string | null
          full_name?: string | null
          general_location?: never
          id?: string | null
          role?: string | null
          verified?: boolean | null
        }
        Update: {
          age?: number | null
          avatar_url?: never
          created_at?: string | null
          full_name?: string | null
          general_location?: never
          id?: string | null
          role?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      advanced_property_search: {
        Args: {
          p_accessibility_needs?: Json
          p_amenities?: Json
          p_location?: string
          p_max_price?: number
          p_min_price?: number
          p_page?: number
          p_page_size?: number
          p_property_type?: string
          p_user_id: string
        }
        Returns: {
          amenities: Json
          description: string
          images: Json
          location: string
          price: number
          property_id: number
          property_type: string
          recommendation_score: number
          title: string
        }[]
      }
      assign_user_subscription: {
        Args: {
          p_package_name: string
          p_payment_status?: string
          p_transaction_id?: string
          p_user_id: string
        }
        Returns: {
          end_date: string
          package_name: string
          start_date: string
          subscription_id: number
        }[]
      }
      block_user: {
        Args: { reason?: string; target_user_id: string }
        Returns: boolean
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_advanced_match_score: {
        Args: { property: Json; tenant_profile: Json }
        Returns: number
      }
      calculate_compatibility_score: {
        Args: { client_id: string; owner_id: string }
        Returns: number
      }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_match_score: {
        Args:
          | { client_profile_id: string; listing_id: string }
          | { input_text: string; match_threshold: number }
          | { p_property_id: number; p_tenant_id: string }
          | { property: Json; tenant_profile: Json }
        Returns: number
      }
      can_start_conversation: {
        Args: { p_other_user_id: string; p_user_id: string }
        Returns: boolean
      }
      can_user_perform_action: {
        Args:
          | Record<PropertyKey, never>
          | { p_action: string; p_user_id: string }
        Returns: boolean
      }
      can_view_profile: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      cancel_user_subscription: {
        Args: { p_user_id: string }
        Returns: {
          cancellation_date: string
          cancelled_subscription_id: number
          package_name: string
        }[]
      }
      change_user_subscription: {
        Args: { p_new_package_name: string; p_user_id: string }
        Returns: {
          change_date: string
          new_package_name: string
          old_package_name: string
        }[]
      }
      check_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_property_availability: {
        Args: {
          p_end_date: string
          p_property_id: number
          p_start_date: string
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args:
          | { max_attempts?: number; user_identifier: string }
          | {
              p_action_type: string
              p_max_actions?: number
              p_time_window?: unknown
              p_user_id: string
            }
        Returns: boolean
      }
      check_user_role_permissions: {
        Args:
          | { p_required_role: string; p_user_id: string }
          | { p_user_id: string }
        Returns: {
          can_book_property: boolean
          can_create_property: boolean
          can_view_all_properties: boolean
          user_role: string
        }[]
      }
      complete_user_onboarding: {
        Args: { onboarding_data?: Json; user_id: string }
        Returns: undefined
      }
      deactivate_expired_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_active_listings_for_client: {
        Args: Record<PropertyKey, never> | { client_user_id: string }
        Returns: {
          address: string
          amenities: string[]
          baths: number
          beds: number
          distance_to_beach: number
          distance_to_cenotes: number
          furnished: boolean
          id: string
          images: string[]
          owner_avatar: string
          owner_name: string
          owner_response_time: string
          price: number
          property_description: string
          property_type: string
          rating: number
          square_footage: number
          title: string
          tulum_zone: string
        }[]
      }
      get_all_clients_for_owner: {
        Args: { owner_user_id?: string }
        Returns: {
          age: number
          bio: string
          full_name: string
          id: string
          images: string[]
          interests: string[]
          location: string
          monthly_income: string
          monthly_income_range: string
          name: string
          nationality: string
          occupation: string
          preferences: string[]
          preferred_activities: string[]
          profession: string
          profile_images: string[]
          profile_name: string
          user_id: string
          verified: boolean
        }[]
      }
      get_clients_for_owner: {
        Args: { owner_user_id: string }
        Returns: {
          age: number
          bio: string
          full_name: string
          id: string
          images: string[]
          location: string
          monthly_income: string
          nationality: string
          occupation: string
          verified: boolean
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_effective_user_package: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_listings_for_client: {
        Args: { client_user_id: string }
        Returns: {
          address: string
          baths: number
          beds: number
          city: string
          furnished: boolean
          id: string
          images: string[]
          neighborhood: string
          owner_avatar: string
          owner_name: string
          price: number
          property_type: string
          square_footage: number
          title: string
        }[]
      }
      get_nearby_listings: {
        Args: {
          exclude_owner_id?: string
          radius_km?: number
          user_lat: number
          user_lon: number
        }
        Returns: {
          distance: number
          id: string
          latitude: number
          longitude: number
          owner_id: string
          price: number
          property_type: string
          title: string
        }[]
      }
      get_nearby_profiles: {
        Args: {
          exclude_user_id?: string
          radius_km?: number
          user_lat: number
          user_lon: number
        }
        Returns: {
          distance: number
          full_name: string
          id: string
          latitude: number
          longitude: number
          role: string
        }[]
      }
      get_potential_clients_for_owner: {
        Args: Record<PropertyKey, never> | { owner_user_id: string }
        Returns: {
          age: number
          bio: string
          budget: number
          full_name: string
          has_kids: boolean
          has_pets: boolean
          id: string
          images: string[]
          interests: string[]
          location: string
          looking_for: string
          monthly_income_range: string
          move_in_date: string
          nationality: string
          preferences: string[]
          profession: string
          relationship_status: string
          verified: boolean
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_property_recommendations: {
        Args: { p_max_results?: number; p_user_id: string }
        Returns: {
          images: string[]
          match_score: number
          price: number
          property_id: number
          property_type: string
          title: string
        }[]
      }
      get_user_like_history: {
        Args: { target_user_id: string }
        Returns: {
          category: string
          like_status: boolean
          liked_at: string
          liker_email: string
          liker_id: string
        }[]
      }
      get_user_like_insights: {
        Args: { target_user_id: string }
        Returns: {
          most_active_liker: string
          most_active_liker_email: string
          most_recent_like: string
          negative_likes: number
          positive_like_percentage: number
          positive_likes: number
          total_likes: number
        }[]
      }
      get_user_subscription_status: {
        Args: { p_user_id: string }
        Returns: {
          end_date: string
          is_active: boolean
          package_name: string
          remaining_daily_matches: number
          remaining_property_listings: number
          start_date: string
          tier: string
        }[]
      }
      get_users_who_liked: {
        Args: { liked_status?: boolean; target_user_id: string }
        Returns: {
          category: string
          liked_at: string
          liker_email: string
          liker_id: string
        }[]
      }
      get_weekly_conversation_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_conversation_count: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      increment_usage_count: {
        Args:
          | Record<PropertyKey, never>
          | { p_action: string; p_user_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_current_user_active: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_profile_owner: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      is_user_blocked: {
        Args: { potential_blocked_id: string; potential_blocker_id: string }
        Returns: boolean
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      log_admin_data_access: {
        Args: { accessed_admin_email: string; accessed_admin_id: string }
        Returns: undefined
      }
      log_profile_update: {
        Args: { update_data: Json; user_id: string }
        Returns: undefined
      }
      log_security_event: {
        Args:
          | { event_details: string; event_type: string }
          | { p_action_details?: Json; p_action_type: string }
        Returns: undefined
      }
      log_user_interaction: {
        Args: {
          p_initiator_id: string
          p_interaction_type: string
          p_property_id?: number
          p_target_id: string
        }
        Returns: undefined
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      manage_property_availability: {
        Args: {
          p_blocked_reason?: string
          p_end_date: string
          p_is_available: boolean
          p_property_id: number
          p_start_date: string
        }
        Returns: {
          blocked_reason: string
          end_date: string
          is_available: boolean
          property_id: number
          start_date: string
        }[]
      }
      manage_user_ban: {
        Args: { p_admin_id: string; p_is_banned: boolean; p_user_id: string }
        Returns: {
          full_name: string
          new_ban_status: boolean
          previous_ban_status: boolean
          user_id: string
        }[]
      }
      manage_user_verification: {
        Args:
          | {
              p_admin_id: string
              p_user_id: string
              p_verification_status: string
            }
          | { p_user_id: string; p_verification_status: string }
        Returns: {
          full_name: string
          new_status: string
          previous_status: string
          user_id: string
        }[]
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: string
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      refresh_user_engagement_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_subscription_usage_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_usage_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      save_property_recommendations: {
        Args: { p_user_id: string }
        Returns: {
          property_id: number
          recommendation_score: number
        }[]
      }
      secure_function_template: {
        Args: { param1: string }
        Returns: string
      }
      send_message: {
        Args: {
          p_content: string
          p_message_type?: string
          p_property_id?: number
          p_receiver_id: string
          p_sender_id: string
        }
        Returns: {
          content: string
          created_at: string
          message_id: number
          receiver_id: string
          sender_id: string
        }[]
      }
      set_secure_search_path: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_user_role: {
        Args: { p_role: Database["public"]["Enums"]["user_role"] }
        Returns: undefined
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unblock_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      update_conversation_last_message: {
        Args: { p_conversation_id: number; p_last_message: string }
        Returns: undefined
      }
      update_swipe_analytics: {
        Args: { p_swipe_type: string; p_user_id: string; p_user_role: string }
        Returns: undefined
      }
      update_user_search_preferences: {
        Args: {
          p_accessibility_needs?: Json
          p_amenities?: Json
          p_max_price?: number
          p_min_price?: number
          p_preferred_locations?: Json
          p_property_types?: Json
          p_user_id: string
        }
        Returns: {
          accessibility_needs: Json
          amenities: Json
          max_price: number
          min_price: number
          preferred_locations: Json
          property_types: Json
          user_id: string
        }[]
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      user_has_restriction: {
        Args:
          | Record<PropertyKey, never>
          | { p_restriction_type: string; p_user_id: string }
        Returns: boolean
      }
      validate_conversation_message_content: {
        Args: { p_message: string }
        Returns: boolean
      }
      validate_listing_content: {
        Args: { param1: string }
        Returns: boolean
      }
      validate_listing_content_v2: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      contract_type: "lease" | "rental" | "purchase" | "rental_agreement"
      deal_status:
        | "pending"
        | "signed_by_owner"
        | "signed_by_client"
        | "completed"
        | "cancelled"
        | "disputed"
      document_status: "pending" | "approved" | "rejected"
      document_type: "property_deed" | "broker_license" | "id_card" | "other"
      listing_status: "active" | "pending" | "inactive" | "suspended"
      signature_type: "drawn" | "typed" | "uploaded"
      user_role: "client" | "owner" | "admin"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
      contract_type: ["lease", "rental", "purchase", "rental_agreement"],
      deal_status: [
        "pending",
        "signed_by_owner",
        "signed_by_client",
        "completed",
        "cancelled",
        "disputed",
      ],
      document_status: ["pending", "approved", "rejected"],
      document_type: ["property_deed", "broker_license", "id_card", "other"],
      listing_status: ["active", "pending", "inactive", "suspended"],
      signature_type: ["drawn", "typed", "uploaded"],
      user_role: ["client", "owner", "admin"],
    },
  },
} as const
