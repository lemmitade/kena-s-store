// ============================================================================
// DOMAIN & DATABASE TYPE DEFINITIONS: PREMIUM ETHIOPIAN E-COMMERCE
// ============================================================================

export type StaffRoleType =
  | 'super_admin'
  | 'product_manager'
  | 'order_manager'
  | 'fulfillment_staff'
  | 'read_only_analyst';

export type OrderFulfillmentType = 'home_delivery' | 'store_pickup';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_dispatch'
  | 'out_for_delivery'
  | 'delivered'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'failed_delivery'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash_on_delivery' | 'chapa' | 'bank_transfer';

export type CouponType = 'percentage' | 'fixed_amount' | 'free_delivery';
export type CouponStatus = 'active' | 'scheduled' | 'expired' | 'exhausted' | 'disabled';

export type CompetitionStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'closed'
  | 'calculating'
  | 'reviewed'
  | 'published'
  | 'cancelled';

export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  description: string;
  media_type: 'image' | 'video';
  media_url: string;
  cta_primary_label: string;
  cta_primary_link: string;
  cta_secondary_label?: string;
  cta_secondary_link?: string;
  is_active: boolean;
  display_order: number;
}

export interface PopupAdSettings {
  is_enabled: boolean;
  headline: string;
  description: string;
  badge_text?: string;
  promo_code?: string;
  image_url?: string;
  button_label: string;
  button_link: string;
  trigger_delay_seconds: number;
  trigger_scroll_percent: number;
}

export interface SeoSettings {
  meta_title: string;
  meta_description: string;
  keywords: string;
  og_image_url: string;
  canonical_url: string;
  twitter_handle?: string;
  allow_indexing: boolean;
  google_site_verification?: string;
}

export interface BiddingPreferences {
  competitions_enabled: boolean;
  require_payment_to_bid: boolean;
  default_entry_fee_etb: number;
  payment_instructions?: string;
  accepted_payment_methods: string[];
  min_bid_limit_etb: number;
  max_bid_limit_etb: number;
  winner_pays_bid_amount: boolean;
  rules_overview: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  tagline: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  social_links: {
    telegram?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  currency_code: string;
  currency_symbol: string;
  cod_enabled: boolean;
  chapa_enabled: boolean;
  chapa_public_key?: string;
  chapa_secret_key?: string;
  chapa_webhook_secret?: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  telegram_notifications_enabled: boolean;
  competitions_enabled: boolean;
  paid_competitions_unlocked: boolean;
  tax_percentage: number;
  hero_slides?: HeroSlide[];
  popup_ad?: PopupAdSettings;
  seo_settings?: SeoSettings;
  bidding_preferences?: BiddingPreferences;
  admin_credentials?: AdminCredentials;
}

export interface StoreSection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner_image_url?: string;
  thumbnail_image_url?: string;
  display_order: number;
  is_nav_visible: boolean;
  is_home_visible: boolean;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  section_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size?: string;
  color?: string;
  color_hex?: string;
  stock_quantity: number;
  price_override_etb?: number;
  is_available: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  cloud_id?: string;
  name: string;
  slug: string;
  description: string;
  primary_section_id?: string;
  primary_category_id?: string;
  regular_price_etb: number;
  sale_price_etb?: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_published: boolean;
  is_archived: boolean;
  low_stock_threshold: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  section?: StoreSection;
  category?: Category;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  fee_etb: number;
  free_delivery_threshold_etb?: number;
  min_order_amount_etb: number;
  estimated_delivery_time: string;
  priority: number;
  is_active: boolean;
  rules?: DeliveryZoneRule[];
}

export interface DeliveryZoneRule {
  id: string;
  zone_id: string;
  match_type: 'sub_city' | 'city' | 'keyword';
  match_pattern: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  address_line: string;
  city: string;
  google_maps_url?: string;
  contact_phone: string;
  opening_hours: string;
  instructions?: string;
  pickup_fee_etb: number;
  is_active: boolean;
  accepts_new_orders: boolean;
  display_order: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: CouponType;
  discount_value: number;
  max_discount_etb?: number;
  min_order_amount_etb: number;
  usage_limit_total?: number;
  usage_limit_per_customer: number;
  current_redemptions_count: number;
  starts_at?: string;
  expires_at?: string;
  is_new_customer_only: boolean;
  status: CouponStatus;
  product_restrictions?: string[];
  category_restrictions?: string[];
  excluded_product_ids?: string[];
}

export interface CartItem {
  variant_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  sku: string;
  size?: string;
  color?: string;
  unit_price_etb: number;
  quantity: number;
  image_url?: string;
  max_stock: number;
}

export interface Customer {
  id: string;
  profile_id?: string;
  full_name: string;
  phone: string;
  phone_normalized: string;
  email?: string;
  marketing_consent: boolean;
  marketing_consent_at?: string;
  notes?: string;
  total_orders: number;
  total_spent_etb: number;
  competition_count: number;
  first_seen_at: string;
  last_activity_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_name: string;
  sku: string;
  size?: string;
  color?: string;
  unit_price_etb: number;
  quantity: number;
  line_total_etb: number;
  product_image_url?: string;
}

export interface OrderFulfillment {
  id: string;
  order_id: string;
  fulfillment_type: OrderFulfillmentType;
  delivery_zone_id?: string;
  delivery_zone_name?: string;
  delivery_address?: string;
  delivery_sub_city?: string;
  delivery_instructions?: string;
  estimated_delivery_time?: string;
  pickup_location_id?: string;
  pickup_location_name?: string;
  pickup_reference_code?: string;
  collected_at?: string;
  collected_by_name?: string;
  dispatch_notes?: string;
  failed_reason?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_phone_normalized: string;
  customer_email?: string;
  fulfillment_type: OrderFulfillmentType;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal_etb: number;
  discount_amount_etb: number;
  applied_coupon_code?: string;
  delivery_fee_etb: number;
  tax_amount_etb: number;
  total_amount_etb: number;
  tracking_token: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  fulfillment?: OrderFulfillment;
}

export interface Competition {
  id: string;
  title: string;
  slug: string;
  description: string;
  product_prize_id?: string;
  prize_name: string;
  prize_value_etb: number;
  prize_image_url?: string;
  entry_fee_etb: number;
  min_bid_etb: number;
  max_bid_etb: number;
  bid_increment_etb: number;
  starts_at: string;
  ends_at: string;
  max_entries_per_user: number;
  max_bids_per_entry: number;
  status: CompetitionStatus;
  rules_text?: string;
  refund_policy?: string;
  winner_pays_bid_amount: boolean;
  is_paid_competition: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompetitionEntry {
  id: string;
  competition_id: string;
  customer_id?: string;
  participant_name: string;
  participant_phone: string;
  participant_phone_normalized: string;
  entry_fee_etb: number;
  payment_status: PaymentStatus;
  payment_reference?: string;
  is_eligible: boolean;
  entered_at: string;
}

export interface CompetitionBid {
  id: string;
  competition_id: string;
  entry_id: string;
  bid_amount_etb: number;
  submitted_at: string;
  is_valid: boolean;
  validation_error?: string;
  participant_name?: string;
  participant_phone_masked?: string;
}

export interface CompetitionResult {
  id: string;
  competition_id: string;
  total_entries_count: number;
  total_valid_bids_count: number;
  unique_bids_count: number;
  winning_bid_amount_etb?: number;
  winning_bid_id?: string;
  winning_entry_id?: string;
  winning_participant_name?: string;
  winning_participant_phone_masked?: string;
  has_winner: boolean;
  hasWinner?: boolean;
  calculated_at: string;
  calculated_by?: string;
  is_reviewed_by_admin: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  is_published: boolean;
  published_at?: string;
  calculation_breakdown?: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  staff_profile_id?: string;
  staff_name?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface NotificationJob {
  id: string;
  channel: 'telegram' | 'sms' | 'email';
  event_type: string;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
  status: 'pending' | 'sent' | 'failed';
  last_error?: string;
  next_retry_at: string;
  created_at: string;
  sent_at?: string;
}
