const unsafeencrypt = require("../index.js")

const randomString = (length = 4) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;

};

const attempts = 1000

for(let i=0;i<attempts;i++) {

    let en = unsafeencrypt.encrypt(randomString(100))

    let out = unsafeencrypt.decrypt(en)

    if(out.version != out.currentversion) {
        console.error(out)
        process.abort(i)
    }

    if(i%100==0) {
        console.log("progress: ",i+"/"+attempts,i/10+"%");
    }
}



console.log("version test succeeded");