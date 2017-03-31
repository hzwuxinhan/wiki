import * as vscode from 'vscode';
import * as wikiFactory from 'parsewiki';
import {
    getFile,
    createFile,
    getFileType
} from '../pathFactory';

export function activate(context: vscode.ExtensionContext) {
    let wikiparse = vscode.commands.registerCommand('wiki.parse', () => {

        let wikiconfig = vscode.workspace.getConfiguration('wiki.config')
        if (!wikiconfig.username || !wikiconfig.password || !wikiconfig.mainUrl) {
            return vscode.window.showErrorMessage("please config first")
        }
        let options: vscode.InputBoxOptions = {
            ignoreFocusOut: true,
            placeHolder: "Enter the pageid which you want parsed",
            prompt: "Example : 20480518 "
        };

        const rootpath = vscode.workspace.rootPath;
        
        vscode.window.showInputBox(options).then(async(res) => {
            if (res) {
                const configData = {
                    pageId:res,
                    username:wikiconfig.username,
                    password:wikiconfig.password,
                    mainUrl:wikiconfig.mainUrl,
                    mockPath:wikiconfig.mockPath,
                    ftlPre:wikiconfig.ftlPre,
                    tddPre:wikiconfig.tddPre,
                    rootPath:rootpath
                } 
                const WIKI = new wikiFactory(configData)
                WIKI.login().then(()=>{
                    WIKI.getPaths().then(datas=>{
                        if(!datas.length) return vscode.window.showErrorMessage("please ensure is pageid exits")
                        let items = []
                        datas.forEach(function(one){
                            items.push({
                                label:one.path,
                                description:one.des,
                                index:one.index
                            })
                        })
                        vscode.window.showQuickPick(items,{ placeHolder: "select item which you want parse", matchOnDescription: true }).then((item)=>{
                            WIKI.getDetail(item.index).then((result)=>{
                                vscode.window.showInformationMessage(`文件${item.label}创建成功`)
                            },(e)=>{
                                console.log(e)
                            })
                        },(e)=>{
                            
                        })
                    },()=>{
                        vscode.window.showErrorMessage("parse error")
                    })
                },()=>{
                    vscode.window.showErrorMessage("login failed! please check your username and password")
                })
            }
        },(e)=>{
            vscode.window.showErrorMessage("error failed")
        })

    });

    context.subscriptions.push(wikiparse);
}