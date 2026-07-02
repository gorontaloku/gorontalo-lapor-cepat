import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

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
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Layanan AI belum dikonfigurasi.");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const system = `Anda adalah penulis laporan resmi untuk pegawai Badan Narkotika Nasional (BNN) Kabupaten Gorontalo. Tugas Anda menyusun bagian "HASIL KEGIATAN" pada laporan resmi instansi pemerintah Indonesia.

ATURAN WAJIB:
- Hasilkan tepat 2 sampai 3 paragraf naratif.
- HANYA gunakan fakta yang tersedia dalam data yang diberikan. DILARANG mengarang, menambah nama orang, angka, tempat, hasil, atau kesimpulan yang tidak ada pada input.
- Gunakan bahasa Indonesia formal ragam instansi pemerintah, sesuai EYD.
- DILARANG menggunakan emoji, tanda bintang, bullet, penomoran, judul, salam pembuka, atau tanda kutip.
- Keluarkan hanya teks paragraf, tanpa label seperti "Paragraf 1".
- Paragraf pertama WAJIB dimulai persis dengan kalimat: "Pada hari ini telah dilaksanakan"
- Paragraf pertama menjelaskan: kegiatan, waktu/tanggal, lokasi, pelaksana (secara umum, misal "tim dari {seksi}"), dan tujuan kegiatan.
- Paragraf kedua (dan opsional ketiga) menjelaskan: hasil yang dicapai, manfaat, serta tindak lanjut atau harapan.
- Jaga panjang wajar (kurang lebih 120–220 kata total).`;

    const meta = [
      data.namaKegiatan ? `Nama Kegiatan: ${data.namaKegiatan}` : null,
      data.hariTanggal ? `Hari/Tanggal: ${data.hariTanggal}` : null,
      data.jam ? `Jam: ${data.jam}` : null,
      data.tempat?.length ? `Tempat: ${data.tempat.join("; ")}` : null,
      data.pelaksana?.length ? `Pelaksana: ${data.pelaksana.join("; ")}` : null,
      data.seksi ? `Seksi: ${data.seksi}` : null,
      data.sumberDana ? `Sumber Dana: ${data.sumberDana}` : null,
    ].filter(Boolean).join("\n");

    const userMsg = `DATA LAPORAN:
${meta}

POIN-POIN HASIL KEGIATAN (dari pengguna):
${data.poin}

Susun bagian HASIL KEGIATAN mengikuti seluruh aturan di atas. Hanya keluarkan paragraf-paragraf naratifnya.`;

    const { text } = await generateText({
      model,
      system,
      prompt: userMsg,
    });

    return { text: text.trim() };
  });
