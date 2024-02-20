import { gerçelEliptikEğri, sayıDoğrusu } from "../../lib/birimler/svg";

export const üret = (değerler) => {
  const height = değerler.height;
  const width = değerler.width;
  const x = değerler.x;
  const y = değerler.y;
  return `<svg class=${değerler.class} height="${height}" width="${width}">` +
    sayıDoğrusu(width, height, "#888") +
    gerçelEliptikEğri(1, 3, width, height, "#935BCA") +
    `</svg>`;
}
