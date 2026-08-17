import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createItem,
  readFiles,
  readItems,
  updateItem,
  uploadFiles
} from '@directus/sdk';
import { createDirectusClient, loginAdmin } from '../lib/config.mjs';
import { createEnsureHelpers } from '../lib/ensure-helpers.mjs';
import { COLLECTION_DEFS } from '../schema/collections.mjs';
import { ensurePermissions } from '../rbac/permissions.mjs';

const scriptDirectory = fileURLToPath(new URL('.', import.meta.url));
const frontendPublic = join(scriptDirectory, '../../frontend/public');

const media = {
  hero: ['/images/brand/ulink-event-hero-figma.webp', 'ULink B2B event auditorium'],
  networking: ['/images/brand/ulink-event-networking-figma.webp', 'B2B Business Networking'],
  supplyChain: ['/images/brand/ulink-event-supply-chain-figma.webp', 'Supply chain optimization seminar'],
  iso: ['/images/brand/ulink-event-iso-figma.webp', 'ISO 9001 manufacturing seminar'],
  techSummit: ['/images/brand/ulink-tech-summit-figma.webp', 'ULink Tech Summit 2026'],
  speakerTri: ['/images/brand/ulink-speaker-nguyen-minh-tri-figma.webp', 'Nguyễn Minh Trí'],
  speakerHang: ['/images/brand/ulink-speaker-le-thanh-hang-figma.webp', 'Lê Thanh Hằng'],
  speakerDavid: ['/images/brand/ulink-speaker-david-chen-figma.webp', 'David Chen'],
  hostBao: ['/images/brand/ulink-host-tran-quoc-bao-figma.webp', 'Trần Quốc Bảo'],
  hostMai: ['/images/brand/ulink-host-pham-thi-mai-anh-figma.webp', 'Phạm Thị Mai Anh'],
  hostAlex: ['/images/brand/ulink-host-alex-nguyen-figma.webp', 'Alex Nguyen'],
  qr: ['/images/brand/ulink-event-payment-qr-figma.png', 'ULink event payment QR'],
  newsProperty: ['/images/brand/ulink-industry-furniture-royal-v1.webp', 'Industrial property market'],
  newsFinance: ['/images/brand/ulink-secure-portal-ops-v1.webp', 'Vietnam financial market'],
  newsLogistics: ['/images/brand/ulink-industry-logistics-royal-v1.webp', 'Logistics market'],
  newsTechnology: ['/images/brand/ulink-industry-electronics-royal-v1.webp', 'Vietnam technology investment']
};

const client = createDirectusClient();
const helpers = createEnsureHelpers(client);

function mimeType(path) {
  const extension = extname(path).toLowerCase();
  if (extension === '.svg') return 'image/svg+xml';
  if (extension === '.png') return 'image/png';
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  return 'image/webp';
}

async function ensureFile(key, publicPath, title) {
  const filename = `ulink-figma-event-${key}${extname(publicPath).toLowerCase()}`;
  const existing = await client.request(
    readFiles({ filter: { filename_download: { _eq: filename } }, fields: ['id'], limit: 1 })
  );
  if (existing.length) return existing[0].id;

  const bytes = await readFile(join(frontendPublic, publicPath.replace(/^\//, '')));
  const form = new FormData();
  form.append('title', title);
  form.append('description', `ULink Industries · Figma Event · ${title}`);
  form.append('file', new Blob([bytes], { type: mimeType(publicPath) }), filename);
  const uploaded = await client.request(uploadFiles(form));
  return uploaded.id;
}

async function buildContent(files) {
  return {
    version: 1,
    hero: {
      title: 'Chương trình sự kiện B2B\nBusiness Networking',
      description:
        'ULink Industries kết nối doanh nghiệp Việt Nam với mạng lưới đối tác quốc tế thông qua các sự kiện networking chuyên sâu, hội thảo ngành và cơ hội giao thương trực tiếp — giúp mở rộng thị trường và thúc đẩy hợp tác B2B bền vững.',
      ctaLabel: 'Đăng ký tham dự',
      ctaHref: '/events/ulink-tech-summit-2026/register',
      image: files.hero
    },
    eventList: {
      eyebrow: 'Sự kiện',
      registerLabel: 'Đăng ký ngay',
      items: [
        {
          slug: 'b2b-business-network',
          title: 'B2B Business Network - Kết nối Doanh nghiệp, mở rộng cơ hội',
          date: '25.08.2026',
          time: '18:00 - 21:30',
          location: 'GOM Bistro, 2C Trần Thánh Tông, Hai Bà Trưng, Hà Nội',
          image: files.networking,
          registrationHref: '/events/ulink-tech-summit-2026/register'
        },
        {
          slug: 'supply-chain-optimization',
          title: 'Tối ưu chuỗi cung ứng cho Doanh nghiệp sản xuất',
          date: '12.8.2026',
          time: '9h00 - 11h30',
          location: 'Melia Hà Nội - Số 44B Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
          image: files.supplyChain,
          registrationHref: '/events/ulink-tech-summit-2026/register'
        },
        {
          slug: 'iso-9001-manufacturing',
          title: 'Phương pháp triển khai Hệ thống Quản lý Chất lượng ISO 9001:2015 trong Sản xuất',
          date: '15 Tháng 9, 2025',
          time: '08:30 - 16:30',
          location: 'Trung tâm Hội nghị Quốc gia, Hà Nội',
          image: files.iso,
          registrationHref: '/events/ulink-tech-summit-2026/register'
        }
      ],
      pagination: { current: 1, total: 4 }
    },
    marketNews: {
      eyebrow: 'Tin tức thị trường',
      title: 'Cập nhật xu hướng và diễn biến mới nhất',
      actionLabel: 'Xem tất cả',
      actionHref: '/resources',
      items: [
        {
          category: 'Bất động sản',
          title: 'Thị trường cần lộ trình phục hồi mạnh mẽ trong quý III',
          image: files.newsProperty,
          href: '/resources'
        },
        {
          category: 'Chứng khoán',
          title: 'VN-Index hồi phục lên mốc 1.400 điểm',
          image: files.newsFinance,
          href: '/resources'
        },
        {
          category: 'Hoạt động',
          title: 'Đơn hàng tăng trưởng, doanh nghiệp chủ động nguồn cung',
          image: files.newsLogistics,
          href: '/resources'
        },
        {
          category: 'Công nghệ',
          title: 'Làn sóng đầu tư AI tại Việt Nam tăng vọt',
          image: files.newsTechnology,
          href: '/resources'
        }
      ]
    },
    detail: {
      breadcrumb: ['Trang chủ', 'Sự kiện', 'ULink Tech Summit 2026: Decentralized Future'],
      slug: 'ulink-tech-summit-2026',
      title: 'ULink Tech Summit 2026: Decentralized Future',
      organizerShort: 'ULink Technology JSC',
      image: files.techSummit,
      dateDay: '16',
      dateYear: '2026',
      startTime: '08:30 AM',
      startTimeLabel: 'Start time',
      endTime: '17:30 PM',
      endTimeLabel: 'End time',
      status: 'UPCOMING',
      statusLabel: 'Event status',
      ticketPrice: '300,000đ/người',
      registerLabel: 'Đăng ký ngay',
      registerHref: '/events/ulink-tech-summit-2026/register',
      sponsors: ['SHELLS', 'SmartFinder', 'kontrastr', 'WAVESMARATHON'],
      overviewLabel: 'Overview',
      overview:
        'ULink Tech Summit 2026 là sự kiện thường niên quy mô lớn, quy tụ các chuyên gia hàng đầu trong lĩnh vực Blockchain, Web3 và Trí tuệ Nhân tạo. Sự kiện năm nay tập trung vào chủ đề “Decentralized Future – Xây dựng nền kinh tế phi tập trung”, nơi các diễn giả và chuyên gia sẽ chia sẻ kinh nghiệm thực chiến về DeFi, NFT, DAO và các ứng dụng AI trong hệ sinh thái Web3. Tham gia sự kiện, bạn sẽ được kết nối với cộng đồng hơn 500 nhà phát triển, nhà đầu tư và chuyên gia công nghệ hàng đầu Đông Nam Á. Đây là cơ hội để cập nhật xu hướng mới nhất, tìm kiếm đối tác và khám phá cơ hội đầu tư tiềm năng trong ngành.',
      timeLabel: 'Thời gian tổ chức',
      dateLine: 'Ngày: Thứ hai, 15 tháng 11, 2026',
      timeLine: 'Thời gian: 08:30 - 17:30 (GMT+7)',
      locationLabel: 'Địa điểm tổ chức',
      locationName: 'Trung tâm Hội nghị GEM Center',
      address: 'Địa chỉ: 8 Nguyễn Bỉnh Khiêm, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh',
      speakersLabel: 'Speakers',
      speakers: [
        {
          name: 'Nguyễn Minh Trí',
          role: 'CEO & Co-founder, ChainVerse',
          bio: 'Chuyên gia về nền tảng blockchain Layer 2 với hơn 8 năm kinh nghiệm phát triển hệ sinh thái DeFi.',
          photo: files.speakerTri
        },
        {
          name: 'Lê Thanh Hằng',
          role: 'Head of Product, MetaLab Asia',
          bio: 'Người tiên phong trong việc ứng dụng NFT và quyền sở hữu số vào game và các tài sản VR/AR.',
          photo: files.speakerHang
        },
        {
          name: 'David Chen',
          role: 'CTO, OpenNode Global',
          bio: 'Kỹ sư cao cấp với hơn 10 năm dẫn dắt các dự án kỹ thuật và bảo mật blockchain tại Singapore.',
          photo: files.speakerDavid
        }
      ],
      hostsLabel: 'Host',
      hosts: [
        {
          name: 'Trần Quốc Bảo',
          role: 'Community Lead, ULink Vietnam',
          bio: 'Người kết nối cộng đồng Web3 Việt Nam với hơn 50 sự kiện đào tạo và workshop trong 3 năm qua.',
          photo: files.hostBao
        },
        {
          name: 'Phạm Thị Mai Anh',
          role: 'Marketing Director, Blockchain SG',
          bio: 'MC công nghệ nổi tiếng, từng dẫn dắt các sự kiện blockchain quy mô lớn tại Singapore và Jakarta.',
          photo: files.hostMai
        },
        {
          name: 'Alex Nguyen',
          role: 'Developer Advocate, Web3APAC',
          bio: 'Nhà truyền cảm hứng cho thế hệ developer trẻ với phong cách diễn đạt sâu sắc và năng động.',
          photo: files.hostAlex
        }
      ],
      organizerLabel: 'Organizer',
      organizer: {
        name: 'ULink Industries JSC',
        role: 'Đơn vị tổ chức chính',
        description:
          'Công ty công nghệ tiên phong trong lĩnh vực blockchain và giải pháp phi tập trung tại Việt Nam. Sứ mệnh kết nối cộng đồng Web3 Đông Nam Á.'
      }
    },
    registration: {
      breadcrumb: ['Trang chủ', 'Sự kiện', 'ULink Tech Summit 2026', 'Đăng ký'],
      title: 'Đăng ký tham gia sự kiện',
      subtitle: 'ULink Tech Summit 2026: Decentralized Future',
      paymentTitle: 'Thông tin vé & Thanh toán',
      paymentDescription:
        'Vui lòng kiểm tra thông tin vé và thực hiện chuyển khoản theo hướng dẫn bên dưới.',
      ticket: {
        eventLabel: 'Sự kiện',
        event: 'ULink Industries Summit 2026',
        dateLabel: 'Ngày',
        date: '15/09/2026 — 08:00 - 17:00',
        locationLabel: 'Địa điểm',
        location: 'Trung tâm Hội nghị Quốc gia, Hà Nội',
        typeLabel: 'Loại vé',
        type: 'Standard — Miễn phí'
      },
      bankTitle: 'Thông tin chuyển khoản',
      bank: {
        bankLabel: 'Ngân hàng',
        bank: 'Vietcombank (VCB)',
        accountLabel: 'Số tài khoản',
        account: '1234 5678 9012',
        ownerLabel: 'Chủ tài khoản',
        owner: 'CÔNG TY TNHH ULINK INDUSTRIES',
        branchLabel: 'Chi nhánh',
        branch: 'Hà Nội',
        transferLabel: 'Nội dung CK',
        transfer: 'ULINK2026 - [Họ tên]'
      },
      qr: files.qr,
      qrLabel: 'Quét mã QR để thanh toán nhanh',
      qrInstruction: 'Nội dung: ULINK2026 - [Họ tên]',
      formTitle: 'Thông tin đăng ký cá nhân',
      formDescription: 'Vui lòng điền chính xác thông tin để nhận email xác nhận và vé điện tử.',
      fields: {
        fullName: 'Họ và tên *',
        email: 'Email *',
        phone: 'Số điện thoại *',
        company: 'Công ty / Tổ chức *',
        jobTitle: 'Chức vụ',
        source: 'Bạn biết đến sự kiện qua đâu?',
        note: 'Ghi chú thêm'
      },
      sourceOptions: ['Facebook / LinkedIn', 'Email từ ULink', 'Đối tác giới thiệu', 'Công cụ tìm kiếm', 'Khác'],
      consent:
        'Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của ULink Industries.',
      submitLabel: 'Xác nhận đăng ký',
      formMessages: {
        consentRequired: 'Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.',
        submitError: 'Không thể gửi đăng ký. Vui lòng thử lại.',
        errorTitle: 'Đăng ký chưa được gửi',
        sourcePlaceholder: 'Chọn một phương án',
        submittingLabel: 'Đang gửi đăng ký...'
      }
    },
    statuses: {
      pending: {
        title: 'Đang chờ xác nhận thanh toán',
        description:
          'Chúng tôi đã nhận được đăng ký của bạn. Vui lòng chuyển khoản theo thông tin bên dưới để hoàn tất giao dịch.',
        panelTitle: 'Thông tin chuyển khoản',
        notice:
          'Thanh toán sẽ được xác nhận tự động trong vòng 24 giờ làm việc. Email xác nhận và vé điện tử sẽ được gửi ngay sau đó.',
        qrTitle: 'Quét mã QR để thanh toán nhanh',
        referenceLabel: 'Mã đăng ký',
        supportLabel: 'Liên hệ hỗ trợ'
      },
      success: {
        title: 'Đăng ký thành công!',
        description:
          'Cảm ơn bạn đã đăng ký tham dự ULink Industries Summit 2026. Thông tin xác nhận đã được gửi đến email của bạn.',
        panelTitle: 'Thông tin vé',
        paymentBadge: 'Đã thanh toán',
        timeLabel: 'Thời gian',
        referenceLabel: 'Mã đăng ký',
        homeLabel: 'Về trang chủ'
      },
      failed: {
        title: 'Thanh toán không thành công',
        description:
          'Giao dịch thanh toán của bạn chưa được xử lý thành công. Vui lòng thử lại hoặc lựa chọn phương thức thanh toán khác.',
        panelTitle: 'Chi tiết lỗi giao dịch',
        errorCodeLabel: 'Mã lỗi',
        errorCode: 'ERR-PAY-4092',
        timeLabel: 'Thời gian',
        time: '15/09/2026 — 09:32',
        reasonLabel: 'Lý do từ chối',
        reason:
          'Giao dịch bị từ chối bởi ngân hàng phát hành thẻ. Vui lòng kiểm tra lại số dư hoặc hạn mức thẻ.',
        retryLabel: 'Chọn phương thức khác',
        supportLabel: 'Liên hệ hỗ trợ kỹ thuật'
      }
    }
  };
}

async function main() {
  await loginAdmin(client);

  const registrationsDefinition = COLLECTION_DEFS.find(
    (definition) => definition.collection === 'event_registrations'
  );
  await helpers.ensureCollection(registrationsDefinition);
  await ensurePermissions(helpers, await helpers.getPublicPolicyId());

  const files = {};
  for (const [key, [path, title]] of Object.entries(media)) {
    files[key] = await ensureFile(key, path, title);
  }

  const content = await buildContent(files);
  const existing = await client.request(
    readItems('pages', { filter: { slug: { _eq: 'events' } }, fields: ['id'], limit: 1 })
  );
  const payload = {
    status: 'published',
    title: 'Sự kiện',
    slug: 'events',
    body: null,
    content,
    meta_title: 'Sự kiện B2B & ULink Tech Summit',
    meta_description:
      'Các chương trình B2B Business Networking, hội thảo chuỗi cung ứng và sự kiện công nghệ của ULink Industries.'
  };

  if (existing.length) {
    await client.request(updateItem('pages', existing[0].id, payload));
    console.log(`Updated events page ${existing[0].id}`);
  } else {
    const created = await client.request(createItem('pages', payload));
    console.log(`Created events page ${created.id}`);
  }

  console.log(`Figma events content applied with ${Object.keys(files).length} unique CMS assets.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
