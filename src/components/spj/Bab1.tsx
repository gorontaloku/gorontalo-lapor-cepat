import { formatHariTanggal } from "@/lib/format";
import { AlignCenter } from "lucide-react";
type Props = {
  laporan: any;
  ai: {
    latarBelakang: string;
    maksudTujuan: string[];
  };
};

export default function Bab1({ laporan, ai }: Props) {
 
  
  let maksudTujuan: string[] = [];
    if (Array.isArray(ai?.maksudTujuan)) {
      maksudTujuan = ai.maksudTujuan;
    } else if (typeof ai?.maksudTujuan === "string") {
      try {
        maksudTujuan = JSON.parse(ai.maksudTujuan);
      } catch {
        maksudTujuan = [ai.maksudTujuan];
      }
    }

  return (
    <div className="page">

      <div className="bab-title text-center font-bold">
        BAB I
        <br />
        PENDAHULUAN
      </div>

      <div className="subbab font-bold">
        A. LATAR BELAKANG
      </div>

      <div className="paragraph ml-5 text-justify">
        {ai.latarBelakang}
      </div>

      <div className="subbab mt-6 font-bold">
        B. DASAR PENYELENGGARAAN KEGIATAN
      </div>

      <ol className="spj-list ml-5 text-justify list-decimal pl-6">

        <li>
            Undang-Undang Nomor 35 Tahun 2009 tentang Narkotika.
        </li>

        <li>
            Peraturan Presiden Nomor 47 Tahun 2019 tentang Perubahan atas
            Peraturan Presiden Nomor 23 Tahun 2010 tentang Badan Narkotika Nasional.
        </li>

        <li>
            DIPA BNN Kabupaten Gorontalo Tahun Anggaran{" "}
            {new Date(laporan.tanggal).getFullYear()}.
        </li>

        {laporan.no_sp && (
            <li>
            Surat Perintah Nomor {laporan.no_sp}.
            </li>
        )}

      </ol>

      <div className="subbab mt-6 font-bold">
        C. MAKSUD DAN TUJUAN
      </div >
      <div className="paragraph ml-5 text-justify">
        {ai.maksudTujuan}
      </div>
        

    </div>
  );
}