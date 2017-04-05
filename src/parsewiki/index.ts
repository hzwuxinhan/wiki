import * as fs from 'fs'
import * as path from 'path'
import util from './util'
import WikiReptile from './WikiReptile'
import generate  from './generate'


export default class parseWiki {
    public rootPath:string;
    public mockPath:string;
    public ftlPre:string;
    public tddPre:string;
    public wikiReptile:any;
    public paths:any;

    constructor(config:any) {
        this.rootPath = config.rootPath;
        this.mockPath = config.mockPath?config.mockPath:"src/test/mock"
        this.ftlPre = config.ftlPre?config.ftlPre:'src/main/webapp/WEB-INF/tmpl'
        this.tddPre = config.tddPre?config.tddPre:'src/test/mock/tdd'
        this.wikiReptile = new WikiReptile (config.username,config.password,config.pageId,config.mainUrl)
    }

    async login() {
        const self = this;
        return new Promise((resolve, reject) => {
            self.wikiReptile.login().then((result:any) => {
                if (result.res.headers["x-seraph-loginreason"] == "OK") return resolve("success")
                return reject("failed")
            }, (e) => {
                return reject("login error")
            })
        })

    }

    async getPaths() {
        const self = this;
        return new Promise((resolve, reject) => {
            self.wikiReptile.getPaths().then(paths => {
                self.paths = paths;
                return resolve(paths)
            },(e)=>{
                return reject("error")
            }).catch(()=>{
                return reject("error")
            })
        })
    }

    async getDetail(index) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.wikiReptile.getDetail(index).then(data => {
                let ajaxPath = self.paths[index].path
                let ajaxPathPre
                let folderPath
                let filePath
                if(new RegExp(self.ftlPre, 'i').test(ajaxPath)) {
                    ajaxPath = ajaxPath.replace(self.ftlPre,self.tddPre).replace(/\.ftl/,".tdd")
                    ajaxPathPre = ajaxPath.match(/.+\//)[0]
                    folderPath = path.join(self.rootPath,ajaxPathPre)
                    filePath = path.join(self.rootPath, ajaxPath)
                }else{
                    ajaxPathPre = ajaxPath.match(/.+\//)[0]
                    folderPath = path.join(self.rootPath,self.mockPath, ajaxPathPre)
                    filePath = path.join(self.rootPath,self.mockPath, ajaxPath)
                }
                util.ensureDir(folderPath)
                fs.writeFileSync(filePath, JSON.stringify(generate(data), null, 4))
                resolve({filePath:filePath})
            },(e)=>{
                reject(e)
            }).catch((e)=>{
                reject(e)
            })
        })
    }

}

