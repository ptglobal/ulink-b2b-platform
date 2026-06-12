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
    /** Ảnh sản phẩm chất lượng cao */
    productGloves: '/images/home/product-gloves.jpg',
    productWipes: '/images/home/product-wipes.jpg',
    productTape: '/images/home/product-tape.jpg',
    productPkg: '/images/home/product-packaging.jpg',
    news1: '/images/home/news-1.png',
    news2: '/images/home/news-2.png',
    news3: '/images/home/news-3.png',
    /** Ảnh giải pháp */
    solutionCleanroom: '/images/home/solution-cleanroom.jpg',
    solutionPackaging: '/images/home/solution-packaging.jpg',
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
  /** Illustrations */
  illustrations: {
    vietnamMap: '/images/illustrations/vietnam-map.svg'
  },
  /** Ảnh trang Về chúng tôi — Trung tâm phân phối Hà Nam */
  about: {
    heroWarehouse: '/images/about/hero-warehouse.png',
    locationAerial: '/images/about/location-aerial.png',
    opWarehouse: '/images/about/op-warehouse.png',
    opWms: '/images/about/op-wms.png',
    opTruck: '/images/about/op-truck.png',
    opTeam: '/images/about/op-team.png',
    iso9001: '/images/about/iso-9001.png',
    iso14001: '/images/about/iso-14001.png',
    iso45001: '/images/about/iso-45001.png',
    isoEsd: '/images/about/iso-esd.png',
    iso13485: '/images/about/iso-13485.png',
    qualityHeroBg: '/images/about/quality-hero-bg.png',
    qualityLab: '/images/about/quality-lab.png'
  },
  og: {
    default: '/og/og-default.png'
  }
} as const;
