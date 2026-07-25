/**
 * Đường dẫn tài nguyên TĨNH tập trung một nơi (tránh rải chuỗi path khắp code).
 * Xem quy ước tại public/images/README.md. Ảnh nội dung (sản phẩm, hub…) đến từ Directus.
 */
export const ASSETS = {
  logo: {
    full: '/images/logo/ulink_logo.png',
    mark: '/images/logo/ulink-mark.svg',
    white: '/images/logo/ulink_logo.png',
    main: '/images/home/logo.png'
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
    /** Section 5: Đối tác tiêu biểu & Chứng nhận ISO */
    partnerSamsung: '/images/home/section5/Samsung-Logo-Blue.png',
    partnerCanon: '/images/home/section5/logo canon.png',
    partnerPanasonic: '/images/home/section5/panasonic-logo-.png',
    partnerIbm: '/images/home/section5/logo-ibm-vector-06.png',
    partnerTraphaco: '/images/home/section5/9383_Traphaco.png',
    partnerCocaCola: '/images/home/section5/coca-cola-logo.png',
    partnerVinfast: '/images/home/section5/logo-vinfast-vector-thumbnail.png',
    partnerLg: '/images/home/section5/logo-lg-vector-inkythuatso-01-30-13-53-58.png',
    partnerAmkor: '/images/home/section5/Amkor.png',
    partnerVinamilk: '/images/home/section5/logo-vinamilk-vector-01.png',
    partner3m: '/images/home/section5/3m-logo-png_seeklogo-806.png',
    partnerByd: '/images/home/section5/BYD.png',
    /** Chứng nhận ISO & Tiêu chuẩn */
    certIso9001: '/images/home/section5/mc-iso-9001-2015.png',
    certSgs: '/images/home/section5/sgs.png',
    certRohs: '/images/home/section5/RoHS-Logo.png',
    certMsds: '/images/home/section5/mdsss.png',
    /** Placeholder */
    factory: '/images/banners/login-hero.png'
  },
  /** Footer assets */
  footer: {
    boCongThuong: '/images/home/section6/Logo - Đã Thông Báo.png',
    qrCode: '/images/footer/qr-code.svg',
    facebook: '/images/home/section6/fb.png',
    linkedin: '/images/home/section6/linked.png',
    tiktok: '/images/home/section6/tik.png',
    youtube: '/images/home/section6/youtube.png'
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
