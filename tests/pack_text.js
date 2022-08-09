import { pack_text, unpack_text } from "../index.js";

const randomString = (length = 4) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
};

const attempts = 1000

const per = attempts/100

for(let i=1;i<attempts+1;i++) {

    let txt = randomString(256)

    let packed = pack_text({text:txt,size:i})

    let unpacked = unpack_text({data: packed})

    if(unpacked != txt) {
        console.error(unpacked,txt)
        process.exit(i) //non-zero
    }

    if(i%100==0) {
        console.log("progress: ",i+"/"+attempts,i/per+"%");
    }

}