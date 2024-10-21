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
            comment: 'If the top of the stack is 0 jump to the next instructions'
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
            comment: 'Jump through the if else blocks'
        }
    )

    BytecodeGenerator.Bytecode[jzIdx].argument = '0x' + (BytecodeGenerator.Bytecode.length).toString(16);
    
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

    BytecodeGenerator.Bytecode[jmpIdx].argument = '0x' + (BytecodeGenerator.Bytecode.length).toString(16);

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