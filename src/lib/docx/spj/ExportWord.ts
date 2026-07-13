import { Document, Packer } from "docx";
import { Cover } from "./Cover";
import { Bab1 } from "./Bab1Word";
import { Bab2 } from "./Bab2Word";
import { Bab3 } from "./Bab3Word";
import { Bab4 } from "./Bab4";
import { Lampiran } from "./Dokumentasi";
import copUrl from "@/assets/cop.png";

type ExportWordProps = {
  laporan: any;
  pengaturan: any;
  urls?: string[];
};

export async function exportWord({
  laporan,
  pengaturan,
  urls = [],
}: ExportWordProps) {

// =========================
// Load gambar kop
// =========================
const kopRes = await fetch(copUrl);
const kopArr = await kopRes.arrayBuffer();
const kop = new Uint8Array(kopArr);



  console.log(urls);
    const images: Uint8Array[] = [];

    for (const url of urls) {
    const res = await fetch(url);

    const arr = await res.arrayBuffer();

    images.push(new Uint8Array(arr));
}
  
  
    const doc = new Document({
    creator: "Aplikasi Laporan Kegiatan",
    title: "Laporan Kegiatan",

    sections: [
      {children: [
          ...Cover({laporan, pengaturan, kop,}),

          ...Bab1({laporan,}),
        ],
      },
      {children: [
          ...Bab2({laporan,}),
        ],
      },
      {children: [
          ...Bab3({laporan,}),
        ],
      },
      {children: [
          ...Bab4({laporan,}),
        ],
      },
      {
        children: [
          ...Lampiran({
            images,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

 const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = `Laporan ${laporan.nama_kegiatan}.docx`;

document.body.appendChild(a);
a.click();
a.remove();

URL.revokeObjectURL(url);
}