import { createServerFn } from "@tanstack/react-start";
import { Document, Packer, Paragraph } from "docx";

export const generateWordSPJ = createServerFn({
  method: "POST",
}).handler(async () => {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph("LAPORAN KEGIATAN"),
          new Paragraph("BNN Kabupaten Gorontalo"),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return Array.from(buffer);
});