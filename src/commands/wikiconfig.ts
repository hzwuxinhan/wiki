import * as vscode from 'vscode';
import {
    Environment
} from '../environmentPath';

export function activate(context: vscode.ExtensionContext) {

    function isEmptyObj(obj) {
        let t;
        for (t in obj)
            return !1;
        return !0
    }

    let wikiconfig = vscode.commands.registerCommand('wiki.config', () => {

        let configs = vscode.workspace.getConfiguration('wiki')
        const en = new Environment(context)

        vscode.workspace.openTextDocument(en.FILE_SETTING).then((a: vscode.TextDocument) => {
            vscode.window.showTextDocument(a, vscode.ViewColumn.One, true).then((e: vscode.TextEditor) => {
                const requiredConfig = ["username","password","mainUrl"]
                requiredConfig.forEach(one=>{
                    if (!configs[one]) configs.update(one,"",true)
                })
                
            })
        })

    });

    context.subscriptions.push(wikiconfig);
}