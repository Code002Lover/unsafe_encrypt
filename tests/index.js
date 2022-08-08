import { existsSync, unlinkSync } from "fs"

if(existsSync("messagekey.txt")) {
    unlinkSync("messagekey.txt")
}
if(existsSync("signkey.txt")) {
    unlinkSync("signkey.txt")
}

//cleared keys



import "./en_de_various_len.js"

import "./messing_with_keys.js"

import "./version.js"

import "./packing.js"

import "./extended_packing.js"





console.log("successfully ended testing");

if(existsSync("messagekey.txt")) {
    unlinkSync("messagekey.txt")
}
if(existsSync("signkey.txt")) {
    unlinkSync("signkey.txt")
}
//clean up after we're finished


