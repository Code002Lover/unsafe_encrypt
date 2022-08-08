import { encrypt, decrypt } from "../index.js";

const randomString = (length = 4) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;

};

const attempts = 100

let string = randomString(attempts)

for(let i=0;i<attempts;i++) {
    let encrypted = encrypt(string.substring(0,i))

    let out = decrypt(encrypted)

    if(out.status == "error") {
        console.error(out)
        process.abort(i)
    }

    if(i%100==0) {
        console.log("progress: ",i+"/"+attempts,i/10+"%");
    }
}

console.log("successfully tested en/decrypt with the same key on various lengths")