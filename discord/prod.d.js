/**
 * @fileoverview discrod.kimlikdao.org worker tanımları.
 *
 * @author KimlikDAO
 * @externs
 */

/**
 * @interface
 * @extends {cloudflare.PageWorkerEnv}
 */
const DiscordEnv = function () { };

/** @const {string} */
DiscordEnv.prototype.KIMLIKDAO_BOT_TOKEN;

/** @const {string} */
DiscordEnv.prototype.HMAC_SECRET;

/** @const {string} */
DiscordEnv.prototype.DISCORD_CLIENT_SECRET;
