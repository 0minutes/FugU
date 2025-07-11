import 
{
    BytecodeGenerator,
    ScopeVariable,
} from "./BytecodeGenerator.ts";

import
{
    InstructionType,
    Instruction,
} from "./Instructions.ts";

import
{
    Expr,
    BinaryExpression,
    UnaryExpression,
    ElementAccessExpression,
    Identifier,
    Literal,
    ArrayExpression,
} from "../Parser/GlobalNodes.ts";

export const generateExpression = (BytecodeGenerator: BytecodeGenerator, Expression: Expr): Instruction[] =>
{
    switch (Expression.type)
    {
        case 'BinaryExpression':
        {
            return generateBinaryExpression(BytecodeGenerator, Expression);
        };

        case 'UnaryExpression':
        {
            return generateUnaryExpression(BytecodeGenerator, Expression);
        };

        case 'ElementAccessExpression':
        {
            return generateElementAccessExpression(BytecodeGenerator, Expression);
        };

        case 'ArrayLiteralExpression':
        {
            return generateArrayExpression(BytecodeGenerator, Expression);
        };

        case 'Identifier':
        {
            return generateIdentifier(BytecodeGenerator, Expression);
        };

        case 'Literal':
        {
            return generateLiteral(Expression);
        };

        default:
        {
            throw new Error(`Unknown expression type: ${Expression.type}`);
        };
    };
}

export const generateElementAccessExpression = (BytecodeGenerator: BytecodeGenerator, Expression: ElementAccessExpression): Instruction[] =>
{
    const bytes: Instruction[] = [];

    bytes.push(...generateExpression(BytecodeGenerator, Expression.left));
    bytes.push(...generateExpression(BytecodeGenerator, Expression.index));

    bytes.push({type: InstructionType.AACS, args: [], comment: 'ACCSS ARR'});

    return bytes;
};

export const generateArrayExpression = (BytecodeGenerator: BytecodeGenerator, Expression: ArrayExpression): Instruction[] =>
{
    const bytes: Instruction[] = [];

    const size = Expression.elements.length;

    bytes.push({type: InstructionType.LDA, args: [size & 0xFF, (size >> 8) & 0xFF, (size >> 16) & 0xFF, (size >> 24) & 0xFF], comment: `LDA $${size}`});

    for (const element of Expression.elements)
    {
        bytes.push(...generateExpression(BytecodeGenerator, element));
    };

    return bytes;
}

export const generateBinaryExpression = (BytecodeGenerator: BytecodeGenerator, Expression: BinaryExpression): Instruction[] =>
{
    const bytes: Instruction[] = [];

    bytes.push(...generateExpression(BytecodeGenerator, Expression.left));
    bytes.push(...generateExpression(BytecodeGenerator, Expression.right));

    bytes.push(...getOperatorInstruction(Expression.operator.kind));

    return bytes;
};

export const getOperatorInstruction = (operator: string): Instruction[] =>
{
    const bytes: Instruction[] = [];

    switch (operator)
    {
        case '+':
        {
            bytes.push({type: InstructionType.ADD, args: [], comment: 'ADD'});
            break;
        };

        case '-':
        {
            bytes.push({type: InstructionType.SUB, args: [], comment: 'SUB'});
            break;
        };

        case '*':
        {
            bytes.push({type: InstructionType.MUL, args: [], comment: 'MUL'});
            break;
        };

        case '**':
        {
            bytes.push({type: InstructionType.POW, args: [], comment: 'POW'});
            break;
        };

        case '/':
        {
            bytes.push({type: InstructionType.DIV, args: [], comment: 'DIV'});
            break;
        };

        case '%':
        {
            bytes.push({type: InstructionType.MOD, args: [], comment: 'MOD'});
            break;
        };

        case '==':
        {
            bytes.push({type: InstructionType.EQ, args: [], comment: 'EQ'});
            break;
        };

        case '<>':
        case '!=':
        {
            bytes.push({type: InstructionType.NEQ, args: [], comment: 'NEQ'});
            break;
        };

        case '<':
        {
            bytes.push({type: InstructionType.LT, args: [], comment: 'LT'});
            break;
        };

        case '>':
        {
            bytes.push({type: InstructionType.GT, args: [], comment: 'GT'});
            break;
        };

        case '<=':
        {
            bytes.push({type: InstructionType.LTE, args: [], comment: 'LTE'});
            break;
        };

        case '>=':
        {
            bytes.push({type: InstructionType.GTE, args: [], comment: 'GTE'});
            break;
        };

        case '&&':
        {
            bytes.push({type: InstructionType.AND, args: [], comment: 'AND'});
            break;
        };
        case '||':
        {
            bytes.push({type: InstructionType.OR, args: [], comment: 'OR'});
            break;
        };
        case '<<':
        {
            bytes.push({type: InstructionType.LSHFT, args: [], comment: 'LSHFT'});
            break;
        };
        case '>>':
        {
            bytes.push({type: InstructionType.RSHFT, args: [], comment: 'RSHFT'});
            break;
        };

        case '&':
        {
            bytes.push({type: InstructionType.BAND, args: [], comment: 'BAND'});
            break;
        };

        case '|':
        {
            bytes.push({type: InstructionType.BOR, args: [], comment: 'BOR'});
            break;
        };

        case '^':
        {
            bytes.push({type: InstructionType.BXOR, args: [], comment: 'BXOR'});
            break;
        };

        default:
        {
            throw new Error(`Unknown binary operator: ${operator}`);
        };
    };

    return bytes;
}

export const generateUnaryExpression = (BytecodeGenerator: BytecodeGenerator, Expression: UnaryExpression): Instruction[] =>
{
    const bytes: Instruction[] = [];

    switch (Expression.operator.kind)
    {
        case '+':
        {
            bytes.push(...generateExpression(BytecodeGenerator, Expression.right));
            break;
        };

        case '-':
        {
            bytes.push({type: InstructionType.LDBI, args: [0x00]});

            bytes.push(...generateExpression(BytecodeGenerator, Expression.right));

            bytes.push({type: InstructionType.SUB, args: []});
            break;
        };
    };

    return bytes;
}

export const generateIdentifier = (BytecodeGenerator: BytecodeGenerator, Identifier: Identifier): Instruction[] =>
{
    const bytes: Instruction[] = [];

    const IdentType: ScopeVariable = BytecodeGenerator.lookupVariable(Identifier.value);


    switch (IdentType.type)
    {
        case 'byte': bytes.push({type: InstructionType.LDVBI, args: [], comment: `LDVBI FRM $${IdentType.slot}`}); break;
        case 'short': bytes.push({type: InstructionType.LDVSI, args: [], comment: `LDVSI FRM $${IdentType.slot}`}); break;
        case 'int': bytes.push({type: InstructionType.LDVI, args: [], comment: `LDVI FRM $${IdentType.slot}`}); break;
        case 'long': bytes.push({type: InstructionType.LDVLI, args: [], comment: `LDVLI FRM $${IdentType.slot}`}); break;

        case 'ubyte': bytes.push({type: InstructionType.LDVUBI, args: [], comment: `LDVUBI FRM $${IdentType.slot}`}); break;
        case 'ushort': bytes.push({type: InstructionType.LDVUSI, args: [], comment: `LDVUSI FRM $${IdentType.slot}`}); break;
        case 'uint': bytes.push({type: InstructionType.LDVUI, args: [], comment: `LDVUI FRM $${IdentType.slot}`}); break;
        case 'ulong': bytes.push({type: InstructionType.LDVULI, args: [], comment: `LDVULI FRM $${IdentType.slot}`}); break;

        case 'float': bytes.push({type: InstructionType.LDVF, args: [], comment: `LDVF FRM $${IdentType.slot}`}); break;
        case 'double': bytes.push({type: InstructionType.LDVD, args: [], comment: `LDVD FRM $${IdentType.slot}`}); break;

        case 'str': bytes.push({type: InstructionType.LDVS, args: [], comment: `LDVS FRM $${IdentType.slot}`}); break;
        case 'array': bytes.push({type: InstructionType.LDVA, args: [], comment: `LDVA FRM $${IdentType.slot}`}); break;

        case 'null': bytes.push({type: InstructionType.LDVBI, args: [], comment: `LDVN FRM $${IdentType.slot}`}); break;

        default: throw new Error(`Unknown identifier type: ${IdentType.type}`);
    }

    for (let i = 0; i <= 1; i++)
    {
        bytes[bytes.length-1].args.push((IdentType.slot >> (i * 8)) & 0xFF);
    };

    return bytes;
}

export const generateLiteral = (Literal: Literal): Instruction[] =>
{
    const bytes: Instruction[] = [];

    switch (Literal.kind)
    {
        case 'StringLiteral':
        {
            bytes.push({type: InstructionType.LDS, args: [], comment: `LDS`});

            for (const char of Literal.value as string)
            {
                bytes[bytes.length-1].args.push(char.charCodeAt(0));
            };

            bytes[bytes.length-1].args.push(0);
            break;
        };

        case "IntegerLiteral":
        {
            const value = Literal.value as bigint;

            if (value >= BigInt(-(2 ** 7) / 2) && value <= BigInt((2 ** 7) / 2 - 1))
            {
                const instruction = {
                    type: InstructionType.LDBI,
                    args: [Number(value & 0xFFn)],
                    comment: `LDBI $${value}`
                } as Instruction;

                bytes.push(instruction);
            }
            else if (value >= BigInt(-(2 ** 16) / 2) && value <= BigInt((2 ** 16) / 2 - 1))
            {
                const instruction = {
                    type: InstructionType.LDSI,
                    args: [],
                    comment: `LDSI $${value}`
                } as Instruction;

                for (let i = 0; i < 2; i++)
                {
                    instruction.args.push(Number((value >> BigInt(i * 8)) & 0xFFn));
                };

                bytes.push(instruction);
            }
            else if (value >= BigInt(-(2 ** 32) / 2) && value <= BigInt((2 ** 32) / 2 - 1))
            {
                const instruction = {
                    type: InstructionType.LDI,
                    args: [],
                    comment: `LDI $${value}`
                } as Instruction;

                for (let i = 0; i < 4; i++)
                {
                    instruction.args.push(Number((value >> BigInt(i * 8)) & 0xFFn));
                }

                bytes.push(instruction);
            }
            else if (value >= BigInt(-(2 ** 64) / 2) && value <= BigInt((2 ** 64) / 2 - 1))
            {
                const instruction = {
                    type: InstructionType.LDLI,
                    args: [],
                    comment: `LDLI $${value}`
                } as Instruction;

                for (let i = 0; i < 8; i++)
                {
                    instruction.args.push(Number((value >> BigInt(i * 8)) & 0xFFn));
                }

                bytes.push(instruction);
            }
            else if (value >= BigInt((2 ** 64) / 2 - 1))
            {
                const overflowVal = value % BigInt(-(2 ** 64) / 2);

                const instruction = {
                    type: InstructionType.LDLI,
                    args: [],
                    comment: `LDLI $${value}`
                } as Instruction;

                for (let i = 0; i < 8; i++)
                {
                    instruction.args.push(Number((overflowVal >> BigInt(i * 8)) & 0xFFn));
                }

                bytes.push(instruction);
            };

            break;
        };



        case 'FloatLiteral':
        {
            bytes.push({type: InstructionType.LDD, args: [], comment: `LDD $${Literal.value}`});

            const buffer = new ArrayBuffer(8);
            const view = new DataView(buffer);
            view.setFloat64(0, Literal.value as number, true);

            for (let i = 0; i < 8; i++)
            {
                bytes[bytes.length-1].args.push(view.getUint8(i));
            }

            break;
        };
        
        case 'NullLiteral':
        {
            bytes.push({type: InstructionType.LDBI, args: [0x00], comment: 'LD NULL'});
            break;
        };

        default:
        {
            throw new Error(`Unknown literal type: ${Literal.type}`);
        };
    };

    return bytes;
};