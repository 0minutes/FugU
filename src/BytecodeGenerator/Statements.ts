import
{
    ExpressionStatement
} from "../Parser/GlobalNodes.ts";

import
{
    BytecodeGenerator,
} from "./BytecodeGenerator.ts";

import
{
    Bytecode,
    Instructions,
} from "./Instructions.ts";

import
{
    generateExpression,
} from "./Expressions.ts";
import type { DeclerationStatement } from "../Parser/GlobalNodes.ts";

export const generateExpressionStatement = (BytecodeGenerator: BytecodeGenerator, Expression: ExpressionStatement): Bytecode =>
{
    const Bytecode: Bytecode = [];

    Bytecode.push(...generateExpression(BytecodeGenerator, Expression.body))

    return Bytecode;
};

export const generateDeclerationStatement = (BytecodeGenerator: BytecodeGenerator, Statement: DeclerationStatement): Bytecode =>
{
    const Bytecode: Bytecode = [];


    for (const variable of Statement.variables)
    {
        if (Statement.init == undefined)
        {
            Bytecode.push(
                {
                    type: Instructions.npush,
                    argument: 'null',
                }
            )
        }
        else
        {
            Bytecode.push(...generateExpression(BytecodeGenerator, Statement.init));
        };

        Bytecode.push(
            {
                type: Instructions.store,
                argument: variable.value,
                comment: `Assign the top of the stack to '${variable.value}'`
            }
        );
    }

    return Bytecode;
};