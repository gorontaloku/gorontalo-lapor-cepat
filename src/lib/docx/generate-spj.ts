import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
} from "docx";

export async function generateSpjWord() {

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "LAPORAN KEGIATAN",
            heading: HeadingLevel.TITLE,
          }),

          new Paragraph("BNN Kabupaten Gorontalo"),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}