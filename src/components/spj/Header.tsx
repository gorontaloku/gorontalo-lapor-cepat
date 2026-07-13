type HeaderProps = {
  instansi: string;

};

export default function Header({
  instansi,
 
}: HeaderProps) {

  
  return (
    <div className="spj-header">

      
          <div className="spj-header-1">
            BADAN NARKOTIKA NASIONAL
          </div>

          <div className="spj-header-2">
            KABUPATEN GORONTALO
          </div>
       

    </div>
  );
}