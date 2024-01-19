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
}

// this method is called when your extension is deactivated
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
