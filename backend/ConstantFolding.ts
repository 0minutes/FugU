// deno-lint-ignore-file no-explicit-any
import {
    NodeType,
    Statement,
    Warning,
    makePosition,
} from './shared.ts';

export class ConstantFolding {
    source: string;
    filename: string;
    constructor(source: string, filename?: string) {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
    };

    fold = (ast: any) => {
        if (ast.type == NodeType.Literal) {
            return ast;
        }

        else if (ast.type == NodeType.EmptyStatement) {
            new Warning('Empty Statement', makePosition(this.filename, ast.range[0], ast.range[1], ast.range[2]), this.source);
            return 'Next';
        }
        
        else if (ast.type == NodeType.Program) {
            const newBody: Statement[] = [];

            ast.body.forEach((Stmt: Statement) => {
                    const folded = this.fold(Stmt);

                    if (folded != 'Next') {
                        newBody.push(folded);
                    };
                }
            );

            ast.body = newBody;
            
            return ast;
        }

        else {
            return ast;
        }
    };
}; 
