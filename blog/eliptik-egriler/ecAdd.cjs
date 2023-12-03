const { fp } = require("./ecFp.cjs");
const { Point } = require("../../lib/birimler/svg.cjs");

exports.üret = (d) => {
  d.en = +d.width;
  d.p = +d.p;
  d.boşluk ||= 10;
  d.solBoşluk = +d.solBosluk || 25;
  d.altBoşluk = +d.altBoşluk || 25;
  d.w = (d.width - d.solBoşluk - d.boşluk) / d.p | 0;
  d.üstBoşluk = d.boşluk + d.w;
  d.boy = d.w * d.p + d.üstBoşluk + d.altBoşluk;
  d.wrapLast = true;

  /** @const {number} */
  const p = d.p;
  /** @const {number} */
  const q = (p - 1) / 2
  /** @const {number} */
  const w = d.w;

  /**
   * @param {!Point} p Eliptik eğri noktası
   * @return {!Point} Grafik noktası
   */
  const g = (P) => new Point(d.solBoşluk + w * P.x, d.üstBoşluk + w * (q - P.y));

  /**
   * @param {!Point} P0
   * @param {!Point} M
   * @param {number} x_m
   * @param {number} x_2
   * @param {number} beg
   */
  const line = (P0, M, x_m, x_2, beg) => {
    /** @const {number} */
    const dur = (x_2 - x_m) / 40;
    /** @const {!Point} */
    const P1 = P0.addAxb(M, w * x_m);
    /** @const {!Point} */
    const P2 = P0.addAxb(M, w * (x_2 - x_m))
    return `<line ${P0.s1()} ${P1.s2()} repeatCount="indefinite">` +
      `<animate attributeName="x2" values="${P1.x};${P1.x};${P2.x};${P2.x}" keyTimes="0;${beg};${beg + dur};1" dur="4s" repeatCount="indefinite" />` +
      `<animate attributeName="y2" values="${P1.y};${P1.y};${P2.y};${P2.y}" keyTimes="0;${beg};${beg + dur};1" dur="4s" repeatCount="indefinite" />` +
      `</line>`;
  }

  const açıkla = (T, metin) => `<text ${T.add(new Point(5, 15)).s()}>${metin}</text>`

  /** @const {!Point} */
  const P = g(new Point(3, -4));
  /** @const {!Point} */
  const Q = g(new Point(6, -2));
  /** @const {!Point} */
  const R = g(new Point(16, -1));
  /** @const {!Point} */
  const M = Q.sub(P);


  return `<svg height="${d.boy}" width="${d.en}" id="${d.id}">` +
    `<g stroke="#5698E2" stroke-width="3">` +
    line(P, M, 3, 17, 0) +
    line(P.addAxb(M, w * 14).decX(17 * w), M, 0, 5.5, 14 / 40) +
    line(g(new Point(5.5, -8)), M, 0, 10.5, 19.5 / 40) +
    `</g>` +
    açıkla(P, "P") +
    açıkla(Q, "Q") +
    açıkla(R, "R") +
    açıkla(g(new Point(16, 1)), "-R") +
    `${fp(d)}</svg>`;
};
