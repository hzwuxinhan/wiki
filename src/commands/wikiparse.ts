import * as vscode from 'vscode';
import wikiFactory from '../parsewiki/index'


export function activate(context: vscode.ExtensionContext) {
    let wikiparse = vscode.commands.registerCommand('extension.wikiparse', () => {

        let wikiconfig = vscode.workspace.getConfiguration('wiki');
        if (!wikiconfig.userName || !wikiconfig.passWord || !wikiconfig.pageUrl) {
            return vscode.window.showErrorMessage("please config first")
        }
        let useringPwd = wikiconfig.passWord
        if(!/wiki\-pwd:.*/.test(useringPwd)) {
            let b = "wiki-pwd:"+new Buffer(useringPwd).toString('base64');
            wikiconfig.update("passWord",b,true)
        }else{
            useringPwd = useringPwd.replace("wiki-pwd:","");
            useringPwd = new Buffer(useringPwd,"base64").toString()
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
                    username:wikiconfig.userName,
                    password:useringPwd,
                    mainUrl:wikiconfig.pageUrl,
                    mockPath:wikiconfig.mockPath,
                    ftlPre:wikiconfig.ftlPre,
                    tddPre:wikiconfig.tddPre,
                    rootPath:rootpath
                } 
                const WIKI = new wikiFactory(configData)
                WIKI.login().then((loginres)=>{
                    WIKI.getPaths().then((datas:any)=>{
                        if(!datas.length) return vscode.window.showErrorMessage("please ensure is pageid exits")
                        let items = [{
                            label:"全部",
                            description:"",
                            index:"all"
                        }];
                        datas.forEach(function(one){
                            items.push({
                                label:one.path,
                                description:one.des,
                                index:one.index
                            })
                        })
                        vscode.window.showQuickPick(items,{ placeHolder: "select item which you want parse", matchOnDescription: true }).then((item)=>{
                            if(item.index == "all") {
                                for(let i=1;i<items.length;i++) {
                                    getOneDetail(WIKI,items[i])
                                }
                            }else {
                                getOneDetail(WIKI,item)
                            }
                            
                        },(e)=>{
                            
                        })
                    },()=>{
                        vscode.window.showErrorMessage("parse error")
                    })
                },()=>{
                    vscode.window.showErrorMessage("login failed! please check your config of wiki")
                })
            }
        },(e)=>{
            vscode.window.showErrorMessage("error failed")
        })

    });

    function getOneDetail(WIKI,item) {  
        WIKI.getDetail(item.index).then((result:any)=>{
            vscode.window.showInformationMessage(`文件${item.label}创建成功`,{
                "title":"查看"
            }).then(res=>{
                if(res.title=="查看") {
                    vscode.workspace.openTextDocument(result.filePath).then((a: vscode.TextDocument) => {
                        vscode.window.showTextDocument(a, vscode.ViewColumn.One, true)
                    })
                }
            })
        },(e)=>{
            console.log(e)
        })
    }

    context.subscriptions.push(wikiparse);
}