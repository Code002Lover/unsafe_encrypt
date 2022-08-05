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

const fs = require("fs")
const readline = require("readline-sync");
const prompt = readline.question

let msg = prompt("Message: ")

if(!fs.existsSync("signkey.txt")) {
    require("./gen_signkey.js")
    console.log("generated a signature key")
}

if(!fs.existsSync("messagekey.txt")) {
    require("./gen_messagekey.js")
    console.log("generated a message key")
}

const signkey = fs.readFileSync("signkey.txt").toString()

const messagekey = fs.readFileSync("messagekey.txt").toString()

const hashes = 1000

let signedmsg = msg + "." + SHA256(msg,signkey,hashes) + "." + hashes

let xoredmsg = xor(signedmsg,messagekey)

let buf = Buffer.from(xoredmsg)

xoredmsg = buf.toString("hex")

console.log("output:");

console.log(xoredmsg);

fs.writeFileSync("output.txt",xoredmsg)