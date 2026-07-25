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
    /** Section 1: Hero & Feature Bar */
    hero: '/images/home/section1/HomeBanner.png',
    iconNation: '/images/home/section1/nation.png',
    iconAdapter: '/images/home/section1/adapter.png',
    iconFile: '/images/home/section1/file.png',
    iconSecurity: '/images/home/section1/security.png',
    iconSend: '/images/home/section1/send.png',
    /** Section 2: Product Categories & Solutions */
    solutionCleanroom: '/images/home/section2/solution-cleanroom.png',
    solutionPackaging: '/images/home/section2/solution-packaging.png',
    productCutGloves: '/images/home/section2/product-cut-gloves.png',
    productHvacTape: '/images/home/section2/product-hvac-tape.png',
    productCustomPkg: '/images/home/section2/product-custom-pkg.png',
    /** Section 3: Industry Solutions */
    indElectronics: '/images/home/section3/chip.png',
    indFood: '/images/home/section3/Icon_Thực phẩm.png',
    indLogistics: '/images/home/section3/iocn_logistics 2 [Vectorized].png',
    indPharma: '/images/home/section3/iocn_Pharmacity 1 [Vectorized].png',
    indFurniture: '/images/home/section3/funiture.png',
    indConstruction: '/images/home/section3/iocn_Xây dựng 1 [Vectorized].png',
    /** Section 4: Về chúng tôi (About Us) */
    companyFactory: '/images/home/section4/companyu.png',
    iconSlack: '/images/home/section4/slack.png',
    iconShield: '/images/home/section4/shield.png',
    iconTag: '/images/home/section4/tag.png',
    iconTruck: '/images/home/section4/truck.png',
    /** Placeholder */
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
