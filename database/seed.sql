
-- Insert profile
INSERT INTO profiles (id, full_name, email, phone, company_name, website, address, bank_account, bio, income_categories, expense_categories, project_types, event_types, notification_settings, security_settings) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Admin Vena',
    'admin@venapictures.com',
    '081234567890',
    'Vena Pictures',
    'https://venapictures.com',
    'Jl. Raya Fotografi No. 123, Jakarta, Indonesia',
    'BCA 1234567890 a/n Vena Pictures',
    'Vendor fotografi pernikahan profesional dengan spesialisasi pada momen-momen otentik dan sinematik.',
    '["DP Proyek", "Pelunasan Proyek", "Penjualan Album", "Sewa Alat", "Lain-lain"]',
    '["Gaji Freelancer", "Hadiah Freelancer", "Penarikan Hadiah Freelancer", "Sewa Tempat", "Transportasi", "Konsumsi", "Marketing", "Sewa Alat", "Cetak Album", "Operasional Kantor", "Transfer Antar Kantong", "Penutupan Anggaran"]',
    '["Pernikahan", "Pre-wedding", "Lamaran", "Acara Korporat", "Ulang Tahun"]',
    '["Meeting Klien", "Survey Lokasi", "Libur", "Workshop", "Lainnya"]',
    '{"newProject": true, "paymentConfirmation": true, "deadlineReminder": true}',
    '{"twoFactorEnabled": false}'
);

-- Insert clients
INSERT INTO clients (id, name, email, phone, since, instagram, status, last_contact) VALUES
('cli001', 'Andi & Siska', 'andi.siska@email.com', '081111111111', '2024-10-15', '@andisiska', 'Aktif', '2024-12-26'),
('cli002', 'Budi Santoso', 'budi.s@email.com', '082222222222', '2024-08-20', '@budisan', 'Aktif', '2024-11-21'),
('cli003', 'Citra Lestari', 'citra.l@email.com', '083333333333', '2024-12-05', '@citralestari', 'Aktif', '2024-12-21'),
('cli004', 'Dewi Anggraini', 'dewi.a@email.com', '084444444444', '2024-03-01', null, 'Tidak Aktif', '2024-06-01'),
('cli005', 'Eko Prasetyo', 'eko.p@email.com', '085555555555', '2024-12-19', '@ekopras', 'Aktif', '2024-12-29');

-- Insert leads
INSERT INTO leads (id, name, contact_channel, location, status, date, notes) VALUES
('lead001', 'Fajar Nugraha', 'Instagram', 'Jakarta', 'Baru Masuk', '2024-12-29'),
('lead002', 'Gita Permata', 'WhatsApp', 'Bandung', 'Sedang Diskusi', '2024-12-26'),
('lead003', 'Hendra Wijaya', 'Referensi', 'Surabaya', 'Menunggu Follow Up', '2024-12-23'),
('lead004', 'Indah Sari', 'Website', 'Jakarta', 'Ditolak', '2024-11-15'),
('lead005', 'Joko Anwar', 'Instagram', 'Bali', 'Dikonversi', '2024-10-10');

-- Insert packages
INSERT INTO packages (id, name, price, description) VALUES
('pkg001', 'Paket Silver', 15000000, '2 Fotografer, 1 Videografer, Album Cetak, 8 Jam Liputan'),
('pkg002', 'Paket Gold', 25000000, '2 Fotografer, 2 Videografer, Album Cetak Premium, Same Day Edit, 10 Jam Liputan'),
('pkg003', 'Paket Platinum', 40000000, '3 Fotografer, 3 Videografer, Album Kustom, SDE, Drone, 12 Jam Liputan');

-- Insert addons
INSERT INTO addons (id, name, price) VALUES
('add001', 'Same Day Edit Video', 3500000),
('add002', 'Sewa Drone', 2000000),
('add003', 'Cetak Kanvas 60x40', 750000),
('add004', 'Jam Liputan Tambahan', 1000000);

-- Insert team members
INSERT INTO team_members (id, name, role, email, phone, standard_fee, reward_balance) VALUES
('tm001', 'Bambang Sudiro', 'Fotografer', 'bambang@photographer.com', '081211112222', 1500000, 500000),
('tm002', 'Siti Aminah', 'Fotografer', 'siti@photographer.com', '081233334444', 1500000, 250000),
('tm003', 'Rahmat Hidayat', 'Videografer', 'rahmat@videographer.com', '081255556666', 2000000, 0),
('tm004', 'Dewi Anjani', 'Editor', 'dewi@editor.com', '081277778888', 1000000, 750000),
('tm005', 'Agung Perkasa', 'Videografer', 'agung@videographer.com', '081299990000', 2000000, 100000);

-- Insert financial pockets
INSERT INTO financial_pockets (id, name, description, icon, type, amount, goal_amount, lock_end_date) VALUES
('poc001', 'Dana Darurat', 'Untuk keperluan tak terduga', 'piggy-bank', 'Nabung & Bayar', 15000000, 50000000, null),
('poc002', 'Beli Kamera Baru', 'Upgrade ke Sony A7IV', 'lock', 'Terkunci', 5000000, 35000000, '2025-07-01'),
('poc003', 'Anggaran Operasional Bulanan', 'Budget untuk pengeluaran rutin', 'clipboard-list', 'Anggaran Pengeluaran', 0, 5000000, null);

-- Insert projects
INSERT INTO projects (id, project_name, client_name, client_id, project_type, package_name, package_id, addons, date, deadline_date, location, progress, status, total_cost, amount_paid, payment_status, team) VALUES
('prj001', 'Pernikahan Andi & Siska', 'Andi & Siska', 'cli001', 'Pernikahan', 'Paket Gold', 'pkg002', '[{"id": "add002", "name": "Sewa Drone", "price": 2000000}]', '2025-02-10', '2025-03-10', 'Hotel Mulia, Jakarta', 25, 'Dikonfirmasi', 27000000, 10000000, 'DP Terbayar', '[{"memberId": "tm001", "name": "Bambang Sudiro", "role": "Fotografer", "fee": 1500000, "reward": 200000}, {"memberId": "tm003", "name": "Rahmat Hidayat", "role": "Videografer", "fee": 2000000, "reward": 250000}]'),
('prj002', 'Prewedding Budi & Rekan', 'Budi Santoso', 'cli002', 'Pre-wedding', 'Paket Silver', 'pkg001', '[]', '2024-11-25', '2024-12-25', 'Bromo, Jawa Timur', 100, 'Selesai', 15000000, 15000000, 'Lunas', '[{"memberId": "tm002", "name": "Siti Aminah", "role": "Fotografer", "fee": 2000000, "reward": 250000}]'),
('prj003', 'Lamaran Citra', 'Citra Lestari', 'cli003', 'Lamaran', 'Paket Silver', 'pkg001', '[]', '2024-12-20', '2025-01-20', 'Bandung', 70, 'Editing', 15000000, 15000000, 'Lunas', '[{"memberId": "tm001", "name": "Bambang Sudiro", "role": "Fotografer", "fee": 1500000, "reward": 150000}]'),
('prj004', 'Event Perusahaan Dewi', 'Dewi Anggraini', 'cli004', 'Acara Korporat', 'Paket Gold', 'pkg002', '[]', '2024-05-05', '2024-06-05', 'Bali', 100, 'Selesai', 25000000, 25000000, 'Lunas', '[]'),
('prj005', 'Pernikahan Eko & Pasangan', 'Eko Prasetyo', 'cli005', 'Pernikahan', 'Paket Platinum', 'pkg003', '[{"id": "add001", "name": "Same Day Edit Video", "price": 3500000}, {"id": "add002", "name": "Sewa Drone", "price": 2000000}, {"id": "add003", "name": "Cetak Kanvas 60x40", "price": 750000}]', '2025-03-15', null, 'Surabaya', 0, 'Persiapan', 46250000, 0, 'Belum Bayar', '[]');

-- Insert transactions
INSERT INTO transactions (id, date, description, amount, type, project_id, category, method, pocket_id) VALUES
('trn001', '2024-11-01', 'DP Proyek Prewedding Budi', 7500000, 'Pemasukan', 'prj002', 'DP Proyek', 'Transfer Bank', null),
('trn002', '2024-11-20', 'Pelunasan Proyek Prewedding Budi', 7500000, 'Pemasukan', 'prj002', 'Pelunasan Proyek', 'Transfer Bank', null),
('trn003', '2024-11-22', 'Gaji Freelancer Siti Aminah - Proyek Budi', 2000000, 'Pengeluaran', 'prj002', 'Gaji Freelancer', 'Transfer Bank', 'poc003'),
('trn004', '2024-11-23', 'Transportasi & Akomodasi Bromo', 2500000, 'Pengeluaran', 'prj002', 'Transportasi', 'Tunai', 'poc003'),
('trn005', '2024-12-01', 'DP Proyek Lamaran Citra', 7500000, 'Pemasukan', 'prj003', 'DP Proyek', 'Transfer Bank', null),
('trn006', '2024-12-18', 'Pelunasan Proyek Lamaran Citra', 7500000, 'Pemasukan', 'prj003', 'Pelunasan Proyek', 'Transfer Bank', null),
('trn007', '2024-12-11', 'DP Proyek Pernikahan Andi & Siska', 10000000, 'Pemasukan', 'prj001', 'DP Proyek', 'Transfer Bank', null),
('trn008', '2024-12-16', 'Biaya Iklan Instagram', 500000, 'Pengeluaran', null, 'Marketing', 'E-Wallet', 'poc003'),
('trn009', '2024-12-29', 'Sewa Studio Foto', 1000000, 'Pengeluaran', null, 'Sewa Tempat', 'Transfer Bank', 'poc003'),
('trn010', '2024-10-01', 'Transfer ke Dana Darurat', 5000000, 'Pengeluaran', null, 'Transfer Antar Kantong', 'Sistem', null),
('trn011', '2024-11-01', 'Transfer ke Beli Kamera Baru', 2000000, 'Pengeluaran', null, 'Transfer Antar Kantong', 'Sistem', null);

-- Insert team project payments
INSERT INTO team_project_payments (id, project_id, team_member_name, team_member_id, date, status, fee, reward) VALUES
('tpp-prj001-tm001', 'prj001', 'Bambang Sudiro', 'tm001', '2025-02-10', 'Unpaid', 1500000, 200000),
('tpp-prj001-tm003', 'prj001', 'Rahmat Hidayat', 'tm003', '2025-02-10', 'Unpaid', 2000000, 250000),
('tpp-prj002-tm002', 'prj002', 'Siti Aminah', 'tm002', '2024-11-25', 'Paid', 2000000, 250000),
('tpp-prj003-tm001', 'prj003', 'Bambang Sudiro', 'tm001', '2024-12-20', 'Unpaid', 1500000, 150000);

-- Insert team payment records
INSERT INTO team_payment_records (id, record_number, team_member_id, date, project_payment_ids, total_amount) VALUES
('tpr001', 'PAY-FR-TM002-1234', 'tm002', '2024-11-22', '["tpp-prj002-tm002"]', 2000000);

-- Insert reward ledger entries
INSERT INTO reward_ledger_entries (id, team_member_id, date, description, amount, project_id) VALUES
('rle-001', 'tm002', '2024-11-22', 'Hadiah dari proyek: Prewedding Budi & Rekan', 250000, 'prj002'),
('rle-002', 'tm001', '2024-09-05', 'Hadiah dari proyek: Pernikahan Fajar & Gita', 300000, 'prj-old-1'),
('rle-003', 'tm001', '2024-10-10', 'Hadiah dari proyek: Event Korporat XYZ', 200000, 'prj-old-2'),
('rle-004', 'tm004', '2024-11-01', 'Hadiah dari proyek: Editing Video Kompilasi', 750000, 'prj-old-3'),
('rle-005', 'tm005', '2024-11-15', 'Hadiah dari proyek: Video Teaser Pernikahan', 100000, 'prj-old-4');
