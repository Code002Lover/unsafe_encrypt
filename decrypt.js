import { decrypt } from "./index.js"

import { readFileSync } from "fs"

let argv = process.argv.splice(2)

let input = ""
let silent = false

for(let i in argv) {
    let arg = argv[i]
    switch(arg) {
        case "-s":
            silent = true
            break;
        case "-i":
            input = argv[++i]
            break
        case "-h":
            console.log(readFileSync("helpmessages/decrypt.txt").toString())
            process.exit(0)
    }
}

const out = decrypt(input)

if(out.status == "success") {
    if(silent)return
    console.log("output:")
    console.log(out.msg)
} else {

    process.exitCode = 1

    if(silent)return
    console.log("error decrypting the message")
    console.log("perhaps you have the wrong keys?")
    console.log("decrypted message: ", out.msg)
    console.log("signature: ", out.signature)
    console.log("signature expected: ", out.expected)

    
}