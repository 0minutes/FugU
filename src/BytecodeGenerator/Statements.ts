import
{
    BytecodeGenerator,
} from "./BytecodeGenerator.ts";

import
{
    DeclerationStatement,
    Expr,
    IfStatement,
    ProcStatement,
    AssignmentStatement,
} from "../Parser/GlobalNodes.ts";

import 
{
    generateExpression,
    getOperatorInstruction,
} from "./Expressions.ts";
import
{
    InstructionType,
    Instruction
} from "./Instructions.ts";

export const generateExpressionStatement = (BytecodeGenerator: BytecodeGenerator, Expression: Expr): Instruction[] =>
{
    return generateExpression(BytecodeGenerator, Expression);
};

export const generateAssignmentStatement = (BytecodeGenerator: BytecodeGenerator, Statement: AssignmentStatement): Instruction[] =>
{
    const bytes: Instruction[] = [];
    const Var = BytecodeGenerator.lookupVariable(Statement.left.value);

    if (Statement.operator.kind == '=')
    {
        bytes.push(...generateExpression(BytecodeGenerator, Statement.right));
    }

    else
    {
        bytes.push(...generateExpression(BytecodeGenerator, Statement.left));
        bytes.push(...generateExpression(BytecodeGenerator, Statement.right));
        bytes.push(...getOperatorInstruction(Statement.operator.kind.split('=')[0]));
    }

    switch (Var.type)
    {
        case 'byte':
        {
            bytes.push({type: InstructionType.STRBI, args: [], comment: `STRBI IN $${Var.slot}`});
            break;
        };

        case 'short':
        {
            bytes.push({type: InstructionType.STRSI, args: [], comment: `STRSI IN $${Var.slot}`});
            break;
        };

        case 'int':
        {
            bytes.push({type: InstructionType.STRI, args: [], comment: `STRI IN $${Var.slot}`});
            break;
        };
        case 'long':
        {
            bytes.push({type: InstructionType.STRLI, args: [], comment: `STRL IN $${Var.slot}`});
            break;
        };

        case 'ubyte':
        {
            bytes.push({type: InstructionType.STRUBI, args: [], comment: `STRUBI IN $${Var.slot}`});
            break;
        };

        case 'ushort':
        {
            bytes.push({type: InstructionType.STRUSI, args: [], comment: `STRUSI IN $${Var.slot}`});
            break;
        };

        case 'uint':
        {
            bytes.push({type: InstructionType.STRUI, args: [], comment: `STRUI IN $${Var.slot}`});
            break;
        };
        case 'ulong':
        {
            bytes.push({type: InstructionType.STRULI, args: [], comment: `STRUL IN $${BytecodeGenerator.slot}`});
            break;
        };

        case 'float':
        {
            bytes.push({type: InstructionType.STRF, args: [], comment: `STRF IN $${Var.slot}`});
            break;
        };
        case 'double':
        {
            bytes.push({type: InstructionType.STRD, args: [], comment: `STRD IN $${Var.slot}`});
            break;
        };

        case 'str':
        {
            bytes.push({type: InstructionType.STRS, args: [], comment: `STRS IN $${Var.slot}`});
            break;
        };

        case 'array':
        {
            bytes.push({type: InstructionType.STRA, args: [], comment: `STRA IN $${Var.slot}`});
            break;
        }

        default:
        {
            throw new Error(`Unsupported type: ${Var.type}`);
        };
    }

    for (let i = 0; i <= 1; i++)
    {
        bytes[bytes.length-1].args![i] = ((Var.slot >> (i * 8)) & 0xFF);
    };

    return bytes;
};

export const generateIfStatement = (BytecodeGenerator: BytecodeGenerator, Statement: IfStatement): Instruction[] =>
{
    const bytes: Instruction[] = [];

    bytes.push(...generateExpressionStatement(BytecodeGenerator, Statement.condition));
    
    bytes.push({type: InstructionType.JZ, args: [0x00, 0x00], comment: `Jump if zero`});

    const jzOffset = bytes.length;

    BytecodeGenerator.enterScope();

    for (const stmt of Statement.body)
    {
        bytes.push(...BytecodeGenerator.generateStatement(stmt));
    };

    BytecodeGenerator.exitScope();

    bytes[jzOffset-1].args[0] = (bytes.length - jzOffset) & 0xFF;
    bytes[jzOffset-1].args[1] = (bytes.length - jzOffset) >> 8;

    bytes[jzOffset-1].comment = `JZ $${bytes.length - jzOffset}`;

    return bytes;
};

export const generateDeclarationStatement = (BytecodeGenerator: BytecodeGenerator, Statement: DeclerationStatement): Instruction[] =>
{
    const bytes: Instruction[] = [];

    BytecodeGenerator.declareVariable(Statement.variable.value, Statement.simpleType.kind);

    if (Statement.init == undefined)
    {
        bytes.push({type: InstructionType.LD_NULL, args: []});
    }
    else
    {
        bytes.push(...generateExpressionStatement(BytecodeGenerator, Statement.init));
    };

    switch (Statement.simpleType.kind)
    {
        case 'byte':
        {
            bytes.push({type: InstructionType.STRBI, args: [], comment: `STRBI IN $${BytecodeGenerator.slot}`});
            break;
        };

        case 'short':
        {
            bytes.push({type: InstructionType.STRSI, args: [], comment: `STRSI IN $${BytecodeGenerator.slot}`});
            break;
        };

        case 'int':
        {
            bytes.push({type: InstructionType.STRI, args: [], comment: `STRI IN $${BytecodeGenerator.slot}`});
            break;
        };
        case 'long':
        {
            bytes.push({type: InstructionType.STRLI, args: [], comment: `STRL IN $${BytecodeGenerator.slot}`});
            break;
        };

        case 'ubyte':
        {
            bytes.push({type: InstructionType.STRUBI, args: [], comment: `STRUBI IN $${BytecodeGenerator.slot}`});
            break;
        };

        case 'ushort':
        {
            bytes.push({type: InstructionType.STRUSI, args: [], comment: `STRUSI IN $${BytecodeGenerator.slot}`});
            break;
        };

        case 'uint':
        {
            bytes.push({type: InstructionType.STRUI, args: [], comment: `STRUI IN $${BytecodeGenerator.slot}`});
            break;
        };
        case 'ulong':
        {
            bytes.push({type: InstructionType.STRULI, args: [], comment: `STRUL IN $${BytecodeGenerator.slot}`});
            break;
        };

        case 'float':
        {
            bytes.push({type: InstructionType.STRF, args: [], comment: `STRF IN $${BytecodeGenerator.slot}`});
            break;
        };
        case 'double':
        {
            bytes.push({type: InstructionType.STRD, args: [], comment: `STRD IN $${BytecodeGenerator.slot}`});
            break;
        };

        case 'str':
        {
            bytes.push({type: InstructionType.STRS, args: [], comment: `STRS IN $${BytecodeGenerator.slot}`});
            break;
        };

        case 'array':
        {
            bytes.push({type: InstructionType.STRA, args: [], comment: `STRA IN $${BytecodeGenerator.slot}`});
            break;
        }

        default:
        {
            throw new Error(`Unsupported type: ${Statement.simpleType.kind}`);
        };
    }

    for (let i = 0; i <= 1; i++)
    {
        bytes[bytes.length-1].args![i] = ((BytecodeGenerator.slot >> (i * 8)) & 0xFF);
    };

    return bytes;
};

