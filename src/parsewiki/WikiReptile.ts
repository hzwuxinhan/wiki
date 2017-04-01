import * as request from 'request'
import * as requestrp from 'request-promise-native'
import * as fs from 'fs'
import * as cheerio from 'cheerio'
import * as path from 'path'


const certFile = path.resolve(__dirname, 'key')



function trimString(str) {
    return typeof str === 'string' ? str.replace(/\n| /g, '') : str
}

export default class WikiReptile {

    public username: string;
    public pwd: string;
    public mainUrl: string;
    public mainPath: string;
    public $mainPage: any;
    public $interfaceList: any;
    public requestrp:any;
    public j:any;

    constructor(name, pwd, pageId, mainUrl) {
        this.username = name
        this.pwd = pwd
        this.mainUrl = mainUrl
        this.mainPath = `/pages/viewpage.action?pageId=${pageId}`,
        this.requestrp = requestrp;
    }

    async getPaths() {
        const self = this
        this.$mainPage = cheerio.load(await self.sendReq(self.mainPath))
        this.$interfaceList = self.$mainPage('.wiki-content ol li')
        const paths = []
        for (let i = 0; i < self.$interfaceList.length; i++) {
            const thatText = self.$interfaceList.eq(i).text()
            if (self.$interfaceList.eq(i).children().length > 2) {

                const destext = thatText.match(/[0-9\,\，\u4E00-\u9FA3]{1,}/)
                const des = trimString(destext ? destext[0] : "")
                const outpath = trimString(thatText.replace(/[c|C]ontent[\-]*[t|T]ype[:|：].*json/, "").match(/.+\/.+|.+\.(json|ftl)/)[0]).replace(/ftl文件[\s]*[：|:][\s]*/, "")
                paths.push({
                    path: outpath,
                    des: des,
                    index: i
                })
            }
        }
        return paths
    }

    async getDetail(index) {
        var self = this;
        const that = self.$interfaceList[index]
        let output = await self.parseTableData(self.$mainPage(that).find('.table-wrap .confluenceTable').eq(1))
        if (output == null) output = await self.parseTableData(self.$mainPage(that).find('.table-wrap .confluenceTable').eq(0))
        return output
    }

    async login() {
        const self = this;
        const options = {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: `${this.mainUrl}`,
            body: `os_username=${this.username}&os_password=${this.pwd}&login=登录`,
            cert: fs.readFileSync(certFile)
        };
        return new Promise((resolve, reject) => {
            self.requestrp.post(options, (e, res, body) => {
                if (e) return reject(e)
                self.j = self.requestrp.jar();
                let cookie = self.requestrp.cookie(res.headers["set-cookie"][0]);
                const url = self.mainUrl;
                self.j.setCookie(cookie, url);
                return resolve({res:res, body:body})
            })
        })
    }

    async parseTableData($table) {
        const properties = {}
        const trList = $table.find('tr')
        for (let i = 0; i < trList.length; i++) {
            const $tdList = trList.eq(i).find('td')
            if ($tdList.length === 0) continue
            const analyseResult = await this.analyseDataType($tdList.eq(1))
            properties[trimString($tdList.eq(0).text())] = Object.assign({
                description: trimString($tdList.eq(2).text())
            }, analyseResult)
        }
        for (let key in properties) return properties
        return null
    }

    async analyseDataType($typeTd) {
        let result:any = {}

        const $aList = $typeTd.find ? $typeTd.find('a') : null
        const typeText = typeof $typeTd === 'string' ? $typeTd : $typeTd.text().toLowerCase()
        if ($aList && $aList.length > 0) {
            if (/list<[A-Za-z0-9]*>/.test(trimString(typeText)) && $aList.length === 1) { // List<xxxx>
                result.type = 'array'
                const $ = cheerio.load(await this.sendReq($aList.eq(0).attr('href')))
                result.items = (await this.parseTableData($('.confluenceTable')))
            } else if ($aList.length === 1 && !/list<[A-Za-z0-9]*>/.test(trimString(typeText))) { // xxxx
                result.type = 'object'
                const $ = cheerio.load(await this.sendReq($aList.eq(0).attr('href')))
                const schema = await this.parseTableData($('.confluenceTable'))
                result.properties = schema ? schema : null
            } else if (/map<[A-Za-z0-9]*,[A-Za-z0-9|\s]*>/.test(trimString(typeText)) && $aList.length === 1) { // Map<String, xxxx>
                result.type = 'object'
                const $ = cheerio.load(await this.sendReq($aList.eq(0).attr('href')))
                result.properties = (await this.parseTableData($('.confluenceTable')))
            } else if ($aList.length === 2 && /[A-Za-z0-9]*<[A-Za-z0-9]*>/.test(trimString(typeText))) { // CursorSearchResult<xxx>
                result.type = 'object'
                const [$0, $1] = (await Promise.all([this.sendReq($aList.eq(0).attr('href')), this.sendReq($aList.eq(1).attr('href'))])).map(html => cheerio.load(html))
                result.properties = (await this.parseTableData($0('.confluenceTable')))
                result.properties.result && (result.properties.result = {
                    type: 'array',
                    items: (await this.parseTableData($1('.confluenceTable')))
                })
            }
        } else {
            if (/^((number)|(long)|(double)|(int)|(integer))$/.test(trimString(typeText))) result.type = 'number'
            else if (/^(boolean)$/.test(trimString(typeText))) result.type = 'boolean'
            else if (/^(string)$/.test(trimString(typeText))) result.type = 'string'
            else if (/^list<[A-Za-z0-9]*>$/.test(trimString(typeText))) {
                result.type = 'array'
                result.items = {
                    // type: `list<${trimString(typeText)}>`
                    type: (await this.analyseDataType(trimString(typeText).replace(/^list</, '').replace(/>$/, ''))).type

                }
            }
        }
        return result
    }

    sendReq(path) {
        const self = this
        return new Promise((resolve, rejcet) => {
            self.requestrp.get({
                url: `${self.mainUrl}${path}`,
                jar:self.j
            }, (e, res, body) => {
                if (e) return rejcet(e)
                return resolve(body)
            })
        })
    }
}