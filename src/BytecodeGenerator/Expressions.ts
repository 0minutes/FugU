import
{
    Expr,
    Literal,
    BinaryExpression
} from "../Parser/GlobalNodes.ts";

import
{
    BytecodeGenerator
} from "./BytecodeGenerator.ts";

import
{
    Bytecode,
    Instructions
} from "./Instructions.ts";

import 
{
    getExpressionType
} from "../TypeChecking/Expressions.ts";

export const generateExpression = (BytecodeGenerator: BytecodeGenerator, Expression: Expr): Bytecode =>
{
    const Bytecode: Bytecode = [];

    switch (Expression.type)
    {
        case 'Literal':
        {
            Bytecode.push(...generateLiteral(Expression));
            break;
        };

        case 'BinaryExpression':
        {
            Bytecode.push(...generateExpression(BytecodeGenerator, Expression.left));
            Bytecode.push(...generateExpression(BytecodeGenerator, Expression.right));

            Bytecode.push(...getOperatorInstruction(BytecodeGenerator, Expression));

            break;
        };

        case 'Identifier':
        {
            Bytecode.push(
                {
                    type: Instructions.load,
                    argument: Expression.value,

                    comment: `load the variable '${Expression.value}' onto the stack`
                }
            );
            break;
        };

        case 'AssignmentExpression':
        {
            Bytecode.push(...generateExpression(BytecodeGenerator, Expression.right));
            Bytecode.push(
                {
                    type: Instructions.update,
                    argument: Expression.left.value,
                    comment: `reassign the variable ${Expression.left.value} to the top of the stack`
                }
            );
        };
    };

    return Bytecode;
};

export const generateLiteral = (Expression: Literal): Bytecode =>
{
    const Bytecode: Bytecode = [];

    switch (Expression.kind)
    {
        case 'IntegerLiteral':
        {
            Bytecode.push(
                {
                    type: Instructions.ipush,
                    argument: '0x' + Expression.value.toString(16)
                }
            );
            
            break;
        };

        case 'StringLiteral':
        {
            Bytecode.push(
                {
                    type: Instructions.spush,
                    argument: '"' + Expression.value as string + '"'
                }
            );

            break;
        };

        case 'FloatLiteral':
        {
            Bytecode.push(
                {
                    type: Instructions.fpush,
                    argument: Expression.value.toString().replace('.', ' ')
                }
            );

            break;
        };
        
        case "NullLiteral":
        {
            Bytecode.push(
                {
                    type: Instructions.npush,
                    argument: 'null'
                }
            );
            break;
        };
    };

    return Bytecode;
};

const getOperatorInstruction = (BytecodeGenerator: BytecodeGenerator, Expression: BinaryExpression): Bytecode =>
{
    const Bytecode: Bytecode = [];

    switch (Expression.operator.kind)
    {
        case '+':
        {
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression).kind)
            {
                case 'int':
                {
                    Bytecode.push(
                        {
                            type: Instructions.iadd
                        }   
                    );

                    break;
                };

                case 'str':
                {
                    Bytecode.push(
                        {
                            type: Instructions.sadd
                        }   
                    );

                    break;
                };

                case 'float':
                {
                    Bytecode.push(
                        {
                            type: Instructions.fadd
                        }   
                    );

                    break;
                };
            };

            break;
        };

        case '-':
        {
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression).kind)
            {
                case 'int':
                {
                    Bytecode.push(
                        {
                            type: Instructions.imin
                        }   
                    );

                    break;
                };

                case 'float':
                {
                    Bytecode.push(
                        {
                            type: Instructions.fmin
                        }   
                    );

                    break;
                };
            };

            break;
        };

        case '*':
        {
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression).kind)
            {
                case 'int':
                {
                    Bytecode.push(
                        {
                            type: Instructions.imul
                        }   
                    );

                    break;
                };

                case 'str':
                {
                    Bytecode.push(
                        {
                            type: Instructions.smul
                        }   
                    );

                    break;
                };

                case 'float':
                {
                    Bytecode.push(
                        {
                            type: Instructions.fmul
                        }   
                    );

                    break;
                };
            };

            break;
        };

        case '/':
        {
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression).kind)
            {
                case 'int':
                {
                    Bytecode.push(
                        {
                            type: Instructions.idiv
                        }   
                    );

                    break;
                };

                case 'float':
                {
                    Bytecode.push(
                        {
                            type: Instructions.fdiv
                        }
                    );

                    break;
                };
            };
            break;
        };
    };

    return Bytecode;
};
