import { tanggalPlusSatu } from "@/lib/format";
type Props = {
  laporan: any;
  ai: {
    penutup: string;
  };
  petugas: any[];
};


export default function Bab4({
  laporan,
  ai,
  petugas,
}: Props) {
  
  const ttdTanggal = tanggalPlusSatu(laporan.tanggal);

  return (
    <div className="page">

      <div className="bab-title text-center font-bold">
        BAB IV
        <br />
        PENUTUP
      </div>

      <div className="paragraph ml-5 text-justify">
        {ai.penutup}
      </div>

      {/* Tanda tangan */}
      <div className="mt-14 flex justify-end">

        <div className="w-[430px]">

          <div className="text-center mb-8">
            Gorontalo, {ttdTanggal}
          </div>

          <table className="w-full">
              <tbody>

                {petugas?.map((item, index) => (

                  <tr key={index}>

                    <td className="w-8 align-top">
                      {index + 1}.
                    </td>

                    <td className="py-2">
                      {item.nama}
                    </td>

                    <td className="text-right whitespace-nowrap">
                      (................................)
                    </td>

                  </tr>

                ))}

              </tbody>
           </table>
        </div>

      </div>

    </div>
  );
}