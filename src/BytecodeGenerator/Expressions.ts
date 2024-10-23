import
{
    Expr,
    Literal,
    BinaryExpression,
    AssignmentExpression
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
import type { UnaryExpression, UnaryUpdateExpression } from "../Parser/GlobalNodes.ts";
import type { Environment } from "../TypeChecking/Environment.ts";

export const generateExpression = (BytecodeGenerator: BytecodeGenerator, Expression: Expr, Env: Environment): void =>
{
    switch (Expression.type)
    {
        case 'Literal':
        {
            generateLiteral(BytecodeGenerator, Expression, Env);
            break;
        };

        case 'BinaryExpression':
        {
            generateExpression(BytecodeGenerator, Expression.left,  Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);

            getOperatorInstruction(BytecodeGenerator, Expression, Env);

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
            generateAssignmentExpression(BytecodeGenerator, Expression, Env);
            break;
        };

        case 'UnaryExpression':
        {
            generateUnaryExpression(BytecodeGenerator, Expression, Env);
            break;
        };

        case 'UnaryUpdateExpression':
        {
            generateUnaryUpdateExpression(BytecodeGenerator, Expression, Env);
            break;
        }
    };
};

export const generateUnaryUpdateExpression = (BytecodeGenerator: BytecodeGenerator, Expression: UnaryUpdateExpression, Env: Environment): void =>
{
    switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression, Env).kind)
    {
        case 'int':
        {
            switch (Expression.operator.kind)
            {
                case '++':
                {
                    generateExpression(BytecodeGenerator, Expression.right, Env);

                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.ipush,
                            argument: '0x' + (1).toString(16)
                        }
                    );

                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.iadd,
                        }
                    );
                    break;
                };
                case '--':
                {
                    generateExpression(BytecodeGenerator, Expression.right, Env);

                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.ipush,
                            argument: '0x' + (1).toString(16)
                        }
                    );

                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.imin,
                        }
                    );
                }
            };
            break;
        }

        case 'float':
        {
            switch (Expression.operator.kind)
            {
                case '++':
                {
                    generateExpression(BytecodeGenerator, Expression.right, Env);
                    
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.fpush,
                            argument: '1 0'
                        }
                    );

                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.fadd,
                        }
                    );
                    break;
                };
                case '--':
                {
                    generateExpression(BytecodeGenerator, Expression.right, Env);

                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.fpush,
                            argument: '1 0'
                        }
                    );

                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.fmin,
                        }
                    );
                }
            }
        }
    };

    BytecodeGenerator.Bytecode.push(
        {
            type: Instructions.update,
            argument: Expression.right.value,
            comment: `Reassign ${Expression.right.value} to the top of the stack`
        }
    );
};

export const generateAssignmentExpression = (BytecodeGenerator: BytecodeGenerator, Expression: AssignmentExpression, Env: Environment): void =>
{
    switch (Expression.operator.kind)
    {
        case '+=':
        {
            generateExpression(BytecodeGenerator, Expression.left, Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);
            Expression.operator.kind = Expression.operator.kind.replace('=', '');
            getOperatorInstruction(BytecodeGenerator, Expression, Env)
            break;
        }
        case '-=':
        {
            generateExpression(BytecodeGenerator, Expression.left, Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);
            Expression.operator.kind = Expression.operator.kind.replace('=', '');
            getOperatorInstruction(BytecodeGenerator, Expression, Env)
            break;
        }
        case '*=':
        {
            generateExpression(BytecodeGenerator, Expression.left, Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);
            Expression.operator.kind = Expression.operator.kind.replace('=', '');
            getOperatorInstruction(BytecodeGenerator, Expression, Env)
            break;
        }
        case '/=':
        {
            generateExpression(BytecodeGenerator, Expression.left, Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);
            Expression.operator.kind = Expression.operator.kind.replace('=', '');
            getOperatorInstruction(BytecodeGenerator, Expression, Env)
            break;
        }
        case '%=':
        {
            generateExpression(BytecodeGenerator, Expression.left, Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);
            Expression.operator.kind = Expression.operator.kind.replace('=', '');
            getOperatorInstruction(BytecodeGenerator, Expression, Env)
            break;
        }
        case '<<=':
        {
            generateExpression(BytecodeGenerator, Expression.left, Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);
            Expression.operator.kind = Expression.operator.kind.replace('=', '');
            getOperatorInstruction(BytecodeGenerator, Expression, Env)
            break;
        }
        case '>>=':
        {
            generateExpression(BytecodeGenerator, Expression.left, Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);
            Expression.operator.kind = Expression.operator.kind.replace('=', '');
            getOperatorInstruction(BytecodeGenerator, Expression, Env)
            break;
        }
        case '&=':
        {
            generateExpression(BytecodeGenerator, Expression.left, Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);
            Expression.operator.kind = Expression.operator.kind.replace('=', '');
            getOperatorInstruction(BytecodeGenerator, Expression, Env)
            break;
        }
        case '|=':
        {
            generateExpression(BytecodeGenerator, Expression.left, Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);
            Expression.operator.kind = Expression.operator.kind.replace('=', '');
            getOperatorInstruction(BytecodeGenerator, Expression, Env)
            break;
        }
        case '^=':
        {
            generateExpression(BytecodeGenerator, Expression.left, Env);
            generateExpression(BytecodeGenerator, Expression.right, Env);
            Expression.operator.kind = Expression.operator.kind.replace('=', '');
            getOperatorInstruction(BytecodeGenerator, Expression, Env)
            break;
        };
    };

    BytecodeGenerator.Bytecode.push(
        {
            type: Instructions.update,
            argument: Expression.left.value,
            comment: `Reassign ${Expression.left.value} to the top of the stack`
        }
    );
};

export const generateUnaryExpression = (BytecodeGenerator: BytecodeGenerator, Expression: UnaryExpression, Env: Environment): void =>
{
    switch (Expression.operator.kind)
    {
        case '~':
        {
            generateExpression(BytecodeGenerator, Expression.right, Env);
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.not,
                }
            );
            break;
        };

        case '!':
        {
            generateExpression(BytecodeGenerator, Expression.right, Env);
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.not,
                }
            );

            break;
        }

        case '-':
        {
            switch(getExpressionType(BytecodeGenerator.TypeChecker, Expression.right, Env).kind)
            {
                case 'float':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.fpush,
                            argument: '0 0',
                        }
                    );
                    generateExpression(BytecodeGenerator, Expression.right, Env);
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.fmin,
                        }
                    );
                    break;
                };
                case 'int':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.ipush,
                            argument: '0x' + (0).toString(16)
                        }
                    );
                    generateExpression(BytecodeGenerator, Expression.right, Env);
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.imin,
                        }
                    );
                    break;
                };
            };

            break;
        }
        case '+':
        {
            switch(getExpressionType(BytecodeGenerator.TypeChecker, Expression.right, Env).kind)
            {
                case 'float':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.fpush,
                            argument: '0 0',
                        }
                    );
                    generateExpression(BytecodeGenerator, Expression.right, Env);
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.fadd,
                        }
                    );
                    break;
                };
                case 'int':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.ipush,
                            argument: '0x' + (0).toString(16)
                        }
                    );
                    generateExpression(BytecodeGenerator, Expression.right, Env);
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.fadd,
                        }
                    );
                    break;
                };
            };
        }
    };
};

export const generateLiteral = (BytecodeGenerator: BytecodeGenerator, Expression: Literal, Env: Environment): void =>
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

const getOperatorInstruction = (BytecodeGenerator: BytecodeGenerator, Expression: BinaryExpression | AssignmentExpression, Env: Environment): void =>
{
    switch (Expression.operator.kind)
    {
        case '+':
        {
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression, Env).kind)
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
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression, Env).kind)
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
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression, Env).kind)
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
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression, Env).kind)
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

        case '%':
        {
            switch (getExpressionType(BytecodeGenerator.TypeChecker, Expression, Env).kind)
            {
                case 'int':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.imod
                        }
                    );
                    break;
                };

                case 'float':
                {
                    BytecodeGenerator.Bytecode.push(
                        {
                            type: Instructions.fmod
                        }
                    );
                    break;
                };
            };
            break;
        };

        case '==':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.eq
                }
            );
            break;
        };

        case '<>':
        case '!=':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.neq
                }
            );
            break;
        };

        case '>':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.gt
                }
            );
            break;
        };

        case '<':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.lt
                }
            );
            break;
        };

        case '>=':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.gteq
                }
            );
            break;
        };

        case '<=':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.lteq
                }
            );
            break;
        };

        case '&&':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.and
                }
            );
            break;
        };

        case '||':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.or
                }
            );
            break;
        };

        case '&':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.bitAnd
                }
            );
            break;
        };

        case '|':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.bitOr
                }
            );
            break;
        };

        case '^':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.xOr
                }
            );
            break;
        };

        case '>>':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.rshift
                }
            );
            break;
        };

        case '<<':
        {
            BytecodeGenerator.Bytecode.push(
                {
                    type: Instructions.lshift
                }
            );
            break;
        };
    };
};