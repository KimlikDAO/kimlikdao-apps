
/**
 * @author KimlikDAO
 * @externs
 */

import kimlikdao from "/sdk/api/validationReport.d";

/**
 * @interface
 * @struct
 *
 * @extends {kimlikdao.ValidationRequest}
 */
const Başvuru = function () { }

/** @const {string} */
Başvuru.prototype.ilan;

/** @const {string} */
Başvuru.prototype.lang;

/** @const {string} */
Başvuru.prototype.email;

/** @const {string} */
Başvuru.prototype.github;

/** @const {string} */
Başvuru.prototype.linkedin;

/** @const {string} */
Başvuru.prototype.twitter;

/** @const {string} */
Başvuru.prototype.notes;

export { Başvuru };
