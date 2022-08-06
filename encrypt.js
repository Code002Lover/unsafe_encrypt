const unsafeencrypt = require("./index.js")


const fs = require("fs")
const readline = require("readline-sync");
const prompt = readline.question

let msg = prompt("Message: ")

const xoredmsg = unsafeencrypt.encrypt(msg)

console.log("output:");

console.log(xoredmsg);

fs.writeFileSync("output.txt",xoredmsg)