'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function getFile (text,rootpath,fileType) {
    var reg = /[\'\"](\.|\/).*[\"\']/;
    if(text.match(reg)){
        text = text.match(reg)[0].replace(/[\"\']/g,"")
    }else {
        text = ""
    }
    if(text) {
        if(fileType) text+="."+fileType;
        const dirname = path.dirname(rootpath);
        const filePath = path.join(dirname,text);
        if(fs.existsSync(filePath)) {
            return {
                file:filePath,
                exist:true
            }
        }else{
            return {
                file:filePath,
                exist:false
            }
        }
       
    }else{
        return null
    }
}

export function createFile (filePath) {
    const dirname = path.dirname(filePath);
    ensureDir(dirname)
    fs.writeFileSync(filePath,"")
}


export function ensureDir(dir) {
    if(fs.existsSync(dir)){
        return
    }
    const parent = path.dirname(dir)
    ensureDir(parent)
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir)
    }
}

export function getFileType (typeName) {
    var obj = {
        "typescript":"ts",
        "vue":"vue"
    }
    return obj[typeName];
}