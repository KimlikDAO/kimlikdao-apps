/**
 * @fileoverview join.kimlikdao.org worker tanımları.
 *
 * @author KimlikDAO
 * @externs
 */

/**
 * @interface
 * @extends {cloudflare.PageWorkerEnv}
 */
const JoinEnv = function () { };

/** @const {string} */
JoinEnv.prototype.DKIM_PRIVATE_KEY;

/** @const {string} */
JoinEnv.prototype.APPLICATION_RECIPIENTS;
