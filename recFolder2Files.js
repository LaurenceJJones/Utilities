const util = require('util');
const fs = require('fs');
const syncDir = util.promisify(fs.readdir);
//
let output = 'OUTPUT PATH';
//Make sure to end input path with a / EG C:/Example/

function copyFile(path , num){
    try{
        fs.copyFile(path, `${output}/${num}.jpg`, (err) => {});
    }catch(error){
        console.log(error)
    }
}

function dirRead(dir) {
    //Return a new promise per folder
    return new Promise((resolve, reject) => {
        //syncDir gets all items within a dir
        syncDir(dir).then(async (dirValue) => {
            //dirValue is every item as an array
            let arr = [];
            //Go through the dirValue array and push full file path
            for (let i = 0; i < dirValue.length; i++) {
                const element = dirValue[i];
                arr.push(`${dir}/${element}`)
            }
            //Once all files are completed resolve the array of objects
            resolve(arr);
        }).catch((err) => reject(err));
    })
}
async function init(baseFolder) {
    //Init console log
    console.log('Awaiting Read');
    //Await dir reading 
    let arr = await syncDir(baseFolder);
    //Init empty unique array
    let prom = [];
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        //Go through all sub directories within a directory and add as a promise
        prom.push(dirRead(baseFolder + element))
    }
    //Await all sub dirs to be read
    let final = await Promise.all(prom);
    //Init a number to make file name
    let figure = 0;
    for (let i = 0; i < final.length; i++) {
        //Element is base array of the directory EG >[Path,Path]<
        const element = final[i];
        for (let jpg = 0; jpg < element.length; jpg++) {
            //Go through each Path within the base array [>Path<,Path]
            const filePath = element[jpg];
            //Run copyFile functions pass in filepath and figure which is the number++
            copyFile(filePath, figure++)
        }
    }
}
//
init('INPUT PATH')
//Make sure to end input path with a / EG C:/Example/