import { randomBytes } from "crypto";
import { writeFileSync } from "fs";

function run() {

    const signkey = randomBytes(2**8).toString('hex');

    writeFileSync("signkey.txt",signkey)

}

export {run}