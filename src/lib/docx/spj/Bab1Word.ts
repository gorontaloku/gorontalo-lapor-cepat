import { bab, isi, nomor, subBab } from "./Builder";

export function Bab1({ laporan }: any) {
  let maksudTujuan: string[] = [];

  if (Array.isArray(laporan.maksud_tujuan)) {
    maksudTujuan = laporan.maksud_tujuan;
  } else if (typeof laporan.maksud_tujuan === "string") {
    try {
      maksudTujuan = JSON.parse(laporan.maksud_tujuan);
    } catch {
      maksudTujuan = [laporan.maksud_tujuan];
    }
  }

  return [
    ...bab("BAB I", "PENDAHULUAN"),

    subBab("A. LATAR BELAKANG"),

    isi(laporan.latar_belakang ?? ""),

    subBab("B. DASAR PENYELENGGARAAN KEGIATAN"),

    ...nomor([
      "Undang-Undang Nomor 35 Tahun 2009 tentang Narkotika.",
      "Peraturan Presiden Nomor 47 Tahun 2019 tentang Perubahan atas Peraturan Presiden Nomor 23 Tahun 2010 tentang Badan Narkotika Nasional.",
      `DIPA BNN Kabupaten Gorontalo Tahun Anggaran ${new Date(
        laporan.tanggal
      ).getFullYear()}.`,
      ...(laporan.no_sp
        ? [`Surat Perintah Nomor ${laporan.no_sp}.`]
        : []),
    ]),

    subBab("C. MAKSUD DAN TUJUAN"),

    ...maksudTujuan.map((item) => isi(item)),
  ];
}