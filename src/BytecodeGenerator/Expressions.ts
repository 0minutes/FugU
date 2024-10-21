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
    Instructions
} from "./Instructions.ts";

import 
{
    getExpressionType
} from "../TypeChecking/Expressions.ts";

export const generateExpression = (BytecodeGenerator: BytecodeGenerator, Expression: Expr): void =>
{
    switch (Expression.type)
    {
        case 'Literal':
        {
            generateLiteral(BytecodeGenerator, Expression);
            break;
        };

        case 'BinaryExpression':
        {
            generateExpression(BytecodeGenerator, Expression.left);
            generateExpression(BytecodeGenerator, Expression.right);

            getOperatorInstruction(BytecodeGenerator, Expression);

            break;
        };

        case 'Identifier':
        {
            BytecodeGenerator.Bytecode.push(
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
            generateExpression(BytecodeGenerator, Expression.right);
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.update,
                    argument: Expression.left.value,
                    comment: `reassign the variable ${Expression.left.value} to the top of the stack`
                }
            );
        };
    };
};

export const generateLiteral = (BytecodeGenerator: BytecodeGenerator, Expression: Literal): void =>
{
    switch (Expression.kind)
    {
        case 'IntegerLiteral':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.ipush,
                    argument: '0x' + Expression.value.toString(16)
                }
            );
            
            break;
        };

        case 'StringLiteral':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.spush,
                    argument: '"' + Expression.value as string + '"'
                }
            );

            break;
        };

        case 'FloatLiteral':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.fpush,
                    argument: Expression.value.toString().replace('.', ' ')
                }
            );

            break;
        };
        
        case "NullLiteral":
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.npush,
                    argument: 'null'
                }
            );
            break;
        };
    };
};

const getOperatorInstruction = (BytecodeGenerator: BytecodeGenerator, Expression: BinaryExpression): void =>
{
    switch (Expression.operator.kind)
    {
        case '+':
        {
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression, BytecodeGenerator.TypeChecker.env).kind)
            {
                case 'int':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.iadd
                        }   
                    );

                    break;
                };

                case 'str':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.sadd
                        }   
                    );

                    break;
                };

                case 'float':
                {
                    BytecodeGenerator.Bytecode.push(
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
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression, BytecodeGenerator.TypeChecker.env).kind)
            {
                case 'int':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.imin
                        }   
                    );

                    break;
                };

                case 'float':
                {
                    BytecodeGenerator.Bytecode.push(
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
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression, BytecodeGenerator.TypeChecker.env).kind)
            {
                case 'int':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.imul
                        }   
                    );

                    break;
                };

                case 'str':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.smul
                        }   
                    );

                    break;
                };

                case 'float':
                {
                    BytecodeGenerator.Bytecode.push(
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
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression, BytecodeGenerator.TypeChecker.env).kind)
            {
                case 'int':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.idiv
                        }   
                    );

                    break;
                };

                case 'float':
                {
                    BytecodeGenerator.Bytecode.push(
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
};