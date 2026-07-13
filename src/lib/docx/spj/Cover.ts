import { Paragraph, ImageRun, AlignmentType } from "docx";
import { bab, paragraph } from "./Builder";


type Props = {
    laporan: any;
    pengaturan: any;
    kop: Uint8Array;
};
export function Cover({
  laporan,
  pengaturan,
  kop,
}: Props) {

  const bulan = new Date(laporan.tanggal).toLocaleString("id-ID", {
    month: "long",
  });

  const tahun = new Date(laporan.tanggal).getFullYear();

  const tempat = Array.isArray(laporan.tempat)
  ? laporan.tempat.join(", ")
  : laporan.tempat ?? "";

  const isNonDipa = laporan.sumber_dana === "NON DIPA";

  const children = [];

  if (!isNonDipa) {
    children.push(
      paragraph("BADAN NARKOTIKA NASIONAL", {
        bold: false,
        center: false,
        size: 24,
        spacingAfter: 50,
        line: 240,
      }),

      paragraph("KABUPATEN GORONTALO", {
        bold: false,
        center: false,
        size: 24,
        spacingAfter: 500,
        line: 240,
      })
    );
  } else {
    // sementara dikosongkan
    children.push(
       new Paragraph({
        alignment: AlignmentType.CENTER,
        indent : {
            left: -1200,
            before: 0,
        },
        children: [
            new ImageRun({
                data: kop,
                transformation: {
                    width: 750,
                    height: 152,
                },
            }),
        ],
    }),
    );
  }

  children.push(

    paragraph("LAPORAN KEGIATAN", {
      bold: true,
      center: true,
      size: 32,
      line: 240,
      spacingAfter: 0,
    }),

    paragraph(laporan.nama_kegiatan.toUpperCase(), {
      bold: true,
      center: true,
      size: 30,
      line: 240,
      spacingAfter: 50,
    }),

    paragraph(tempat.toUpperCase(), {
      bold: true,
      center: true,
      size: 28,
      line: 240,
      spacingAfter: 50,
    }),

    paragraph(`BULAN ${bulan.toUpperCase()} T.A. ${tahun}`, {
      bold: true,
      center: true,
      size: 28,
      line: 240,
      spacingAfter: 500,
    })
  );

  return children;
}