-- ============================================================================
-- ULink B2B Platform - Seed Data Sản Phẩm Công Nghiệp Tiêu Chuẩn (80 Sản phẩm Tiếng Việt)
-- File: directus/seed-products.sql
-- ============================================================================

-- 0. Xóa sạch toàn bộ sản phẩm cũ trong database trước khi nạp lại
DELETE FROM products WHERE TRUE;

-- 1. Đảm bảo 8 danh mục sản phẩm tồn tại
INSERT INTO product_categories (id, status, name, slug) VALUES
(1, 'published', 'Vật tư phòng sạch', 'cleanroom-consumables'),
(2, 'published', 'Găng tay phòng sạch', 'cleanroom-gloves'),
(3, 'published', 'Khăn lau phòng sạch', 'cleanroom-wipers'),
(4, 'published', 'Quần áo phòng sạch', 'cleanroom-apparel'),
(5, 'published', 'Khẩu trang phòng sạch', 'cleanroom-masks'),
(6, 'published', 'Bao bì công nghiệp', 'industrial-packaging'),
(7, 'published', 'Vật tư ESD', 'esd-supplies'),
(8, 'published', 'Hóa chất phòng sạch', 'cleanroom-chemicals')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- 2. Thêm 80 sản phẩm tiêu chuẩn B2B công nghiệp (10 sản phẩm chính xác cho từng danh mục)
INSERT INTO products (status, name, slug, brand, category, short_description) VALUES

-- === DANH MỤC 1: VẬT TƯ PHÒNG SẠCH (cleanroom-consumables) ===
('published', 'Thảm dính bụi phòng sạch Sticky Mat Contec 30 lớp (60x90cm)', 'sticky-mat-30-layers', 'Contec', 1, 'Thảm dính bụi lối vào phòng sạch, cấu tạo 30 lớp PE phủ keo acrylic giữ lại 99.9% bụi bẩn từ đế giày và bánh xe đẩy.'),
('published', 'Con lăn bụi phòng sạch PE Sticky Roller Contec 12 inch (Cán Inox ESD)', 'sticky-roller-12-inch', 'Contec', 1, 'Con lăn PE dính bụi mịn 12 inch bọc tay cầm inox chống tĩnh điện dùng để vệ sinh bụi trên bề mặt tấm mạch SMT.'),
('published', 'Bút ghi phòng sạch vỏ nhựa tĩnh điện Texwipe Pen (Mực Xanh không bụi)', 'cleanroom-pen-esd', 'Texwipe', 1, 'Bút bi vỏ nhựa tĩnh điện 10^8 Ω mực khô nhanh không bay hơi không bám bụi dành cho ghi chép nhật ký phòng lab.'),
('published', 'Giấy in phòng sạch Contec Cleanroom Paper A4 72gsm (ISO Class 100)', 'cleanroom-paper-a4-72g', 'Contec', 1, 'Giấy in phòng sạch ép nhiệt đặc biệt không sinh bụi kiềm, không rách rưới khi in nhiệt trong phòng sạch Class 100.'),
('published', 'Tăm bông phòng sạch Huby Swab đầu dẹt 3 inch không xơ sợi', 'cleanroom-swab-cotton-3inch', 'Huby', 1, 'Tăm bông chuyên dụng làm sạch chi tiết thấu kính máy ảnh, cảm biến quang học không phát sinh xơ bông.'),
('published', 'Nhíp gắp vi mạch chống tĩnh điện Vetus ESD-249 (Đầu nhựa PEEK)', 'cleanroom-tweezers-esd', 'Vetus', 1, 'Nhíp nhựa carbon tĩnh điện gắp chip linh kiện không làm xước bề mặt thấu kính bán dẫn.'),
('published', 'Cuộn màng PE dính bụi thay thế Contec Roller Refill 4 inch', 'sticky-roller-refill-4inch', 'Contec', 1, 'Cuộn lõi dính bụi thay thế 4 inch dùng vệ sinh vi mạch và màn hình cảm ứng.'),
('published', 'Băng keo dán phòng sạch Texwipe Vinyl Tape 20mm (Không để lại keo)', 'cleanroom-tape-vinyl-blue', 'Texwipe', 1, 'Băng keo Vinyl dán niêm phong hộp phòng sạch không để lại keo dư khi bóc.'),
('published', 'Sổ tay ghi chép phòng sạch Contec A5 gáy xoắn chống tĩnh điện', 'cleanroom-notebook-spiral', 'Contec', 1, 'Sổ tay giấy phòng sạch gáy xoắn nhựa ESD 50 trang dành cho kỹ sư vận hành.'),
('published', 'Dụng cụ lau sàn phòng sạch Texwipe Microfiber Mop (Vắt tự động)', 'cleanroom-dust-collector-mop', 'Texwipe', 1, 'Dụng cụ lau sàn phòng sạch đầu lau Microfiber thay thế nhanh không đọng nước.'),

-- === DANH MỤC 2: GĂNG TAY PHÒNG SẠCH (cleanroom-gloves) ===
('published', 'Găng tay Nitrile phòng sạch Ansell TouchNTuff 92-600 (Không bột, 9 inch)', 'nitrile-cleanroom-gloves', 'Ansell', 2, 'Găng tay Nitrile chống hóa chất nhẹ, kháng rách gấp 3 lần latex, không chứa silicone và bột.'),
('published', 'Găng tay dệt carbon phủ PU đầu ngón tay ULink ESD (Trắng/Xám)', 'pu-fingertip-esd-gloves', 'ULink Clean', 2, 'Găng tay sợi polyester pha carbon dệt kim phủ polyurethane đầu ngón giúp tăng độ bám khi gắp chip SMT.'),
('published', 'Găng tay Latex vô trùng tiệt trùng Ansell AccuTech (12 inch, Dược phẩm)', 'sterile-latex-cleanroom-gloves', 'Ansell AccuTech', 2, 'Găng tay cao su vô trùng tiệt trùng bằng tia Gamma chuyên dụng cho sản xuất thuốc tiêm và vắc-xin.'),
('published', 'Găng tay dệt carbon phủ PU lòng bàn tay ULink Protect ESD', 'pu-palm-coated-esd-gloves', 'ULink Protect', 2, 'Găng tay phủ kín lớp PU toàn bộ lòng bàn tay tăng ma sát, chịu mài mòn tốt khi bê vác linh kiện kim loại.'),
('published', 'Bao ngón tay cao su chống tĩnh điện Ansell Pink Finger Cots (Không bột)', 'esd-finger-cots-pink', 'Ansell', 2, 'Bao ngón tay cao su tĩnh điện không bột giúp công nhân dễ dàng thao tác gắp các linh kiện nhỏ.'),
('published', 'Găng tay chịu nhiệt phòng sạch Nomex/Kevlar Ansell 300°C (Dài 38cm)', 'cleanroom-heat-resistant-gloves', 'Ansell', 2, 'Găng tay dệt bện Nomex chịu nhiệt độ cao 300°C dùng cho lò sấy bo mạch và đùn ép nhựa.'),
('published', 'Găng tay cao su tự nhiên Latex Ansell Micro-Touch (12 inch, Class 5)', 'latex-cleanroom-gloves-powderfree', 'Ansell Micro-Touch', 2, 'Găng tay cao su tự nhiên siêu dẻo dai độ nhạy xúc giác cao cho phòng thí nghiệm vi sinh.'),
('published', 'Găng tay sợi carbon chống tĩnh điện ULink (Không phủ PU, thoáng khí)', 'esd-carbon-gloves-top-coated', 'ULink Protect', 2, 'Găng tay dệt kim sợi carbon mềm mại thoáng khí dành cho khâu kiểm hàng kiểm ngoại quan.'),
('published', 'Găng tay Neoprene chống hóa chất ăn mòn Ansell AlphaTec 58-535', 'neoprene-chemical-cleanroom-gloves', 'Ansell', 2, 'Găng tay Neoprene bọc nỉ cotton chống ăn mòn hóa chất mạnh như Axit Sulfuric, IPA và Solvents.'),
('published', 'Găng tay chống cắt cấp độ A5 Ansell HyFlex 11-542 (Phủ Nitrile Foam)', 'cut-resistant-level-a5-gloves', 'Ansell HyFlex', 2, 'Găng tay sợi HPPE dệt pha kim loại gia cường chống cắt sắc bén khi thao tác với kính và tôn tấm.'),

-- === DANH MỤC 3: KHĂN LAU PHÒNG SẠCH (cleanroom-wipers) ===
('published', 'Khăn lau phòng sạch Texwipe Wiper 1009DLE (100% Polyester cắt Laser)', 'polyester-cleanroom-wipers', 'Texwipe', 3, 'Khăn lau 100% Polyester liên tục cắt nhiệt hàn mép không để lại sợi vải, đạt tiêu chuẩn ISO Class 3-5.'),
('published', 'Khăn lau vi sợi Microfiber M-3 Asahi Kasei (Cắt siêu âm 9x9 inch)', 'microfiber-cleanroom-wiper-m3', 'Asahi Kasei', 3, 'Khăn lau dệt từ sợi Microfiber siêu mảnh hút dầu mỡ và vết vân tay trên kính camera không cần hóa chất.'),
('published', 'Khăn lau phòng sạch tẩm sẵn cồn 70% IPA Texwipe Pre-wetted Wipes', 'pre-wetted-ipa-70-wipers', 'Texwipe', 3, 'Khăn lau tẩm sẵn dung dịch cồn 70% IPA tiệt trùng tiện lợi vệ sinh bề mặt máy móc và băng tải nhanh chóng.'),
('published', 'Khăn lau phòng sạch Asahi Kasei Bemcot M-3 (80% Cellulose + 20% Polyester)', 'cleanroom-wiper-m3-celluose', 'Asahi Kasei', 3, 'Khăn lau M-3 Bemcot dệt không thoi từ xơ bông tự nhiên khả năng hấp thụ dung môi gấp 5 lần trọng lượng.'),
('published', 'Khăn lau siêu sạch Microfiber Texwipe 4004 (ISO Class 10, Cắt Laser)', 'wiper-4004-microfiber-laser', 'Texwipe', 3, 'Khăn lau Microfiber cấp độ siêu sạch Class 10 dùng vệ sinh thấu kính hiển vi và đĩa bán dẫn Wafer.'),
('published', 'Khăn lau vải không dệt Contec Wiper 7080 (Định lượng 68gsm thấm hút nhanh)', 'wiper-7080-nonwoven', 'Contec', 3, 'Khăn lau vải không dệt giá thành tối ưu dùng vệ sinh khuôn dập và thiết bị cơ khí phòng sạch.'),
('published', 'Khăn lau pha Poly-Cellulose Texwipe (Kháng dung môi IPA & Acetone)', 'cleanroom-poly-cellulose-wiper', 'Texwipe', 3, 'Khăn lau kết hợp độ bền của polyester và độ thấm hút của cellulose chịu được dung môi mạnh.'),
('published', 'Khăn lau phòng sạch kinh tế ULink Wiper 1008D (Dệt đúp 120gsm)', 'cleanroom-wiper-1008D', 'ULink Wiper', 3, 'Khăn lau phòng sạch kinh tế 1008D thích hợp cho các phân xưởng sản xuất thiết bị phụ trợ.'),
('published', 'Khăn lau chống tĩnh điện Texwipe ESD Wiper (Điện trở 10^6 - 10^8 Ω)', 'antistatic-cleanroom-wiper', 'Texwipe', 3, 'Khăn lau dệt bổ sung sợi dẫn điện ESD loại bỏ hoàn toàn sự tích tụ điện tĩnh khi ma sát.'),
('published', 'Cuộn khăn lau công nghiệp Kimberly-Clark WypAll X70 (500 tờ rút)', 'heavy-duty-industrial-wiper-roll', 'Kimberly-Clark WypAll', 3, 'Cuộn khăn lau công nghiệp cỡ lớn 500 tờ rút tiện lợi dán trên kệ máy bốc xếp.'),

-- === DANH MỤC 4: QUẦN ÁO PHÒNG SẠCH (cleanroom-apparel) ===
('published', 'Bộ áo liền quần phòng sạch Tyvek 400 DuPont (Chống văng bắn hóa chất)', 'tyvek-cleanroom-coverall', 'DuPont', 4, 'Trang phục phòng sạch kháng khuẩn, chống văng bắn hóa chất nhẹ và hạt bụi siêu mịn 0.5 micron.'),
('published', 'Giày boot phòng sạch cao cổ ULink Shoes (Đế PVC chống tĩnh điện 10^6-10^9 Ω)', 'esd-pvc-cleanroom-boot', 'ULink Shoes', 4, 'Giày boot phòng sạch cao cổ đế PVC chống trơn trượt, điện trở tĩnh điện chuẩn ANSI/ESD S20.20.'),
('published', 'Áo blouse phòng sạch tĩnh điện ULink Protect (Cổ bẻ khuy bấm, Sợi Carbon)', 'cleanroom-blouse-esd', 'ULink Protect', 4, 'Áo blouse phòng sạch tĩnh điện may sợi carbon khuy bấm cài tiện lợi cho cán bộ kỹ thuật và khách tham quan.'),
('published', 'Nón trùm đầu phòng sạch trùm vai ULink (Tích hợp khẩu trang ESD)', 'cleanroom-hood-mask', 'ULink Protect', 4, 'Nón trùm trùm kín đầu, cổ và vai tích hợp khẩu trang giúp ngăn tóc và nước bọt rơi vãi vào dây chuyền.'),
('published', 'Áo khoác phủ phòng sạch ULink Protect (Khóa kéo, Vải kẻ ô Carbon)', 'esd-cleanroom-smock-zip', 'ULink Protect', 4, 'Áo khoác chống tĩnh điện khóa kéo thiết kế gọn nhẹ thoáng mát cho khu vực kiểm tra sản phẩm.'),
('published', 'Dép phòng sạch chống tĩnh điện ULink Sabot (Đế EVA chống trượt mỏi)', 'esd-sabot-shoes-white', 'ULink Shoes', 4, 'Dép phòng sạch chống tĩnh điện quai hậu đế EVA nhẹ chống mỏi chân khi đứng làm việc lâu.'),
('published', 'Bao bọc giày phòng sạch dùng 1 lần ULink PE (Độ dày 0.04mm, Bo thun)', 'cleanroom-shoe-cover-pe', 'ULink Protect', 4, 'Bao bọc giày nilon PE chống dính nước bẩn lối vào nhà máy B2B.'),
('published', 'Bao tay áo phòng sạch ULink Protect (Vải sợi carbon ESD 40cm)', 'cleanroom-sleeve-cover-esd', 'ULink Protect', 4, 'Ống bọc cẳng tay phòng sạch bảo vệ phần tay áo thường không bị văng bắn hóa chất.'),
('published', 'Quần rời phòng sạch chống tĩnh điện ULink (Dệt kẻ sọc carbon, Bo gấu)', 'cleanroom-pants-esd-stripe', 'ULink Protect', 4, 'Quần rời phòng sạch bo gấu thun co giãn kết hợp cùng áo blouse tạo bộ đồng phục B2B.'),
('published', 'Kính bảo hộ phòng sạch Bolle Safety (Chịu hấp tiệt trùng Autoclave 121°C)', 'autoclavable-cleanroom-goggles', 'Bolle Safety', 4, 'Kính bảo hộ kín mắt chịu nhiệt hấp tiệt trùng Autoclave 121°C dành cho phòng sạch dược phẩm.'),

-- === DANH MỤC 5: KHẨU TRANG PHÒNG SẠCH (cleanroom-masks) ===
('published', 'Khẩu trang phòng sạch 3 lớp ES/MB Kimberly-Clark (Quai thun siêu mềm)', 'cleanroom-face-mask-3ply', 'Kimberly-Clark', 5, 'Khẩu trang lọc bụi mịn 99% không gây ngứa, quai thun hàn siêu âm siêu dai cho công nhân phòng sạch SMT.'),
('published', 'Khẩu trang than hoạt tính 4 lớp Kimberly-Clark (Lọc mùi hóa chất hữu cơ)', 'active-carbon-mask-4ply', 'Kimberly-Clark', 5, 'Khẩu trang tích hợp màng lọc than hoạt tính nén hấp phụ mùi hóa chất hữu cơ và khí độc nhẹ phòng sơn.'),
('published', 'Khẩu trang định hình 3M N95 8210 Cleanroom (Hiệu suất lọc bụi 95%)', 'n95-cleanroom-mask', '3M', 5, 'Khẩu trang 3M N95 ôm khít khuôn mặt lọc 95% bụi mịn và vi khuẩn trong sản xuất dược phẩm và sinh học.'),
('published', 'Khẩu trang giấy 2 lớp ULink Protect (Không xơ sợi, Dùng 1 lần)', 'cleanroom-mask-2ply-paper', 'ULink Protect', 5, 'Khẩu trang giấy siêu nhẹ không dệt 2 lớp ngăn nước bọt cho công đoạn đóng gói thực phẩm.'),
('published', 'Khẩu trang phòng sạch 3 lớp Kimberly-Clark (Dạng dây buộc sau đầu)', 'cleanroom-mask-tie-on', 'Kimberly-Clark', 5, 'Khẩu trang phòng sạch 3 lớp dạng dây buộc chắc chắn tránh đau tai khi đeo làm ca 12 tiếng.'),
('published', 'Khẩu trang vải carbon phòng sạch ULink ESD (Giặt tái sử dụng 30+ lần)', 'esd-fabric-washable-mask', 'ULink Protect', 5, 'Khẩu trang vải phòng sạch kẻ ô carbon giặt tái sử dụng 30+ lần tiết kiệm chi phí vận hành.'),
('published', 'Bao che râu tóc phòng sạch Kimberly-Clark PP (Đạt chuẩn vệ sinh GMP)', 'cleanroom-beard-cover-pp', 'Kimberly-Clark', 5, 'Bao che râu tóc nam công nhân phòng sạch đạt chuẩn vệ sinh an toàn thực phẩm GMP.'),
('published', 'Khẩu trang tiệt trùng Kimberly-Clark Sterling (Túi niêm phong đôi)', 'cleanroom-face-mask-ultra-clean', 'Kimberly-Clark Sterling', 5, 'Khẩu trang tiệt trùng hai lớp túi niêm phong dùng cho phòng pha chế thuốc và vắc-xin.'),
('published', 'Mặt nạ bảo hộ nửa mặt 3M 6200 (Silicon dẻo ôm khít, Hai phin lọc)', 'half-face-respirator-3m-6200', '3M', 5, 'Mặt nạ bảo hộ nửa mặt chất liệu silicon dẻo ôm khít cho công nhân làm việc với dung môi hóa chất.'),
('published', 'Tấm lọc bụi mịn P100 3M 2091 (Lọc 99.97% hạt bụi mịn & hơi chì)', 'particulate-filter-3m-2091', '3M', 5, 'Tấm lọc bụi mịn P100 tiêu chuẩn NIOSH lọc 99.97% hạt bụi mịn, khói hàn và hơi bụi chì.'),

-- === DANH MỤC 6: BAO BÌ CÔNG NGHIỆP (industrial-packaging) ===
('published', 'Túi nhôm chống tĩnh điện Desco ESD Shielding Bag (Khóa Zip/Miệng dán)', 'esd-shielding-bag', 'Desco', 6, 'Túi nhôm màng 4 lớp che chắn điện từ trường hoàn hảo cho bo mạch linh kiện bán dẫn.'),
('published', 'Màng PE quấn pallet ULink Pack LLDPE (Co giãn 300%, Dày 20mic)', 'pe-stretch-wrap', 'ULink Pack', 6, 'Màng LLDPE dẻo dai bọc lót kiện hàng xuất khẩu chống bụi, chống nước mưa và giữ cố định pallet.'),
('published', 'Thùng nhựa Danpla PP sóng ULink Pack ESD (Có nắp cài, Chống va đập)', 'danpla-esd-box', 'ULink Pack', 6, 'Thùng nhựa PP sóng dẻo dai nhẹ chống va đập và ngăn dòng tĩnh điện bảo vệ bo mạch khi luân chuyển kho.'),
('published', 'Cuộn màng xốp hơi bóp nổ ULink Pink ESD (1.2m x 100m, Chống sốc)', 'esd-bubble-wrap-roll', 'ULink Pack', 6, 'Màng xốp hơi bóp nổ màu hồng ESD chèn lót hàng hóa tránh trầy xước và va đập chấn động.'),
('published', 'Túi nhôm hút chân không 3 lớp Desco (Bảo quản chip bán dẫn cao cấp)', 'aluminum-foil-vacuum-bag', 'Desco', 6, 'Túi nhôm ép 3 lớp cách ly hoàn toàn độ ẩm và không khí cho vi mạch cao cấp.'),
('published', 'Túi chống ẩm & tĩnh điện Desco Dry-Shield MBB (Dày 150 micron, J-STD-033)', 'esd-moisture-barrier-bag', 'Desco Dry-Shield', 6, 'Túi MBB độ dày 150 micron chuyên đóng gói chip SMD đạt tiêu chuẩn IPC/JEDEC J-STD-033.'),
('published', 'Tấm xốp định hình EPE ULink Pink ESD (Dày 10mm, Cắt CNC khuôn mạch)', 'epe-foam-sheet-anti-static', 'ULink Pack', 6, 'Mút xốp PE bọt biển dẻo đàn hồi cắt CNC làm khay chứa bo mạch điện tử không làm xước vỏ máy.'),
('published', 'Dây đai nhựa PET ULink Pack (Bản 16mm, Lực kéo đứt 450kgf xuất khẩu)', 'strapping-band-pet-green', 'ULink Pack', 6, 'Dây đai nhựa PET màu xanh lá lực kéo đứt 450kg siết chặt kiện hàng xuất khẩu đường biển.'),
('published', 'Thanh nẹp góc carton ULink Pack 5 lớp (L 50x50x4mm, Bảo vệ pallet)', 'edge-protector-cardboard', 'ULink Pack', 6, 'Thanh nẹp góc carton ép chặt 5 lớp giúp gia cố cạnh góc thùng hàng không bị sụp móp khi đai siết.'),
('published', 'Thẻ báo độ ẩm 6 nấc Desco HIC (Chỉ thị 10%-60% RH trong túi MBB)', 'humidity-indicator-card-6dot', 'Desco HIC', 6, 'Thẻ chỉ thị độ ẩm 6 mức (10% đến 60% RH) thả vào túi nhôm hút chân không kiểm tra rò rỉ độ ẩm.'),

-- === DANH MỤC 7: VẬT TƯ ESD (esd-supplies) ===
('published', 'Dây đeo cổ tay chống tĩnh điện 3M Wrist Strap (Tích hợp điện trở 1MΩ)', 'esd-wrist-strap', '3M', 7, 'Dây vòng tay giải phóng dòng điện tích trên cơ thể công nhân xuống hệ thống nối đất an toàn.'),
('published', 'Thảm cao su chống tĩnh điện 3M ESD 2 lớp (Xanh/Đen, Dày 2mm x 1m x 10m)', 'esd-table-mat-2layer', '3M', 7, 'Thảm trải bàn thao tác 2 lớp: lớp mặt xanh tiêu tán tĩnh điện và lớp đáy đen dẫn điện.'),
('published', 'Quạt phát ion khử tĩnh điện 3M Ionizer Fan (Khử nạp tĩnh điện <1.5s)', 'desktop-ionizer-fan-2fan', '3M', 7, 'Quạt phát ion cao thế cân bằng điện thế khử nạp tĩnh điện trên bề mặt nhựa và linh kiện khô nhanh chóng.'),
('published', 'Bộ nhíp inox chống tĩnh điện Vetus ESD-10 đến ESD-15 (Sơn phủ ESD)', 'esd-stainless-tweezers-set', 'Vetus', 7, 'Bộ nhíp inox sơn phủ lớp sơn chống tĩnh điện màu đen gắp IC và chip nhỏ chính xác không bị nhiễm từ.'),
('published', 'Thảm cao su trải sàn nhà xưởng 3M ESD (Dày 3mm, Chịu tải xe nâng)', 'esd-floor-rubber-mat', '3M', 7, 'Thảm cao su trải sàn phòng sạch chịu tải trọng xe đẩy và xe nâng nhẹ, điện trở 10^6 - 10^9 Ω.'),
('published', 'Thiết bị đo điện trở bề mặt Desco 19290 Megohmmeter (Kèm 2 quả nặng 2.27kg)', 'surface-resistivity-meter', 'Desco 19290', 7, 'Máy đo điện trở bề mặt tiêu chuẩn ANSI/ESD S20.20 hiển thị số LCD kiểm định định kỳ vật tư ESD.'),
('published', 'Dây nối đất thảm tĩnh điện 3M Grounding Cord (Củ tròn 10mm, Dây xoắn 2.4m)', 'esd-grounding-cord-snap', '3M', 7, 'Dây tiếp địa kết nối thảm cao su với thanh cái đồng nối đất nhà xưởng điện trở bảo vệ 1MΩ.'),
('published', 'Khay nhựa đựng linh kiện SMT ULink Pack ESD (12 ngăn tráp xếp chồng)', 'esd-component-organizer-tray', 'ULink Pack', 7, 'Khay nhựa PP đúc màng dẫn điện tĩnh 10^4 - 10^6 Ω đựng chip SMT và vi mạch khi lắp ráp.'),
('published', 'Băng keo dán sàn cảnh báo khu vực EPA 3M 471 (Vàng/Đen in chữ ESD)', 'esd-caution-tape-yellow', '3M 471', 7, 'Băng dán sàn cảnh báo khu vực kiểm soát tĩnh điện EPA màu vàng in biểu tượng bàn tay ESD.'),
('published', 'Dải dán dẫn điện đeo gót giày Desco Heel Grounder (Dùng 1 lần cho khách)', 'esd-heel-grounder-disposable', 'Desco', 7, 'Dải dán dẫn điện đeo gót giày dành cho khách tham quan nhà máy di chuyển trong khu vực EPA.'),

-- === DANH MỤC 8: HÓA CHẤT PHÒNG SẠCH (cleanroom-chemicals) ===
('published', 'Dung dịch cồn IPA 99.9% Techspray Cleanroom Grade (Can 5L / 20L)', 'ipa-cleanroom-grade-999', 'Techspray', 8, 'Dung môi lau rửa bo mạch SMT, thấu kính quang học và khử trùng thiết bị phòng sạch y tế.'),
('published', 'Dung dịch tẩy rửa bo mạch SMT Techspray PCB Cleaner (Không để lại cặn ion)', 'smt-pcb-cleaner-fluid', 'Techspray', 8, 'Dung dịch tẩy rửa chất trợ hàn Flux và nhựa cây bám trên bo mạch điện tử sau khi hàn SMT.'),
('published', 'Keo xịt phủ bảo vệ bo mạch Techspray Conformal Coating (Chống ẩm & muối)', 'conformal-coating-acrylic', 'Techspray', 8, 'Keo xịt phủ bảo vệ mạch điện chống oxy hóa, độ ẩm cao và hơi muối tại các vùng duyên hải.'),
('published', 'Nước lau sàn phòng sạch trung tính Techspray Detergent (pH 7.0)', 'cleanroom-neutral-cleaner-detergent', 'Techspray', 8, 'Nước lau sàn phòng sạch pH 7.0 trung tính không chứa ion Natri/Kali bám bẩn thảm cao su ESD.'),
('published', 'Dung dịch tẩy keo kem hàn Stencil SMT Cleaner Techspray (Chai 500ml)', 'stencil-cleaning-fluid-smt', 'Techspray', 8, 'Hóa chất chuyên dụng lau rửa tấm mặt nạ Stencil in keo kem hàn SMT tự động.'),
('published', 'Chai xịt tẩy rửa nhựa thông & Flux hàn Techspray E-LINE (Dung tích 400ml)', 'flux-remover-spray-400ml', 'Techspray E-LINE', 8, 'Chai xịt tẩy mảng bám nhựa thông và Flux hàn khô nhanh cho thợ sửa chữa điện tử.'),
('published', 'Dung dịch lau kính & bề mặt chống bám tĩnh điện Techspray Static Free', 'antistatic-surface-cleaner-spray', 'Techspray', 8, 'Nước lau kính và mica防静电 ngăn hút bụi tĩnh điện trên mặt kính máy soi ngoại quan.'),
('published', 'Nước cất tiệt trùng khử ion DI Water ULink Chem (Điện trở 18.2 MΩ.cm)', 'deionized-di-water-cleanroom', 'ULink Chem', 8, 'Nước khử ion siêu tinh khiết DI Water điện trở 18.2 MΩ.cm pha dung dịch và rửa ống nghiệm.'),
('published', 'Solvent tẩy rửa dầu mỡ máy móc công nghiệp Techspray (An toàn, Khô nhanh)', 'degreaser-solvent-industrial', 'Techspray', 8, 'Hóa chất tẩy dầu mỡ bôi trơn bánh răng máy móc tự động không gây cháy nổ.'),
('published', 'Chai xịt vệ sinh tiếp điểm điện 3M Contact Cleaner 16oz (Không dẫn điện)', 'contact-cleaner-spray-3m', '3M', 8, 'Dung dịch xịt vệ sinh điểm tiếp xúc công tắc, relay và rắc cắm điện không dẫn điện.')
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name, 
  brand = EXCLUDED.brand, 
  category = EXCLUDED.category, 
  short_description = EXCLUDED.short_description;
