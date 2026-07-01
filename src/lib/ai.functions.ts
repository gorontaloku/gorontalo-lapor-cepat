import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  poin: z.string().min(1),
  namaKegiatan: z.string().optional(),
  tempat: z.array(z.string()).optional(),
});

export const generateHasilKegiatan = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => InputSchema.parse(raw))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Layanan AI belum dikonfigurasi.");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const system = `Anda adalah asisten penulis laporan resmi untuk pegawai Badan Narkotika Nasional (BNN) Kabupaten Gorontalo. Tugas Anda mengubah poin-poin singkat menjadi narasi laporan resmi instansi pemerintah Indonesia yang formal, jelas, dan padat. Aturan:
- Tulis 2 sampai 3 paragraf.
- Gunakan bahasa formal instansi pemerintah Indonesia (baku, EYD).
- Jangan menambahkan informasi yang tidak ada di poin.
- Hindari bullet point; keluarkan hanya paragraf naratif.
- Jangan sertakan judul, salam pembuka, atau tanda kutip. Cukup isi hasil kegiatan.`;

    const userMsg = [
      data.namaKegiatan ? `Nama Kegiatan: ${data.namaKegiatan}` : null,
      data.tempat?.length ? `Tempat: ${data.tempat.join(", ")}` : null,
      `Poin-poin hasil:\n${data.poin}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const { text } = await generateText({
      model,
      system,
      prompt: userMsg,
    });

    return { text: text.trim() };
  });
