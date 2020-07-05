const util = require('util');
const fs = require('fs');
const crypto = require('crypto');
const syncDir = util.promisify(fs.readdir);
const syncFile = util.promisify(fs.readFile);
const dest = 'ENTER OUTPUT PATH';
//Best to be a full folder URL EG c:/Temp/
//Please end all folder paths with '/' at end

function copy(dir , md5){
    //Test to see if folder exists if not make dir
    if (!fs.existsSync(dest + md5)){
        fs.mkdirSync(dest + md5);
    }
    //Try to copy file over to new dir with randomised 1 - 1000 number to prevent overwrite
    try{
        fs.copyFile(dir, `${dest + md5}/${md5 + Math.floor(Math.random() * Math.floor(1000))}.jpg`, (err) => {});
    }catch(error){
        //Catch if error happens and try rewrite copy with new number
        //Could implment a tick or detect if files exists but random number was chosen for swiftness
        fs.copyFile(dir, `${dest + md5}/${md5 + Math.floor(Math.random() * Math.floor(1000))}.jpg`, (err) => {});
    }
}

function md5(string) {
    //Return MD5 hash for given string
    //In our case it is a string of bytes
    return crypto.createHash('md5').update(string).digest('hex');
}

function dirRead(dir) {
    //Return a new promise per folder
    return new Promise((resolve, reject) => {
        //syncDir gets all items within a dir
        syncDir(dir).then(async (dirValue) => {
            //dirValue is every item as an array
            let arr = [];
            //Go through the dirValue array and push full file path and val which MD5 hash of bytes array
            for (let i = 0; i < dirValue.length; i++) {
                const element = dirValue[i];
                arr.push({
                    path: dir + element,
                    val: await syncFile(dir + element).then((value) => md5(value))
                })
            }
            //Once all files are completed resolve the array of objects
            resolve(arr);
        }).catch((err) => reject(err));
    })
}
async function init(string) {
    //Init console log
    console.log('Awaiting Read');
    //Await dir reading 
    let arr = await dirRead(string);
    //Init empty unique array
    let uniq = [];
    //For loop around arr which is array full of object containing full path and MD5 hash
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        //If unique array does not include element.val (MD5 hash)
        if (!uniq.includes(element.val)){
            //Debug purposes comment out below console log
            console.log('New ID', element.val , element.path)
            //
            //Push element.val MD5 hash into uniq array
            uniq.push(element.val);
        }else{
            //If MD5 hash already exists in array it must be duplicate
            console.log('Dupe', element.val , element.path)
        }
        //Copy file with full path and 
        copy(element.path,element.val)
    }
}
//Always best to use full URL c:/temp/ or /usr/temp/
init('ENTER INPUT FOLDER')
//Please end all folder paths with '/' at end
