import Header from "./Header";
import cop from "@/assets/cop.png";
import { formatHariTanggal } from "@/lib/format";
type CoverProps = {
  instansi: string;
  namaKegiatan: string;
  tempat: string;
  tanggal: string;
  sumberDana: string;
};
type Props = {
  laporan: any;
  ai: {
    latarBelakang: string;
    maksudTujuan: string[];
  };
};


export default function Cover({
  instansi,
  namaKegiatan,
  tempat,
  tanggal,
  sumberDana,
}: CoverProps) {

  const bulan = new Date(tanggal).toLocaleString("id-ID", {
    month: "long",
  });
  const isNonDipa = sumberDana === "NON DIPA";

  const tahun = new Date(tanggal).getFullYear();

  console.log("sumberDana:", sumberDana);
  console.log("isNonDipa:", isNonDipa); 

  return (
    <div className="cover">
     
      {isNonDipa && (
          <img
            src={cop}
            alt="Kop Surat"
            className="w-full h-auto mb-4"
          />
        )}

       {!isNonDipa && (
    <Header instansi={instansi} />
  )} 

      

      <div className="cover-body">

        

        <div className="cover-title text-center font-bold text-lg mt-15">
          LAPORAN KEGIATAN
        </div>

        <div className="cover-line text-center font-bold text-lg" />

        <div className="cover-kegiatan text-center font-bold text-lg">
          {namaKegiatan.toUpperCase()}
        </div>

        <div className="cover-tempat text-center font-bold text-lg">
          {tempat.toUpperCase()}
        </div>

        <div className="cover-bulan text-center font-bold text-lg">
          BULAN {bulan.toUpperCase()} T.A. {tahun}
        </div>
        

      </div>
      

      <div className="cover-footer text-center font-bold text-lg mb-10">


      </div>

    </div>
  );
  
}

