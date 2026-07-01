import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";

export interface LaporanData {
  nama_kegiatan: string;
  tanggal: string; // yyyy-mm-dd
  jam: string | null; // HH:mm
  tempat: string[];
  pelaksana: { nama: string; pangkat?: string | null; nip?: string | null }[];
  seksi: string | null;
  hasil_kegiatan: string | null;
  sumber_dana: string | null;
}

export function formatTanggalIndo(tanggal: string): string {
  try {
    const d = tanggal.includes("T") ? parseISO(tanggal) : parseISO(tanggal + "T00:00:00");
    return format(d, "EEEE, dd MMMM yyyy", { locale: idLocale });
  } catch {
    return tanggal;
  }
}

export function buildLaporanText(l: LaporanData, opts?: { namaKepala?: string }): string {
  const kepala = opts?.namaKepala || "Kepala BNNK Gorontalo";
  const seksi = l.seksi || "-";
  const hari = formatTanggalIndo(l.tanggal);
  const jam = l.jam ? `${l.jam} WITA` : "-";
  const tempat = l.tempat.length
    ? l.tempat.map((t) => `- ${t}`).join("\n")
    : "-";
  const pelaksana = l.pelaksana.length
    ? l.pelaksana
        .map((p, i) => {
          const detail = [p.pangkat, p.nip].filter(Boolean).join(" / ");
          return `${i + 1}. ${p.nama}${detail ? ` (${detail})` : ""}`;
        })
        .join("\n")
    : "-";

  return `Kepada Yth : ${kepala}
Dari       : ${seksi}

A. KEGIATAN
${l.nama_kegiatan}

B. WAKTU & TEMPAT
Hari/Tanggal : ${hari}
Jam          : ${jam}
Tempat       :
${tempat}

C. PELAKSANA
${pelaksana}

D. HASIL KEGIATAN
${l.hasil_kegiatan?.trim() || "-"}

E. SUMBER DANA
${l.sumber_dana || "-"}

#IndonesiaBersinar`;
}

export function buildWhatsAppUrl(text: string, phone?: string): string {
  const encoded = encodeURIComponent(text);
  const cleaned = phone?.replace(/\D/g, "");
  const prefix = cleaned ? `https://wa.me/${cleaned}` : `https://wa.me/`;
  return `${prefix}?text=${encoded}`;
}
