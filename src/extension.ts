// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let disposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
  vscode.languages.registerFoldingRangeProvider(
    "prr",
    new FoldingRangeProvider(),
  );
  vscode.languages.registerDefinitionProvider("prr", new DefinitionProvider());
}

export function deactivate() {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
}

class FoldingRangeProvider implements vscode.FoldingRangeProvider {
  onDidChangeFoldingRanges?: vscode.Event<void> | undefined;

  provideFoldingRanges(
    document: vscode.TextDocument,
    context: vscode.FoldingContext,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.FoldingRange[]> {
    const result: vscode.FoldingRange[] = [];

    var lastDiff: number | undefined = undefined;
    for (var lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
      const line = document.lineAt(lineNumber);
      if (line.text.startsWith("> diff")) {
        if (lastDiff !== undefined) {
          result.push(new vscode.FoldingRange(lastDiff, lineNumber - 1));
        }
        lastDiff = lineNumber;
      }
    }

    return result;
  }
}

class DefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    var diff: vscode.TextLine | undefined = undefined;
    for (var lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
      if (token.isCancellationRequested) return undefined;
      const line = document.lineAt(lineNumber);
      if (line.text.startsWith("> diff")) diff = line;
      if (position.line === lineNumber) break;
    }
    if (diff === undefined) return undefined;
    const [_, path] = diff.text.split(" b/");
    if (path === undefined) return undefined;

    const folder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (folder === undefined) return undefined;

    const uri = vscode.Uri.file(folder.uri.fsPath + "/" + path);
    return new vscode.Location(uri, new vscode.Position(0, 0));
  }
}
