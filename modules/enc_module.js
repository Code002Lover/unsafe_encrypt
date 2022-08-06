const crypto = require("crypto")
/**
 * hashes with the secure hashing algorithm 256
 * @param       {string} str   string to hash
 * @param       {any} salt  salt to apply to string
 * @param       {number} num   amount of times to hash, defaults to 1
 * @returns     {string}    base64 digested hash
*/
function SHA256(str,salt,num) {
    if(!num && num!==0)num=1;
    if(!str)return;
    let ret = str;
    for (let i = 0; i < num; i++) {
        ret = crypto
            .createHash("sha256")
            .update(ret+salt)
            .digest("base64");
    }
    return ret;
}

function xor(a,b) {
    let c = ""
    for (let ac of a) {
        cc = ac.charCodeAt(0)
        for(let i=0;i<b.length;i++) {
            cc = cc ^ b.charCodeAt(i) ^ i
        }
        c += String.fromCharCode(cc)
    }

    return c
}

module.exports = {
    SHA256,
    xor
}