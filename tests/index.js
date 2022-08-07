const unsafeencrypt = require("../index.js")

const fs = require("fs")

if(fs.existsSync("messagekey.txt")) {
    fs.unlinkSync("messagekey.txt")
}
if(fs.existsSync("signkey.txt")) {
    fs.unlinkSync("signkey.txt")
}

//cleared keys



require("./en_de_various_len.js")

require("./messing_with_keys.js")





console.log("successfully ended testing");

if(fs.existsSync("messagekey.txt")) {
    fs.unlinkSync("messagekey.txt")
}
if(fs.existsSync("signkey.txt")) {
    fs.unlinkSync("signkey.txt")
}
//clean up after we're finished


