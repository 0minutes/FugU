import { Parser } from "./Parser.ts";
import {
    Program,
    ExpressionStatement,
    Instructions,
    Bytecode,
    Byte,
    NodeType,
    Statement,
    Expression,
    BinaryExpression,
} from "./shared.ts";


export class BytecodeGenerator {
    filename: string;
    source: string;

    parser: Parser;
    ast: Program;
    
    bytecode: Bytecode;

    constructor(source: string, filename?: string) {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
        this.parser = new Parser(this.source, this.filename);
        this.ast = this.parser.ast;
        this.bytecode = this.generateBytecode();
    };

    byteExpressionStatement = (ExprStmt: ExpressionStatement): Bytecode => {
        const bytecode: Bytecode = [];
        const Expr = ExprStmt.body[0];

        const traverse = (ast: Expression) => {
            switch (ast.type) {
                case NodeType.BinaryExpression : {
                    ast = ast as BinaryExpression;
                    traverse(ast.left as Expression);
                    traverse(ast.right as Expression);

                    switch (ast.operator) {
                        case '+' : {
                            bytecode.push([Instructions.add] as Byte);
                            break;
                        };
                        case '-' : {
                            bytecode.push([Instructions.sub] as Byte);
                            break;
                        };
                        case '*' : {
                            bytecode.push([Instructions.mul] as Byte);
                            break;
                        };
                        case '/' : {
                            bytecode.push([Instructions.div] as Byte);
                            break;
                        };
                        case '**' : {
                            bytecode.push([Instructions.pow] as Byte);
                            break
                        };
                        case '%' : {
                            bytecode.push([Instructions.mod] as Byte);
                            break;
                        };
                    };
                    break;
                };
                
                case NodeType.UnaryUpdateExpression : {
                    if (ast.prefix) {
                        switch (ast.operator) {
                            case '++':
                                bytecode.push([Instructions.push, 1]);
                                traverse(ast.argument as Expression);
                                bytecode.push([Instructions.add]);
                                break;
                            case '--':
                                bytecode.push([Instructions.push, 1]);
                                traverse(ast.argument as Expression);
                                bytecode.push([Instructions.sub]);
                                break;
                        }
                    }
                    else {
                        switch (ast.operator) {
                            case '++':
                                traverse(ast.argument as Expression);
                                bytecode.push([Instructions.push, 1]);
                                bytecode.push([Instructions.add]);
                                break;
                            case '--':
                                traverse(ast.argument as Expression);
                                bytecode.push([Instructions.push, 1]);
                                bytecode.push([Instructions.sub]);
                                break;
                        };
                    };
                    break;
                };

                

                case NodeType.Literal : {
                    bytecode.push([Instructions.push, ast.value] as Byte);
                    break;
                };

                case NodeType.Identifier : {
                    bytecode.push([Instructions.load, ast.value] as Byte);
                    break;
                };
            };
        };

        traverse(Expr as Expression);

        return bytecode;
    };

    bytePrimaryStatement = (Stmt: Statement): Bytecode => {
        const bytecode: Bytecode = [];
        
        switch (Stmt.type) {
            case NodeType.ExpressionStatement : {
                bytecode.push(...this.byteExpressionStatement(Stmt));
            };
        };
        
        return bytecode;
    }

    generateBytecode = (): Bytecode => {
        const bytecode: Bytecode = []

        for (let i = 0; i < this.ast.body.length; i++) {
            const Stmt = this.ast.body[i];

            switch (Stmt.type) {    
                default:
                    bytecode.push(...this.bytePrimaryStatement(Stmt));
            };
        };

        return bytecode;
    };
};


// TESTING PURPOSES

//const test = new BytecodeGenerator('x2 + x3', 'tst');
//console.log(test.bytecode);
