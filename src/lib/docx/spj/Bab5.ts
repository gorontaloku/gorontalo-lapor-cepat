import { Paragraph } from "docx";

export function Bab5(data: any) {
  return [

    new Paragraph({
      text: "BAB V",
      heading: "Heading1",
    }),

    new Paragraph({
      text: "KESIMPULAN DAN SARAN",
      spacing: {
        after: 300,
      },
    }),

    new Paragraph({
      text: data.kesimpulan ?? "",
    }),

    new Paragraph({
      text: "",
    }),

    new Paragraph({
      text: data.saran ?? "",
    }),

  ];
}