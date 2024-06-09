import { Parser } from "./Parser.ts";
import { LiteralValue } from "./shared.ts";
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

    byteHandleConstInt = (ExprStmt: Expression): Byte => {
        switch (ExprStmt.value) {
            case 0 : {
                return [Instructions.const_0] as Byte;
            };
            
            case 1 : {
                return [Instructions.const_1] as Byte;
            };

            case 2 : {
                return [Instructions.const_2] as Byte;
            };

            case 3 : {
                return [Instructions.const_3] as Byte;
            };

            case 4 : {
                return [Instructions.const_4] as Byte;
            };

            case 5 : {
                return [Instructions.const_5] as Byte;
            };

            case 6 : {
                return [Instructions.const_6] as Byte;
            };

            default : {
                return [Instructions.ipush, ExprStmt.value as number];
            };
        };
    };

    byteMatchType(ExprStmt: Expression): Byte {
        if (ExprStmt.runtimeValue == LiteralValue.BoolLiteral) {
            if (ExprStmt.value == true) {
                return [Instructions.const_1] as Byte;
            };  
            return [Instructions.const_0] as Byte
        };

        if (ExprStmt.runtimeValue == LiteralValue.StringLiteral) {
            return [Instructions.spush, ...this.byteStringToInt16(ExprStmt.value as string)] as Byte;
        };
        
        if (ExprStmt.runtimeValue == LiteralValue.FloatLiteral) {
            
            const float = String(ExprStmt.value);
            const floatSplit = float.split('.');

            // deno-lint-ignore no-explicit-any
            if (ExprStmt.value == parseInt(ExprStmt.value as any)) {
                return this.byteHandleConstInt(ExprStmt);
            };
            
            const rightValue = parseInt(floatSplit[0]);
            const leftValue = floatSplit[1];
            const leftDecimal: number[] = [];

            leftValue.split('').forEach(char => {
                leftDecimal.push(parseInt(char));
            });

            return [Instructions.fpush, float.length -1 ,rightValue, ...leftDecimal] as Byte;
        };
        
        if (ExprStmt.runtimeValue == LiteralValue.NullLiteral) {
            return [Instructions.const_null] as Byte;
        };

        return this.byteHandleConstInt(ExprStmt);

    };

    byteStringToInt16(str: string) {
        const strInt16: number[] = [];
        strInt16.push(str.length);

        str.split('').forEach(char => {
            strInt16.push(char.charCodeAt(0));
        });

        return strInt16;
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

                        case '!' : { 
                            bytecode.push([Instructions.not] as Byte);
                            break;
                        };

                        case '==' : {
                            bytecode.push([Instructions.eqls] as Byte);
                            break;
                        };
                        case '!=' : {
                            bytecode.push([Instructions.neqls] as Byte);
                            break;
                        };
                        
                        case '>' : {
                            bytecode.push([Instructions.gt] as Byte);
                            break;
                        };
                        case '<' : {
                            bytecode.push([Instructions.lt] as Byte);
                            break;
                        };

                        case '>=' : {
                            bytecode.push([Instructions.gteqls] as Byte);
                            break;
                        };
                        case '<=' : {
                            bytecode.push([Instructions.lteqls] as Byte);
                            break;
                        };

                        case '<<' : {
                            bytecode.push([Instructions.shl] as Byte);
                            break;
                        };
                        case '>>' : {
                            bytecode.push([Instructions.shr] as Byte);
                            break
                        };
                    };

                    break;
                };
                
                case NodeType.UnaryUpdateExpression : {
                    if (ast.prefix) {
                        switch (ast.operator) {
                            case '++':
                                bytecode.push([Instructions.const_1]);
                                traverse(ast.argument as Expression);
                                bytecode.push([Instructions.add]);
                                break;
                            case '--':
                                bytecode.push([Instructions.const_1]);
                                traverse(ast.argument as Expression);
                                bytecode.push([Instructions.sub]);
                                break;
                        }
                    }
                    else {
                        switch (ast.operator) {
                            case '++':
                                traverse(ast.argument as Expression);
                                bytecode.push([Instructions.const_1]);
                                bytecode.push([Instructions.add]);
                                break;
                            case '--':
                                traverse(ast.argument as Expression);
                                bytecode.push([Instructions.const_1]);
                                bytecode.push([Instructions.sub]);
                                break;
                        };
                    };
                    break;
                };

                case NodeType.UnaryExpression : {
                    traverse(ast.argument as Expression);
                    bytecode.push([Instructions.not] as Byte);
                    break;
                };

                case NodeType.Literal : {
                    bytecode.push(this.byteMatchType(ast));
                    break;
                };

                case NodeType.Identifier : {
                    bytecode.push([Instructions.load, ...this.byteStringToInt16(ast.value as string)] as Byte);
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
        bytecode.push([Instructions.halt] as Byte);
        return bytecode;
    };

    bytecodeEncode = (bytecode: Bytecode, radix: number, bits: number, char: string = '0'): string[] => {
        const encoded: string[] = [];
    
        for (let i = 0; i < bytecode.length; i++) {
            const byte = bytecode[i];
            for (let j = 0; j < byte.length; j++) {
                const bit = byte[j];
                encoded.push(bit.toString(radix).padStart(bits, char));
            };
        };
    
        return encoded;
    };
};

// TESTING PURPOSES

// const Generator = new BytecodeGenerator('1 + 1', 'tst');
// const bytecode: Bytecode = Generator.bytecode;
// console.log(bytecode);