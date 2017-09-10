import * as vscode from 'vscode';
import { ElixirSenseClient } from './elixirSenseClient';
import { checkElixirSenseClientInitialized, checkTokenCancellation } from './elixirSenseValidations';

export class ElixirSenseHoverProvider implements vscode.HoverProvider {

    constructor(private elixirSenseClient: ElixirSenseClient) { }

    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Hover> {
        return new Promise((resolve, reject) => {

            const payload = {
                buffer : document.getText(),
                line   : position.line + 1,
                column : position.character + 1
            };

            return Promise.resolve(this.elixirSenseClient)
            .then((elixirSenseClient) => checkElixirSenseClientInitialized(elixirSenseClient))
            .then((elixirSenseClient) => elixirSenseClient.send('docs', payload))
            .then((result) => checkTokenCancellation(token, result))
            .then((result) => {
                const { actual_subject, docs } = result;
                if (!docs) {
                    console.error('rejecting');
                    reject();
                    return;
                }
                const wordAtPosition = document.getWordRangeAtPosition(position);
                const hover = new vscode.Hover(docs.docs, wordAtPosition);
                resolve(hover);
            })
            .catch((err) => {
                console.error('rejecting', err);
                reject();
            });
        });
    }
}
