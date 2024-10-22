import
{
    IfStatement,
    DeclerationStatement,
    ExpressionStatement
} from "../Parser/GlobalNodes.ts";

import
{
    BytecodeGenerator,
} from "./BytecodeGenerator.ts";

import
{
    Instructions,
} from "./Instructions.ts";

import
{
    generateExpression,
} from "./Expressions.ts";

export const generateExpressionStatement = (BytecodeGenerator: BytecodeGenerator, Expression: ExpressionStatement): void =>
{
    generateExpression(BytecodeGenerator, Expression.body)
};

export const generateIfStatement = (BytecodeGenerator: BytecodeGenerator, Statement: IfStatement): void =>
{
    generateExpression(BytecodeGenerator, Statement.condition);

    const jzIdx = BytecodeGenerator.Bytecode.length;

    BytecodeGenerator.Bytecode.push(
        {
            type: Instructions.jz,
            argument: '',
            comment: 'If the top of the stack is 0 jump'
        }
    );
    
    for (const Stmt of Statement.body)
    {
        BytecodeGenerator.generateStatement(Stmt);
    };

    const jmpIdx = BytecodeGenerator.Bytecode.length;

    BytecodeGenerator.Bytecode.push(
        {
            type: Instructions.jmp,
            argument: '',
            comment: ''
        }
    )

    BytecodeGenerator.Bytecode[jzIdx].argument = '0x' + (BytecodeGenerator.Bytecode.length - jzIdx-1).toString(16);
    BytecodeGenerator.Bytecode[jzIdx].comment = `Jump if zero ${'0x' + (BytecodeGenerator.Bytecode.length - jzIdx-1).toString(16)} times`

    if (Statement.alternate != undefined)
    {
        if (Statement.alternate.type == 'ElseStatement')
        {
            for (const Stmt of Statement.alternate.body)
            {
                BytecodeGenerator.generateStatement(Stmt);
            };
        };
        if (Statement.alternate.type == 'IfStatement')
        {
            generateIfStatement(BytecodeGenerator, Statement.alternate);
        };
    };

    BytecodeGenerator.Bytecode[jmpIdx].argument = '0x' + (BytecodeGenerator.Bytecode.length-jmpIdx-1).toString(16);
    BytecodeGenerator.Bytecode[jmpIdx].comment = `Jump ${'0x' + (BytecodeGenerator.Bytecode.length-jmpIdx-1).toString(16)} times`

};

export const generateDeclerationStatement = (BytecodeGenerator: BytecodeGenerator, Statement: DeclerationStatement): void =>
{

    for (const variable of Statement.variables)
    {
        if (Statement.init == undefined)
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.npush,
                    argument: 'null',
                }
            )
        }
        else
        {
            generateExpression(BytecodeGenerator, Statement.init);
        };

        BytecodeGenerator.Bytecode.push(
            {
                type: Instructions.store,
                argument: variable.value,
                comment: `Assign the top of the stack to '${variable.value}'`
            }
        );
    }
};