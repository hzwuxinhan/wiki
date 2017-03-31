// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as wikiconfig from './commands/wikiconfig';
import * as wikiparse from './commands/wikiparse';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext): Promise<any> {
    wikiconfig.activate(context);
    wikiparse.activate(context);
}
