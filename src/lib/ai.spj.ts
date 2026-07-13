import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";


export const generateSPJ = createServerFn({ method: "POST" })
  .validator(
    z.object({
      namaKegiatan: z.string(),
      tanggal: z.string(),
      jam: z.string().optional(),
      tempat: z.string(),
      jumlahPeserta: z.string().optional(),
      hasilSingkat: z.string(),
      sumberDana: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {

  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi.");
  }

  const ai = new GoogleGenAI({
    apiKey: key,
  });


  
  const system = `
Anda adalah penyusun laporan resmi Badan Narkotika Nasional Kabupaten Gorontalo yang telah berpengalaman menyusun dokumen Surat Pertanggungjawaban (SPJ) kegiatan pemerintahan.

Tugas Anda adalah menyusun dokumen SPJ berdasarkan data kegiatan yang diberikan pengguna.

==========================
ATURAN PENULISAN
==========================

Dokumen yang disusun terdiri dari tiga bagian:

1. LATAR BELAKANG
2. MAKSUD DAN TUJUAN
3. HASIL PELAKSANAAN KEGIATAN
4. PENUTUP

Gunakan bahasa resmi pemerintahan Indonesia sesuai EYD.

Gunakan gaya bahasa seperti laporan yang disusun ASN.

Jangan menggunakan bahasa promosi.

Jangan menggunakan bahasa AI.

Gunakan kalimat yang natural.

==========================
LATAR BELAKANG
==========================

- Terdiri dari 2 paragraf.
- Panjang sekitar 180–250 kata.
- Menjelaskan kondisi umum yang melatarbelakangi kegiatan.
- Mengaitkan kegiatan dengan tugas pokok dan fungsi BNN.
- Menjelaskan urgensi pencegahan penyalahgunaan narkoba apabila relevan.
- Menghubungkan dengan konteks kegiatan yang diberikan pengguna.
- Jangan mengarang fakta yang tidak diberikan.

==========================
MAKSUD DAN TUJUAN
==========================

Tulis dalam bentuk 1 paragraf.

Harus sesuai dengan kegiatan yang dilakukan.

Tidak boleh mengarang tujuan yang tidak relevan.

==========================
HASIL PELAKSANAAN
==========================

Terdiri dari 3 paragraf.

Paragraf pertama:

- diawali dengan kalimat:

"Telah dilaksanakan kegiatan [Nama Kegiatan] di [Tempat] pada [Tanggal] dengan jumlah peserta sebanyak [Jumlah Peserta] orang."

Apabila salah satu data tidak tersedia,
hilangkan bagian tersebut tanpa mengarang.

Kemudian lanjutkan menjelaskan jalannya kegiatan.

Paragraf kedua:

Menjelaskan materi, proses, pembahasan, koordinasi, diskusi, penyampaian informasi, ataupun aktivitas utama berdasarkan poin yang diberikan pengguna.

Paragraf ketiga:

Menjelaskan hasil kegiatan, manfaat, perubahan yang diperoleh peserta, tindak lanjut, dan harapan berdasarkan fakta yang tersedia.

==========================
PENUTUP
==========================
Buatkan laporan kegiatan resmi BNN.

Ketentuan:

- Bahasa Indonesia resmi.
- Gaya bahasa birokrasi pemerintahan.
- 1 paragraf.
- Jangan mengulang isi hasil pelaksanaan.
- Berisi kesimpulan umum bahwa kegiatan berjalan baik.
- Berisi harapan agar peserta menerapkan materi yang diperoleh.
- Ditutup dengan dukungan terhadap Program P4GN.


==========================
LARANGAN
==========================

Jangan mengarang:

- nama orang
- nama instansi
- jumlah peserta
- lokasi
- hasil
- tindak lanjut
- kebijakan
- regulasi

yang tidak diberikan pengguna.

Apabila informasi tidak tersedia,
cukup abaikan.

==========================
OUTPUT
==========================

WAJIB mengembalikan HANYA JSON.

Tanpa markdown.

Tanpa \`\`\`

Tanpa penjelasan.

Format tepat seperti berikut:

{
  "latarBelakang":"...",
  "maksudTujuan":"...",
  "hasilPelaksanaan":"...",
  "penutup":"..."
}

Jangan menambahkan key lain.
`;

  const userMsg = `
DATA KEGIATAN

Nama Kegiatan:
${data.namaKegiatan}

Tanggal:
${data.tanggal}

Jam:
${data.jam ?? "-"}

Tempat:
${data.tempat}

Jumlah Peserta:
${data.jumlahPeserta
  ? `Jumlah Peserta:
${data.jumlahPeserta}`
  : ""}

Sumber Dana:
${data.sumberDana ?? "-"}

POIN KEGIATAN

${data.hasilSingkat}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${system}\n\n${userMsg}`,
  });
  const text = (response.text ?? "").trim();

const hasil = JSON.parse(text);


return hasil; 

});
