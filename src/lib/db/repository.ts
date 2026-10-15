// ============================================================================
// DATA REPOSITORY: UNIFIED ACCESS LAYER (SUPABASE + LOCAL PERSISTENCE)
// Supports all store modules with atomic updates, transactions, and fallback
// ============================================================================

import {
  StoreSettings,
  StoreSection,
  Category,
  Product,
  ProductVariant,
  DeliveryZone,
  PickupLocation,
  Coupon,
  Order,
  Customer,
  Competition,
  CompetitionEntry,
  CompetitionBid,
  CompetitionResult,
  AuditLog,
  NotificationJob,
} from '@/types';
import { generateOrderNumber, generatePickupCode, generateTrackingToken } from '@/lib/utils/format';
import { normalizeEthiopianPhone } from '@/lib/utils/phone';
import { syncProductToSupabase, deleteProductFromSupabase, loadProductsFromSupabase } from './supabase-sync';
import fs from 'fs';
import path from 'path';

// ----------------------------------------------------------------------------
// INITIAL SEED STATE (AUTHENTIC ETHIOPIAN FASHION CATALOG & LOGISTICS)
// ----------------------------------------------------------------------------
const INITIAL_STORE_SETTINGS: StoreSettings = {
  id: 'default',
  store_name: 'Kena Store',
  tagline: 'Order & Relax',
  logo_url: '/logo.png',
  primary_color: '#121212',
  accent_color: '#E51E25',
  background_color: '#FAF9F6',
  contact_phone: '+251 91 123 4567',
  contact_email: 'hello@kenastore.et',
  contact_address: 'Bole Sub-City, Cameroon St, Addis Ababa, Ethiopia',
  social_links: {
    telegram: 'https://t.me/kenastore',
    instagram: 'https://instagram.com/kenastore',
  },
  currency_code: 'ETB',
  currency_symbol: 'ETB',
  cod_enabled: true,
  chapa_enabled: true,
  chapa_public_key: process.env.NEXT_PUBLIC_CHAPA_PUBLIC_KEY || 'CHAPA_TEST_PUB_ayOWglxK6DKbnbyvMYCnRP8Osa2H16fHcq4oAIAL',
  chapa_secret_key: process.env.CHAPA_SECRET_KEY || 'CHAPA_TEST_PRIV_jjIB_c4WZWenlQtaijj6FuUezHs2fzRmoSGQtZVK',
  telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN || '8900384234:AAGomXBQ1JQBmc_X4E5slxGbLJ1xk0IweoI',
  telegram_chat_id: process.env.TELEGRAM_CHAT_ID || '-1003962170647',
  telegram_notifications_enabled: true,
  competitions_enabled: true,
  paid_competitions_unlocked: true,
  tax_percentage: 0,
  admin_credentials: {
    email: 'admin@kenastore.et',
    password: 'admin123',
  },
  hero_slides: [
    {
      id: 'slide-1',
      tag: 'Autumn / Winter 2026 Collection',
      title: 'Quiet Tailoring.\nArtisanal Roots.',
      description:
        'Understated luxury tailored in Addis Ababa. Pure linen drapes, Highland calfskin, and ancient Shemma weaving reinterpreted for the modern wardrobe.',
      media_type: 'image',
      media_url:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85',
      cta_primary_label: 'Explore Catalog',
      cta_primary_link: '/shop',
      cta_secondary_label: 'View Competitions',
      cta_secondary_link: '/bids',
      is_active: true,
      display_order: 1,
    },
    {
      id: 'slide-2',
      tag: 'Cinematic Fashion Showcase',
      title: 'Modern Craftsmanship in Motion.',
      description:
        'Experience the drape and texture of handwoven Ethiopian textiles and bespoke leather essentials in high motion.',
      media_type: 'video',
      media_url:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      cta_primary_label: 'Shop New Arrivals',
      cta_primary_link: '/shop',
      cta_secondary_label: 'Artisanal Story',
      cta_secondary_link: '/about',
      is_active: true,
      display_order: 2,
    },
    {
      id: 'slide-3',
      tag: 'Handspun Luxury',
      title: 'Tibeb & Heritage Fusion.',
      description:
        'Celebrating centuries of handspun Ethiopian cotton tradition elevated into relaxed luxury silhouettes.',
      media_type: 'image',
      media_url:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
      cta_primary_label: 'Discover Heritage',
      cta_primary_link: '/shop/heritage-fusion',
      cta_secondary_label: 'Track Order',
      cta_secondary_link: '/track-order',
      is_active: true,
      display_order: 3,
    },
  ],
  popup_ad: {
    is_enabled: true,
    headline: 'Welcome to Kena Store',
    description:
      'Order & Relax. Enjoy 10% off your first curated Ethiopian sartorial order with complimentary Addis Ababa doorstep delivery.',
    badge_text: 'Limited First Order Privilege',
    promo_code: 'RELAX10',
    image_url:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    button_label: 'Explore Catalog Now',
    button_link: '/shop',
    trigger_delay_seconds: 3,
    trigger_scroll_percent: 25,
  },
  seo_settings: {
    meta_title: 'Kena Store | Curated Ethiopian Fashion & Modern Essentials',
    meta_description:
      'Luxury artisanal Ethiopian fashion, handcrafted highland leather bags, linen garments, and Shemma heritage essentials. Order & relax.',
    keywords:
      'Kena Store, Ethiopian fashion, Habesha clothing, Shemma dress, Addis Ababa shopping, Highland leather, Tibeb, artisan menswear',
    og_image_url: '/logo.png',
    canonical_url: 'https://kenastore.et',
    twitter_handle: '@kenastore',
    allow_indexing: true,
    google_site_verification: process.env.GOOGLE_SITE_VERIFICATION || 'XUH3QQTaQBIpwlIBQ_DVgiUPj_by3clSZ1LHRFWOS3k',
  },
  bidding_preferences: {
    competitions_enabled: true,
    require_payment_to_bid: true,
    default_entry_fee_etb: 100,
    payment_instructions:
      'A participation entry fee of 100 ETB is required per bid. Securely payable via Chapa, Telebirr, or CBE Birr.',
    accepted_payment_methods: ['chapa', 'telebirr', 'cbe_birr'],
    min_bid_limit_etb: 10,
    max_bid_limit_etb: 5000,
    winner_pays_bid_amount: true,
    rules_overview:
      'The winning bid is the lowest amount that is submitted by only ONE participant. All bids are verified deterministically.',
  },
};

const INITIAL_SECTIONS: StoreSection[] = [
  {
    id: 'sec-men',
    name: 'Men',
    slug: 'men',
    description: 'Tailored essentials, relaxed linen, and refined silhouettes.',
    display_order: 1,
    is_nav_visible: true,
    is_home_visible: true,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sec-women',
    name: 'Women',
    slug: 'women',
    description: 'Contemporary drape, minimalist tailoring, and premium textiles.',
    display_order: 2,
    is_nav_visible: true,
    is_home_visible: true,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sec-footwear',
    name: 'Footwear',
    slug: 'footwear',
    description: 'Handcrafted Ethiopian full-grain leather shoes and modern minimalist footwear.',
    display_order: 3,
    is_nav_visible: true,
    is_home_visible: true,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sec-heritage',
    name: 'Tibeb & Heritage Fusion',
    slug: 'heritage-fusion',
    description: 'Artisanal handwoven Shemma textiles reimagined in sleek, modern cuts.',
    display_order: 4,
    is_nav_visible: true,
    is_home_visible: true,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sec-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Vegetable-tanned leather goods, scarves, and understated essentials.',
    display_order: 5,
    is_nav_visible: true,
    is_home_visible: true,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-linen-shirts',
    section_id: 'sec-men',
    name: 'Linen Shirts',
    slug: 'linen-shirts',
    description: 'Breathable relaxed fit shirts crafted for warm days.',
    display_order: 1,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-trousers',
    section_id: 'sec-men',
    name: 'Tailored Trousers',
    slug: 'tailored-trousers',
    description: 'Clean pleats and structured wool-cotton blends.',
    display_order: 2,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-dresses',
    section_id: 'sec-women',
    name: 'Minimalist Dresses',
    slug: 'minimalist-dresses',
    description: 'Architectural silhouettes and column drapes.',
    display_order: 1,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-blazers',
    section_id: 'sec-women',
    name: 'Oversized Blazers',
    slug: 'blazers',
    description: 'Relaxed shoulders and premium structural drape.',
    display_order: 2,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-loafers',
    section_id: 'sec-footwear',
    name: 'Handcrafted Loafers',
    slug: 'leather-loafers',
    description: 'Ethiopian highland leather with Blake stitched soles.',
    display_order: 1,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-tibeb-sets',
    section_id: 'sec-heritage',
    name: 'Modern Tibeb Sets',
    slug: 'modern-tibeb',
    description: 'Subtle woven border geometry on pure handspun cotton.',
    display_order: 1,
    is_active: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-baggy-jeans',
    name: 'baggy jeans',
    slug: 'baggy-jeans',
    description:
      'Contemporary wide-leg relaxed denim trousers crafted with durable washed cotton. Tailored for comfort with modern street-luxury drape.',
    primary_section_id: 'sec-women',
    primary_category_id: 'cat-dresses',
    regular_price_etb: 38000,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    is_archived: false,
    low_stock_threshold: 5,
    seo_title: 'baggy jeans | YOUR BRAND',
    seo_description: 'Wide-leg relaxed denim trousers.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-baggy-1',
        product_id: 'prod-baggy-jeans',
        image_url:
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85',
        alt_text: 'baggy jeans',
        display_order: 1,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: 'var-baggy-s',
        product_id: 'prod-baggy-jeans',
        sku: 'BGY-JNS-BLU-S',
        size: 'S',
        color: 'Classic Blue',
        color_hex: '#2E5090',
        stock_quantity: 10,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-baggy-m',
        product_id: 'prod-baggy-jeans',
        sku: 'BGY-JNS-BLU-M',
        size: 'M',
        color: 'Classic Blue',
        color_hex: '#2E5090',
        stock_quantity: 13,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-baggy-l',
        product_id: 'prod-baggy-jeans',
        sku: 'BGY-JNS-BLU-L',
        size: 'L',
        color: 'Classic Blue',
        color_hex: '#2E5090',
        stock_quantity: 10,
        is_available: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'prod-linen-shirt',
    name: 'Relaxed Pure Linen Camp Shirt',
    slug: 'relaxed-pure-linen-camp-shirt',
    description:
      'Spun from 100% organic lightweight flax linen. Featuring an open camp collar, mother-of-pearl buttons, and side-vent drapes tailored for effortless warmth in Addis Ababa.',
    primary_section_id: 'sec-men',
    primary_category_id: 'cat-linen-shirts',
    regular_price_etb: 2850,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    is_archived: false,
    low_stock_threshold: 3,
    seo_title: 'Relaxed Pure Linen Camp Shirt | YOUR BRAND',
    seo_description: '100% organic linen camp shirt tailored in Ethiopia.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-1-1',
        product_id: 'prod-linen-shirt',
        image_url:
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85',
        alt_text: 'Relaxed Pure Linen Camp Shirt in Off-White',
        display_order: 1,
        is_primary: true,
      },
      {
        id: 'img-1-2',
        product_id: 'prod-linen-shirt',
        image_url:
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
        alt_text: 'Linen shirt texture detail',
        display_order: 2,
        is_primary: false,
      },
    ],
    variants: [
      {
        id: 'var-1-s',
        product_id: 'prod-linen-shirt',
        sku: 'LNN-SHT-WHT-S',
        size: 'S',
        color: 'Off-White',
        color_hex: '#FAF9F6',
        stock_quantity: 8,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-1-m',
        product_id: 'prod-linen-shirt',
        sku: 'LNN-SHT-WHT-M',
        size: 'M',
        color: 'Off-White',
        color_hex: '#FAF9F6',
        stock_quantity: 14,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-1-l',
        product_id: 'prod-linen-shirt',
        sku: 'LNN-SHT-WHT-L',
        size: 'L',
        color: 'Off-White',
        color_hex: '#FAF9F6',
        stock_quantity: 10,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-1-olv-m',
        product_id: 'prod-linen-shirt',
        sku: 'LNN-SHT-OLV-M',
        size: 'M',
        color: 'Olive Umber',
        color_hex: '#556B2F',
        stock_quantity: 6,
        is_available: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'prod-wool-trousers',
    name: 'Pleated High-Waist Wool Trousers',
    slug: 'pleated-high-waist-wool-trousers',
    description:
      'Double front pleats with a relaxed tapered leg. Woven from breathable tropical wool blend with concealed hook closure and internal waistband adjusters.',
    primary_section_id: 'sec-men',
    primary_category_id: 'cat-trousers',
    regular_price_etb: 3950,
    sale_price_etb: 3450,
    is_featured: true,
    is_new_arrival: false,
    is_published: true,
    is_archived: false,
    low_stock_threshold: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-2-1',
        product_id: 'prod-wool-trousers',
        image_url:
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85',
        alt_text: 'Pleated High-Waist Wool Trousers in Charcoal',
        display_order: 1,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: 'var-2-30',
        product_id: 'prod-wool-trousers',
        sku: 'TRS-WOOL-CHR-30',
        size: '30',
        color: 'Charcoal',
        color_hex: '#2B2B2B',
        stock_quantity: 5,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-2-32',
        product_id: 'prod-wool-trousers',
        sku: 'TRS-WOOL-CHR-32',
        size: '32',
        color: 'Charcoal',
        color_hex: '#2B2B2B',
        stock_quantity: 9,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-2-34',
        product_id: 'prod-wool-trousers',
        sku: 'TRS-WOOL-CHR-34',
        size: '34',
        color: 'Charcoal',
        color_hex: '#2B2B2B',
        stock_quantity: 7,
        is_available: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'prod-column-dress',
    name: 'Architectural Column Midi Dress',
    slug: 'architectural-column-midi-dress',
    description:
      'A striking minimalist silhouette crafted from substantial stretch viscose crepe. Features clean seam detailing, a discreet side slit, and an invisible back zipper.',
    primary_section_id: 'sec-women',
    primary_category_id: 'cat-dresses',
    regular_price_etb: 4600,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    is_archived: false,
    low_stock_threshold: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-3-1',
        product_id: 'prod-column-dress',
        image_url:
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
        alt_text: 'Architectural Column Midi Dress in Onyx Black',
        display_order: 1,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: 'var-3-xs',
        product_id: 'prod-column-dress',
        sku: 'DRS-COL-BLK-XS',
        size: 'XS',
        color: 'Onyx Black',
        color_hex: '#121212',
        stock_quantity: 4,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-3-s',
        product_id: 'prod-column-dress',
        sku: 'DRS-COL-BLK-S',
        size: 'S',
        color: 'Onyx Black',
        color_hex: '#121212',
        stock_quantity: 8,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-3-m',
        product_id: 'prod-column-dress',
        sku: 'DRS-COL-BLK-M',
        size: 'M',
        color: 'Onyx Black',
        color_hex: '#121212',
        stock_quantity: 6,
        is_available: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'prod-loafers',
    name: 'Handcrafted Highland Leather Loafers',
    slug: 'handcrafted-highland-leather-loafers',
    description:
      'Meticulously crafted from supple vegetable-tanned Ethiopian highland calfskin. Goodyear welted leather soles and hand-burnished finish.',
    primary_section_id: 'sec-footwear',
    primary_category_id: 'cat-loafers',
    regular_price_etb: 6200,
    is_featured: true,
    is_new_arrival: false,
    is_published: true,
    is_archived: false,
    low_stock_threshold: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-4-1',
        product_id: 'prod-loafers',
        image_url:
          'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1200&q=85',
        alt_text: 'Handcrafted Highland Leather Loafers',
        display_order: 1,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: 'var-4-41',
        product_id: 'prod-loafers',
        sku: 'LFR-ETH-BRN-41',
        size: '41',
        color: 'Espresso Brown',
        color_hex: '#3D2817',
        stock_quantity: 4,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-4-42',
        product_id: 'prod-loafers',
        sku: 'LFR-ETH-BRN-42',
        size: '42',
        color: 'Espresso Brown',
        color_hex: '#3D2817',
        stock_quantity: 5,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-4-43',
        product_id: 'prod-loafers',
        sku: 'LFR-ETH-BRN-43',
        size: '43',
        color: 'Espresso Brown',
        color_hex: '#3D2817',
        stock_quantity: 3,
        is_available: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'prod-tibeb-set',
    name: 'Modern Handwoven Tibeb Tunic Set',
    slug: 'modern-handwoven-tibeb-tunic-set',
    description:
      'Handspun Shemma cotton tailored into a clean, modern tunic and trouser pairing. Subtle monochrome Tibeb geometric borders woven by master weavers in Gulele.',
    primary_section_id: 'sec-heritage',
    primary_category_id: 'cat-tibeb-sets',
    regular_price_etb: 7500,
    sale_price_etb: 6800,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    is_archived: false,
    low_stock_threshold: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-5-1',
        product_id: 'prod-tibeb-set',
        image_url:
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
        alt_text: 'Modern Handwoven Tibeb Tunic Set',
        display_order: 1,
        is_primary: true,
      },
    ],
    variants: [
      {
        id: 'var-5-s',
        product_id: 'prod-tibeb-set',
        sku: 'TIB-SET-NAT-S',
        size: 'S',
        color: 'Natural Cream',
        color_hex: '#F5F5DC',
        stock_quantity: 3,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-5-m',
        product_id: 'prod-tibeb-set',
        sku: 'TIB-SET-NAT-M',
        size: 'M',
        color: 'Natural Cream',
        color_hex: '#F5F5DC',
        stock_quantity: 4,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'var-5-l',
        product_id: 'prod-tibeb-set',
        sku: 'TIB-SET-NAT-L',
        size: 'L',
        color: 'Natural Cream',
        color_hex: '#F5F5DC',
        stock_quantity: 2,
        is_available: true,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

const INITIAL_PICKUP_LOCATIONS: PickupLocation[] = [
  {
    id: 'pk-bole',
    name: 'Bole Flagship Boutique',
    address_line: 'Cameroon St, Near Edna Mall, Bole',
    city: 'Addis Ababa',
    google_maps_url: 'https://maps.google.com/?q=Bole+Addis+Ababa',
    contact_phone: '+251 91 123 4567',
    opening_hours: 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM',
    instructions: 'Present your Pickup PIN code (PK-XXXXX) to store staff upon collection.',
    pickup_fee_etb: 0,
    is_active: true,
    accepts_new_orders: true,
    display_order: 1,
  },
  {
    id: 'pk-kazanchis',
    name: 'Kazanchis Design Studio',
    address_line: 'Menelik II Avenue, Kazanchis Business District',
    city: 'Addis Ababa',
    google_maps_url: 'https://maps.google.com/?q=Kazanchis+Addis+Ababa',
    contact_phone: '+251 91 234 5678',
    opening_hours: 'Mon - Fri: 9:30 AM - 7:00 PM',
    instructions: 'Enter ground floor showroom. Parking available at the rear.',
    pickup_fee_etb: 0,
    is_active: true,
    accepts_new_orders: true,
    display_order: 2,
  },
  {
    id: 'pk-sarbet',
    name: 'Sarbet Old Airport Studio',
    address_line: 'Roosevelt St, Near Pushkin Square, Sarbet',
    city: 'Addis Ababa',
    contact_phone: '+251 91 345 6789',
    opening_hours: 'Tue - Sun: 10:00 AM - 7:30 PM',
    instructions: 'Collection desk located in the main gallery.',
    pickup_fee_etb: 0,
    is_active: true,
    accepts_new_orders: true,
    display_order: 3,
  },
];

const INITIAL_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-addis-central',
    name: 'Addis Ababa Central Zone',
    description: 'Bole, Kirkos, Arada, Lideta, Kazanchis, Piazza',
    fee_etb: 200,
    free_delivery_threshold_etb: 2500,
    min_order_amount_etb: 0,
    estimated_delivery_time: 'Same Day / Next Day (24h)',
    priority: 10,
    is_active: true,
    rules: [
      { id: 'r1', zone_id: 'zone-addis-central', match_type: 'sub_city', match_pattern: 'Bole' },
      { id: 'r2', zone_id: 'zone-addis-central', match_type: 'sub_city', match_pattern: 'Kirkos' },
      { id: 'r3', zone_id: 'zone-addis-central', match_type: 'sub_city', match_pattern: 'Arada' },
      { id: 'r4', zone_id: 'zone-addis-central', match_type: 'sub_city', match_pattern: 'Lideta' },
    ],
  },
  {
    id: 'zone-addis-outer',
    name: 'Addis Ababa Greater Sub-Cities',
    description: 'Yeka, Nifas Silk Lafto, Kolfe Keranio, Akaki Kality, Gullele',
    fee_etb: 300,
    free_delivery_threshold_etb: 3500,
    min_order_amount_etb: 0,
    estimated_delivery_time: '24 to 48 Hours',
    priority: 8,
    is_active: true,
    rules: [
      { id: 'r5', zone_id: 'zone-addis-outer', match_type: 'sub_city', match_pattern: 'Yeka' },
      { id: 'r6', zone_id: 'zone-addis-outer', match_type: 'sub_city', match_pattern: 'Nifas Silk' },
      { id: 'r7', zone_id: 'zone-addis-outer', match_type: 'sub_city', match_pattern: 'Kolfe' },
      { id: 'r8', zone_id: 'zone-addis-outer', match_type: 'sub_city', match_pattern: 'Gullele' },
      { id: 'r9', zone_id: 'zone-addis-outer', match_type: 'sub_city', match_pattern: 'Akaki Kality' },
    ],
  },
  {
    id: 'zone-regional',
    name: 'Regional Express Hubs',
    description: 'Hawassa, Adama, Bishoftu, Bahir Dar, Dire Dawa, Gondar',
    fee_etb: 550,
    free_delivery_threshold_etb: 6000,
    min_order_amount_etb: 500,
    estimated_delivery_time: '2 to 4 Business Days',
    priority: 5,
    is_active: true,
    rules: [
      { id: 'r10', zone_id: 'zone-regional', match_type: 'city', match_pattern: 'Hawassa' },
      { id: 'r11', zone_id: 'zone-regional', match_type: 'city', match_pattern: 'Adama' },
      { id: 'r12', zone_id: 'zone-regional', match_type: 'city', match_pattern: 'Bishoftu' },
      { id: 'r13', zone_id: 'zone-regional', match_type: 'city', match_pattern: 'Bahir Dar' },
    ],
  },
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-welcome',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    max_discount_etb: 600,
    min_order_amount_etb: 1000,
    usage_limit_total: 500,
    usage_limit_per_customer: 1,
    current_redemptions_count: 14,
    is_new_customer_only: true,
    status: 'active',
  },
  {
    id: 'coup-300',
    code: 'FASHION300',
    discount_type: 'fixed_amount',
    discount_value: 300,
    min_order_amount_etb: 2500,
    usage_limit_total: 200,
    usage_limit_per_customer: 1,
    current_redemptions_count: 28,
    is_new_customer_only: false,
    status: 'active',
  },
  {
    id: 'coup-free-ship',
    code: 'FREESHIP',
    discount_type: 'free_delivery',
    discount_value: 0,
    min_order_amount_etb: 1500,
    usage_limit_total: 1000,
    usage_limit_per_customer: 2,
    current_redemptions_count: 52,
    is_new_customer_only: false,
    status: 'active',
  },
];

const INITIAL_COMPETITION: Competition = {
  id: 'comp-1',
  title: 'Artisanal Highland Leather Weekender Duffel',
  slug: 'artisanal-leather-weekender-duffel',
  description:
    'Win this limited-edition full-grain Ethiopian leather travel weekender bag hand-stitched by master artisans in Addis Ababa.',
  prize_name: 'Artisanal Highland Leather Weekender Duffel',
  prize_value_etb: 14500,
  prize_image_url:
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
  entry_fee_etb: 0,
  min_bid_etb: 10,
  max_bid_etb: 5000,
  bid_increment_etb: 1,
  starts_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  ends_at: new Date(Date.now() + 10 * 86400000).toISOString(),
  max_entries_per_user: 1,
  max_bids_per_entry: 3,
  status: 'active',
  rules_text:
    '1. Each participant may submit up to 3 bids between 10 ETB and 5,000 ETB.\n2. The winner will be the eligible participant who submits the lowest bid amount that is completely unique (chosen by exactly one person).\n3. In the event of no unique bids, no winner is determined.\n4. Results are audited by the store administration before publication.',
  refund_policy: 'Free promotional competition. Paid competitions remain disabled pending merchant regulatory compliance.',
  winner_pays_bid_amount: true,
  is_paid_competition: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ----------------------------------------------------------------------------
// IN-MEMORY ACTIVE STATE SINGLETON
// ----------------------------------------------------------------------------
class MemoryStore {
  storeSettings: StoreSettings = { ...INITIAL_STORE_SETTINGS };
  sections: StoreSection[] = [...INITIAL_SECTIONS];
  categories: Category[] = [...INITIAL_CATEGORIES];
  products: Product[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  pickupLocations: PickupLocation[] = [...INITIAL_PICKUP_LOCATIONS];
  deliveryZones: DeliveryZone[] = JSON.parse(JSON.stringify(INITIAL_DELIVERY_ZONES));
  coupons: Coupon[] = [...INITIAL_COUPONS];
  orders: Order[] = [];
  customers: Customer[] = [];
  competitions: Competition[] = [{ ...INITIAL_COMPETITION }];
  competitionEntries: CompetitionEntry[] = [];
  competitionBids: CompetitionBid[] = [];
  competitionResults: CompetitionResult[] = [];
  auditLogs: AuditLog[] = [];
  notificationJobs: NotificationJob[] = [];

  constructor() {
    this.seedDemoCustomersAndOrders();
    loadStoreState(this);
  }

  private seedDemoCustomersAndOrders() {
    // Demo customer
    const c1: Customer = {
      id: 'cust-1',
      full_name: 'Abebe Kebede',
      phone: '0911223344',
      phone_normalized: '+251911223344',
      email: 'abebe@example.com',
      marketing_consent: true,
      total_orders: 1,
      total_spent_etb: 2850,
      competition_count: 1,
      first_seen_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      last_activity_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    };
    this.customers.push(c1);

    // Demo completed order
    const o1: Order = {
      id: 'ord-1',
      order_number: 'ORD-2026-104821',
      customer_id: 'cust-1',
      customer_name: 'Abebe Kebede',
      customer_phone: '0911223344',
      customer_phone_normalized: '+251911223344',
      customer_email: 'abebe@example.com',
      fulfillment_type: 'store_pickup',
      order_status: 'ready_for_pickup',
      payment_status: 'paid',
      payment_method: 'chapa',
      subtotal_etb: 2850,
      discount_amount_etb: 0,
      delivery_fee_etb: 0,
      tax_amount_etb: 0,
      total_amount_etb: 2850,
      tracking_token: 'trk-demo-token-12345678',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          order_id: 'ord-1',
          product_id: 'prod-linen-shirt',
          variant_id: 'var-1-m',
          product_name: 'Relaxed Pure Linen Camp Shirt',
          sku: 'LNN-SHT-WHT-M',
          size: 'M',
          color: 'Off-White',
          unit_price_etb: 2850,
          quantity: 1,
          line_total_etb: 2850,
          product_image_url:
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85',
        },
      ],
      fulfillment: {
        id: 'ful-1',
        order_id: 'ord-1',
        fulfillment_type: 'store_pickup',
        pickup_location_id: 'pk-bole',
        pickup_location_name: 'Bole Flagship Boutique',
        pickup_reference_code: 'PK-B4821',
      },
    };
    this.orders.push(o1);

    // Demo competition entries & bids
    this.competitionEntries.push({
      id: 'entry-1',
      competition_id: 'comp-1',
      customer_id: 'cust-1',
      participant_name: 'Abebe Kebede',
      participant_phone: '0911223344',
      participant_phone_normalized: '+251911223344',
      entry_fee_etb: 0,
      payment_status: 'paid',
      is_eligible: true,
      entered_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    });

    this.competitionBids.push(
      {
        id: 'bid-1',
        competition_id: 'comp-1',
        entry_id: 'entry-1',
        bid_amount_etb: 150,
        submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        is_valid: true,
        participant_name: 'Abebe Kebede',
        participant_phone_masked: '0911 **** 44',
      },
      {
        id: 'bid-2',
        competition_id: 'comp-1',
        entry_id: 'entry-1',
        bid_amount_etb: 220,
        submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        is_valid: true,
        participant_name: 'Abebe Kebede',
        participant_phone_masked: '0911 **** 44',
      }
    );
  }
}

function getStoreDataFilePath(): string {
  try {
    const dir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, 'store_state.json');
  } catch {
    return path.join('/tmp', 'store_state.json');
  }
}

let lastLoadedMtime = 0;

function saveStoreState(store: MemoryStore) {
  try {
    const filePath = getStoreDataFilePath();
    let diskOrders: Order[] = [];
    let diskCustomers: Customer[] = [];
    let diskSettings: Partial<StoreSettings> = {};

    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const existing = JSON.parse(raw);
        if (Array.isArray(existing.orders)) diskOrders = existing.orders;
        if (Array.isArray(existing.customers)) diskCustomers = existing.customers;
        if (existing.storeSettings) diskSettings = existing.storeSettings;
      } catch {
        // file mid-write, ignore
      }
    }

    // Merge orders without losing any from disk or memory
    const orderMap = new Map<string, Order>();
    for (const ord of diskOrders) {
      if (ord && ord.id) orderMap.set(ord.id, ord);
    }
    for (const ord of store.orders) {
      if (ord && ord.id) {
        if (!orderMap.has(ord.id)) {
          orderMap.set(ord.id, ord);
        } else {
          // Keep newer version
          const diskOrd = orderMap.get(ord.id)!;
          const memTime = new Date(ord.updated_at || ord.created_at || 0).getTime();
          const diskTime = new Date(diskOrd.updated_at || diskOrd.created_at || 0).getTime();
          if (memTime >= diskTime) {
            orderMap.set(ord.id, ord);
          }
        }
      }
    }

    const mergedOrders = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Merge customers
    const custMap = new Map<string, Customer>();
    for (const c of diskCustomers) {
      if (c && c.id) custMap.set(c.id, c);
    }
    for (const c of store.customers) {
      if (c && c.id) custMap.set(c.id, c);
    }
    const mergedCustomers = Array.from(custMap.values());

    store.orders = mergedOrders;
    store.customers = mergedCustomers;

    const data = {
      products: store.products,
      sections: store.sections,
      categories: store.categories,
      pickupLocations: store.pickupLocations,
      deliveryZones: store.deliveryZones,
      coupons: store.coupons,
      orders: mergedOrders,
      customers: mergedCustomers,
      storeSettings: { ...diskSettings, ...store.storeSettings },
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    try {
      lastLoadedMtime = fs.statSync(filePath).mtimeMs;
    } catch {
      // ignore
    }
  } catch (err) {
    console.error('[saveStoreState error]:', err);
  }
}

function loadStoreState(store: MemoryStore, force = false) {
  try {
    const filePath = getStoreDataFilePath();
    if (!fs.existsSync(filePath)) {
      // First run: save initial catalog to disk
      saveStoreState(store);
      return;
    }

    const stat = fs.statSync(filePath);
    if (!force && lastLoadedMtime > 0 && stat.mtimeMs <= lastLoadedMtime) {
      return;
    }

    const raw = fs.readFileSync(filePath, 'utf-8').trim();
    if (!raw) {
      return;
    }
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return; // ignore partial read
    }
    lastLoadedMtime = stat.mtimeMs;

    // 1. Products persistence & merge
    if (Array.isArray(data.products) && data.products.length > 0) {
      const prodMap = new Map<string, Product>();
      for (const p of data.products) {
        if (p && p.id) prodMap.set(p.id, p);
      }
      for (const p of store.products) {
        if (p && p.id) {
          if (!prodMap.has(p.id)) {
            prodMap.set(p.id, p);
          } else {
            const diskP = prodMap.get(p.id)!;
            const memTime = new Date(p.updated_at || p.created_at || 0).getTime();
            const diskTime = new Date(diskP.updated_at || diskP.created_at || 0).getTime();
            if (memTime > diskTime) {
              prodMap.set(p.id, p);
            }
          }
        }
      }
      store.products = Array.from(prodMap.values());
    } else if (Array.isArray(store.products) && store.products.length > 0) {
      saveStoreState(store);
    }

    // 2. Sections
    if (Array.isArray(data.sections) && data.sections.length > 0) {
      store.sections = data.sections;
    }

    // 3. Categories
    if (Array.isArray(data.categories) && data.categories.length > 0) {
      store.categories = data.categories;
    }

    // 4. Pickup Locations
    if (Array.isArray(data.pickupLocations) && data.pickupLocations.length > 0) {
      store.pickupLocations = data.pickupLocations;
    }

    // 5. Delivery Zones
    if (Array.isArray(data.deliveryZones) && data.deliveryZones.length > 0) {
      store.deliveryZones = data.deliveryZones;
    }

    // 6. Coupons
    if (Array.isArray(data.coupons) && data.coupons.length > 0) {
      store.coupons = data.coupons;
    }

    // 7. Orders
    if (Array.isArray(data.orders) && data.orders.length > 0) {
      const orderMap = new Map<string, Order>();
      for (const ord of data.orders) {
        if (ord && ord.id) orderMap.set(ord.id, ord);
      }
      for (const ord of store.orders) {
        if (ord && ord.id && !orderMap.has(ord.id)) {
          orderMap.set(ord.id, ord);
        }
      }
      store.orders = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // 8. Customers
    if (Array.isArray(data.customers) && data.customers.length > 0) {
      const custMap = new Map<string, Customer>();
      for (const c of data.customers) {
        if (c && c.id) custMap.set(c.id, c);
      }
      for (const c of store.customers) {
        if (c && c.id && !custMap.has(c.id)) {
          custMap.set(c.id, c);
        }
      }
      store.customers = Array.from(custMap.values());
    }

    // 9. Settings
    if (data.storeSettings) {
      store.storeSettings = { ...store.storeSettings, ...data.storeSettings };
    }
  } catch (err) {
    console.error('[loadStoreState error]:', err);
  }
}

// Global instance to preserve data across server actions / reloads in all environments
const globalForStore = globalThis as unknown as { appMemoryStore?: MemoryStore };
export const db = globalForStore.appMemoryStore ?? new MemoryStore();
globalForStore.appMemoryStore = db;

// ----------------------------------------------------------------------------
// REPOSITORY METHODS (ASYNC FOR PARITY WITH SUPABASE)
// ----------------------------------------------------------------------------

export async function getStoreSettings(): Promise<StoreSettings> {
  return { ...db.storeSettings };
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  db.storeSettings = { ...db.storeSettings, ...settings };
  saveStoreState(db);
  return { ...db.storeSettings };
}

export async function getSections(includeArchived = false): Promise<StoreSection[]> {
  return db.sections
    .filter((s) => (includeArchived ? true : !s.is_archived && s.is_active))
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getSectionBySlug(slug: string): Promise<StoreSection | null> {
  return db.sections.find((s) => s.slug === slug && !s.is_archived) || null;
}

export async function createSection(data: Omit<StoreSection, 'id' | 'created_at' | 'updated_at'>): Promise<StoreSection> {
  loadStoreState(db);
  const newSection: StoreSection = {
    ...data,
    id: `sec-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.sections.push(newSection);
  saveStoreState(db);
  return newSection;
}

export async function updateSection(id: string, data: Partial<StoreSection>): Promise<StoreSection | null> {
  loadStoreState(db);
  const index = db.sections.findIndex((s) => s.id === id);
  if (index === -1) return null;
  db.sections[index] = { ...db.sections[index], ...data, updated_at: new Date().toISOString() };
  saveStoreState(db);
  return db.sections[index];
}

export async function getCategories(sectionId?: string, includeArchived = false): Promise<Category[]> {
  return db.categories
    .filter((c) => {
      if (!includeArchived && (c.is_archived || !c.is_active)) return false;
      if (sectionId && c.section_id !== sectionId) return false;
      return true;
    })
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getCategoryBySlug(sectionSlug: string, categorySlug: string): Promise<Category | null> {
  const section = await getSectionBySlug(sectionSlug);
  if (!section) return null;
  return db.categories.find((c) => c.section_id === section.id && c.slug === categorySlug && !c.is_archived) || null;
}

export async function getProducts(options?: {
  sectionSlug?: string;
  categorySlug?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  searchQuery?: string;
  includeDrafts?: boolean;
}): Promise<Product[]> {
  loadStoreState(db);

  // Sync from Supabase cloud if configured
  try {
    const cloudProducts = await loadProductsFromSupabase();
    if (cloudProducts && cloudProducts.length > 0) {
      const map = new Map<string, Product>();
      for (const p of cloudProducts) {
        if (p && p.slug) map.set(p.slug, p);
      }
      for (const p of db.products) {
        if (p && p.slug && !map.has(p.slug)) {
          map.set(p.slug, p);
        }
      }
      db.products = Array.from(map.values());
    }
  } catch {}

  let list = db.products.filter((p) => (options?.includeDrafts ? !p.is_archived : p.is_published && !p.is_archived));

  if (options?.sectionSlug) {
    const sSlug = options.sectionSlug.trim().toLowerCase();
    const section = db.sections.find((s) => s.slug.toLowerCase() === sSlug || s.id.toLowerCase() === sSlug);
    if (section) {
      list = list.filter((p) => p.primary_section_id === section.id);
    }
  }

  if (options?.categorySlug) {
    const cSlug = options.categorySlug.trim().toLowerCase();
    const category = db.categories.find((c) => c.slug.toLowerCase() === cSlug || c.id.toLowerCase() === cSlug);
    if (category) {
      list = list.filter((p) => p.primary_category_id === category.id);
    }
  }

  if (options?.isFeatured !== undefined) {
    list = list.filter((p) => p.is_featured === options.isFeatured);
  }

  if (options?.isNewArrival !== undefined) {
    list = list.filter((p) => p.is_new_arrival === options.isNewArrival);
  }

  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.variants?.some((v) => v.sku.toLowerCase().includes(q) || v.color?.toLowerCase().includes(q) || v.size?.toLowerCase().includes(q))
    );
  }

  // Populate related section and category details
  return list.map((p) => ({
    ...p,
    section: db.sections.find((s) => s.id === p.primary_section_id),
    category: db.categories.find((c) => c.id === p.primary_category_id),
  }));
}

export async function getProductBySlug(slugOrId: string, options?: { allowDrafts?: boolean }): Promise<Product | null> {
  if (!slugOrId) return null;
  loadStoreState(db);
  const raw = String(slugOrId).trim();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    decoded = raw.toLowerCase();
  }
  const lowerRaw = raw.toLowerCase();

  const p = db.products.find((prod) => {
    if (prod.is_archived) return false;
    // Allow drafts if specifically requested or if queried by exact ID/slug
    if (!options?.allowDrafts && !prod.is_published) {
      // Still match if admin is previewing via ID or direct slug
      return prod.id === raw || prod.slug === raw || prod.id.toLowerCase() === lowerRaw || prod.slug.toLowerCase() === lowerRaw;
    }
    const prodSlug = (prod.slug || '').toLowerCase();
    const prodId = (prod.id || '').toLowerCase();
    return (
      prod.slug === raw ||
      prod.id === raw ||
      prodSlug === decoded ||
      prodId === decoded ||
      prodSlug === lowerRaw ||
      prodId === lowerRaw
    );
  });

  if (!p) return null;
  return {
    ...p,
    section: db.sections.find((s) => s.id === p.primary_section_id),
    category: db.categories.find((c) => c.id === p.primary_category_id),
  };
}

export async function getProductById(idOrSlug: string): Promise<Product | null> {
  if (!idOrSlug) return null;
  loadStoreState(db);
  const raw = String(idOrSlug).trim();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    decoded = raw.toLowerCase();
  }
  const lowerRaw = raw.toLowerCase();

  const p = db.products.find((prod) => {
    const prodId = (prod.id || '').toLowerCase();
    const prodSlug = (prod.slug || '').toLowerCase();
    return (
      prod.id === raw ||
      prod.slug === raw ||
      prodId === decoded ||
      prodSlug === decoded ||
      prodId === lowerRaw ||
      prodSlug === lowerRaw
    );
  });

  if (!p) return null;
  return {
    ...p,
    section: db.sections.find((s) => s.id === p.primary_section_id),
    category: db.categories.find((c) => c.id === p.primary_category_id),
  };
}

export async function createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  loadStoreState(db);

  // Normalize slug to prevent spaces, uppercase, or invalid URL characters
  let cleanSlug = (data.slug || data.name || `prod-${Date.now()}`)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!cleanSlug) {
    cleanSlug = `product-${Date.now()}`;
  }

  // Ensure slug uniqueness
  let finalSlug = cleanSlug;
  let counter = 1;
  while (db.products.some((p) => p.slug === finalSlug && !p.is_archived)) {
    finalSlug = `${cleanSlug}-${counter}`;
    counter++;
  }

  const id = `prod-${Date.now()}`;
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...data,
    id,
    slug: finalSlug,
    is_published: data.is_published ?? true,
    is_archived: false,
    created_at: now,
    updated_at: now,
    images: (data.images && data.images.length > 0)
      ? data.images.map((img, idx) => ({
          ...img,
          id: img.id || `img-${Date.now()}-${idx}`,
          product_id: id,
          display_order: img.display_order ?? idx + 1,
          is_primary: idx === 0,
        }))
      : [],
    variants: (data.variants && data.variants.length > 0)
      ? data.variants.map((v, idx) => ({
          ...v,
          id: v.id || `var-${Date.now()}-${idx}`,
          product_id: id,
          is_available: v.stock_quantity > 0,
          created_at: v.created_at || now,
        }))
      : [],
  };

  db.products.unshift(newProduct);
  saveStoreState(db);
  syncProductToSupabase(newProduct).catch(() => {});
  return newProduct;
}

export async function updateProduct(idOrSlug: string, data: Partial<Product>): Promise<Product | null> {
  loadStoreState(db);
  const target = String(idOrSlug).trim();
  const lowerTarget = target.toLowerCase();
  const index = db.products.findIndex(
    (p) => p.id === target || p.slug === target || p.id.toLowerCase() === lowerTarget || p.slug.toLowerCase() === lowerTarget
  );
  if (index === -1) return null;

  const existing = db.products[index];

  // If slug is being updated, normalize it
  let updatedSlug = existing.slug;
  if (data.slug && data.slug.trim()) {
    const cleaned = data.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (cleaned) {
      // Ensure unique among other products
      let finalSlug = cleaned;
      let counter = 1;
      while (db.products.some((p, i) => i !== index && p.slug === finalSlug && !p.is_archived)) {
        finalSlug = `${cleaned}-${counter}`;
        counter++;
      }
      updatedSlug = finalSlug;
    }
  }

  const now = new Date().toISOString();
  db.products[index] = {
    ...existing,
    ...data,
    slug: updatedSlug,
    updated_at: now,
  };

  // If variants provided, ensure product_id is set
  if (data.variants) {
    db.products[index].variants = data.variants.map((v, idx) => ({
      ...v,
      id: v.id || `var-${Date.now()}-${idx}`,
      product_id: existing.id,
      is_available: v.stock_quantity > 0,
      created_at: v.created_at || now,
    }));
  }

  // If images provided, ensure product_id is set
  if (data.images) {
    db.products[index].images = data.images.map((img, idx) => ({
      ...img,
      id: img.id || `img-${Date.now()}-${idx}`,
      product_id: existing.id,
      display_order: img.display_order ?? idx + 1,
      is_primary: idx === 0,
    }));
  }

  saveStoreState(db);
  syncProductToSupabase(db.products[index]).catch(() => {});
  return db.products[index];
}

export async function deleteProduct(idOrSlug: string): Promise<boolean> {
  loadStoreState(db);
  const target = String(idOrSlug).trim();
  const lowerTarget = target.toLowerCase();
  const index = db.products.findIndex(
    (p) => p.id === target || p.slug === target || p.id.toLowerCase() === lowerTarget || p.slug.toLowerCase() === lowerTarget
  );
  if (index === -1) return false;
  const removed = db.products.splice(index, 1)[0];
  saveStoreState(db);
  if (removed) {
    deleteProductFromSupabase(removed.slug || target).catch(() => {});
  }
  return true;
}

export async function getPickupLocations(onlyActive = true): Promise<PickupLocation[]> {
  loadStoreState(db);
  return db.pickupLocations
    .filter((loc) => (onlyActive ? loc.is_active && loc.accepts_new_orders : true))
    .sort((a, b) => a.display_order - b.display_order);
}

export async function updatePickupLocation(id: string, data: Partial<PickupLocation>): Promise<PickupLocation | null> {
  loadStoreState(db);
  const idx = db.pickupLocations.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  db.pickupLocations[idx] = { ...db.pickupLocations[idx], ...data };
  saveStoreState(db);
  return db.pickupLocations[idx];
}

export async function createPickupLocation(data: Omit<PickupLocation, 'id'>): Promise<PickupLocation> {
  loadStoreState(db);
  const newLoc: PickupLocation = { ...data, id: `pk-${Date.now()}` };
  db.pickupLocations.push(newLoc);
  saveStoreState(db);
  return newLoc;
}

export async function getDeliveryZones(onlyActive = true): Promise<DeliveryZone[]> {
  loadStoreState(db);
  return db.deliveryZones
    .filter((z) => (onlyActive ? z.is_active : true))
    .sort((a, b) => b.priority - a.priority);
}

export async function updateDeliveryZone(id: string, data: Partial<DeliveryZone>): Promise<DeliveryZone | null> {
  loadStoreState(db);
  const idx = db.deliveryZones.findIndex((z) => z.id === id);
  if (idx === -1) return null;
  db.deliveryZones[idx] = { ...db.deliveryZones[idx], ...data };
  saveStoreState(db);
  return db.deliveryZones[idx];
}

export async function createDeliveryZone(data: Omit<DeliveryZone, 'id'>): Promise<DeliveryZone> {
  loadStoreState(db);
  const newZone: DeliveryZone = { ...data, id: `zone-${Date.now()}` };
  db.deliveryZones.push(newZone);
  saveStoreState(db);
  return newZone;
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  loadStoreState(db);
  const normalized = code.trim().toUpperCase();
  return db.coupons.find((c) => c.code === normalized && c.status === 'active') || null;
}

export async function getAllCoupons(): Promise<Coupon[]> {
  loadStoreState(db);
  return [...db.coupons];
}

export async function createCoupon(data: Omit<Coupon, 'id' | 'current_redemptions_count'>): Promise<Coupon> {
  loadStoreState(db);
  const newCoupon: Coupon = {
    ...data,
    id: `coup-${Date.now()}`,
    code: data.code.trim().toUpperCase(),
    current_redemptions_count: 0,
  };
  db.coupons.unshift(newCoupon);
  saveStoreState(db);
  return newCoupon;
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | null> {
  loadStoreState(db);
  const idx = db.coupons.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.coupons[idx] = { ...db.coupons[idx], ...data };
  saveStoreState(db);
  return db.coupons[idx];
}

// ----------------------------------------------------------------------------
// ATOMIC CHECKOUT & ORDER CREATION
// ----------------------------------------------------------------------------
export interface CreateOrderInput {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  marketing_consent?: boolean;
  fulfillment_type: 'home_delivery' | 'store_pickup';
  payment_method: 'cash_on_delivery' | 'chapa' | 'bank_transfer';
  coupon_code?: string;
  // Delivery details
  delivery_zone_id?: string;
  delivery_address?: string;
  delivery_sub_city?: string;
  delivery_instructions?: string;
  // Pickup details
  pickup_location_id?: string;
  items: Array<{
    variant_id: string;
    quantity: number;
  }>;
}

export async function createOrder(input: CreateOrderInput): Promise<{
  success: boolean;
  order?: Order;
  error?: string;
}> {
  loadStoreState(db);

  // 1. Validate Customer Phone
  const phoneVal = normalizeEthiopianPhone(input.customer_phone);
  if (!phoneVal.isValid) {
    return { success: false, error: phoneVal.error };
  }

  // 2. Validate Items & Stock Availability atomically
  if (!input.items || input.items.length === 0) {
    return { success: false, error: 'Your shopping cart is empty.' };
  }

  let subtotal_etb = 0;
  const processedItems = [];

  for (const item of input.items) {
    let matchedProduct: Product | undefined;
    let matchedVariant: ProductVariant | undefined;

    for (const prod of db.products) {
      const v = prod.variants?.find((varItem) => varItem.id === item.variant_id);
      if (v) {
        matchedProduct = prod;
        matchedVariant = v;
        break;
      }
    }

    if (!matchedProduct || !matchedVariant) {
      return { success: false, error: 'One or more items in your cart is no longer available.' };
    }

    if (matchedVariant.stock_quantity < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for "${matchedProduct.name}" (${matchedVariant.size || ''}/${matchedVariant.color || ''}). Only ${matchedVariant.stock_quantity} remaining.`,
      };
    }

    const unitPrice =
      matchedVariant.price_override_etb ||
      matchedProduct.sale_price_etb ||
      matchedProduct.regular_price_etb;

    const lineTotal = unitPrice * item.quantity;
    subtotal_etb += lineTotal;

    processedItems.push({
      product: matchedProduct,
      variant: matchedVariant,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    });
  }

  // 3. Revalidate & Calculate Coupon
  let discount_amount_etb = 0;
  let appliedCoupon: Coupon | null = null;

  if (input.coupon_code) {
    const coupon = await getCouponByCode(input.coupon_code);
    if (coupon) {
      if (coupon.min_order_amount_etb && subtotal_etb < coupon.min_order_amount_etb) {
        return {
          success: false,
          error: `Coupon "${coupon.code}" requires a minimum order amount of ${coupon.min_order_amount_etb} ETB.`,
        };
      }

      if (coupon.usage_limit_total && coupon.current_redemptions_count >= coupon.usage_limit_total) {
        return { success: false, error: `Coupon "${coupon.code}" has reached its maximum redemptions.` };
      }

      if (coupon.discount_type === 'percentage') {
        let calc = Math.round((subtotal_etb * coupon.discount_value) / 100);
        if (coupon.max_discount_etb && calc > coupon.max_discount_etb) {
          calc = coupon.max_discount_etb;
        }
        discount_amount_etb = calc;
      } else if (coupon.discount_type === 'fixed_amount') {
        discount_amount_etb = Math.min(coupon.discount_value, subtotal_etb);
      }
      appliedCoupon = coupon;
    }
  }

  // 4. Calculate Fulfillment Fee & Save Snapshots
  let delivery_fee_etb = 0;
  let fulfillmentDetails: Order['fulfillment'];

  if (input.fulfillment_type === 'store_pickup') {
    const pickupLoc = db.pickupLocations.find((l) => l.id === input.pickup_location_id);
    if (!pickupLoc || !pickupLoc.is_active || !pickupLoc.accepts_new_orders) {
      return { success: false, error: 'Please select an active store pickup location.' };
    }
    delivery_fee_etb = pickupLoc.pickup_fee_etb;
    fulfillmentDetails = {
      id: `ful-${Date.now()}`,
      order_id: '',
      fulfillment_type: 'store_pickup',
      pickup_location_id: pickupLoc.id,
      pickup_location_name: pickupLoc.name,
      pickup_reference_code: generatePickupCode(),
    };
  } else {
    // Home delivery
    const zone = db.deliveryZones.find((z) => z.id === input.delivery_zone_id);
    if (!zone || !zone.is_active) {
      return { success: false, error: 'Please select a valid delivery zone.' };
    }

    if (zone.free_delivery_threshold_etb && subtotal_etb >= zone.free_delivery_threshold_etb) {
      delivery_fee_etb = 0;
    } else if (appliedCoupon?.discount_type === 'free_delivery') {
      delivery_fee_etb = 0;
    } else {
      delivery_fee_etb = zone.fee_etb;
    }

    fulfillmentDetails = {
      id: `ful-${Date.now()}`,
      order_id: '',
      fulfillment_type: 'home_delivery',
      delivery_zone_id: zone.id,
      delivery_zone_name: zone.name,
      delivery_address: input.delivery_address || '',
      delivery_sub_city: input.delivery_sub_city || '',
      delivery_instructions: input.delivery_instructions,
      estimated_delivery_time: zone.estimated_delivery_time,
    };
  }

  const total_amount_etb = Math.max(0, subtotal_etb - discount_amount_etb + delivery_fee_etb);
  const orderNumber = generateOrderNumber();
  const trackingToken = generateTrackingToken();
  const orderId = `ord-${Date.now()}`;

  // 5. Deduct Stock Atomically
  for (const item of processedItems) {
    item.variant.stock_quantity -= item.quantity;
    if (item.variant.stock_quantity <= 0) {
      item.variant.stock_quantity = 0;
      item.variant.is_available = false;
    }
  }

  // 6. Increment Coupon Usage
  if (appliedCoupon) {
    appliedCoupon.current_redemptions_count += 1;
  }

  // 7. Upsert Customer Record
  let customer = db.customers.find((c) => c.phone_normalized === phoneVal.normalized);
  if (!customer) {
    customer = {
      id: `cust-${Date.now()}`,
      full_name: input.customer_name,
      phone: phoneVal.localFormat,
      phone_normalized: phoneVal.normalized,
      email: input.customer_email,
      marketing_consent: !!input.marketing_consent,
      marketing_consent_at: input.marketing_consent ? new Date().toISOString() : undefined,
      total_orders: 1,
      total_spent_etb: total_amount_etb,
      competition_count: 0,
      first_seen_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    };
    db.customers.push(customer);
  } else {
    customer.total_orders += 1;
    customer.total_spent_etb += total_amount_etb;
    customer.last_activity_at = new Date().toISOString();
    if (input.marketing_consent && !customer.marketing_consent) {
      customer.marketing_consent = true;
      customer.marketing_consent_at = new Date().toISOString();
    }
  }

  // 8. Assemble Immutable Order
  if (fulfillmentDetails) {
    fulfillmentDetails.order_id = orderId;
  }

  const order: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_id: customer.id,
    customer_name: input.customer_name,
    customer_phone: phoneVal.localFormat,
    customer_phone_normalized: phoneVal.normalized,
    customer_email: input.customer_email,
    fulfillment_type: input.fulfillment_type,
    order_status: 'confirmed',
    payment_status: input.payment_method === 'cash_on_delivery' ? 'pending' : 'pending',
    payment_method: input.payment_method,
    subtotal_etb,
    discount_amount_etb,
    applied_coupon_code: appliedCoupon?.code,
    delivery_fee_etb,
    tax_amount_etb: 0,
    total_amount_etb,
    tracking_token: trackingToken,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fulfillment: fulfillmentDetails,
    items: processedItems.map((p, idx) => ({
      id: `item-${orderId}-${idx}`,
      order_id: orderId,
      product_id: p.product.id,
      variant_id: p.variant.id,
      product_name: p.product.name,
      sku: p.variant.sku,
      size: p.variant.size,
      color: p.variant.color,
      unit_price_etb: p.unitPrice,
      quantity: p.quantity,
      line_total_etb: p.lineTotal,
      product_image_url: p.product.images?.[0]?.image_url,
    })),
  };

  db.orders.unshift(order);
  saveStoreState(db);

  // 9. Queue Telegram Notification Job
  db.notificationJobs.push({
    id: `notif-${Date.now()}`,
    channel: 'telegram',
    event_type: 'new_order',
    payload: { order_number: order.order_number, total: order.total_amount_etb },
    attempts: 0,
    max_attempts: 5,
    status: 'pending',
    next_retry_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  return { success: true, order };
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  loadStoreState(db);
  const target = orderNumber.trim().toUpperCase();
  return db.orders.find((o) => o.order_number.toUpperCase() === target) || null;
}

export async function getOrderByTracking(orderNumber: string, phoneOrToken: string): Promise<Order | null> {
  loadStoreState(db);
  const norm = phoneOrToken.trim();
  const phoneVal = normalizeEthiopianPhone(norm);
  const target = orderNumber.trim().toUpperCase();
  const order = db.orders.find((o) => o.order_number.toUpperCase() === target);
  if (!order) return null;

  if (
    order.tracking_token === norm ||
    order.customer_phone === norm ||
    order.customer_phone_normalized === norm ||
    (phoneVal.isValid && (order.customer_phone_normalized === phoneVal.normalized || order.customer_phone === phoneVal.localFormat))
  ) {
    return order;
  }
  return null;
}

export async function getAllOrders(): Promise<Order[]> {
  loadStoreState(db);
  return [...db.orders];
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['order_status'],
  paymentStatus?: Order['payment_status']
): Promise<Order | null> {
  loadStoreState(db);
  const o = db.orders.find((ord) => ord.id === orderId);
  if (!o) return null;
  o.order_status = status;
  if (paymentStatus) o.payment_status = paymentStatus;
  o.updated_at = new Date().toISOString();
  saveStoreState(db);
  return o;
}

export async function overrideOrderDeliveryFee(
  orderId: string,
  newFeeETB: number,
  reason: string,
  staffName: string
): Promise<Order | null> {
  loadStoreState(db);
  const o = db.orders.find((ord) => ord.id === orderId);
  if (!o) return null;
  const originalFee = o.delivery_fee_etb;
  o.delivery_fee_etb = newFeeETB;
  o.total_amount_etb = Math.max(0, o.subtotal_etb - o.discount_amount_etb + newFeeETB);
  o.updated_at = new Date().toISOString();
  saveStoreState(db);

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    staff_name: staffName,
    action: 'fee_override',
    resource_type: 'order',
    resource_id: orderId,
    details: { originalFee, newFeeETB, reason },
    created_at: new Date().toISOString(),
  });

  return o;
}

export async function getAllCustomers(): Promise<Customer[]> {
  return [...db.customers];
}

export async function getCompetitions(): Promise<Competition[]> {
  return [...db.competitions];
}

export async function getCompetitionBySlug(slug: string): Promise<Competition | null> {
  return db.competitions.find((c) => c.slug === slug) || null;
}

export async function submitCompetitionBid(input: {
  competition_id: string;
  participant_name: string;
  participant_phone: string;
  bid_amount_etb: number;
  payment_method?: string;
  payment_reference?: string;
}): Promise<{ success: boolean; error?: string }> {
  const comp = db.competitions.find((c) => c.id === input.competition_id);
  if (!comp) return { success: false, error: 'Competition not found.' };

  if (comp.status !== 'active') {
    return { success: false, error: 'This competition is not actively accepting bids.' };
  }

  const now = new Date().getTime();
  if (now > new Date(comp.ends_at).getTime()) {
    return { success: false, error: 'This competition has ended.' };
  }

  const settings = db.storeSettings;
  const isPaidRequired = settings.bidding_preferences?.require_payment_to_bid || comp.entry_fee_etb > 0;
  const requiredFee = comp.entry_fee_etb > 0 ? comp.entry_fee_etb : (settings.bidding_preferences?.default_entry_fee_etb || 100);

  if (isPaidRequired) {
    if (!input.payment_method) {
      return {
        success: false,
        error: `An entry fee of ${requiredFee} ETB is required to place a bid. Please select your payment method.`,
      };
    }
    if (!input.payment_reference || input.payment_reference.trim().length < 4) {
      return {
        success: false,
        error: 'Please enter a valid payment transaction reference / receipt code.',
      };
    }
  }

  if (input.bid_amount_etb < comp.min_bid_etb || input.bid_amount_etb > comp.max_bid_etb) {
    return {
      success: false,
      error: `Bid amount must be between ${comp.min_bid_etb} ETB and ${comp.max_bid_etb} ETB.`,
    };
  }

  const phoneVal = normalizeEthiopianPhone(input.participant_phone);
  if (!phoneVal.isValid) {
    return { success: false, error: phoneVal.error };
  }

  // Find or create entry
  let entry = db.competitionEntries.find(
    (e) => e.competition_id === comp.id && e.participant_phone_normalized === phoneVal.normalized
  );

  if (!entry) {
    entry = {
      id: `entry-${Date.now()}`,
      competition_id: comp.id,
      participant_name: input.participant_name,
      participant_phone: phoneVal.localFormat,
      participant_phone_normalized: phoneVal.normalized,
      entry_fee_etb: isPaidRequired ? requiredFee : 0,
      payment_status: 'paid',
      is_eligible: true,
      entered_at: new Date().toISOString(),
    };
    db.competitionEntries.push(entry);
  }

  // Check bid count per entry
  const userBids = db.competitionBids.filter((b) => b.entry_id === entry!.id);
  if (userBids.length >= comp.max_bids_per_entry) {
    return {
      success: false,
      error: `You have reached the maximum allowed limit of ${comp.max_bids_per_entry} bids for this competition.`,
    };
  }

  const masked = `${phoneVal.localFormat.slice(0, 4)} **** ${phoneVal.localFormat.slice(-2)}`;

  db.competitionBids.push({
    id: `bid-${Date.now()}`,
    competition_id: comp.id,
    entry_id: entry.id,
    bid_amount_etb: input.bid_amount_etb,
    submitted_at: new Date().toISOString(),
    is_valid: true,
    participant_name: input.participant_name,
    participant_phone_masked: masked,
  });

  return { success: true };
}

export async function getCompetitionBids(competitionId: string): Promise<CompetitionBid[]> {
  return db.competitionBids.filter((b) => b.competition_id === competitionId);
}

export async function getCompetitionResults(competitionId?: string): Promise<CompetitionResult[]> {
  if (competitionId) {
    return db.competitionResults.filter((r) => r.competition_id === competitionId);
  }
  return db.competitionResults.filter((r) => r.is_published);
}

export async function saveCompetitionResult(result: CompetitionResult): Promise<void> {
  const idx = db.competitionResults.findIndex((r) => r.competition_id === result.competition_id);
  if (idx !== -1) {
    db.competitionResults[idx] = result;
  } else {
    db.competitionResults.push(result);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return [...db.auditLogs];
}
