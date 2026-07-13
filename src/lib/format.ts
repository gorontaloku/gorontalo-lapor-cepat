import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";

export interface Pelaksana {
  nama: string;
  gelar?: string | null;
  jabatan?: string | null;
  pangkat?: string | null;
  nip?: string | null;
}

export interface LaporanData {
  nama_kegiatan: string;
  jenis_kegiatan?: string | null;
  tanggal: string;
  jam: string | null;
  tempat: string[];
  pelaksana: Pelaksana[];
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

export function namaWithGelar(p: Pelaksana): string {
  const gelar = p.gelar?.trim();
  return gelar ? `${p.nama}, ${gelar}` : p.nama;
}

export function buildLaporanText(l: LaporanData, opts?: { namaKepala?: string }): string {
  const kepala = opts?.namaKepala || "Kepala BNNK Gorontalo";
  const seksi = l.seksi || "-";
  const hari = formatTanggalIndo(l.tanggal);
  const jam = l.jam ? `${l.jam} WITA` : "-";
  const tempat = l.tempat.length ? l.tempat.map((t) => `- ${t}`).join("\n") : "-";
  const pelaksana = l.pelaksana.length
    ? l.pelaksana
        .map((p, i) => {
          const jab = p.jabatan?.trim();
          return `${i + 1}. ${namaWithGelar(p)}${jab ? ` (${jab})` : ""}`;
        })
        .join("\n")
    : "-";

  return `*Kepada Yth : ${kepala}*
*Dari : ${seksi}*

*A. KEGIATAN*
${l.nama_kegiatan || "-"}

*B. WAKTU & TEMPAT*
Hari/Tanggal : ${hari}
Jam : ${jam}
Tempat :
${tempat}

*C. PELAKSANA*
${pelaksana}

*D. HASIL KEGIATAN*
${l.hasil_kegiatan?.trim() || "-"}

*E. SUMBER DANA*
${l.sumber_dana || "-"}

#IndonesiaBersinar`;
}

export function buildWhatsAppUrl(text: string, phone?: string): string {
  const encoded = encodeURIComponent(text);
  const cleaned = phone?.replace(/\D/g, "");
  const prefix = cleaned ? `https://wa.me/${cleaned}` : `https://wa.me/`;
  return `${prefix}?text=${encoded}`;
}

export const JENIS_KEGIATAN = [
  "Sosialisasi",
  "Koordinasi",
  "Audiensi",
  "Rapat",
  "Tes Urine",
  "Monitoring",
  "Asistensi",
  "Jumat Bersinar",
  "Lainnya",
] as const;

export type JenisKegiatan = (typeof JENIS_KEGIATAN)[number];

export function formatHariTanggal(tanggal: string) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function tanggalPlusSatu(tanggal: string) {
  const d = new Date(tanggal);

  d.setDate(d.getDate() + 1);

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}