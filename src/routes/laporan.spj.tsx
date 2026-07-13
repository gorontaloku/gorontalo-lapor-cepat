import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { formatTanggalIndo, namaWithGelar } from "@/lib/format";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateWordSPJ } from "@/server/word.spj";
import Cover from "@/components/spj/Cover";
import Bab1 from "@/components/spj/Bab1";
import Bab2 from "@/components/spj/Bab2";
import Bab3 from "@/components/spj/Bab3";
import Bab4 from "@/components/spj/Bab4";
import { exportWord } from "@/lib/docx/spj/ExportWord";
/*import Bab4 from "@/components/spj/Bab4";
import Bab5 from "@/components/spj/Bab5";
import Dokumentasi from "@/components/spj/Dokumentasi";*/




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

  useEffect(() => {
    if (!laporan) return;

    console.log("LAPORAN:", laporan);
    console.log("HASIL PENUTUP:", laporan.hasil_penutup);
  }, [laporan]);

  const { data: pengaturan } = useQuery({
    queryKey: ["pengaturan"],
    queryFn: async () => (await supabase.from("pengaturan").select("*").eq("id", 1).maybeSingle()).data as any,
  });


  useEffect(() => {
    console.log("DOKUMENTASI RAW:", laporan?.dokumentasi);
    const dok: { path: string }[] = laporan?.dokumentasi ?? [];
    if (!dok.length) return;
    (async () => {
      const signed = await Promise.all(
  dok.map(async (d) => {
    console.log("PATH DATABASE:", d.path);

    const { data } = supabase.storage
      .from("dokumentasi")
      .getPublicUrl(d.path);

    console.log("PUBLIC URL:", data.publicUrl);

    return data.publicUrl;
  })
);

setUrls(signed);

console.log("SIGNED URLS:", signed);

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

  const handlePrint = () => {
    window.print();
  };
  


 /* const downloadWord = async () => {

    const bytes = await generateWordSPJ();

    const blob = new Blob(
        [new Uint8Array(bytes)],
        {
            type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "SPJ.docx";

    a.click();

    URL.revokeObjectURL(url);

  };*/
  
  const downloadWord = async () => {
  await exportWord({
    laporan,
    pengaturan,
    urls,
  });
};
  
  
  /*const downloadWord = async () => {
  alert("Fitur Download Word sedang dibuat");
  };*/
  return (
    <div className="min-h-screen bg-gray-100 py-6 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto space-y-4 print:space-y-0">
        <div className="flex justify-end gap-2 print:hidden">
          <div className="print:hidden top-5 right-5 flex gap-3">
              <Button onClick={handlePrint}>
                  Print
              </Button>

              <Button
                  variant="outline"
                  onClick={downloadWord}
              >
                  Download Word
              </Button>
            </div>
        </div>
        <style>{`
          @media print {
            .page { page-break-after: always; }
            body { font-family: 'Times New Roman', serif; }
          }
        `}</style>
          <>
            {/* ================= HALAMAN 1 Cover Bab1================= */}
            <div className="bg-white p-16">
              <Cover
                instansi={instansi}
                namaKegiatan={laporan.nama_kegiatan}
                tempat={tempat.join(", ")}
                tanggal={laporan.tanggal}
                sumberDana={laporan.sumber_dana}
              />

              <Bab1
                laporan={laporan}
                ai={{
                  latarBelakang: laporan.latar_belakang,
                  maksudTujuan: laporan.maksud_tujuan ?? [],
                }}
              />
            </div>

            {/* ================= HALAMAN 2 Bab2================= */}
            <div className="page bg-white p-16">
              <Bab2
                laporan={laporan}
                ai={{
                  pelaksanaanKegiatan: laporan.pelaksanaan_kegiatan,
                }}
              />
            </div>

            {/* ================= HALAMAN 3 Bab3================= */}
            <div className="page bg-white p-16">
              <Bab3
              laporan={laporan}
                ai={{
                  hasilPelaksanaan: laporan.hasil_pelaksanaan,
                }}
              />
            </div>

            {/* ================= HALAMAN 4 Bab4 ================= */}
            <div className="page bg-white p-16">
              <Bab4
                laporan={laporan}
                ai={{
                  penutup: laporan.hasil_penutup,
                }}
                petugas={pelaksana}
              />
            </div>

            {/* ================= HALAMAN 5 Dokumentasi================= */}
            <div className="page bg-white justify-center p-12 min-h-[297mm]" style={{ fontFamily: "'Times New Roman', serif" }}>

                      <h2 className="text-center font-bold text-lg">DOKUMENTASI KEGIATAN</h2>
                        <div
                          className={`mt-10 ${
                            urls.length === 1
                              ? "flex justify-center"
                              : "grid grid-cols-2 gap-10"
                          }`}
                        >
                          {urls.map((url, i) => (
                            <div key={i} className="flex justify-center">
                              <img
                                src={url}
                                alt={`Dokumentasi ${i + 1}`}
                                className="w-[300px] h-[220px] object-contain border border-black bg-white"
                              />
                              
                        </div>
                      ))}
                    </div>
                      
              
            </div>

          </>
      </div>
    </div>
    
  );

}
