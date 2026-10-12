-- ============================================================================
-- SEED DATA: PREMIUM ETHIOPIAN CATALOG, ZONES, PICKUP, & SAMPLE INVENTORY
-- ============================================================================

-- 1. STORE SECTIONS
INSERT INTO store_sections (id, name, slug, description, display_order, is_nav_visible, is_home_visible, is_active)
VALUES
('a0000001-0000-0000-0000-000000000001', 'Men', 'men', 'Tailored essentials, relaxed linen, and refined silhouettes.', 1, true, true, true),
('a0000001-0000-0000-0000-000000000002', 'Women', 'women', 'Contemporary drape, minimalist tailoring, and premium textiles.', 2, true, true, true),
('a0000001-0000-0000-0000-000000000003', 'Footwear', 'footwear', 'Handcrafted Ethiopian full-grain leather shoes and modern minimalist footwear.', 3, true, true, true),
('a0000001-0000-0000-0000-000000000004', 'Tibeb & Heritage Fusion', 'heritage-fusion', 'Artisanal handwoven Shemma textiles reimagined in sleek, modern cuts.', 4, true, true, true),
('a0000001-0000-0000-0000-000000000005', 'Accessories', 'accessories', 'Vegetable-tanned leather goods, scarves, and understated essentials.', 5, true, true, true)
ON CONFLICT (slug) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (id, section_id, name, slug, description, display_order, is_active)
VALUES
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Linen Shirts', 'linen-shirts', 'Breathable relaxed fit shirts crafted for warm days.', 1, true),
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Tailored Trousers', 'tailored-trousers', 'Clean pleats and structured wool-cotton blends.', 2, true),
('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000002', 'Minimalist Dresses', 'minimalist-dresses', 'Architectural silhouettes and column drapes.', 1, true),
('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000002', 'Oversized Blazers', 'blazers', 'Relaxed shoulders and premium structural drape.', 2, true),
('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000003', 'Handcrafted Loafers', 'leather-loafers', 'Ethiopian highland leather with Blake stitched soles.', 1, true),
('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000004', 'Modern Tibeb Sets', 'modern-tibeb', 'Subtle woven border geometry on pure handspun cotton.', 1, true)
ON CONFLICT (section_id, slug) DO NOTHING;

-- 3. PICKUP LOCATIONS
INSERT INTO pickup_locations (id, name, address_line, city, contact_phone, opening_hours, pickup_fee_etb, is_active, accepts_new_orders)
VALUES
('c0000001-0000-0000-0000-000000000001', 'Bole Flagship Store', 'Cameroon St, Near Edna Mall, Bole', 'Addis Ababa', '+251 91 123 4567', 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM', 0, true, true),
('c0000001-0000-0000-0000-000000000002', 'Kazanchis Design Studio', 'Menelik II Avenue, Kazanchis Business District', 'Addis Ababa', '+251 91 234 5678', 'Mon - Fri: 9:30 AM - 7:00 PM', 0, true, true),
('c0000001-0000-0000-0000-000000000003', 'Sarbet Old Airport Studio', 'Roosevelt St, Near Pushkin Square, Sarbet', 'Addis Ababa', '+251 91 345 6789', 'Tue - Sun: 10:00 AM - 7:30 PM', 0, true, true)
ON CONFLICT DO NOTHING;

-- 4. DELIVERY ZONES & RULES
INSERT INTO delivery_zones (id, name, description, fee_etb, free_delivery_threshold_etb, min_order_amount_etb, estimated_delivery_time, priority, is_active)
VALUES
('d0000001-0000-0000-0000-000000000001', 'Addis Ababa Central Zone', 'Bole, Kirkos, Arada, Lideta, Kazanchis, Piazza', 200, 2500, 0, 'Same Day / Next Day (24h)', 10, true),
('d0000001-0000-0000-0000-000000000002', 'Addis Ababa Greater Sub-Cities', 'Yeka, Nifas Silk Lafto, Kolfe Keranio, Akaki Kality, Gullele', 300, 3500, 0, '24 to 48 Hours', 8, true),
('d0000001-0000-0000-0000-000000000003', 'Regional Express Hubs', 'Hawassa, Adama, Bishoftu, Bahir Dar, Dire Dawa, Gondar', 550, 6000, 500, '2 to 4 Business Days', 5, true)
ON CONFLICT DO NOTHING;

INSERT INTO delivery_zone_rules (zone_id, match_type, match_pattern)
VALUES
('d0000001-0000-0000-0000-000000000001', 'sub_city', 'Bole'),
('d0000001-0000-0000-0000-000000000001', 'sub_city', 'Kirkos'),
('d0000001-0000-0000-0000-000000000001', 'sub_city', 'Arada'),
('d0000001-0000-0000-0000-000000000001', 'sub_city', 'Lideta'),
('d0000001-0000-0000-0000-000000000002', 'sub_city', 'Yeka'),
('d0000001-0000-0000-0000-000000000002', 'sub_city', 'Nifas Silk'),
('d0000001-0000-0000-0000-000000000002', 'sub_city', 'Kolfe'),
('d0000001-0000-0000-0000-000000000002', 'sub_city', 'Gullele'),
('d0000001-0000-0000-0000-000000000003', 'city', 'Hawassa'),
('d0000001-0000-0000-0000-000000000003', 'city', 'Adama'),
('d0000001-0000-0000-0000-000000000003', 'city', 'Bahir Dar')
ON CONFLICT DO NOTHING;

-- 5. COUPONS
INSERT INTO coupons (id, code, discount_type, discount_value, max_discount_etb, min_order_amount_etb, usage_limit_total, usage_limit_per_customer, status)
VALUES
('e0000001-0000-0000-0000-000000000001', 'WELCOME10', 'percentage', 10, 600, 1000, 500, 1, 'active'),
('e0000001-0000-0000-0000-000000000002', 'FASHION300', 'fixed_amount', 300, 300, 2500, 200, 1, 'active'),
('e0000001-0000-0000-0000-000000000003', 'FREESHIP', 'free_delivery', 0, NULL, 1500, 1000, 2, 'active')
ON CONFLICT (code) DO NOTHING;

-- 6. PRODUCTS
INSERT INTO products (id, name, slug, description, primary_section_id, primary_category_id, regular_price_etb, sale_price_etb, is_featured, is_new_arrival, is_published, low_stock_threshold)
VALUES
(
  'f0000001-0000-0000-0000-000000000001',
  'Relaxed Pure Linen Camp Shirt',
  'relaxed-pure-linen-camp-shirt',
  'Spun from 100% organic lightweight flax linen. Featuring a camp collar, mother-of-pearl buttons, and side-vent drapes tailored for effortless warmth in Addis Ababa.',
  'a0000001-0000-0000-0000-000000000001',
  'b0000001-0000-0000-0000-000000000001',
  2850,
  NULL,
  true,
  true,
  true,
  3
),
(
  'f0000001-0000-0000-0000-000000000002',
  'Pleated High-Waist Wool Trousers',
  'pleated-high-waist-wool-trousers',
  'Double front pleats with a relaxed tapered leg. Woven from breathable tropical wool blend with concealed hook closure and internal waistband adjusters.',
  'a0000001-0000-0000-0000-000000000001',
  'b0000001-0000-0000-0000-000000000002',
  3950,
  3450,
  true,
  false,
  true,
  4
),
(
  'f0000001-0000-0000-0000-000000000003',
  'Architectural Column Midi Dress',
  'architectural-column-midi-dress',
  'A striking minimalist silhouette crafted from substantial stretch viscose crepe. Features clean seam detailing, a discreet side slit, and an invisible back zipper.',
  'a0000001-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000003',
  4600,
  NULL,
  true,
  true,
  true,
  2
),
(
  'f0000001-0000-0000-0000-000000000004',
  'Handcrafted Highland Leather Loafers',
  'handcrafted-highland-leather-loafers',
  'Meticulously crafted from supple vegetable-tanned Ethiopian highland calfskin. Goodyear welted leather soles and hand-burnished finish.',
  'a0000001-0000-0000-0000-000000000003',
  'b0000001-0000-0000-0000-000000000005',
  6200,
  NULL,
  true,
  false,
  true,
  2
),
(
  'f0000001-0000-0000-0000-000000000005',
  'Modern Handwoven Tibeb Tunic Set',
  'modern-handwoven-tibeb-tunic-set',
  'Handspun Shemma cotton tailored into a clean, modern tunic and trouser pairing. Subtle monochrome Tibeb geometric borders woven by master weavers in Gulele.',
  'a0000001-0000-0000-0000-000000000004',
  'b0000001-0000-0000-0000-000000000006',
  7500,
  6800,
  true,
  true,
  true,
  3
)
ON CONFLICT (slug) DO NOTHING;

-- 7. PRODUCT VARIANTS
INSERT INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity, is_available)
VALUES
-- Linen Shirt
('f0000001-0000-0000-0000-000000000001', 'LNN-SHT-WHT-S', 'S', 'Off-White', '#FAF9F6', 8, true),
('f0000001-0000-0000-0000-000000000001', 'LNN-SHT-WHT-M', 'M', 'Off-White', '#FAF9F6', 14, true),
('f0000001-0000-0000-0000-000000000001', 'LNN-SHT-WHT-L', 'L', 'Off-White', '#FAF9F6', 10, true),
('f0000001-0000-0000-0000-000000000001', 'LNN-SHT-OLV-M', 'M', 'Olive Umber', '#556B2F', 6, true),

-- Wool Trousers
('f0000001-0000-0000-0000-000000000002', 'TRS-WOOL-CHR-30', '30', 'Charcoal', '#2B2B2B', 5, true),
('f0000001-0000-0000-0000-000000000002', 'TRS-WOOL-CHR-32', '32', 'Charcoal', '#2B2B2B', 9, true),
('f0000001-0000-0000-0000-000000000002', 'TRS-WOOL-CHR-34', '34', 'Charcoal', '#2B2B2B', 7, true),

-- Column Dress
('f0000001-0000-0000-0000-000000000003', 'DRS-COL-BLK-XS', 'XS', 'Onyx Black', '#121212', 4, true),
('f0000001-0000-0000-0000-000000000003', 'DRS-COL-BLK-S', 'S', 'Onyx Black', '#121212', 8, true),
('f0000001-0000-0000-0000-000000000003', 'DRS-COL-BLK-M', 'M', 'Onyx Black', '#121212', 6, true),

-- Loafers
('f0000001-0000-0000-0000-000000000004', 'LFR-ETH-BRN-41', '41', 'Espresso Brown', '#3D2817', 4, true),
('f0000001-0000-0000-0000-000000000004', 'LFR-ETH-BRN-42', '42', 'Espresso Brown', '#3D2817', 5, true),
('f0000001-0000-0000-0000-000000000004', 'LFR-ETH-BRN-43', '43', 'Espresso Brown', '#3D2817', 3, true),

-- Tibeb Set
('f0000001-0000-0000-0000-000000000005', 'TIB-SET-NAT-S', 'S', 'Natural Cream', '#F5F5DC', 3, true),
('f0000001-0000-0000-0000-000000000005', 'TIB-SET-NAT-M', 'M', 'Natural Cream', '#F5F5DC', 4, true),
('f0000001-0000-0000-0000-000000000005', 'TIB-SET-NAT-L', 'L', 'Natural Cream', '#F5F5DC', 2, true)
ON CONFLICT (sku) DO NOTHING;

-- 8. PRODUCT IMAGES
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
VALUES
('f0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85', 'Relaxed Pure Linen Camp Shirt in Off-White', 1, true),
('f0000001-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85', 'Linen shirt detail close up', 2, false),
('f0000001-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85', 'Pleated High-Waist Wool Trousers in Charcoal', 1, true),
('f0000001-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85', 'Architectural Column Midi Dress front editorial', 1, true),
('f0000001-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=85', 'Handcrafted Highland Leather Loafers espresso', 1, true),
('f0000001-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85', 'Modern Handwoven Tibeb Tunic Set editorial', 1, true)
ON CONFLICT DO NOTHING;

-- 9. SAMPLE COMPETITION
INSERT INTO competitions (
  id, title, slug, description, prize_name, prize_value_etb, prize_image_url,
  entry_fee_etb, min_bid_etb, max_bid_etb, bid_increment_etb,
  starts_at, ends_at, max_entries_per_user, max_bids_per_entry,
  status, rules_text, refund_policy, is_paid_competition
)
VALUES (
  '10000001-0000-0000-0000-000000000001',
  'Artisanal Highland Leather Weekender Duffel',
  'artisanal-leather-weekender-duffel',
  'Win this limited-edition full-grain Ethiopian leather travel weekender bag hand-stitched by master artisans in Addis Ababa.',
  'Artisanal Highland Leather Weekender Duffel',
  14500,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
  0, -- Free entry by default for compliance safeguard
  10,
  5000,
  1,
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '14 days',
  1,
  3,
  'active',
  '1. Each participant may submit up to 3 bids between 10 ETB and 5,000 ETB. 2. The winner will be the eligible participant who submits the lowest bid amount that is completely unique (chosen by exactly one person). 3. In the event of no unique bids, no winner is selected. 4. Results are audited by the store administration before publication.',
  'Free promotional competition. Paid competitions remain disabled pending merchant regulatory compliance.',
  false
)
ON CONFLICT (slug) DO NOTHING;
