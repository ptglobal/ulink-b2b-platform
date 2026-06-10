/**
 * Đường dẫn tài nguyên TĨNH tập trung một nơi (tránh rải chuỗi path khắp code).
 * Xem quy ước tại public/images/README.md. Ảnh nội dung (sản phẩm, hub…) đến từ Directus.
 */
export const ASSETS = {
  logo: {
    full: '/images/logo/ulink_logo.png',
    mark: '/images/logo/ulink-mark.svg',
    white: '/images/logo/ulink_logo.png',
    main: '/images/logo/ulink_logo.png'
  },
  banners: {
    /** Ảnh nền trang đăng nhập — KHÔNG kèm chữ. */
    loginHero: '/images/banners/login-hero.png'
  },
  /** Ảnh trang chủ — chỉ giữ lại những ảnh đang được sử dụng. */
  home: {
    hero: '/images/home/hero-gloves.png',
    productGlovesBox: '/images/home/product-gloves-box.png',
    productTapeRolls: '/images/home/product-tape-rolls.png',
    productWiper2: '/images/home/product-wiper-2.png',
    productPackaging: '/images/home/product-packaging.png',
    news1: '/images/home/news-1.png',
    news2: '/images/home/news-2.png',
    news3: '/images/home/news-3.png',
    /** Ảnh nhà máy dưới khối About — placeholder, thay bằng ảnh thật sau. */
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
