-- ============================================================================
-- MASTER DATABASE SCHEMA: PREMIUM ETHIOPIAN E-COMMERCE PLATFORM
-- Covers all 34 required relational entities, constraints, indexes & RLS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. STORE SETTINGS & BRAND CONFIGURATION
CREATE TABLE IF NOT EXISTS store_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    store_name VARCHAR(150) NOT NULL DEFAULT 'YOUR BRAND',
    tagline TEXT DEFAULT 'Curated Ethiopian Fashion & Modern Essentials',
    logo_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#121212',
    accent_color VARCHAR(20) DEFAULT '#78716C',
    background_color VARCHAR(20) DEFAULT '#FAF9F6',
    contact_phone VARCHAR(50) DEFAULT '+251 91 123 4567',
    contact_email VARCHAR(100) DEFAULT 'hello@yourbrand.et',
    contact_address TEXT DEFAULT 'Bole Sub-City, Addis Ababa, Ethiopia',
    social_links JSONB DEFAULT '{"telegram": "https://t.me/yourbrand", "instagram": "https://instagram.com/yourbrand"}',
    currency_code VARCHAR(10) NOT NULL DEFAULT 'ETB',
    currency_symbol VARCHAR(10) NOT NULL DEFAULT 'ETB',
    cod_enabled BOOLEAN NOT NULL DEFAULT true,
    chapa_enabled BOOLEAN NOT NULL DEFAULT false,
    chapa_public_key TEXT,
    chapa_secret_key TEXT,
    chapa_webhook_secret TEXT,
    telegram_bot_token TEXT,
    telegram_chat_id TEXT,
    telegram_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
    competitions_enabled BOOLEAN NOT NULL DEFAULT false,
    paid_competitions_unlocked BOOLEAN NOT NULL DEFAULT false,
    tax_percentage NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROFILES & USERS
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    phone_normalized VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. STAFF ROLES & PERMISSIONS
CREATE TYPE staff_role_type AS ENUM (
    'super_admin',
    'product_manager',
    'order_manager',
    'fulfillment_staff',
    'read_only_analyst'
);

CREATE TABLE IF NOT EXISTS staff_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role staff_role_type NOT NULL DEFAULT 'read_only_analyst',
    is_active BOOLEAN NOT NULL DEFAULT true,
    granted_by UUID REFERENCES profiles(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (profile_id, role)
);

-- 4. DYNAMIC STORE SECTIONS
CREATE TABLE IF NOT EXISTS store_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    banner_image_url TEXT,
    thumbnail_image_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_nav_visible BOOLEAN NOT NULL DEFAULT true,
    is_home_visible BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CATEGORIES (NESTED UNDER SECTIONS)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES store_sections(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(section_id, slug)
);

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    primary_section_id UUID REFERENCES store_sections(id) ON DELETE SET NULL,
    primary_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    regular_price_etb INT NOT NULL, -- Stored in whole ETB or minor units
    sale_price_etb INT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_new_arrival BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    seo_title VARCHAR(200),
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRODUCT SECTION ASSIGNMENTS (MANY-TO-MANY)
CREATE TABLE IF NOT EXISTS product_section_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES store_sections(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    display_order INT DEFAULT 0,
    UNIQUE(product_id, section_id, category_id)
);

-- 8. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(200),
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PRODUCT VARIANTS (SIZES, COLORS, SKUS)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    size VARCHAR(50),
    color VARCHAR(50),
    color_hex VARCHAR(20),
    stock_quantity INT NOT NULL DEFAULT 0,
    price_override_etb INT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. INVENTORY MOVEMENTS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    change_quantity INT NOT NULL,
    reason VARCHAR(200) NOT NULL, -- 'order_placed', 'order_cancelled', 'manual_adjustment', 'restock'
    reference_id VARCHAR(100), -- order_id or admin audit reference
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CUSTOMER DATABASE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    phone_normalized VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150),
    marketing_consent BOOLEAN NOT NULL DEFAULT false,
    marketing_consent_at TIMESTAMPTZ,
    notes TEXT,
    total_orders INT NOT NULL DEFAULT 0,
    total_spent_etb INT NOT NULL DEFAULT 0,
    competition_count INT NOT NULL DEFAULT 0,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    recipient_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    sub_city VARCHAR(100) NOT NULL,
    woreda VARCHAR(50),
    house_no VARCHAR(50),
    specific_location_notes TEXT,
    is_default BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. CARTS & CART ITEMS
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cart_id, variant_id)
);

-- 14. STORE PICKUP LOCATIONS
CREATE TABLE IF NOT EXISTS pickup_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Addis Ababa',
    google_maps_url TEXT,
    contact_phone VARCHAR(50) NOT NULL,
    opening_hours VARCHAR(200) NOT NULL,
    instructions TEXT,
    pickup_fee_etb INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    accepts_new_orders BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. DELIVERY ZONES & RULES
CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    fee_etb INT NOT NULL,
    free_delivery_threshold_etb INT,
    min_order_amount_etb INT DEFAULT 0,
    estimated_delivery_time VARCHAR(100) NOT NULL DEFAULT '24-48 Hours',
    priority INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_zone_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID NOT NULL REFERENCES delivery_zones(id) ON DELETE CASCADE,
    match_type VARCHAR(50) NOT NULL, -- 'sub_city', 'city', 'keyword'
    match_pattern VARCHAR(100) NOT NULL, -- e.g. 'Bole', 'Kirkos', 'Hawassa'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. COUPONS & DISCOUNTS
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'free_delivery');
CREATE TYPE coupon_status AS ENUM ('active', 'scheduled', 'expired', 'exhausted', 'disabled');

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type coupon_type NOT NULL,
    discount_value INT NOT NULL, -- e.g., 10 for 10% or 200 for 200 ETB
    max_discount_etb INT, -- cap for percentage discounts
    min_order_amount_etb INT DEFAULT 0,
    usage_limit_total INT,
    usage_limit_per_customer INT DEFAULT 1,
    current_redemptions_count INT NOT NULL DEFAULT 0,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_new_customer_only BOOLEAN NOT NULL DEFAULT false,
    status coupon_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_product_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    is_exclusion BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS coupon_category_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_exclusion BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS coupon_customer_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE
);

-- 17. ORDERS
CREATE TYPE order_fulfillment_type AS ENUM ('home_delivery', 'store_pickup');
CREATE TYPE order_status AS ENUM (
    'pending_payment',
    'confirmed',
    'preparing',
    'ready_for_dispatch',
    'out_for_delivery',
    'delivered',
    'ready_for_pickup',
    'picked_up',
    'failed_delivery',
    'cancelled',
    'refunded'
);
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash_on_delivery', 'chapa', 'bank_transfer');

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'ORD-2026-1001'
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_phone_normalized VARCHAR(50) NOT NULL,
    customer_email VARCHAR(150),
    fulfillment_type order_fulfillment_type NOT NULL,
    order_status order_status NOT NULL DEFAULT 'confirmed',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method payment_method NOT NULL DEFAULT 'cash_on_delivery',
    
    -- Immutable financial snapshots
    subtotal_etb INT NOT NULL,
    discount_amount_etb INT NOT NULL DEFAULT 0,
    applied_coupon_code VARCHAR(50),
    delivery_fee_etb INT NOT NULL DEFAULT 0,
    tax_amount_etb INT NOT NULL DEFAULT 0,
    total_amount_etb INT NOT NULL,
    
    -- Security token for unguessable guest tracking
    tracking_token VARCHAR(100) NOT NULL UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. ORDER ITEMS (IMMUTABLE CATALOG SNAPSHOT)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    color VARCHAR(50),
    unit_price_etb INT NOT NULL,
    quantity INT NOT NULL,
    line_total_etb INT NOT NULL,
    product_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. ORDER FULFILLMENT DETAILS
CREATE TABLE IF NOT EXISTS order_fulfillment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    fulfillment_type order_fulfillment_type NOT NULL,
    
    -- Home delivery fields snapshot
    delivery_zone_id UUID REFERENCES delivery_zones(id),
    delivery_zone_name VARCHAR(100),
    delivery_address TEXT,
    delivery_sub_city VARCHAR(100),
    delivery_instructions TEXT,
    estimated_delivery_time VARCHAR(100),
    
    -- Store pickup fields snapshot
    pickup_location_id UUID REFERENCES pickup_locations(id),
    pickup_location_name VARCHAR(150),
    pickup_reference_code VARCHAR(50), -- e.g. 'PK-89421'
    collected_at TIMESTAMPTZ,
    collected_by_name VARCHAR(150),
    
    -- Dispatch notes & failure logging
    dispatch_notes TEXT,
    failed_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. DELIVERY FEE OVERRIDES (STAFF AUDITED)
CREATE TABLE IF NOT EXISTS delivery_fee_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    original_fee_etb INT NOT NULL,
    overridden_fee_etb INT NOT NULL,
    reason TEXT NOT NULL,
    authorized_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. PAYMENTS & REFUNDS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    amount_etb INT NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    gateway_reference VARCHAR(150) UNIQUE, -- Chapa tx_ref
    gateway_transaction_id VARCHAR(150),
    gateway_response JSONB,
    paid_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES profiles(id), -- for COD confirmation
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    amount_etb INT NOT NULL,
    reason TEXT NOT NULL,
    authorized_by UUID NOT NULL REFERENCES profiles(id),
    status VARCHAR(50) NOT NULL DEFAULT 'processed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. COUPON REDEMPTIONS
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    discount_amount_etb INT NOT NULL,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. UNIQUE-LOWEST-BID COMPETITIONS
CREATE TYPE competition_status AS ENUM ('draft', 'active', 'paused', 'closed', 'calculating', 'reviewed', 'published', 'cancelled');

CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    product_prize_id UUID REFERENCES products(id) ON DELETE SET NULL,
    prize_name VARCHAR(200) NOT NULL,
    prize_value_etb INT NOT NULL,
    prize_image_url TEXT,
    entry_fee_etb INT NOT NULL DEFAULT 0,
    min_bid_etb INT NOT NULL DEFAULT 1,
    max_bid_etb INT NOT NULL DEFAULT 50000,
    bid_increment_etb INT NOT NULL DEFAULT 1,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    max_entries_per_user INT DEFAULT 1,
    max_bids_per_entry INT DEFAULT 5,
    status competition_status NOT NULL DEFAULT 'draft',
    rules_text TEXT,
    refund_policy TEXT,
    winner_pays_bid_amount BOOLEAN NOT NULL DEFAULT true,
    is_paid_competition BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. COMPETITION ENTRIES & VERIFIED PARTICIPATION
CREATE TABLE IF NOT EXISTS competition_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    participant_name VARCHAR(150) NOT NULL,
    participant_phone VARCHAR(50) NOT NULL,
    participant_phone_normalized VARCHAR(50) NOT NULL,
    entry_fee_etb INT NOT NULL DEFAULT 0,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(150),
    is_eligible BOOLEAN NOT NULL DEFAULT false,
    entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. COMPETITION BIDS
CREATE TABLE IF NOT EXISTS competition_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES competition_entries(id) ON DELETE CASCADE,
    bid_amount_etb INT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_valid BOOLEAN NOT NULL DEFAULT true,
    validation_error TEXT
);

-- 26. COMPETITION RESULTS (DETERMINISTIC & AUDITED)
CREATE TABLE IF NOT EXISTS competition_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID UNIQUE NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    total_entries_count INT NOT NULL DEFAULT 0,
    total_valid_bids_count INT NOT NULL DEFAULT 0,
    unique_bids_count INT NOT NULL DEFAULT 0,
    winning_bid_amount_etb INT,
    winning_bid_id UUID REFERENCES competition_bids(id),
    winning_entry_id UUID REFERENCES competition_entries(id),
    winning_participant_name VARCHAR(150),
    winning_participant_phone_masked VARCHAR(50),
    has_winner BOOLEAN NOT NULL DEFAULT false,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    calculated_by UUID REFERENCES profiles(id),
    is_reviewed_by_admin BOOLEAN NOT NULL DEFAULT false,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    calculation_breakdown JSONB
);

-- 27. COMPETITION FULFILLMENT
CREATE TABLE IF NOT EXISTS competition_fulfillment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID UNIQUE NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    result_id UUID NOT NULL REFERENCES competition_results(id) ON DELETE CASCADE,
    winner_contacted BOOLEAN NOT NULL DEFAULT false,
    contacted_at TIMESTAMPTZ,
    prize_claimed BOOLEAN NOT NULL DEFAULT false,
    claimed_at TIMESTAMPTZ,
    delivery_or_pickup_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 28. NOTIFICATION JOBS (TELEGRAM & SYSTEM QUEUE)
CREATE TABLE IF NOT EXISTS notification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel VARCHAR(50) NOT NULL DEFAULT 'telegram', -- 'telegram', 'sms', 'email'
    event_type VARCHAR(100) NOT NULL, -- 'new_order', 'payment_verified', 'low_stock', 'winner_announced'
    payload JSONB NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    last_error TEXT,
    next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- 29. MARKETING CONSENTS
CREATE TABLE IF NOT EXISTS marketing_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    phone_normalized VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    source VARCHAR(100) NOT NULL DEFAULT 'checkout_checkbox',
    has_consented BOOLEAN NOT NULL DEFAULT true,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(50)
);

-- 30. AUDIT LOGS (STAFF & SYSTEM ACTIONS)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    staff_name VARCHAR(150),
    action VARCHAR(100) NOT NULL, -- 'excel_export', 'fee_override', 'price_change', 'publish_winner'
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY EFFICIENCY
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published, is_archived);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone_normalized);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON orders(tracking_token);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_competition_bids_comp_amt ON competition_bids(competition_id, bid_amount_etb);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_status ON notification_jobs(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at);

-- Insert Initial Store Settings Row
INSERT INTO store_settings (id, store_name, tagline, contact_phone, contact_email)
VALUES ('default', 'YOUR BRAND', 'Curated Ethiopian Fashion & Modern Essentials', '+251 91 123 4567', 'hello@yourbrand.et')
ON CONFLICT (id) DO NOTHING;
