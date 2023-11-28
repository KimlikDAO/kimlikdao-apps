const svgs = require("../../lib/util/svg.cjs");

exports.üret = (değerler) => {
  const height = değerler.height;
  const width = değerler.width;
  const x = değerler.x;
  const y = değerler.y;
  return `<svg class=${değerler.class} height="${height}" width="${width}">` +
    svgs.sayıDoğrusu(width, height, "#888") +
    svgs.gerçelEliptikEğri(1, 3, width, height, "#935BCA") +
    `</svg>`;
}
