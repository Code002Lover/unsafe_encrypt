const unsafeencrypt = require("./index.js")

const fs = require("fs")

let argv = process.argv.splice(2)

let silent = false
let msg = ""

for(let i in argv) {
    let arg = argv[i]
    switch(arg) {
        case "-s":
            silent = true
            break;
        case "--msg":
            msg = argv[++i]
            break;
        case "-h":
            console.log(fs.readFileSync("helpmessages/encrypt.txt").toString())
            process.exit(0)
    }
}



if(msg == "") {

    const readline = require("readline-sync");

    msg =  readline.question("Message: ")

}

const xoredmsg = unsafeencrypt.encrypt(msg)

if(!silent) {
    console.log("output:");

    console.log(xoredmsg);
}

fs.writeFileSync("output.txt",xoredmsg)