const fp = (d) => {
  /** @const {number} */
  const p = d.p;
  /** @const {number} */
  const w = d.w;
  /** @const {number} */
  const L = d.w * (p - 1);
  /** @type {string} */
  let html = `<g stroke="${d.mazgalRenk}">`;
  for (let i = 0; i < p; ++i)
    html += `  <path d="M${d.solBoşluk} ${d.üstBoşluk + i * w}h${L}" />\n`;
  for (let i = 0; i < p; ++i)
    html += `  <path d="M${d.solBoşluk + i * w} ${d.üstBoşluk}v${L}" />\n`;
  html += `</g>`;
  if (d.wrapLast) {
    html += `<g stroke="#999" stroke-dasharray="4">` +
      `  <path d="M${d.solBoşluk} ${d.boşluk}h${L + w}" />` +
      `  <path d="M${d.solBoşluk + p * w} ${d.boşluk}v${L + w}" />\n` +
      `</g>`;
  }
  html += `<g class="blt" text-anchor="end">`;
  for (let i = 0; i < p; ++i)
    html += `<text x="${d.boşluk + 3}" y="${5 + d.üstBoşluk + w * i}">${8 - i}</text>`
  for (let i = 0; i < p; ++i)
    html += `<text x="${d.solBoşluk + 4 + i * w}" y="${d.boy - d.altBoşluk - 8}">${i}</text>`

  if (d.wrapLast) {
    html += `  <text x="${d.solBoşluk + 4 + p * w}" y="${d.boy - d.altBoşluk - 8}">0</text>`
    html += `  <text x="${d.boşluk + 3}" y="${5 + d.boşluk}">-8</text>`
  }
  html += "</g>";

  const sqrt = Array(p).fill(p);
  for (let x = (1 - p) / 2 | 0; x <= ((p - 1) / 2 | 0); ++x)
    sqrt[((x + p) * (x + p)) % p] = x;

  html += `<g fill="${d.renk || "#935BCA"}">`
  const M = d.üstBoşluk + w * (p - 1) / 2;
  for (let x = 0; x < p; ++x) {
    const y = sqrt[(x * x * x + x + 3) % p];
    if (y >= p) continue;
    html += ""
      + `<circle cx="${d.solBoşluk + x * w}" cy="${M + y * w}" r="4" />`
      + `<circle cx="${d.solBoşluk + x * w}" cy="${M - y * w}" r="4" />`;
  }

  html += "</g>"
  return html;
}

exports.fp = fp;

exports.üret = (d) => {
  d.en = +d.width;
  d.p = +d.p;
  d.boşluk ||= 10;
  d.solBoşluk = +d.solBosluk || 25;
  d.altBoşluk = +d.altBoşluk || 25;
  d.w = (d.width - d.solBoşluk - d.boşluk) / d.p | 0;
  d.üstBoşluk = d.boşluk;
  d.boy = d.w * d.p + d.üstBoşluk + d.altBoşluk;

  const iç = fp(d) + `<text stroke="#5698E2" x="${d.en / 5 - 45}" y="${d.boy - 60}">P = (2, -8)</text>`
  return `<svg class="${d.class}" height="${d.boy}" width="${d.en}">${iç}</svg>`;
}
