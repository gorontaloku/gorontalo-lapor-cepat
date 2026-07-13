import {
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";

import { bab, paragraph } from "./Builder";
import { tanggalPlusSatu } from "@/lib/format";

export function Bab4({ laporan }: any) {
  const petugas = laporan.pelaksana ?? [];

  const petugasRows = petugas.map(
    (p: any, i: number) =>
      new TableRow({
        children: [
          new TableCell({
            width: {
              size: 8,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
            },
            children: [
              paragraph(`${i + 1}.`),
            ],
          }),

          new TableCell({
            width: {
              size: 57,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
            },
            children: [
              paragraph(
                `${p.nama}${p.gelar ? ", " + p.gelar : ""}`
              ),
            ],
          }),

          new TableCell({
            width: {
              size: 35,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
            },
            children: [
              paragraph("(................................)", {
                center: true,
              }),
            ],
          }),
        ],
      })
  );

  return [
    ...bab("BAB IV", "PENUTUP"),

    paragraph(laporan.hasil_penutup ?? "", {
      justify: true,
      firstLine: true,
    }),

    paragraph("", {
      spacingAfter: 300,
    }),

    paragraph(`Gorontalo, ${tanggalPlusSatu(laporan.tanggal)}`, {
      center: true,
    }),

    new Table({
      width: {
        size: 70,
        type: WidthType.PERCENTAGE,
      },

      borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
        insideHorizontal: {
          style: BorderStyle.NONE,
          size: 0,
        },
        insideVertical: {
          style: BorderStyle.NONE,
          size: 0,
        },
      },

      rows: petugasRows,
    }),
  ];
}