type Props = {
  laporan: any;
  ai: {
    hasilPelaksanaan: string;
  };
};

export default function Bab3({ laporan, ai }: Props) {
  return (
    <div className="page">
      <div className="bab-title text-center font-bold">
        BAB III
        <br />
        HASIL PELAKSANAAN
      </div>

      <div className="paragraph ml-5 text-justify">
        {ai.hasilPelaksanaan}
      </div>
    
    </div>
  );
}