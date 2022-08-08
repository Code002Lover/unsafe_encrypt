import { randomBytes } from "crypto";
import { writeFileSync } from "fs";

function run() {

    const messagekey = randomBytes(2**10).toString('hex');

    writeFileSync("messagekey.txt",messagekey)
}

export {run}
