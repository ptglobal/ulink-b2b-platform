/**
 * Đường dẫn tài nguyên TĨNH tập trung một nơi (tránh rải chuỗi path khắp code).
 * Xem quy ước tại public/images/README.md. Ảnh nội dung (sản phẩm, hub…) đến từ Directus.
 */
export const ASSETS = {
  logo: {
    full: '/images/logo/ulink-logo.svg',
    mark: '/images/logo/ulink-mark.svg',
    white: '/images/logo/ulink-logo-white.svg',
    main: '/images/logo/ulink-main-logo.png'
  },
  banners: {
    /** Ảnh nền trang đăng nhập — KHÔNG kèm chữ. */
    loginHero: '/images/banners/login-hero.png'
  },
  /** Ảnh trang chủ tải từ Figma (UI tĩnh — sau sẽ thay bằng nội dung Directus). */
  home: {
    hero: '/images/home/hero-gloves.png',
    heroBg: '/images/home/hero-bg.png',
    productGloves: '/images/home/product-gloves.png',
    productGlovesBox: '/images/home/product-gloves-box.png',
    productTape: '/images/home/product-tape.png',
    productTapeRolls: '/images/home/product-tape-rolls.png',
    productWiper1: '/images/home/product-wiper-1.png',
    productWiper2: '/images/home/product-wiper-2.png',
    productPackaging: '/images/home/product-packaging.png',
    productPackagingBox: '/images/home/product-packaging-box.png',
    news1: '/images/home/news-1.png',
    news2: '/images/home/news-2.png',
    news3: '/images/home/news-3.png',
    /** Trust bar icons */
    trustGlobe: '/images/home/trust-globe.png',
    trustSample: '/images/home/trust-sample.png',
    trustDelivery: '/images/home/trust-delivery.png',
    trustIso: '/images/home/trust-iso.png',
    /** Ảnh nhà máy dưới khối "Đối tác tiêu biểu" — placeholder, thay bằng ảnh thật sau. */
    factory: '/images/banners/login-hero.png'
  },
  /** Logo đối tác (SVG) */
  partners: {
    samsung: '/images/partners/samsung.svg',
    lg: '/images/partners/lg.svg',
    canon: '/images/partners/canon.svg',
    mider: '/images/partners/mider.svg',
    fujifilm: '/images/partners/fujifilm.svg',
    mkor: '/images/partners/mkor.svg'
  },
  og: {
    default: '/og/og-default.png'
  }
} as const;
