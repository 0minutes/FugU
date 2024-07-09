import { Parser } from "./Parser.ts";
import
{
    Instructions,
    NodeType,
    LiteralValue,
    Program,
    Statement,
    Expression,
    BinaryExpression,
    Literal,
} from "./shared.ts";



export class ByteEncoder
{
    filename: string | undefined;
    source: string;

    parser: Parser;
    ast: Program;
    intermidiate: [];
    bytecode: number[]

    constructor(source: string, filename ? : string)
    {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
        this.parser = new Parser(source, this.filename);
        this.ast = this.parser.ast;
        this.intermidiate = [];
        this.bytecode = this.generateProgram(this.ast);
    };

    generateProgram = (ast: Program): number[] =>
    {
        const Bytecode: number[] = [];

        for (let i = 0; i < ast.body.length; i++)
        {
            const Stmt = ast.body[i];

            Bytecode.push(...this.generateStatement(Stmt));
        };
        
        return Bytecode;
    };

    generateStatement = (ast: Statement): number[] =>
    {
        const Bytecode: number[] = [];

        switch (ast.type)
        {
            case NodeType.ExpressionStatement:
            {
                const Expr: Expression = ast.body[0];

                Bytecode.push(...this.generateExpression(Expr));
                break;
            };
        };
        return Bytecode;
    };

    generateExpression = (ast: Expression): number[] =>
    {
        const Bytecode: number[] = [];

        const traverse = (ast: Expression) =>
        {
            switch (ast.type)
            {
                case NodeType.Literal:
                {
                    Bytecode.push(...this.generateLiteral(ast as Literal));
                    break;
                };

                case NodeType.BinaryExpression:
                {
                    ast = ast as BinaryExpression;
                    traverse(ast.left as Expression);
                    traverse(ast.right as Expression);
                    switch (ast.operator)
                    {
                        case '+':
                        {
                            Bytecode.push(Instructions.add);
                            break;
                        };
                        case '-':
                        {
                            Bytecode.push(Instructions.sub);
                            break;
                        };
                        case '*':
                        {
                            Bytecode.push(Instructions.mul);
                            break;
                        };
                        case '/':
                        {
                            Bytecode.push(Instructions.div);
                            break;
                        };
                        case '**':
                        {
                            Bytecode.push(Instructions.pow);
                            break
                        };
                        case '%':
                        {
                            Bytecode.push(Instructions.mod);
                            break;
                        };

                        case '!':
                        {
                            Bytecode.push(Instructions.not);
                            break;
                        };

                        case '==':
                        {
                            Bytecode.push(Instructions.eqls);
                            break;
                        };
                        case '!=':
                        {
                            Bytecode.push(Instructions.neqls);
                            break;
                        };

                        case '>':
                        {
                            Bytecode.push(Instructions.gt);
                            break;
                        };
                        case '<':
                        {
                            Bytecode.push(Instructions.lt);
                            break;
                        };

                        case '>=':
                        {
                            Bytecode.push(Instructions.gteqls);
                            break;
                        };
                        case '<=':
                        {
                            Bytecode.push(Instructions.lteqls);
                            break;
                        };

                        case '<<':
                        {
                            Bytecode.push(Instructions.shl);
                            break;
                        };
                        case '>>':
                        {
                            Bytecode.push(Instructions.shr);
                            break
                        };
                    };

                    break;
                };

                case NodeType.UnaryUpdateExpression:
                {
                    if (ast.prefix)
                    {
                        switch (ast.operator)
                        {
                            case '++':
                                Bytecode.push(Instructions.const_1);
                                traverse(ast.argument as Expression);
                                Bytecode.push(Instructions.add);
                                break;
                            case '--':
                                Bytecode.push(Instructions.const_1);
                                traverse(ast.argument as Expression);
                                Bytecode.push(Instructions.sub);
                                break;
                        }
                    }
                    else
                    {
                        switch (ast.operator)
                        {
                            case '++':
                                traverse(ast.argument as Expression);
                                Bytecode.push(Instructions.const_1);
                                Bytecode.push(Instructions.add);
                                break;
                            case '--':
                                traverse(ast.argument as Expression);
                                Bytecode.push(Instructions.const_1);
                                Bytecode.push(Instructions.sub);
                                break;
                        };
                    };
                    break;
                };

                case NodeType.UnaryExpression:
                {
                    switch (ast.operator)
                    {
                        case '!':
                        {
                            traverse(ast.argument as Expression);
                            Bytecode.push(Instructions.not);
                            break;
                        };


                        case '+':
                        {   
                            traverse(ast.argument as Expression);
                            break;
                        };

                        case '-':
                        {
                            Bytecode.push(Instructions.const_0);
                            traverse(ast.argument as Expression);
                            Bytecode.push(Instructions.sub);
                            break;
                        };
                    };
                    break;
                };
            };
        };

        traverse(ast as Expression);

        return Bytecode;
    };

    generateLiteral = (ast: Literal): number[] =>
    {
        const Bytecode: number[] = [];
        
        if (ast.runtimeValue == LiteralValue.BoolLiteral)
        {
            Bytecode.push(ast.value == true ? Instructions.const_1 : Instructions.const_0);
        }
        else if (ast.runtimeValue == LiteralValue.NumberLiteral)
        {
            Bytecode.push(...this.generateConstInt(ast.value as number));
        }
        else if (ast.runtimeValue == LiteralValue.FloatLiteral)
        {
            Bytecode.push(...this.generateConstFloat(ast.value as number));
        }
        else if (ast.runtimeValue == LiteralValue.StringLiteral)
        {
            Bytecode.push(...this.generateConst32bitString(ast.value as string))
        }
        else if (ast.runtimeValue == LiteralValue.NullLiteral)
        {
            Bytecode.push(Instructions.const_null);
        }

        return Bytecode;
    };

    generateConstInt = (value: number): number[] => {
        const Bytecode = [];

        if (value == 0) return [Instructions.const_0];
        else if (value == 1) return [Instructions.const_1];
        else if (value == 2) return [Instructions.const_2];
        else if (value == 3) return [Instructions.const_3];
        else if (value == 4) return [Instructions.const_4];
        else if (value == 5) return [Instructions.const_5];
        else if (value == 6) return [Instructions.const_6];
    
        else if (value <= (2 ** 8) - 1)
        {
            Bytecode.push(Instructions.u8push);
            Bytecode.push(value);
        }
        
        else if (value <= (2 ** 16) - 1) {
            Bytecode.push(Instructions.u16push);
            Bytecode.push(value & 0xFF);
            Bytecode.push((value >> 8) & 0xFF);
        }
        
        else if (value <= (2 ** 32) - 1) {
            Bytecode.push(Instructions.u32push);
            for (let i = 0; i < 4; i++) {
                Bytecode.push((value >> (8 * i)) & 0xFF);
            }
        }
        
        else if (value <= (2 ** 64) - 1) {
            Bytecode.push(Instructions.u64push);
            for (let i = 0; i < 8; i++) {
                Bytecode.push((value >> (8 * i)) & 0xFF);
            }
        };
    
        return Bytecode;
    };

    generateConstFloat = (value: number): number[] => {
        const Bytecode = [];

        const buffer = new ArrayBuffer(8);
        const floatArray = new Float64Array(buffer);
        const uint8Array = new Uint8Array(buffer);
    
        floatArray[0] = value;
    
        if (value >= -3.4e+38 && value <= 3.4e+38)
        {
            Bytecode.push(Instructions.fpush);
            for (let i = 0; i < 4; i++)
            {
                Bytecode.push(uint8Array[i]);
            }
        }
        
        else if (value >= -1.7e+308 && value <= 1.7e+308)
        {
            Bytecode.push(Instructions.dpush);
            for (let i = 0; i < 8; i++)
            {
                Bytecode.push(uint8Array[i]);
            }
        }
    
        return Bytecode;
    };

    generateConst32bitString = (str: string): number[] =>
    {
        const Bytecode: number[] = [];
        Bytecode.push(Instructions.spush)
        for (let i = 0; i < str.length; i++)
        {
            const charCode = str.charCodeAt(i);
            Bytecode.push(charCode);
        };
    
        return Bytecode;
    };

    viewAs = (bytecode: number[], radix: number, bits: number = 0, char: string = '0') => {
        const encoded: string[] = [];
    
        for (let i = 0; i < bytecode.length; i++) {
            const byte = bytecode[i];
            encoded.push(byte.toString(radix).padStart(bits, char));
        };
    
        return encoded;
    };
};

// TESTING PURPOSES

// const test = new ByteEncoder('1-1', 'tst');
// console.log(test.viewAs(test.bytecode, 10));