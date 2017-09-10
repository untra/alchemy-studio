import * as vscode from 'vscode';
import { configuration } from './configuration';
import { ElixirSenseAutocompleteProvider } from './elixirSenseAutocompleteProvider';
import { ElixirSenseClient } from './elixirSenseClient';
import { ElixirSenseDefinitionProvider } from './elixirSenseDefinitionProvider';
import { ElixirSenseHoverProvider } from './elixirSenseHoverProvider';
import { ElixirSenseServerProcess } from './elixirSenseServerProcess';
import { ElixirSenseSignatureHelpProvider } from './elixirSenseSignatureHelpProvider';
import { ElixirServer } from './elixirServer';

const ELIXIR_MODE: vscode.DocumentFilter = { language: 'elixir', scheme: 'file' };
// tslint:disable-next-line:prefer-const
let elixirServer: ElixirServer;
// Elixir-Sense
let useElixirSense: boolean;
let elixirSenseServer: ElixirSenseServerProcess;
let elixirSenseClient: ElixirSenseClient;

export function activate(ctx: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "alchemy-studio" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed
        vscode.window.showInformationMessage('Hello World!');
    });
    const elixirSetting = vscode.workspace.getConfiguration('elixir');
    useElixirSense = elixirSetting.useElixirSense;

    ElixirSenseServerProcess.initClass();
    // TODO: detect environment automatically.
    const env = elixirSetting.elixirEnv;
    const projectPath = vscode.workspace.rootPath;
    elixirSenseServer = new ElixirSenseServerProcess(vscode.workspace.rootPath, (host, port, authToken) => {
        elixirSenseClient = new ElixirSenseClient(host, port, authToken, env, projectPath);
        const autoCompleteProvider = new ElixirSenseAutocompleteProvider(elixirSenseClient);
        const definitionProvider = new ElixirSenseDefinitionProvider(elixirSenseClient);
        const hoverProvider = new ElixirSenseHoverProvider(elixirSenseClient);
        const signatureHelpProvider = new ElixirSenseSignatureHelpProvider(elixirSenseClient);
        ctx.subscriptions.concat([
            // vscode.languages.registerCodeActionsProvider(ELIXIR_MODE, codeActionsProvider);
            // vscode.languages.registerCodeLensProvider(ELIXIR_MODE, codeLensProvider);
            // vscode.languages.registerDocumentFormattingEditProvider(ELIXIR_MODE, documentFormattingEditProvider);
            // vscode.languages.registerDocumentHighlightProvider(ELIXIR_MODE, documentHighlightProvider);
            // vscode.languages.registerDocumentLinkProvider(ELIXIR_MODE, documentLinkProvider);
            // vscode.languages.registerDocumentSymbolProvider(ELIXIR_MODE, documentSymbolProvider);
            // vscode.languages.registerImplementationProvider(ELIXIR_MODE, implementationProvider);
            vscode.languages.registerCompletionItemProvider(ELIXIR_MODE, autoCompleteProvider, '.', '{', '@'),
            vscode.languages.registerDefinitionProvider(ELIXIR_MODE, definitionProvider),
            vscode.languages.registerHoverProvider(ELIXIR_MODE, hoverProvider),
            vscode.languages.registerSignatureHelpProvider(ELIXIR_MODE, signatureHelpProvider, '(', ','),
            vscode.languages.setLanguageConfiguration('elixir', configuration)
        ]);
    });
    elixirSenseServer.start(0, env);
}

export function deactivate() {
    if (useElixirSense) {
        elixirSenseServer.stop();
    } else {
        this.elixirServer.stop();
    }
}
