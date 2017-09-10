'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const util = require('util');
const exec = util.promisify(require('child_process').exec);
import * as vscode from 'vscode';

async function cmd() {
    const { stdout, stderr } = await exec(cmd);
}
