import { formatHariTanggal } from "@/lib/format";

type Props = {
  laporan: any;
  ai: {
    pelaksanaanKegiatan: string;
  };
};

export default function Bab2({ laporan, ai }: Props) {
  const tempat = laporan.tempat ?? [];
  const pelaksana = laporan.pelaksana ?? [];
  const dd = laporan.data_dinamis ?? {};
  
    return (
    <div className="">

      <div className="bab-title text-center font-bold">
        BAB II
        <br />
        PENDAHULUAN
      </div>


      {/* D */}
      <div className="subbab mt-6 font-bold">
        D. MEKANISME KEGIATAN
      </div>

      <table className="spj-table ml-5">

        <tbody>

          <tr>
            <td>Hari / Tanggal</td>
            <td>: {formatHariTanggal(laporan.tanggal)}</td>
          </tr>

          {laporan.jam && (
            <tr>
              <td>Pukul</td>
              <td>: {laporan.jam}</td>
            </tr>
          )}

          <tr>
            <td>Tempat</td>
            <td>: {tempat.join(", ")}</td>
          </tr>

         {/*dd.sasaran && (
            <tr>
              <td>Sasaran</td>
              <td>: {dd.sasaran}</td>
            </tr>
          )*/}

          {dd.narasumber && (
            <tr>
              <td>Narasumber</td>
              <td>: {dd.narasumber}</td>
            </tr>
          )}

          {dd.materi && (
            <tr>
              <td>Materi</td>
              <td>: {dd.materi}</td>
            </tr>
          )}

          {dd.jumlah_peserta && (
            <tr>
              <td>Jumlah Peserta</td>
              <td>: {dd.jumlah_peserta}</td>
            </tr>
          )}

        </tbody>

      </table>

      <div className="subbab mt-6 font-bold">
        E. ANGGARAN BIAYA
      </div>

      <div className="paragraph ml-5">
        Kegiatan ini didukung melalui sumber dana
        {" "}
        <strong>
          {laporan.sumber_dana ?? "-"}
        </strong>.
      </div>

      <div className="subbab mt-6 font-bold">
        F. SUSUNAN KOORDINATOR KEGIATAN
      </div>
      <p className="ml-5">Adapun Petugasnya adalah :</p>

      <table className="ml-5" style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>

            <tbody>

              {pelaksana.map((p: any, i: number) => (

                <tr key={i}>

                  <td style={{ width: 30, verticalAlign: "top" }}>
                    {i + 1}.
                  </td>

                  <td>
                    {p.nama}
                    {p.gelar ? `, ${p.gelar}` : ""}
                  </td>

                  <td style={{ width: 220, textAlign: "center" }}>
                    (................................)
                  </td>

                </tr>

              ))}

            </tbody>

      </table>

    </div>
  );
}