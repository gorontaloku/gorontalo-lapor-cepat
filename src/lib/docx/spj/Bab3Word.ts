import { bab, paragraph } from "./Builder";

export function Bab3({ laporan }: any) {
  return [
    ...bab("BAB III", "HASIL PELAKSANAAN"),

    paragraph(laporan.hasil_pelaksanaan ?? "", {
      justify: true,
      firstLine: true,
    }),
  ];
}