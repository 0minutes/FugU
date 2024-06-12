import
{
    Parser
}
from "./Parser.ts";
import
{
    Program,
    Instructions,
    NodeType,
    Statement,
    Expression,
    BinaryExpression,
    LiteralValue,
    Bytecode,
    PoolElementCodes,
}
from "./shared.ts";


export class BytecodeGenerator
{
    filename: string;
    source: string;

    parser: Parser;
    ast: Program;
    label: number;
    dataPool: number[];
    bytecode: number[];

    constructor(source: string, filename ? : string)
    {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
        this.parser = new Parser(source, this.filename);

        this.ast = this.parser.ast;
        this.label = 0;
        this.dataPool = [];
        this.bytecode = this.genBytesProgram(this.ast);
    };

    pushdata = (data: number[]): number => 
    {
        this.label = this.label + 1;
        this.dataPool.push(this.label as never,...data);
        return this.label;
    };


    genbytesString = (ExprStmt: Expression): number[] =>
    {
        const strBytes: number[] = []
        const str = String(ExprStmt.value);

        str.split('').forEach(char =>
        {
            strBytes.push(char.charCodeAt(0));
        });

        strBytes.unshift(str.length);

        this.pushdata([PoolElementCodes.str, ...strBytes])
        return [Instructions.sload, this.label];
    };

    genBytesFloat = (ExprStmt: Expression): number[] => {
        const float = String(ExprStmt.value);
        const floatSplit = float.split('.');

        // deno-lint-ignore no-explicit-any
        if (ExprStmt.value == parseInt(ExprStmt.value as any)) {
            return this.genBytesConst(ExprStmt);
        };
        
        const rightValue = parseInt(floatSplit[0]);
        const leftValue = floatSplit[1];
        const leftDecimal: number[] = [];

        leftValue.split('').forEach(char => {
            leftDecimal.push(parseInt(char));
        });

        if (leftDecimal.length <= 7) 
        {
            this.pushdata([PoolElementCodes.flt, float.length -1, rightValue, ...leftDecimal])
            return [Instructions.fload, this.label];
        }

        else 
        {
            this.pushdata([PoolElementCodes.dflt, float.length -1, rightValue, ...leftDecimal])
            return [Instructions.dload, this.label];
        };
    };

    genBytesConst = (ExprStmt: Expression): number[] =>
    {
        if (ExprStmt.value === 0) return [Instructions.const_0];

        else if (ExprStmt.value as number === 1) return [Instructions.const_1];

        else if (ExprStmt.value as number === 2) return [Instructions.const_2];

        else if (ExprStmt.value as number === 3) return [Instructions.const_3];

        else if (ExprStmt.value as number === 4) return [Instructions.const_4];

        else if (ExprStmt.value as number === 5) return [Instructions.const_5];

        else if (ExprStmt.value as number === 6) return [Instructions.const_6];

        else if (ExprStmt.value as number >= 0)
        {
            if (ExprStmt.value as number <= (2 ** 8 )/2-1) return [Instructions.u8push, ExprStmt.value as number];

            else if (ExprStmt.value as number <= (2 ** 16)/2-1) return [Instructions.u16push, ExprStmt.value as number];

            else if (ExprStmt.value as number <= (2 ** 32)/2-1) return [Instructions.u32push, ExprStmt.value as number];

            else if (ExprStmt.value as number <= (2 ** 64)/2-1) return [Instructions.u64push, ExprStmt.value as number];

            else return [Instructions.ulpush, ExprStmt.value as number];
        }

        else if (ExprStmt.value as number < 0)
        {
            if (ExprStmt.value as number <= -(2 ** 8)/2) return [Instructions.s8push, ExprStmt.value as number];

            else if (ExprStmt.value as number <= -(2 ** 16)/2) return [Instructions.s16push, ExprStmt.value as number];

            else if (ExprStmt.value as number <= -(2 ** 32)/2) return [Instructions.s32push, ExprStmt.value as number];

            else if (ExprStmt.value as number <= -(2 ** 64)/2) return [Instructions.s64push, ExprStmt.value as number];

            else return [Instructions.slpush, ExprStmt.value as number];
        };

        return [Instructions.apush, ExprStmt.value as number];
    };

    genbytesLiteral = (Expr: Expression): number[] =>
    {
        const bytecode: Bytecode = [];

        if (Expr.runtimeValue == LiteralValue.BoolLiteral)
        {
            if (Expr.value == true)
            {
                bytecode.push(Instructions.const_0);
            }
            else {
                bytecode.push(Instructions.const_1);

            };
        }

        else if (Expr.runtimeValue == LiteralValue.NumberLiteral)
        {
            bytecode.push(...this.genBytesConst(Expr));
        }

        else if (Expr.runtimeValue == LiteralValue.FloatLiteral)
        {
            bytecode.push(...this.genBytesFloat(Expr));
        }
        else if (Expr.runtimeValue == LiteralValue.StringLiteral)
        {
            bytecode.push(...this.genbytesString(Expr));
        };

        return bytecode;
    };

    genBytesExpression = (Expr: Expression): Bytecode =>
    {
        const bytecode: Bytecode = [];

        const traverse = (ast: Expression) =>
        {
            switch (ast.type)
            {
                case NodeType.BinaryExpression:
                {
                    ast = ast as BinaryExpression;
                    traverse(ast.left as Expression);
                    traverse(ast.right as Expression);
                    switch (ast.operator)
                    {
                        case '+':
                        {
                            bytecode.push(Instructions.add);
                            break;
                        };
                        case '-':
                        {
                            bytecode.push(Instructions.sub);
                            break;
                        };
                        case '*':
                        {
                            bytecode.push(Instructions.mul);
                            break;
                        };
                        case '/':
                        {
                            bytecode.push(Instructions.div);
                            break;
                        };
                        case '**':
                        {
                            bytecode.push(Instructions.pow);
                            break
                        };
                        case '%':
                        {
                            bytecode.push(Instructions.mod);
                            break;
                        };

                        case '!':
                        {
                            bytecode.push(Instructions.not);
                            break;
                        };

                        case '==':
                        {
                            bytecode.push(Instructions.eqls);
                            break;
                        };
                        case '!=':
                        {
                            bytecode.push(Instructions.neqls);
                            break;
                        };

                        case '>':
                        {
                            bytecode.push(Instructions.gt);
                            break;
                        };
                        case '<':
                        {
                            bytecode.push(Instructions.lt);
                            break;
                        };

                        case '>=':
                        {
                            bytecode.push(Instructions.gteqls);
                            break;
                        };
                        case '<=':
                        {
                            bytecode.push(Instructions.lteqls);
                            break;
                        };

                        case '<<':
                        {
                            bytecode.push(Instructions.shl);
                            break;
                        };
                        case '>>':
                        {
                            bytecode.push(Instructions.shr);
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
                                bytecode.push(Instructions.const_1);
                                traverse(ast.argument as Expression);
                                bytecode.push(Instructions.add);
                                break;
                            case '--':
                                bytecode.push(Instructions.const_1);
                                traverse(ast.argument as Expression);
                                bytecode.push(Instructions.sub);
                                break;
                        }
                    }
                    else
                    {
                        switch (ast.operator)
                        {
                            case '++':
                                traverse(ast.argument as Expression);
                                bytecode.push(Instructions.const_1);
                                bytecode.push(Instructions.add);
                                break;
                            case '--':
                                traverse(ast.argument as Expression);
                                bytecode.push(Instructions.const_1);
                                bytecode.push(Instructions.sub);
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
                            bytecode.push(Instructions.not);
                            break;
                        };


                        case '+':
                        {   
                            traverse(ast.argument as Expression);
                            break;
                        };

                        case '-':
                        {
                            bytecode.push(Instructions.const_0);
                            traverse(ast.argument as Expression);
                            bytecode.push(Instructions.sub);
                            break;
                        };
                    };
                    break;
                };

                case NodeType.Literal:
                {
                    bytecode.push(...this.genbytesLiteral(ast));
                    break;
                };

                case NodeType.Identifier:
                {
                    bytecode.push(Instructions.load, ...this.genbytesString(ast));
                    break;
                };
            };
        };

        traverse(Expr as Expression)

        return bytecode;
    };

    genBytesStatement(Stmt: Statement): Bytecode
    {
        const bytecode: Bytecode = [];

        switch (Stmt.type)
        {
            case NodeType.ExpressionStatement:
            {
                const Expr: Expression = Stmt.body[0];

                bytecode.push(...this.genBytesExpression(Expr));
                break;
            };
        };

        return bytecode;
    };

    genBytesProgram = (Program: Program): Bytecode =>
    {
        const bytecode = [];

        for (let i = 0; i < Program.body.length; i++)
        {
            const Stmt = Program.body[i];

            bytecode.push(...this.genBytesStatement(Stmt));
        };

        bytecode.unshift(this.label, ...this.dataPool);

        return bytecode;
    };
    EncodeBytecode = (bytecode: number[], radix: number, bits: number = 0, char: string = '0') => {
        const encoded: string[] = [];
    
        for (let i = 0; i < bytecode.length; i++) {
            const byte = bytecode[i];
            encoded.push(byte.toString(radix).padStart(bits, char));
        };
    
        return encoded;
    }
};


// TESTING PURPOSES

// const Generator = new BytecodeGenerator('127;128','test.fugu');

// console.log(Generator.bytecode);
// console.log(Generator.EncodeBytecode(Generator.bytecode, 16));