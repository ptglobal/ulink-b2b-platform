'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  Award,
  BookOpen,
  Newspaper,
  Download,
  Calendar,
  Clock,
  X,
  ChevronRight,
  FileSpreadsheet,
  Share2,
  ExternalLink,
  HelpCircle,
  CornerDownRight,
  Printer,
  Cpu,
  Activity,
  Utensils,
  Car,
  Sun,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';

// Resource Item Type definition
interface ResourceItem {
  id: string;
  category: 'tech-docs' | 'iso-certs' | 'case-studies' | 'blog-news' | 'download-center';
  title: string;
  description: string;
  date: string;
  size?: string;
  type?: string; // e.g. PDF, XLSX, ZIP
  issuer?: string; // for ISO certs
  expiry?: string; // for ISO certs
  author?: string; // for Case studies & blogs
  readTime?: string; // for Case studies & blogs
  tag?: string; // for blogs & news
  fullContent?: string; // full content for the modal detail view
}

// Full Vietnamese mock data for a high-fidelity experience
const MOCK_RESOURCES: ResourceItem[] = [
  // Technical Docs
  {
    id: 'TDS-001',
    category: 'tech-docs',
    title: 'Bảng thông số kỹ thuật Khăn lau phòng sạch ULink Cleanwipe 80 series (TDS)',
    description: 'Tài liệu chi tiết về đặc tính thấm hút, lượng hạt bụi phát tán, khả năng kháng hóa chất và quy trình kiểm soát hạt của khăn lau phòng sạch Polyester 100% dòng ULink Cleanwipe.',
    date: '12/03/2026',
    size: '1.2 MB',
    type: 'PDF',
    author: 'Phòng R&D ULink',
    fullContent: `### Giới thiệu sản phẩm
Khăn lau phòng sạch ULink Cleanwipe 80 series được thiết kế chuyên biệt cho việc kiểm soát ô nhiễm hạt và chất lỏng ở mức độ cực nhỏ trong các môi trường phòng sạch Class 10 - 100 (ISO 4 - 5). Với thành phần 100% sợi liên tục Polyester mật độ cao, sản phẩm mang đến hiệu năng lau chùi vượt trội mà không để lại xơ hay trầy xước bề mặt.

### Thông số kỹ thuật chi tiết
1. **Trọng lượng cơ bản:** 115g/m² ± 5%
2. **Độ dày:** 0.43 mm
3. **Cạnh khăn:** Được cắt bằng tia laser siêu âm giúp hạn chế tối đa việc tước sợi và phát sinh hạt ở viền.
4. **Khả năng hấp thụ (Absorbency):**
   - Tốc độ hấp thụ: < 0.5 giây
   - Dung tích hấp thụ: 320 mL/m²
5. **Hàm lượng hạt phát sinh (Liquid Particle Count - LPC):**
   - Hạt kích thước ≥ 0.5 µm: < 10 x 10⁶ hạt/m²
6. **Hàm lượng ion không bay hơi (NVR):**
   - Trong nước khử ion (DI Water): < 0.03 mg/g
   - Trong cồn Isopropyl (IPA): < 0.08 mg/g

### Tiêu chuẩn đóng gói
- Kích thước tiêu chuẩn: 9" x 9" (22.8cm x 22.8cm)
- Quy cách đóng gói: 150 miếng/gói, 10 gói/thùng (Double-bagged để bảo vệ trong phòng sạch).

### Hướng dẫn ứng dụng
- Thích hợp cho việc lau chùi thiết bị bán dẫn, vệ sinh bề mặt bàn thao tác quang học, bảng điều khiển LCD/LED.
- Tương thích tốt với dung dịch cồn IPA 70% và các chất tẩy rửa chuyên dụng trong y tế/bán dẫn.`
  },
  {
    id: 'UG-002',
    category: 'tech-docs',
    title: 'Hướng dẫn sử dụng & Kiểm soát tĩnh điện cho Trang phục Phòng sạch ESD',
    description: 'Hướng dẫn chi tiết cách mặc, giặt là, bảo quản và định kỳ kiểm tra điện trở bề mặt đối với quần áo liền mũ chống tĩnh điện ULink ESD Coverall.',
    date: '20/01/2026',
    size: '2.5 MB',
    type: 'PDF',
    author: 'Ban kỹ thuật ESD ULink',
    fullContent: `### Nguyên lý chống tĩnh điện
Trang phục phòng sạch ESD của ULink sử dụng sợi carbon dẫn điện dệt xen kẽ với sợi polyester chất lượng cao theo dạng lưới ô vuông (stripe/grid). Điều này giúp tiêu tán nhanh điện tích sinh ra do ma sát từ cơ thể người dùng và quần áo thông thường bên trong, ngăn ngừa hiện tượng phóng tĩnh điện (ESD) gây hỏng linh kiện nhạy cảm.

### Quy trình mặc trang phục chuẩn (Gowning Protocol)
Để đảm bảo tĩnh điện và hạt bụi được kiểm soát 100%, quy trình mặc cần thực hiện nghiêm ngặt từ trên xuống dưới tại phòng trung chuyển (Gowning Room):
1. **Bước 1:** Đội mũ trùm đầu (Hood) phòng sạch, nhét toàn bộ tóc vào bên trong mũ.
2. **Bước 2:** Đeo khẩu trang phòng sạch và kiểm tra độ khít.
3. **Bước 3:** Mặc bộ quần áo liền quần (Coverall). Chú ý không để phần gấu quần hoặc tay áo chạm đất trong quá trình mặc.
4. **Bước 4:** Xỏ ủng phòng sạch ESD (Booties) và kéo khóa cố định bên ngoài ống quần Coverall.
5. **Bước 5:** Đeo vòng đeo tay chống tĩnh điện (Wrist strap) và kết nối dây tiếp đất (nếu có yêu cầu tại vị trí thao tác).
6. **Bước 6:** Đeo găng tay phòng sạch ESD ngoài cùng, trùm qua cổ tay áo.

### Hướng dẫn giặt là & Bảo dưỡng
- **Nhiệt độ nước:** Giặt ở nhiệt độ ấm từ 30°C đến 40°C với nước khử ion (DI water).
- **Hóa chất:** Không sử dụng chất tẩy mạnh chứa clo hoặc chất làm mềm vải (vì sẽ làm hỏng hoặc phủ lên các sợi carbon dẫn điện).
- **Sấy khô:** Sấy ở nhiệt độ thấp (< 60°C).
- **Chu kỳ kiểm tra:** Đo điện trở bề mặt (Surface Resistivity) sau mỗi 50 lần giặt. Tiêu chuẩn đạt yêu cầu là từ 10⁵ đến 10⁹ Ohms.`
  },
  {
    id: 'TDS-003',
    category: 'tech-docs',
    title: 'Bản vẽ kỹ thuật và quy cách đóng gói Màng co LDPE ULink Wrap',
    description: 'Bản vẽ kỹ thuật chi tiết về độ dày, sai số, khả năng co nhiệt và quy cách đóng cuộn của màng co PE ứng dụng đóng gói pallet trong công nghiệp sản xuất linh kiện và thực phẩm.',
    date: '05/04/2026',
    size: '3.1 MB',
    type: 'PDF',
    author: 'Kỹ sư bao bì ULink',
    fullContent: `### Tổng quan màng co LDPE ULink Wrap
Màng co LDPE (Low-Density Polyethylene) ULink Wrap được sản xuất bằng công nghệ thổi màng nhiều lớp tiến tiến, đem lại độ dẻo dai cao, khả năng chống đâm thủng xuất sắc và tỷ lệ co ngót nhiệt đồng đều. Sản phẩm đạt chứng nhận FDA cho tiếp xúc thực phẩm trực tiếp.

### Bản vẽ kích thước & Quy cách cuộn
- **Độ rộng khổ thông dụng (W):** 500 mm, 1000 mm, 1200 mm (Sai số ±2mm).
- **Độ dày màng (T):** Từ 30 micrometer (µm) đến 80 micrometer (µm) (Sai số ±5%).
- **Trọng lượng lõi giấy:** 1.0 kg hoặc 1.2 kg làm bằng giấy kraft chịu lực cao, không bị móp méo khi vận chuyển.
- **Chiều dài cuộn:** Tuỳ chỉnh từ 100m đến 1500m tùy thuộc vào hệ thống đóng gói tự động hoặc thủ công của khách hàng.

### Chỉ số vật lý tiêu chuẩn
1. **Độ bền kéo đứt (Tensile Strength):**
   - Chiều dọc (MD): ≥ 24 MPa
   - Chiều ngang (TD): ≥ 22 MPa
2. **Độ giãn dài khi đứt (Elongation):**
   - Chiều dọc (MD): ≥ 450%
   - Chiều ngang (TD): ≥ 550%
3. **Tỷ lệ co ngót ở 130°C (Shrinkage Ratio):**
   - Chiều dọc: 50% - 70%
   - Chiều ngang: 15% - 30%

### Bảo quản
Lưu trữ ở nơi khô ráo, thoáng mát dưới 40°C, tránh ánh nắng trực tiếp và các nguồn nhiệt gần để ngăn chặn hiện tượng tự co nhiệt trước khi sử dụng.`
  },

  // ISO Certifications
  {
    id: 'ISO-9001',
    category: 'iso-certs',
    title: 'Chứng nhận Hệ thống Quản lý Chất lượng ISO 9001:2015',
    description: 'Chứng chỉ chứng nhận nhà máy sản xuất và toàn bộ quy trình vận hành cung ứng của ULink Industries đạt chuẩn quản lý chất lượng ISO 9001:2015 toàn cầu.',
    date: '15/07/2025',
    size: '1.8 MB',
    type: 'PDF',
    issuer: 'SGS Vietnam / ANAB accredited',
    expiry: '14/07/2028',
    fullContent: `### Chi tiết Chứng nhận ISO 9001:2015
Hệ thống Quản lý Chất lượng (QMS) của ULink Industries đã được tổ chức đánh giá uy tín hàng đầu thế giới **SGS** kiểm duyệt và cấp chứng nhận chính thức. 

- **Số đăng ký chứng chỉ (Certificate No):** VN25/90881Q
- **Phạm vi chứng nhận:** Thiết kế, sản xuất và phân phối găng tay phòng sạch, khăn lau phòng sạch, màng co bao bì đóng gói, băng keo chịu nhiệt và các giải pháp chống tĩnh điện chuyên sâu.
- **Cơ quan công nhận:** ANAB (ANSI National Accreditation Board - Hoa Kỳ).

### Ý nghĩa đối với Khách hàng B2B
1. **Chất lượng đồng đều:** Mọi lô sản phẩm xuất xưởng đều tuân thủ quy trình kiểm tra chất lượng 5 bước từ nguyên liệu đầu vào tới xuất kho.
2. **Khả năng truy xuất nguồn gốc (Traceability):** ULink áp dụng hệ thống gán mã lô hàng (batch number) cho từng thùng sản phẩm, cho phép truy xuất nhanh nguồn gốc nguyên vật liệu và ca máy sản xuất trong vòng 2 giờ khi có phản ánh.
3. **Cải tiến liên tục:** Các báo cáo đánh giá nội bộ định kỳ 6 tháng một lần giúp ULink liên tục khắc phục lỗi hệ thống và nâng cao tỷ lệ đơn hàng đạt chuẩn (hiện đạt 99.5%).`
  },
  {
    id: 'ISO-14001',
    category: 'iso-certs',
    title: 'Chứng nhận Hệ thống Quản lý Môi trường ISO 14001:2015',
    description: 'Chứng nhận cam kết của ULink Industries trong việc giảm thiểu tác động môi trường, tối ưu hóa tài nguyên và quy trình xử lý chất thải đạt tiêu chuẩn quốc tế.',
    date: '10/08/2025',
    size: '1.5 MB',
    type: 'PDF',
    issuer: 'TUV SUD Germany',
    expiry: '09/08/2028',
    fullContent: `### Chi tiết Chứng nhận ISO 14001:2015
Chứng nhận Hệ thống Quản lý Môi trường (EMS) được cấp bởi **TUV SUD** chứng minh ULink Industries vận hành sản xuất bền vững và giảm thiểu tối đa dấu chân carbon.

- **Số đăng ký chứng chỉ (Certificate No):** GER25/14001E
- **Mục tiêu cốt lõi:**
  - Tối ưu hóa hiệu quả sử dụng điện năng tại các dây chuyền dệt khăn lau phòng sạch và thổi màng co PE.
  - Áp dụng chương trình thu gom, tái chế 100% phế phẩm nhựa LDPE trong quá trình sản xuất màng co.
  - Hệ thống xử lý khí thải và nước thải tự động đạt tiêu chuẩn xả thải loại A trước khi đưa ra khu công nghiệp.

### Lợi ích cho đối tác phát triển bền vững (ESG)
Hầu hết các tập đoàn công nghệ đa quốc gia hiện nay đều yêu cầu nhà cung cấp đạt chuẩn ISO 14001 để khớp với báo cáo ESG hàng năm. Việc hợp tác với ULink giúp quý doanh nghiệp hoàn thiện chuỗi cung ứng xanh, nâng cao điểm số đánh giá nhà cung cấp của các đối tác toàn cầu.`
  },
  {
    id: 'ISO-13485',
    category: 'iso-certs',
    title: 'Chứng nhận Hệ thống Quản lý Chất lượng Thiết bị Y tế ISO 13485:2016',
    description: 'Chứng nhận năng lực sản xuất và cung ứng các sản phẩm găng tay y tế, khẩu trang phòng sạch đạt tiêu chuẩn phục vụ cho các nhà máy sản xuất thiết bị y tế và dược phẩm.',
    date: '22/09/2025',
    size: '2.1 MB',
    type: 'PDF',
    issuer: 'BSI Group UK',
    expiry: '21/09/2028',
    fullContent: `### Chi tiết Chứng nhận ISO 13485:2016
Tiêu chuẩn ISO 13485 đặc biệt yêu cầu các kiểm soát cực kỳ khắt khe đối với môi trường vô trùng và tính đồng bộ của sản phẩm dùng trong y tế. Chứng chỉ của ULink được cấp bởi viện tiêu chuẩn Anh quốc **BSI**.

- **Số đăng ký chứng chỉ (Certificate No):** MD 25/13485M
- **Ứng dụng sản phẩm:**
  - Găng tay cao su không bột (Powder-free Nitrile/Latex Cleanroom Gloves).
  - Khẩu trang phòng sạch y tế 3 lớp / 4 lớp.
  - Quần áo bảo hộ phòng mổ dùng một lần.

### Điểm mấu chốt trong kiểm soát chất lượng
- **Kiểm soát vi sinh (Bioburden Control):** Nhà máy dệt và đóng gói của ULink trang bị đèn UV khử trùng và hệ thống lọc khí HEPA liên tục đảm bảo lượng vi sinh vật bám trên sản phẩm trước khi đóng gói nằm dưới ngưỡng cho phép.
- **Nhà máy phòng sạch đạt chuẩn Class 100 (ISO 5):** Đảm bảo không phát sinh ô nhiễm chéo trong quá trình sản xuất sản phẩm.`
  },

  // Case Studies
  {
    id: 'CS-001',
    category: 'case-studies',
    title: 'Giải pháp kiểm soát tĩnh điện & ô nhiễm hạt tại nhà máy bán dẫn Samsung Thái Nguyên',
    description: 'Nghiên cứu thực tế về việc áp dụng khăn lau Microfiber chống tĩnh điện của ULink giúp giảm thiểu 25% tỷ lệ lỗi sản phẩm do nhiễm hạt bụi mịn và tĩnh điện tại dây chuyền sản xuất vi mạch.',
    date: '18/02/2026',
    readTime: '8 phút',
    author: 'Đội ngũ Kỹ thuật B2B ULink',
    tag: 'Bán dẫn & Điện tử',
    fullContent: `### Bối cảnh dự án
Nhà máy linh kiện điện tử Samsung tại Thái Nguyên gặp phải vấn đề tỷ lệ lỗi linh kiện camera và vi mạch tăng cao (ước tính khoảng 4.2%) trong giai đoạn kiểm thử cuối cùng. Sau khi phân tích bằng kính hiển vi điện tử, nguyên nhân được xác định là do các hạt bụi cực mịn (kích thước từ 0.5 - 2.0 µm) bám dính trên ống kính do hiện tượng tích điện tĩnh sinh ra trong quá trình công nhân lau chùi thủ công.

### Giải pháp từ ULink Industries
ULink đã cử các chuyên gia kiểm soát tĩnh điện đến khảo sát thực tế và đưa ra gói giải pháp tối ưu:
1. **Thay thế khăn lau thông thường:** Chuyển sang sử dụng **ULink Cleanwipe ESD Microfiber** dệt từ 80% Polyester và 20% Nylon siêu mịn, tích hợp sợi carbon dẫn điện đặc biệt.
2. **Chuẩn hóa quy trình lau:** Tập huấn kỹ năng lau một chiều (one-direction wiping) thay vì lau xoay tròn để tối ưu hóa việc giữ hạt bụi trong các kẽ sợi khăn lau.
3. **Kiểm tra định kỳ:** Cung cấp thiết bị đo điện trở bề mặt nhanh cho trưởng ca sản xuất để giám sát tĩnh điện tại chỗ.

### Kết quả đạt được
- Tỷ lệ lỗi hạt bụi mịn bám dính giảm mạnh từ **4.2% xuống còn 1.1%** sau 1 tháng áp dụng.
- Hiệu suất năng suất tăng lên đáng kể, tiết kiệm chi phí hao hụt sản phẩm lỗi ước tính hàng trăm ngàn USD mỗi quý cho nhà máy.
- Sản phẩm của ULink chính thức được đưa vào danh mục vật tư tiêu hao bắt buộc của Samsung cho dây chuyền này.`
  },
  {
    id: 'CS-002',
    category: 'case-studies',
    title: 'Nâng cấp hệ thống phân loại & giặt là phòng sạch Class 100 cho nhà máy Dược Hậu Giang',
    description: 'ULink phối hợp cùng DHG Pharma thiết kế quy trình kiểm soát chuỗi cung ứng khép kín quần áo bảo hộ đạt tiêu chuẩn vô trùng khắt khe, giúp tối ưu 15% chi phí vận hành.',
    date: '10/04/2026',
    readTime: '12 phút',
    author: 'Ban Giải pháp Phòng sạch ULink',
    tag: 'Dược phẩm & Y tế',
    fullContent: `### Thử thách của DHG Pharma
Môi trường sản xuất thuốc tiêm và thuốc kháng sinh đòi hỏi mức độ vô trùng tuyệt đối (Phòng sạch Class 100 - ISO 5). Quy trình giặt là quần áo phòng sạch tự doanh trước đây của DHG Pharma gặp khó khăn trong việc kiểm soát chỉ số vi sinh vật và bụi bẩn đồng đều, đồng thời chi phí bảo trì phòng giặt chuyên dụng và nhân sự vận hành tiêu tốn ngân sách lớn.

### Giải pháp chuỗi cung ứng của ULink
ULink đã triển khai dịch vụ Giặt là & Quản lý Trang phục Phòng sạch khép kín (Cleanroom Laundry Service):
1. **Phân loại mã hóa:** Mỗi bộ trang phục phòng sạch của nhân viên DHG Pharma được gắn mã RFID/Bar code độc bản để theo dõi lịch sử số lần giặt, ngày giặt và vị trí phòng làm việc tương ứng.
2. **Quy trình giặt đạt chuẩn:** Giặt bằng nước siêu lọc DI, sử dụng máy giặt/máy sấy chuyên dụng trong phòng sạch Class 100 của ULink, đóng gói hút chân không 2 lớp.
3. **Giao nhận SLA 24/7:** Giao nhận định kỳ hàng tuần trực tiếp đến tủ đồ gowning room của nhà máy thông qua xe tải chuyên dụng chống nhiễm khuẩn.

### Kết quả ấn tượng
- **100% mẫu kiểm thử** quần áo phòng sạch sau giặt đạt tiêu chuẩn vô trùng tuyệt đối, không phát hiện bụi và vi khuẩn.
- **Tiết kiệm 15% chi phí** so với việc DHG Pharma tự vận hành phòng giặt là chuyên dụng (nhờ ULink tối ưu hóa được quy mô công suất nhà xưởng).
- Giảm thiểu rủi ro gián đoạn sản xuất do thiếu quần áo sạch nhờ lượng tồn kho đệm (safety stock) 10% được ULink tài trợ.`
  },

  // Blog & News
  {
    id: 'BLOG-001',
    category: 'blog-news',
    title: 'Phân biệt phòng sạch Class 100 (ISO 5) và Class 1000 (ISO 6) trong thực tế',
    description: 'Hướng dẫn phân biệt rõ các tiêu chuẩn hạt bụi, số lần trao đổi không khí và yêu cầu trang phục phòng sạch tương ứng cho từng cấp độ phòng sạch theo tiêu chuẩn ISO 14644-1.',
    date: '15/06/2026',
    readTime: '6 phút',
    author: 'TS. Nguyễn Văn Minh (Cố vấn ULink)',
    tag: 'Kiến thức phòng sạch',
    fullContent: `### Khái niệm cơ bản về phân cấp phòng sạch
Phòng sạch được phân loại dựa trên mật độ hạt bụi lơ lửng trong một mét khối không khí theo tiêu chuẩn quốc tế **ISO 14644-1** (hoặc chuẩn cũ Fed Std 209E của Mỹ). Hai cấp độ phổ biến nhất trong công nghiệp điện tử và dược phẩm là Class 100 (ISO 5) và Class 1000 (ISO 6).

### Bảng so sánh các chỉ số cốt lõi

| Chỉ số tiêu chuẩn | Class 100 (ISO 5) | Class 1000 (ISO 6) |
| :--- | :--- | :--- |
| **Số hạt cực đại (size ≥ 0.5 µm)/m³** | Tối đa 3,520 hạt | Tối đa 35,200 hạt |
| **Số lần trao đổi không khí (Air Changes/hr)** | 240 đến 480 lần/giờ | 150 đến 240 lần/giờ |
| **Bộ lọc không khí tối thiểu** | HEPA/ULPA phủ 35% - 70% trần | HEPA phủ 20% - 40% trần |
| **Yêu cầu trang phục (Gowning)** | Kín hoàn toàn (Coverall, Hood, Ủng cao, Găng tay trùm) | Có thể dùng áo choàng (Lab coat), mũ trùm tóc thông thường |

### Ứng dụng thực tế
- **Class 100 (ISO 5):** Thường ứng dụng trong khu vực đổ đầy thuốc vô trùng (dược phẩm), khu vực phơi màng silicon trước khi quang khắc (bán dẫn), hoặc bàn thao tác sửa chữa ổ đĩa cứng.
- **Class 1000 (ISO 6):** Sử dụng cho khu vực đóng gói thuốc cấp 2, lắp ráp cụm linh kiện điện tử thông thường, hoặc phòng đệm trước khi vào phòng Class 100.`
  },
  {
    id: 'NEWS-002',
    category: 'blog-news',
    title: 'ULink khánh thành trung tâm phân phối thông minh Hà Nam quy mô 20.000m²',
    description: 'Buổi lễ khánh thành trung tâm Logistics và lưu trữ thông minh tại KCN Đồng Văn, Hà Nam ứng dụng hệ thống quản lý kho WMS thời gian thực giúp rút ngắn thời gian giao hàng khu vực phía Bắc còn dưới 4 giờ.',
    date: '01/06/2026',
    readTime: '4 phút',
    author: 'Ban Truyền thông ULink',
    tag: 'Tin tức công ty',
    fullContent: `### Sự kiện trọng đại của ULink Industries
Ngày 01/06/2026, ULink Industries chính thức cắt băng khánh thành Trung tâm phân phối thông minh (Smart Distribution Center - SDC) tại KCN Đồng Văn IV, tỉnh Hà Nam. Dự án có tổng số vốn đầu tư giai đoạn 1 lên tới 8 triệu USD, trải dài trên diện tích 20.000 mét vuông đất nhà kho hiện đại.

### Ứng dụng công nghệ kho vận 4.0
Trung tâm phân phối mới được trang bị những công nghệ tiên tiến hàng đầu trong ngành logistics:
- **Hệ thống WMS (Warehouse Management System):** Quản lý toàn bộ vị trí pallet bằng mã QR và định vị sóng vô tuyến RFID, giúp tối ưu hóa quãng đường di chuyển của xe nâng và giảm thời gian soạn hàng xuống dưới 5 phút mỗi đơn.
- **Khu vực kho kiểm soát nhiệt ẩm chuyên sâu:** Dành riêng cho lưu trữ găng tay nitrile, băng keo chịu nhiệt và hóa chất phòng sạch nhạy cảm với thời tiết nóng ẩm của miền Bắc Việt Nam.
- **Đội xe tải ULink Express:** Đội ngũ vận tải nội bộ sẵn sàng chạy 24/7 kết nối nhanh đến các cụm công nghiệp Bắc Ninh, Hưng Yên, Hải Phòng và Vĩnh Phúc.

### Cam kết thời gian giao hàng SLA
Phát biểu tại buổi lễ, Tổng Giám đốc ULink phát biểu: *"Việc đưa trung tâm phân phối Hà Nam vào vận hành là bước đi chiến lược giúp ULink thực hiện cam kết giao hàng khẩn cấp dưới 4 giờ đến các khách hàng nằm trong bán kính 80km, đảm bảo chuỗi cung ứng vật tư phòng sạch của đối tác không bao giờ bị đứt gãy."*`
  },

  // Download Center
  {
    id: 'CAT-2026',
    category: 'download-center',
    title: 'Catalogue Tổng hợp Sản phẩm Phòng sạch & Đóng gói ULink 2026',
    description: 'Tài liệu trọn bộ hơn 200 trang giới thiệu tất cả các dòng sản phẩm găng tay, khăn lau, băng keo, trang phục phòng sạch và vật liệu đóng gói co nhiệt mang thương hiệu ULink.',
    date: '01/01/2026',
    size: '18.5 MB',
    type: 'PDF',
    author: 'Phòng Marketing ULink',
    fullContent: `### Nội dung Catalogue ULink 2026
Cuốn catalogue tổng hợp phiên bản 2026 là cẩm nang toàn diện nhất giúp các bộ phận Mua hàng (Procurement) và Kỹ thuật tại các nhà máy dễ dàng tìm kiếm và lựa chọn sản phẩm phù hợp.

### Các chương mục chính
1. **Chương 1: Khăn lau phòng sạch (Cleanroom Wipers):** Các dòng sợi polyester, microfiber, vải không dệt spunlace nén từ xơ gỗ.
2. **Chương 2: Găng tay công nghiệp (Cleanroom Gloves):** Găng Nitrile, Latex, PVC chống tĩnh điện, găng phủ ngón carbon.
3. **Chương 3: Trang phục bảo hộ (ESD Apparel):** Quần áo liền quần, áo choàng phòng sạch, ủng, mũ trùm, khẩu trang y tế.
4. **Chương 4: Băng keo chịu nhiệt & ESD (Technical Tapes):** Băng keo Polyimide, băng keo ESD dán sàn cảnh báo, băng keo chịu nhiệt Teflon.
5. **Chương 5: Màng co & Đóng gói bảo vệ (Packaging Film):** Màng co LDPE dạng cuộn, dạng túi cắt sẵn, màng quấn pallet căng tay/căng máy.

### Tiêu chuẩn kỹ thuật đính kèm
Mỗi trang sản phẩm đều tích hợp sẵn bảng thông số kỹ thuật tóm tắt, chứng chỉ đạt được (ISO, FDA, RoHS) và các quy cách đóng gói đóng hộp tiêu chuẩn để bộ phận mua hàng dễ dàng đối chiếu mã SKU.`
  },
  {
    id: 'FORM-RFQ',
    category: 'download-center',
    title: 'Mẫu bảng yêu cầu báo giá RFQ tiêu chuẩn dành cho khách hàng doanh nghiệp',
    description: 'Mẫu file Excel điền thông số sản phẩm, số lượng và thông tin liên hệ giúp đẩy nhanh tiến trình báo giá và tích hợp dữ liệu vào hệ thống cổng B2B ULink.',
    date: '15/02/2026',
    size: '120 KB',
    type: 'XLSX',
    author: 'Bộ phận Chăm sóc khách hàng ULink',
    fullContent: `### Hướng dẫn sử dụng mẫu RFQ Excel
Mẫu bảng yêu cầu báo giá RFQ (Request for Quote) dạng file bảng tính giúp quý khách hàng điền nhanh thông tin nhu cầu mua sắm số lượng lớn, phục vụ cho việc gửi báo giá chính xác nhất.

### Các thông tin cần cung cấp trong file
1. **Thông tin doanh nghiệp:** Tên công ty, mã số thuế, địa điểm giao hàng dự kiến, người liên hệ trực tiếp.
2. **Thông tin sản phẩm:**
   - Mã SKU ULink (nếu đã biết) hoặc tên mô tả sản phẩm tương đương.
   - Yêu cầu kỹ thuật cốt lõi (ví dụ: Khổ rộng màng co 500mm, Độ dày 50mic).
   - Số lượng cần báo giá (cung cấp số lượng mua theo tháng hoặc theo từng đơn hàng).
   - Đơn vị tính (cuộn, gói, thùng, chiếc).
3. **Kế hoạch giao hàng:** Lịch trình giao một lần hay giao nhiều đợt theo lịch trình sản xuất (SLA).

### Quy trình xử lý
Sau khi điền đầy đủ thông tin vào mẫu Excel này, bạn có thể tải trực tiếp file lên cổng B2B ở trang tạo RFQ hoặc gửi đính kèm qua email **sales@ulink.com.vn**. Đội ngũ Sales của chúng tôi sẽ phản hồi bảng báo giá chính thức trong vòng tối đa **4 giờ làm việc**.`
  }
];

// Beautiful categories mapping with icon component and color themes
const CATEGORIES = [
  {
    id: 'tech-docs',
    label: 'Technical Docs',
    subLabel: 'Tài liệu kỹ thuật',
    icon: FileText,
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950/20',
    textLight: 'text-blue-600 dark:text-blue-400',
    borderLight: 'border-blue-100 dark:border-blue-900/30'
  },
  {
    id: 'iso-certs',
    label: 'ISO Certs',
    subLabel: 'Chứng chỉ chất lượng',
    icon: Award,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
    textLight: 'text-emerald-600 dark:text-emerald-400',
    borderLight: 'border-emerald-100 dark:border-emerald-900/30'
  },
  {
    id: 'case-studies',
    label: 'Case Studies',
    subLabel: 'Nghiên cứu thực tế',
    icon: BookOpen,
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50 dark:bg-violet-950/20',
    textLight: 'text-violet-600 dark:text-violet-400',
    borderLight: 'border-violet-100 dark:border-violet-900/30'
  },
  {
    id: 'blog-news',
    label: 'Blog & News',
    subLabel: 'Tin tức & Kiến thức',
    icon: Newspaper,
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 dark:bg-amber-950/20',
    textLight: 'text-amber-600 dark:text-amber-400',
    borderLight: 'border-amber-100 dark:border-amber-900/30'
  },
  {
    id: 'download-center',
    label: 'Download Center',
    subLabel: 'Trung tâm tải về',
    icon: Download,
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50 dark:bg-rose-950/20',
    textLight: 'text-rose-600 dark:text-rose-400',
    borderLight: 'border-rose-100 dark:border-rose-900/30'
  }
] as const;

const MOCK_INDUSTRIES = [
  {
    slug: 'electronics',
    name: 'Điện tử',
    description: 'Kiểm soát tĩnh điện và hạt bụi, bảo vệ linh kiện và đảm bảo độ tin cậy.',
    icon: Cpu,
    bgLight: 'bg-blue-50 dark:bg-blue-950/20',
    textLight: 'text-blue-600 dark:text-blue-400',
    borderLight: 'border-blue-100 dark:border-blue-900/30'
  },
  {
    slug: 'electronics',
    name: 'Bán dẫn',
    description: 'Đáp ứng tiêu chuẩn siêu sạch, kiểm soát hạt siêu mịn và tạp chất.',
    icon: Cpu,
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/20',
    textLight: 'text-indigo-600 dark:text-indigo-400',
    borderLight: 'border-indigo-100 dark:border-indigo-900/30'
  },
  {
    slug: 'pharmaceutical-cosmetics',
    name: 'Dược phẩm',
    description: 'Tuân thủ GMP, đảm bảo vô trùng và an toàn trong sản xuất.',
    icon: Activity,
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
    textLight: 'text-emerald-600 dark:text-emerald-400',
    borderLight: 'border-emerald-100 dark:border-emerald-900/30'
  },
  {
    slug: 'pharmaceutical-cosmetics',
    name: 'Y tế',
    description: 'Đảm bảo vô trùng, bảo vệ nhân viên và bệnh nhân khỏi nhiễm chéo.',
    icon: Activity,
    bgLight: 'bg-teal-50 dark:bg-teal-950/20',
    textLight: 'text-teal-600 dark:text-teal-400',
    borderLight: 'border-teal-100 dark:border-teal-900/30'
  },
  {
    slug: 'food-beverage',
    name: 'Thực phẩm',
    description: 'Kiểm soát vi sinh và dị vật, đảm bảo an toàn thực phẩm.',
    icon: Utensils,
    bgLight: 'bg-amber-50 dark:bg-amber-950/20',
    textLight: 'text-amber-600 dark:text-amber-400',
    borderLight: 'border-amber-100 dark:border-amber-900/30'
  },
  {
    slug: 'automotive',
    name: 'Cơ khí chế tạo',
    description: 'Bảo vệ sản phẩm và thiết bị, ổn định sản xuất và nâng cao chất lượng.',
    icon: Car,
    bgLight: 'bg-violet-50 dark:bg-violet-950/20',
    textLight: 'text-violet-600 dark:text-violet-400',
    borderLight: 'border-violet-100 dark:border-violet-900/30'
  }
];

export function ResourcesClient() {
  const [activeTab, setActiveTab] = useState<ResourceItem['category']>('tech-docs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  // Search logic across all resources (or filtered by tab if query is empty)
  const filteredResources = useMemo(() => {
    return MOCK_RESOURCES.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.issuer && item.issuer.toLowerCase().includes(searchQuery.toLowerCase()));

      if (searchQuery.trim() !== '') {
        return matchesSearch; // Global search across all categories when query exists
      }

      return item.category === activeTab;
    });
  }, [activeTab, searchQuery]);

  const activeCategoryDetail = useMemo(() => {
    return CATEGORIES.find((cat) => cat.id === activeTab) || CATEGORIES[0];
  }, [activeTab]);

  const handleShare = (resource: ResourceItem) => {
    if (navigator.share) {
      navigator
        .share({
          title: resource.title,
          text: resource.description,
          url: window.location.href
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.href}?id=${resource.id}`);
      alert('Đã sao chép liên kết tài liệu vào bộ nhớ tạm!');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20 pb-20">
      
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden bg-slate-950 text-white py-16 px-6 sm:px-12 md:py-20 lg:py-24 rounded-3xl mb-10 shadow-2xl border border-white/[0.08]">
        {/* Decorative vector background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] -mr-48 -mt-48 z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-300 text-blue-400">
              ULink Resource Library
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300"
          >
            Trung tâm Tài nguyên & Tài liệu B2B
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Tra cứu và tải về các bảng thông số kỹ thuật (TDS), chứng chỉ ISO quốc tế, hướng dẫn quy trình ESD, nghiên cứu thực tiễn và tài liệu vận hành cổng B2B.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-4 pt-2"
          >
            <Link
              href="/solutions?search=cleanroom"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] border border-blue-500/30"
            >
              Giải pháp phòng sạch
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/solutions?search=packaging"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] border border-emerald-500/30"
            >
              Giải pháp đóng gói
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Search bar inside Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-xl mx-auto pt-4"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tài liệu, mã sản phẩm, chứng chỉ, bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 pl-12 pr-12 text-sm sm:text-base outline-none backdrop-blur-lg transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 placeholder:text-slate-400 text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="absolute right-0 left-0 -bottom-8 text-xs text-left text-slate-400 mt-2 px-2">
                Đang tìm kiếm trên toàn bộ danh mục tài nguyên...
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Tabs (Only show when not doing global search) */}
        {!searchQuery && (
          <div className="mb-8 border-b border-border/60 pb-1 overflow-x-auto scrollbar-none">
            <div className="flex space-x-1 min-w-max">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = activeTab === cat.id;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={cn(
                      'relative flex items-center gap-2.5 px-5 py-4 text-sm font-semibold rounded-t-xl transition-all outline-none border-b-2',
                      isActive
                        ? 'border-brand text-brand'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    )}
                  >
                    <IconComponent className={cn('h-4.5 w-4.5', isActive ? 'text-brand' : 'text-muted-foreground')} />
                    <div className="text-left">
                      <span className="block leading-none">{cat.label}</span>
                      <span className="block text-[10px] font-normal opacity-85 mt-0.5">{cat.subLabel}</span>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Meta Header (shows only if not searching) */}
        {!searchQuery && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <activeCategoryDetail.icon className={cn('h-5.5 w-5.5', activeCategoryDetail.textLight)} />
                {activeCategoryDetail.label} ({activeCategoryDetail.subLabel})
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Xem và khai thác các tài nguyên chính thức được kiểm duyệt của ULink.
              </p>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/30 shrink-0 self-start sm:self-center">
              Tìm thấy <span className="font-semibold text-foreground">{filteredResources.length}</span> tài liệu
            </div>
          </div>
        )}

        {searchQuery && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Kết quả tìm kiếm cho: &quot;{searchQuery}&quot;
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Tìm thấy trên toàn bộ danh mục tài liệu của ULink.
              </p>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-brand font-semibold hover:underline"
            >
              Quay lại danh mục
            </button>
          </div>
        )}

        {/* Resource Grid */}
        <AnimatePresence mode="popLayout">
          {filteredResources.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-border p-6 bg-card"
            >
              <HelpCircle className="h-12 w-12 text-muted-foreground/60 mb-4 animate-pulse" />
              <h3 className="text-base font-bold text-foreground">Không tìm thấy tài liệu phù hợp</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục tài liệu khác.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-brand/10 border border-brand/20 px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/20 transition-all"
                >
                  Xóa từ khóa
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredResources.map((resource) => {
                const catTheme = CATEGORIES.find((cat) => cat.id === resource.category) || CATEGORIES[0];
                const CatIcon = catTheme.icon;
                
                return (
                  <motion.div
                    key={resource.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md hover:border-brand/40 transition-all cursor-pointer"
                    onClick={() => setSelectedResource(resource)}
                  >
                    <div className="space-y-4">
                      {/* Top Row with ID & Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 bg-muted rounded border border-border/40">
                          {resource.id}
                        </span>
                        
                        <span className={cn(
                          'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border',
                          catTheme.bgLight, catTheme.textLight, catTheme.borderLight
                        )}>
                          <CatIcon className="h-3 w-3" />
                          {catTheme.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug group-hover:text-brand transition-colors">
                        {resource.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>

                    {/* Footer Info / Meta */}
                    <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-3">
                      {/* Technical details or Issuer or Authors */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                        {resource.size && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 shrink-0" />
                            <span>Dung lượng: {resource.size}</span>
                          </div>
                        )}
                        {resource.type && (
                          <div className="flex items-center gap-1">
                            <CornerDownRight className="h-3 w-3 shrink-0" />
                            <span>Định dạng: {resource.type}</span>
                          </div>
                        )}
                        {resource.issuer && (
                          <div className="flex items-center gap-1 col-span-2 line-clamp-1">
                            <Award className="h-3 w-3 shrink-0 text-emerald-500" />
                            <span className="truncate">Cấp bởi: {resource.issuer}</span>
                          </div>
                        )}
                        {resource.author && (
                          <div className="flex items-center gap-1 col-span-2 line-clamp-1">
                            <BookOpen className="h-3 w-3 shrink-0 text-violet-500" />
                            <span className="truncate">Tác giả: {resource.author}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Button Row */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{resource.date}</span>
                        </div>
                        
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-brand group-hover:translate-x-0.5 transition-transform">
                          <span>Chi tiết</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Industries Grid Section */}
        <div className="mt-20 pt-16 border-t border-border/60">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Giải pháp theo Ngành nghề
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              ULink Industries cung cấp dải giải pháp vật tư phòng sạch và đóng gói chuyên dụng, đáp ứng các tiêu chuẩn khắt khe cho từng lĩnh vực công nghiệp trọng điểm.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_INDUSTRIES.map((ind) => {
              const IndIcon = ind.icon;
              return (
                <div
                  key={ind.slug}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md hover:border-brand/40 transition-all"
                >
                  <div className="space-y-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm",
                      ind.bgLight, ind.textLight, ind.borderLight
                    )}>
                      <IndIcon className="h-6 w-6" />
                    </div>
                    
                    <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-brand transition-colors">
                      {ind.name}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {ind.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/50 flex justify-end">
                    <Link
                      href={`/industries/${ind.slug}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Document Detail Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedResource(null)}
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/80 px-6 py-5 bg-muted/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 border border-border/60 rounded text-muted-foreground">
                      {selectedResource.id}
                    </span>
                    
                    <span className={cn(
                      'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
                      CATEGORIES.find((cat) => cat.id === selectedResource.category)?.bgLight,
                      CATEGORIES.find((cat) => cat.id === selectedResource.category)?.textLight,
                      CATEGORIES.find((cat) => cat.id === selectedResource.category)?.borderLight
                    )}>
                      {selectedResource.category}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-foreground line-clamp-1 leading-snug">
                    {selectedResource.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all ml-4 border border-transparent hover:border-border/50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Contents */}
              <div className="max-h-[65vh] overflow-y-auto p-6 space-y-6">
                
                {/* Meta details list */}
                <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-2xl bg-muted/30 border border-border/50 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Ngày cập nhật / xuất bản:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      {selectedResource.date}
                    </span>
                  </div>
                  
                  {selectedResource.size && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Dung lượng tệp tin:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-slate-500" />
                        {selectedResource.size} ({selectedResource.type})
                      </span>
                    </div>
                  )}

                  {selectedResource.issuer && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Cơ quan cấp chứng nhận:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-emerald-500" />
                        {selectedResource.issuer}
                      </span>
                    </div>
                  )}

                  {selectedResource.expiry && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Thời hạn hiệu lực:</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Đến {selectedResource.expiry}
                      </span>
                    </div>
                  )}

                  {selectedResource.author && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Biên soạn / Tác giả:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-violet-500" />
                        {selectedResource.author}
                      </span>
                    </div>
                  )}

                  {selectedResource.readTime && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Thời gian đọc dự kiến:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-500" />
                        {selectedResource.readTime}
                      </span>
                    </div>
                  )}
                </div>

                {/* Main Text Content */}
                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-foreground/90">
                  <h3 className="text-md font-bold text-foreground border-b border-border/60 pb-2">
                    Tóm tắt & Xem trước nội dung tài liệu
                  </h3>
                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm bg-muted/20 border border-border/40 p-4 sm:p-5 rounded-2xl overflow-x-auto whitespace-pre-wrap leading-relaxed font-normal">
                    {selectedResource.fullContent || selectedResource.description}
                  </div>
                </div>

                {/* Professional Warning Box */}
                <div className="p-4 rounded-xl border border-blue-200/50 bg-blue-50/40 dark:bg-blue-950/10 dark:border-blue-900/30 text-xs text-blue-800 dark:text-blue-400">
                  <strong>Chú ý bản quyền:</strong> Tài liệu thuộc quyền sở hữu của ULINK INDUSTRIES. Chỉ dành cho đối tác, khách hàng doanh nghiệp khai thác nghiệp vụ nội bộ. Vui lòng không phát tán tài liệu ra ngoài mạng lưới B2B khi chưa được chấp thuận văn bản.
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 px-6 py-4 bg-muted/40">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(selectedResource)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted hover:text-brand transition-all"
                    title="Chia sẻ tài liệu này"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Chia sẻ
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-all"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    In trang
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedResource(null)}
                    className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-all"
                  >
                    Đóng lại
                  </button>
                  
                  {/* Download CTA */}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Đang khởi tạo tải xuống file ${selectedResource.title} (${selectedResource.size || '1.0MB'})...`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand/90 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Tải về máy ({selectedResource.type || 'PDF'})
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
