# Presentasi: Sectoolkit - Web Penetration Testing Framework

## Slide 1: Pengenalan Sectoolkit
- **Apa itu Sectoolkit?**
  Platform uji penetrasi web komprehensif yang dirancang untuk mempermudah alur kerja pentesting.
- **Tujuan Utama:** 
  Mengubah puluhan tools pentest yang awalnya berbasis Command-Line Interface (CLI) menjadi antarmuka grafis (GUI) yang interaktif, dan menggabungkannya di dalam satu platform terpusat.
- **Arsitektur Berbasis Microservices:** 
  Dibangun menggunakan lingkungan terisolasi dengan Docker Compose:
  1. **Frontend & Backend:** Next.js (Port 3000)
  2. **Database:** PostgreSQL (Port 5432)
  3. **Mesin Pemindai (Scanner):** Flask API berjalan di atas sistem operasi Kali Linux (Port 5000)

## Slide 2: Nilai Utama (Core Value) Aplikasi
- **Sentralisasi Tools:** Menggabungkan berbagai alat uji keamanan web ke dalam satu tempat, sehingga pengujian dapat dilakukan secara terpadu.
- **Kemudahan Penggunaan:** Menghadirkan antarmuka berbasis web (GUI) agar operasional alat pentesting CLI menjadi lebih praktis tanpa harus sering berpindah antar terminal.

## Slide 3: Daftar Fitur Tools dalam Aplikasi
Sectoolkit mengorganisir fiturnya ke dalam 4 kategori:

**🔍 Reconnaissance (Pengintaian):**
Whois Lookup, Google Dork, Subdomain Finder, Nmap Scanner, DNS Recon, WAF Detector, URL Crawler [FUZZ], Deep URL Crawler, Wayback Machine Dorking, Web Parameter Enumerator

**💥 Exploitation (Eksploitasi):**
URL Fuzzer, XSS Exploiter, SQL Map, CORS Misc Scanner, Open Redirect Exploiter, LFI Exploiter, Subdomain Takeover, Security Headers Checker

**🚨 Vulnerability Scanning:**
Nuclei Scan

**🛠️ Utilities:**
JWT Debugger, Decoder/Encoder, CVSS Scoring

## Slide 4: Fitur Reconnaissance (Pengintaian Target)
- **Whois Lookup** *(menggunakan: whois)*
  Melacak informasi kepemilikan dan registrasi suatu domain atau alamat IP, termasuk data kontak pemilik dan tanggal registrasi.
- **Google Dork** *(fitur bawaan, tanpa tools CLI)*
  Menghasilkan kueri pencarian khusus Google untuk menemukan informasi sensitif yang tidak sengaja terekspos ke internet.
- **Subdomain Finder** *(menggunakan: assetfinder + httpx)*
  Mencari dan mendaftar subdomain-subdomain tersembunyi milik target domain, lalu memverifikasi status aktif tiap subdomain secara otomatis.
- **Nmap Scanner** *(menggunakan: nmap)*
  Melakukan pemetaan jaringan secara menyeluruh untuk mengetahui port-port yang terbuka dan layanan yang berjalan pada target.
- **DNS Recon** *(menggunakan: dnsrecon)*
  Menelusuri seluruh rekaman DNS (A, MX, TXT, NS, dll.) untuk mendapatkan gambaran infrastruktur domain target.
- **WAF Detector** *(menggunakan: wafw00f)*
  Mendeteksi keberadaan dan jenis *Web Application Firewall* (WAF) yang melindungi target sebelum memulai pengujian lebih dalam.

## Slide 5: Fitur Reconnaissance – URL & Parameter Discovery
- **URL Crawler [FUZZ]** *(menggunakan: paramspider)*
  Merayapi (*crawling*) arsip internet untuk mengumpulkan URL-URL milik target yang mengandung parameter, kemudian mengolahnya ke dalam format siap-uji (fuzzing format) yang dapat langsung dimanfaatkan oleh pemindai eksploit.
- **Deep URL Crawler** *(menggunakan: katana)*
  Melakukan perayapan mendalam (*deep crawl*) secara aktif ke dalam website target, termasuk merayapi konten JavaScript dan request XHR, untuk menemukan *endpoint* tersembunyi dan jalur akses yang tidak terindeks secara publik.
- **Wayback Machine Dorking** *(menggunakan: Wayback Machine CDX API)*
  Menelusuri arsip internet (Wayback Machine) untuk menemukan halaman, endpoint, dan parameter lama yang pernah ada pada target, meski sudah dihapus dari server aktif.
- **Web Parameter Enumerator** *(menggunakan: waybackurls + gau + gf + qsreplace)*
  Menambang parameter GET dari arsip internet dengan berbagai sumber (Wayback Machine & AlienVault OTX), kemudian menyaring hasilnya berdasarkan pola kerentanan tertentu (XSS, SQLi, LFI, dll.) menggunakan pencocokan pola otomatis.

## Slide 6: Fitur Exploitation & Vulnerability Scanning
- **URL Fuzzer** *(menggunakan: ffuf)*
  Melakukan *brute-force* pada jalur direktori dan nama file untuk menemukan halaman, panel admin, dan file tersembunyi di dalam server target.
- **XSS Exploiter** *(menggunakan: dalfox)*
  Secara otomatis menguji dan mengeksploitasi celah *Cross-Site Scripting* (XSS) pada parameter-parameter URL yang ditemukan di target, mendukung payload bawaan maupun payload kustom.
- **SQL Map** *(menggunakan: sqlmap)*
  Menguji secara otomatis apakah parameter pada target rentan terhadap injeksi SQL (*SQL Injection*) dan mencoba mengeksploitasinya untuk mengakses isi database.
- **CORS Misc Scanner** *(menggunakan: corsy)*
  Mengidentifikasi kesalahan konfigurasi pada kebijakan *Cross-Origin Resource Sharing* (CORS) yang berpotensi mengizinkan akses dari domain pihak ketiga yang berbahaya.
- **Open Redirect Exploiter** *(menggunakan: oralyzer)*
  Mendeteksi parameter yang dapat dimanipulasi untuk mengarahkan ulang pengguna ke situs berbahaya (*phishing*).
- **LFI Exploiter** *(menggunakan: loxs)*
  Menguji celah *Local File Inclusion* untuk mencoba membaca file sistem sensitif di server target.
- **Subdomain Takeover** *(menggunakan: subzy)*
  Mengidentifikasi subdomain yang mengarah ke layanan yang sudah tidak aktif, sehingga berpotensi diambil alih oleh pihak lain.
- **Security Headers Checker** *(menggunakan: shcheck)*
  Mengaudit keberadaan dan konfigurasi HTTP Security Headers penting seperti `CSP`, `HSTS`, `X-Frame-Options`, dll.
- **Nuclei Scan** *(menggunakan: gau + urldedupe + gf + nuclei)*
  Menjalankan pipeline pemindaian kerentanan lengkap: mengumpulkan URL dari arsip, menghapus duplikat, menyaring pola kerentanan, lalu mengeksekusi template Nuclei DAST untuk mendeteksi CVE dan miskonfigurasi umum secara otomatis.

## Slide 7: Fitur Utilities Tambahan
*Selain otomasi pemindaian, platform ini menyediakan utilitas harian bawaan untuk kebutuhan pentester:*
- **JWT Debugger** *(fitur bawaan, tanpa tools CLI)*
  Alat untuk memecahkan kode (*decode*), membaca isi klaim, dan memverifikasi token JWT (*JSON Web Token*). Sangat berguna untuk menguji kelemahan pada mekanisme autentikasi berbasis token di aplikasi modern.
- **Decoder/Encoder** *(fitur bawaan, tanpa tools CLI)*
  Alat konversi *string* yang mendukung berbagai skema encoding (Base64, URL Encode, Hex, dll.) untuk mempermudah perancangan dan manipulasi *payload* secara manual.
- **CVSS Scoring** *(fitur bawaan, tanpa tools CLI)*
  Kalkulator interaktif berbasis standar *Common Vulnerability Scoring System* (CVSS) untuk menentukan tingkat keparahan (*severity*: Low/Medium/High/Critical) dari kerentanan yang berhasil ditemukan.

## Slide 8: Fitur Keamanan Database (Centralized Payloads)
- **Penyimpanan Payload Terpusat:** Database aplikasi berfungsi sebagai repositori keamanan sentral yang menyimpan *payload-payload* kerentanan (*Centralized Payloads*).
- **Manajemen Pola (Pattern) Serangan:** Template serangan dari alat otomatis dipusatkan, sehingga selalu termutakhir berdasarkan *payload* di dalam database.
- **Efisiensi Eksploitasi:** *Payload* untuk injeksi berbasis parameter (seperti SQLi, XSS) dipanggil dan didistribusikan secara terstruktur kepada *scanner backend* (Flask), mempercepat proses deteksi celah.

## Slide 9: Kelemahan & Keterbatasan
- **Keterbatasan Cakupan Pemindaian Otomatis:** Platform ini utamanya hanya mampu menemukan kerentanan pada **parameter GET** yang dapat diotomatisasi melalui skrip. Aplikasi **tidak dapat menemukan kerentanan berbasis hak akses (RBAC - Role-Based Access Control) maupun kelemahan pada logika bisnis (Business Logic Flaws)**, karena membutuhkan interaksi dan pemahaman logis dari pentester manusia.
- **Konsumsi Sumber Daya (Resource Intensive):** Menjalankan fitur seperti Nuclei Scan, Nmap Scanner, dan Deep URL Crawler membutuhkan konsumsi RAM dan CPU yang sangat tinggi.
- **Positif Palsu (False Positives):** Hasil dari pemindai otomatis mungkin memunculkan temuan palsu. Diperlukan analisis teknis manual dari pentester untuk memvalidasi temuan.
- **Sangat Bising (Noisy) & Rawan Diblokir:** Aktivitas dari fitur *fuzzing* dan *brute-force* sangat agresif dan mudah terdeteksi, sehingga bisa memicu pemblokiran otomatis oleh WAF atau Cloudflare.

## Slide 10: Kesimpulan
- **Sectoolkit** mempermudah cara kerja auditor keamanan dengan mengintegrasikan berbagai alat uji penetrasi CLI Kali Linux ke dalam antarmuka web GUI yang terpusat dan mudah digunakan.
- Meski sangat membantu dalam otomasi deteksi kerentanan umum, pemahaman mendalam dari seorang pentester (analisis manusia) tetap menjadi hal krusial untuk menemukan celah logika dan mengonfirmasi hasil pengujian.
