import { pack_keys as pack, unpack_keys as unpack } from "../index.js";

import { randomBytes } from "crypto";

const attempts = 100000

const per = attempts/100

for(let i=0;i<attempts;i++) {

    const messagekey = randomBytes(2**10).toString('hex');

    const signkey = randomBytes(2**8).toString('hex');

    const packed = pack({
        signkey: signkey,
        messagekey: messagekey
    })

    const unpacked = unpack(packed)

    if(unpacked.signkey != signkey || unpacked.messagekey != messagekey) {
        console.log(unpacked);
        process.exit(i)
    }

    if(i%10000==0) {
        console.log("progress: ",i+"/"+attempts,i/per+"%");
    }

}

console.log("succeeded packing test")