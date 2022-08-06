const enc_stuff = require("./enc_module.js")
const SHA256 = enc_stuff.SHA256
const xor = enc_stuff.xor


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