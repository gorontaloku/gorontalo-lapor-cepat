import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { formatTanggalIndo, namaWithGelar } from "@/lib/format";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({ id: z.string() });

export const Route = createFileRoute("/laporan/spj")({
  component: SpjPage,
  validateSearch: searchSchema,
});

function SpjPage() {
  const { id } = useSearch({ from: "/laporan/spj" });
  const [urls, setUrls] = useState<string[]>([]);

  const { data: laporan } = useQuery({
    queryKey: ["laporan-spj", id],
    queryFn: async () => (await supabase.from("laporan").select("*").eq("id", id).maybeSingle()).data as any,
  });
  const { data: pengaturan } = useQuery({
    queryKey: ["pengaturan"],
    queryFn: async () => (await supabase.from("pengaturan").select("*").eq("id", 1).maybeSingle()).data as any,
  });

  useEffect(() => {
    const dok: { path: string }[] = laporan?.dokumentasi ?? [];
    if (!dok.length) return;
    (async () => {
      const signed = await Promise.all(
        dok.map(async (d) => (await supabase.storage.from("dokumentasi").createSignedUrl(d.path, 60 * 60 * 6)).data?.signedUrl ?? ""),
      );
      setUrls(signed);
    })();
  }, [laporan?.id]);

  if (!laporan) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const instansi = pengaturan?.nama_instansi ?? "BNN Kabupaten Gorontalo";
  const kepala = pengaturan?.nama_kepala ?? "Kepala BNNK Gorontalo";
  const tempat = (laporan.tempat as string[]) ?? [];
  const pelaksana = (laporan.pelaksana as any[]) ?? [];
  const dd = laporan.data_dinamis ?? {};
  const showSp = !!(laporan.no_sp && laporan.no_sp.trim());

  return (
    <div className="min-h-screen bg-gray-100 py-6 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto space-y-4 print:space-y-0">
        <div className="flex justify-end gap-2 print:hidden">
          <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> Cetak / Simpan PDF</Button>
        </div>

        <style>{`
          @media print {
            .page { page-break-after: always; }
            body { font-family: 'Times New Roman', serif; }
          }
        `}</style>

        {/* COVER */}
        <div className="page bg-white p-16 min-h-[297mm] flex flex-col items-center text-center" style={{ fontFamily: "'Times New Roman', serif" }}>
          <div className="text-lg font-bold uppercase">LAPORAN PELAKSANAAN KEGIATAN</div>
          <div className="text-base mt-2 uppercase">{laporan.jenis_kegiatan ?? "KEGIATAN"}</div>
          <div className="my-8 text-2xl font-bold uppercase">{laporan.nama_kegiatan}</div>
          <div className="mt-4">{tempat.join(", ")}</div>
          <div>{formatTanggalIndo(laporan.tanggal)}</div>
          <div className="flex-1" />
          <div className="mt-16 font-bold uppercase">{instansi}</div>
          <div>Tahun {new Date(laporan.tanggal).getFullYear()}</div>
        </div>

        {/* BAB I */}
        <div className="page bg-white p-12 min-h-[297mm]" style={{ fontFamily: "'Times New Roman', serif" }}>
          <h2 className="text-center font-bold text-lg">BAB I</h2>
          <h3 className="text-center font-bold mb-6">PENDAHULUAN</h3>
          <h4 className="font-bold mt-4">A. Latar Belakang</h4>
          <p className="text-justify mt-2 indent-8">
            Sesuai dengan tugas pokok dan fungsi {instansi} dalam pelaksanaan Pencegahan dan Pemberantasan Penyalahgunaan dan Peredaran Gelap Narkoba (P4GN), maka dilaksanakan kegiatan {laporan.nama_kegiatan}. Kegiatan ini merupakan bagian dari upaya mewujudkan Indonesia Bersinar dan meningkatkan sinergi antar pemangku kepentingan.
          </p>

          <h4 className="font-bold mt-4">B. Dasar Penyelenggaraan</h4>
          <ol className="list-decimal pl-8 mt-2 space-y-1">
            <li>Undang-Undang Nomor 35 Tahun 2009 tentang Narkotika;</li>
            <li>Peraturan Presiden Nomor 23 Tahun 2010 tentang Badan Narkotika Nasional;</li>
            {showSp && (
              <li>Surat Perintah Nomor {laporan.no_sp}{laporan.tanggal_sp ? ` tanggal ${formatTanggalIndo(laporan.tanggal_sp)}` : ""}{laporan.perihal_sp ? ` perihal ${laporan.perihal_sp}` : ""}.</li>
            )}
          </ol>

          <h4 className="font-bold mt-4">C. Maksud dan Tujuan</h4>
          <p className="text-justify mt-2 indent-8">
            Maksud dari kegiatan ini adalah untuk melaksanakan tugas P4GN di wilayah kerja {instansi}. Tujuannya adalah tercapainya hasil yang optimal dari pelaksanaan kegiatan {laporan.nama_kegiatan}.
          </p>
        </div>

        {/* BAB II */}
        <div className="page bg-white p-12 min-h-[297mm]" style={{ fontFamily: "'Times New Roman', serif" }}>
          <h2 className="text-center font-bold text-lg">BAB II</h2>
          <h3 className="text-center font-bold mb-6">PELAKSANAAN</h3>

          <h4 className="font-bold mt-4">A. Mekanisme Pelaksanaan</h4>
          <p className="text-justify mt-2 indent-8">
            Kegiatan {laporan.jenis_kegiatan?.toLowerCase()} ini dilaksanakan oleh tim {instansi} dengan tahapan persiapan, pelaksanaan di lapangan, dan pelaporan hasil.
            {dd.sasaran ? ` Sasaran kegiatan adalah ${dd.sasaran}.` : ""}
            {dd.jumlah_peserta ? ` Jumlah peserta ${dd.jumlah_peserta}.` : ""}
            {dd.narasumber ? ` Narasumber: ${dd.narasumber}.` : ""}
            {dd.materi ? ` Materi: ${dd.materi}.` : ""}
            {dd.instansi ? ` Instansi yang dikunjungi: ${dd.instansi}.` : ""}
          </p>

          <h4 className="font-bold mt-4">B. Waktu</h4>
          <p className="mt-2">Hari/Tanggal : {formatTanggalIndo(laporan.tanggal)}</p>
          {laporan.jam && <p>Waktu : {laporan.jam} WITA</p>}

          <h4 className="font-bold mt-4">C. Tempat</h4>
          <ol className="list-decimal pl-8 mt-2">{tempat.map((t, i) => <li key={i}>{t}</li>)}</ol>

          <h4 className="font-bold mt-4">D. Pelaksana</h4>
          <table className="w-full border-collapse border border-black mt-2 text-sm">
            <thead>
              <tr>
                <th className="border border-black p-1 w-10">No</th>
                <th className="border border-black p-1">Nama</th>
                <th className="border border-black p-1">Jabatan</th>
              </tr>
            </thead>
            <tbody>
              {pelaksana.map((p, i) => (
                <tr key={i}>
                  <td className="border border-black p-1 text-center">{i + 1}</td>
                  <td className="border border-black p-1">{namaWithGelar(p)}</td>
                  <td className="border border-black p-1">{p.jabatan ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BAB III */}
        <div className="page bg-white p-12 min-h-[297mm]" style={{ fontFamily: "'Times New Roman', serif" }}>
          <h2 className="text-center font-bold text-lg">BAB III</h2>
          <h3 className="text-center font-bold mb-6">HASIL PELAKSANAAN</h3>
          <p className="text-justify indent-8 whitespace-pre-wrap">{laporan.hasil_kegiatan || "-"}</p>
          {dd.hasil_tes && <p className="mt-4"><strong>Hasil Tes:</strong> {dd.hasil_tes}</p>}
        </div>

        {/* BAB IV */}
        <div className="page bg-white p-12 min-h-[297mm]" style={{ fontFamily: "'Times New Roman', serif" }}>
          <h2 className="text-center font-bold text-lg">BAB IV</h2>
          <h3 className="text-center font-bold mb-6">PENUTUP</h3>
          <p className="text-justify indent-8">
            Demikian laporan pelaksanaan kegiatan {laporan.nama_kegiatan} ini disusun sebagai bentuk pertanggungjawaban pelaksanaan tugas. Sumber pembiayaan kegiatan berasal dari {laporan.sumber_dana ?? "-"}. Atas perhatian dan kerja sama semua pihak, disampaikan terima kasih.
          </p>
          <div className="mt-16 flex justify-end">
            <div className="text-center">
              <div>Gorontalo, {formatTanggalIndo(laporan.tanggal)}</div>
              <div className="font-bold mt-1">{kepala}</div>
              <div className="h-20" />
              <div className="font-bold underline">_________________________</div>
            </div>
          </div>
        </div>

        {/* Dokumentasi */}
        <div className="page bg-white p-12 min-h-[297mm]" style={{ fontFamily: "'Times New Roman', serif" }}>
          <h2 className="text-center font-bold text-lg">DOKUMENTASI KEGIATAN</h2>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {urls.map((url, i) => (
              <div key={i} className="border border-black">
                <img src={url} alt={`Dokumentasi ${i + 1}`} className="w-full h-64 object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
