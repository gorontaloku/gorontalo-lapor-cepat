import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

const InputSchema = z.object({
  poin: z.string().min(1),
  namaKegiatan: z.string().optional(),
  jenisKegiatan: z.string().optional(),
  hariTanggal: z.string().optional(),
  jam: z.string().optional(),
  tempat: z.array(z.string()).optional(),
  pelaksana: z.array(z.string()).optional(),
  seksi: z.string().optional(),
  sumberDana: z.string().optional(),
  dataDinamis: z.record(z.string(), z.any()).optional(),
});

export const generateHasilKegiatan = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => InputSchema.parse(raw))
  .handler(async ({ data }) => {
        const key = process.env.GEMINI_API_KEY;

      if (!key)
          throw new Error("GEMINI_API_KEY belum dikonfigurasi.");

      const ai = new GoogleGenAI({
          apiKey: key,
      });
      

    const system = `
Anda adalah penulis laporan resmi Badan Narkotika Nasional Kabupaten Gorontalo yang berpengalaman menyusun laporan kegiatan pemerintahan.

Tugas Anda adalah menyusun bagian "HASIL KEGIATAN" berdasarkan data yang diberikan pengguna.

========================
ATURAN WAJIB
========================

1. Tulis tepat 2 paragraf.

2. HASIL KEGIATAN BUKAN merupakan pendahuluan laporan.

3. JANGAN mengulang informasi yang sudah terdapat pada header laporan, seperti:
- nama kegiatan
- jenis kegiatan
- hari/tanggal
- jam
- tempat
- pelaksana
- seksi
- sumber dana

4. DILARANG memulai paragraf dengan kalimat seperti:
- "Pada hari ini telah dilaksanakan..."
- "Telah dilaksanakan..."
- "Pada kesempatan ini..."
- "Kegiatan dilaksanakan..."
- ataupun bentuk pembuka lain yang mengulang informasi kegiatan.

5. Paragraf pertama harus langsung menjelaskan substansi kegiatan berdasarkan poin-poin yang diberikan pengguna, misalnya:
- proses koordinasi
- pembahasan
- sosialisasi
- diskusi
- pendampingan
- monitoring
- asesmen
- rapat
- kunjungan
- kegiatan lapangan
sesuai fakta yang tersedia.

6. Paragraf kedua menjelaskan:
- hasil yang diperoleh
- manfaat kegiatan
- tindak lanjut
- harapan
berdasarkan fakta yang tersedia.

7. Gunakan bahasa resmi instansi pemerintah Indonesia sesuai EYD.

8. Gunakan kalimat yang natural seperti laporan yang ditulis pegawai pemerintah, bukan seperti hasil AI.

9. Variasikan struktur kalimat agar setiap laporan berbeda dan tidak monoton.

10. DILARANG mengarang informasi.

Jangan menambah:
- nama orang
- jumlah peserta
- instansi lain
- hasil
- kesimpulan
- rekomendasi
- tindak lanjut

apabila tidak terdapat pada data yang diberikan.

11. Apabila informasi yang diberikan sedikit, cukup susun laporan berdasarkan informasi tersebut tanpa menambahkan fakta baru.

12. Fokus utama adalah menjelaskan isi kegiatan, bukan menjelaskan bahwa kegiatan tersebut dilaksanakan.

13. Hindari penggunaan kata-kata yang terlalu sering diulang seperti:
"terlaksana",
"diharapkan",
"guna",
"dalam rangka"
kecuali memang diperlukan.

14. Gunakan gaya bahasa formal, ringkas, padat, jelas, dan profesional.

15. Output hanya berupa dua paragraf tanpa judul, tanpa bullet, tanpa penomoran, tanpa tanda kutip, tanpa markdown.

16. Setiap paragraf terdiri dari 4–6 kalimat yang saling berkaitan.

17. Uraikan kegiatan secara naratif sehingga pembaca memperoleh gambaran mengenai jalannya kegiatan.

18. Jangan hanya mengubah poin menjadi kalimat. Kembangkan setiap poin menjadi uraian yang logis tanpa menambahkan fakta baru.

19. Gunakan transisi yang alami seperti:
- Dalam kegiatan tersebut...
- Selama pelaksanaan kegiatan...
- Melalui penyampaian materi...
- Interaksi yang terjalin...
- Berdasarkan hasil diskusi...
- Dari penyampaian materi tersebut...
- Sebagai tindak lanjut...

20. Hindari paragraf yang hanya terdiri dari dua kalimat kecuali data memang sangat terbatas.

21. Target panjang hasil sekitar 180–250 kata.

22. Paragraf pertama WAJIB diawali dengan kalimat pembuka yang merangkum pelaksanaan kegiatan menggunakan format berikut:

"Telah dilaksanakan kegiatan [NAMA KEGIATAN] di [TEMPAT KEGIATAN] dengan jumlah peserta sebanyak [JUMLAH PESERTA] orang."

23. Gunakan data yang diberikan pengguna untuk mengisi:
- Nama kegiatan
- Tempat kegiatan
- Jumlah peserta

24. Apabila salah satu data tersebut tidak tersedia, jangan mengarang. Hilangkan bagian yang tidak diketahui sehingga kalimat tetap natural.

Contoh:
- Jika jumlah peserta tidak tersedia:
  "Telah dilaksanakan kegiatan Sosialisasi Bahaya Penyalahgunaan Narkoba di SDN 1 Bongomeme."

- Jika tempat tidak tersedia:
  "Telah dilaksanakan kegiatan Sosialisasi Bahaya Penyalahgunaan Narkoba dengan jumlah peserta sebanyak 35 orang."

25. Setelah kalimat pembuka tersebut, lanjutkan uraian kegiatan secara naratif tanpa mengulangi kembali nama kegiatan, tempat, maupun jumlah peserta.

26. Kalimat pembuka hanya ditulis satu kali pada awal paragraf pertama.
`;

    const dinamisText = data.dataDinamis
      ? Object.entries(data.dataDinamis)
          .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join("; ") : v}`)
          .join("\n")
      : "";

    const meta = [
      data.namaKegiatan ? `Nama Kegiatan: ${data.namaKegiatan}` : null,
      data.jenisKegiatan ? `Jenis Kegiatan: ${data.jenisKegiatan}` : null,
      data.hariTanggal ? `Hari/Tanggal: ${data.hariTanggal}` : null,
      data.jam ? `Jam: ${data.jam}` : null,
      data.tempat?.length ? `Tempat: ${data.tempat.join("; ")}` : null,
      data.pelaksana?.length ? `Pelaksana: ${data.pelaksana.join("; ")}` : null,
      data.seksi ? `Seksi: ${data.seksi}` : null,
      data.sumberDana ? `Sumber Dana: ${data.sumberDana}` : null,
      dinamisText || null,
    ].filter(Boolean).join("\n");

    const userMsg = `
DATA KEGIATAN

${meta}

POIN HASIL KEGIATAN YANG DIBERIKAN PEGAWAI

${data.poin}

Gunakan seluruh informasi di atas sebagai satu-satunya sumber fakta.

Jangan mengulang informasi yang sudah terdapat pada header laporan.

Susun bagian HASIL KEGIATAN sesuai aturan yang diberikan.

Keluarkan hanya dua paragraf naratif.
`;

    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${system}\n\n${userMsg}`,
});

const text = response.text ?? "";

    return { text: text.trim() };
  });
