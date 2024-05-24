import { Statement } from './shared.ts';

export class ConstantFolding {
    source: string;
    filename: string;
    constructor(source: string, filename?: string) {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
    };

    fold = (ast: any) => {
        if (ast.type == 'Literal') {
            return ast;
        }

        else if (ast.type == 'Program') {
            const newBody: Statement[] = [];

            ast.body.forEach((Stmt: Statement) => {
                const folded = this.fold(Stmt);

                if (folded != 'Skip') {
                    newBody.push(folded);
                };
            });
            ast.body = newBody;
            return ast;
        }

        else if (ast.type == 'EmptyStatement') {
            
            return 'Skip';
        }
        else {
            return ast;
        }
    };
}; 
