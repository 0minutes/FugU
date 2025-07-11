import
{
    TypeChecker,
} from './TypeChecker.ts'

import
{
    simpleType,
    floatType,
    strType,
    intType,
    arrayType,
    nullType,
    errorType,
    byteType,
} from "../Parser/Types.ts";

import 
{
    AssignmentExpression,
    BinaryExpression,
    Expr,
    Literal,
} from "../Parser/GlobalNodes.ts";

import 
{
    error,
    makePosition,
} from '../Errors/Errors.ts';

import
{
    Env,
    Environment
} from './Environment.ts';

export const getExpressionType = (TypeChecker: TypeChecker, Expression: Expr, env: Env): simpleType =>
{
    switch (Expression.type)
    {
        case 'BinaryExpression':
        {
            return getBinaryExpressionType(TypeChecker, Expression, env);
        };
        
        case 'AssignmentExpression':
        {
            const identType = env.getVar(Expression.left.value)?.type;

            if (identType == undefined)
            {
                new error(
                    'Name Error',
                    `The variable '${Expression.left.value}' has not been declered yet`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.left.where[0], Expression.left.where[1], Expression.left.where[2])
                );

                return {
                    kind: 'errorType',
                    where: Expression.where 
                } as errorType;
            }

            if (env.getVar(Expression.left.value)!.mut == false)
            {
                new error(
                    'Name Error',
                    `The variable '${Expression.left.value}' is a constant and therefore cannot be re-assigned`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2])
                );
            };

            const initType = getExpressionType(TypeChecker, Expression.right, env);

            if (!allTypesCompatible(identType, initType))
            {
                new error(
                    'Type Error',
                    `Cannot reassign the '${stringifyType(initType)}' type to the declared type of '${stringifyType(identType)}'`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, initType.where[0], initType.where[1], initType.where[2]),
                    stringifyType(identType)
                );
            };

            return getBinaryExpressionType(TypeChecker, Expression, env);
        };

        case 'ProcCall':
        {
            const proc = env.getProc(Expression.caller.value)

            if (proc == undefined)
            {
                new error(
                    'Name Error',
                    `Unable to find the procedure '${Expression.caller.value}'`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.caller.where[0], Expression.caller.where[1], Expression.caller.where[2])
                );

                return {
                    kind: 'errorType',
                    where: Expression.where 
                } as errorType;
            }
            
            if (proc.argsType.length != Expression.args.length)
            {
                new error(
                    'Type Error',
                    `'${Expression.caller.value}' accepts ${proc.argsType.length} arguments but ${Expression.args.length} were given`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.caller.where[0], Expression.caller.where[1], Expression.caller.where[2])
                );

                return {
                    kind: 'errorType',
                    where: Expression.where 
                } as errorType;
            };


            for (let i = 0; i < proc.argsType.length; ++i)
            {
                if (proc.argsType[i].kind != getExpressionType(TypeChecker, Expression.args[i], env).kind)
                {
                    new error(
                        'Type Error',
                        `Expected the '${stringifyType(proc.argsType[i])}' type instead of the '${stringifyType(getExpressionType(TypeChecker, Expression.args[i], env))}' type`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, Expression.args[i].where[0], Expression.args[i].where[1], Expression.args[i].where[2]),
                        stringifyType(proc.argsType[i])
                    );
                }
            };

            return proc.retType;
        };

        case 'Argument':
        {
            return Expression.simpleType;
        };

        case 'ElementAccessExpression':
        {
            const leftType = getExpressionType(TypeChecker, Expression.left, env);


            if (Expression.left.type == 'AssignmentExpression')
            {
                new error(
                    'Type Error',
                    `Cannot access elements from an assignment expression`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.left.where[0], Expression.left.where[1], Expression.left.where[2]),
                    'Array'
                );

                return {
                    kind: 'errorType',
                    where: Expression.where
                } as errorType;
            }

            if (leftType.kind == 'array')
            {
                const indexType = getExpressionType(TypeChecker, Expression.index, env);

                if (indexType.kind != 'int')
                {
                    new error(
                        'Type Error',
                        `The index must be of type 'int' instead of '${stringifyType(indexType)}'`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, Expression.index.where[0], Expression.index.where[1], Expression.index.where[2]),
                        'int'
                    );

                    return {
                        kind: 'errorType',
                        where: Expression.where
                    } as errorType;
                };

                if (leftType.elementKind == undefined)
                {
                    new error(
                        'Type Error',
                        `Cannot access element from an uninitialized array`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, Expression.left.where[0], Expression.left.where[1], Expression.left.where[2]),
                        'Initialize the Array'
                    );
        
                    return {
                        kind: 'errorType',
                        where: Expression.where
                    } as errorType;
                };

                return leftType.elementKind;
            };

            
            new error(
                'Type Error',
                `Cannot access element from non-array type of '${stringifyType(leftType)}'`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.left.where[0], Expression.left.where[1], Expression.left.where[2]),
                'Array'
            );

            return {
                kind: 'errorType',
                where: Expression.where
            } as errorType;
        }

        case 'ArrayLiteralExpression':
        {
            let ElementKind: simpleType | undefined = undefined

            for (let i = 0; i < Expression.elements.length; i++)
            {
                const element = Expression.elements[i];

                const currentElementKind = getExpressionType(TypeChecker, element, env);

                if (i == 0)
                {
                    ElementKind = currentElementKind;
                    continue;
                };

                if (!allTypesCompatible(currentElementKind, ElementKind!) && !(isNumeric(ElementKind!) && isNumeric(currentElementKind)) || (isFloat(ElementKind!) && isFloat(currentElementKind)))
                {
                    new error(
                        'Type Error',
                        `Expected to only have the '${stringifyType(ElementKind!)}' type in the array instead of '${stringifyType(getExpressionType(TypeChecker, element, env))}'. Cannot have different types in the same array`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, element.where[0], element.where[1], element.where[2]),
                        stringifyType(ElementKind)
                    );
                };

                if (element.type == 'Identifier')
                {
                    if (!(env.getVar(element.value)!.init))
                    {
                        
                        new error(
                            'Type Error',
                            `The variable '${element.value}' is not initialized and therefore cannot be added to the list`,
                            TypeChecker.parser.source,
                            makePosition(TypeChecker.parser.filename, element.where[0], element.where[1], element.where[2]),
                            'Initialize it first'
                        );
                    };
                };
            };

            const arrayType = {
                kind: 'array',
                elementKind: ElementKind,
                where: Expression.where,
            } as arrayType;

            return arrayType;
        };

        case 'UnaryExpression':
        {
            const elementKind = getExpressionType(TypeChecker, Expression.right, env);

            const element = Expression.right;

            if (element.type == 'Identifier')
            {
                if (!(env.getVar(element.value)!.init))
                {
                    new error(
                        'Type Error',
                        `The variable '${element.value}' is not initialized and can therefore not be operated on`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, element.where[0], element.where[1], element.where[2]),
                        'Initialize it first'
                    );
                };
            };

            if (Expression.operator.kind == '+' || Expression.operator.kind == '-')
            {
                if (isNumeric(elementKind) || isFloat(elementKind))
                {
                    return elementKind;
                };

                
                new error(
                    'Type Error',
                    `Cannot perform '${Expression.operator}' on the '${stringifyType(elementKind)}' type`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                    'int or float type'
                );

                return {
                    kind: 'errorType',
                    where: Expression.where
                } as errorType;
            };

            return elementKind;
        };

        case 'UnaryUpdateExpression':
        {
            const identType = getExpressionType(TypeChecker, Expression.right, env);

            if (identType.kind == 'int' || identType.kind == 'float')
            {
                return identType;
            };

            if (env.getVar(Expression.right.value)!.init == false)
            {
                
                new error(
                    'Type Error',
                    `The variable '${Expression.right.value}' is not initialized and can therefore not be operated on`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2]),
                    'Initialize it first'
                );
            };

            
            new error(
                'Type Error',
                `Cannot perform '${Expression.operator}' on the '${stringifyType(identType)}' type`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                'int or float type'
            );

            return {
                kind: 'errorType',
                where: Expression.where
            } as errorType;
        };

        case 'Identifier':
        {
            const simpleType = env.getVar(Expression.value);

            if (simpleType == undefined)
            {
                new error(
                    'Name Error',
                    `The variable '${Expression.value}' is not defined`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                    'Undefined'
                );

                return {
                    kind: 'errorType',
                    where: Expression.where
                } as errorType;
            };

            if (simpleType.type.kind == 'int')
            {
                return {
                    kind: 'int',
                    where: Expression.where
                } as intType;
            }

            if (simpleType.type.kind == 'float')
            {
                return {
                    kind: 'float',
                    where: Expression.where
                } as floatType;
            }

            return simpleType.type;
        };  

        case 'Literal':
        {
            return getLiteralType(Expression);
        };
    }; 
};  

export const getLiteralType = (Literal: Literal): simpleType =>
{
    switch (Literal.kind)
    {
        case 'NullLiteral':
        {
            return {
                kind: 'null',
                where: Literal.where
            } as nullType;
        };

        case 'FloatLiteral':
        {
            return {
                kind: 'float',
                where: Literal.where
            } as floatType;
        };

        case 'StringLiteral':
        {
            return {
                kind: 'str',
                where: Literal.where
            } as strType;
        };

        case 'IntegerLiteral':
        {
            return {
                kind: 'int',
                where: Literal.where
            } as intType;
        };
    };
};

export const getBinaryExpressionType = (TypeChecker: TypeChecker, Expression: BinaryExpression | AssignmentExpression, env: Environment): simpleType =>
{
    if (Expression.left.type == 'AssignmentExpression')
    {
        
        new error(
            'Type Error',
            'Cannot perform operations on assignment expressions',
            TypeChecker.parser.source,
            makePosition(TypeChecker.parser.filename, Expression.left.where[0], Expression.left.where[1], Expression.left.where[2])
        );

        return {
            kind: 'errorType',
            where: Expression.where
        } as errorType;
    };

    if (Expression.right.type == 'AssignmentExpression')
    {
        
        new error(
            'Type Error',
            'Cannot perform operations on assignment expressions',
            TypeChecker.parser.source,
            makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2])
        );
        
        return {
            kind: 'errorType',
            where: Expression.where
        } as errorType;
    };

    const leftType = getExpressionType(TypeChecker, Expression.left, env);
    const rightType = getExpressionType(TypeChecker, Expression.right, env);

    if (Expression.left.type == 'Identifier')
    {
        if (env.getVar(Expression.left.value)?.init == false)
        {
            new error(
                'Type Error',
                `Cannot perfrom operations on an uninitialized variable`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.left.where[0], Expression.left.where[1], Expression.left.where[2]),
                "Initialize it first"
            );
        }
    }

    if (Expression.right.type == 'Identifier')
    {
        if (env.getVar(Expression.right.value)?.init == false)
        {
            new error(
                'Type Error',
                `Cannot perfrom operations on an uninitialized variable`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2]),
                "Initialize it first"
            );
        }
    }

    if (leftType == undefined)
    {
        new error(
            'Type Error',
            `Cannot perfrom operations on empty array`,
            TypeChecker.parser.source,
            makePosition(TypeChecker.parser.filename, Expression.left.where[0], Expression.left.where[1], Expression.left.where[2]),
        );
    };

    if (rightType == undefined)
    {
        
        new error(
            'Type Error',
            `Cannot perfrom operations on empty array`,
            TypeChecker.parser.source,
            makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2]),
        );
    };

    const op = Expression.operator.kind;

    switch (op)
    {
        case '=':
        {
            if (allTypesCompatible(leftType, rightType))
            {
                return leftType;
            };

            
            new error(
                'Type Error',
                `Cannot assign the '${stringifyType(rightType)}' type to the declared type of '${stringifyType(leftType)}'`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, rightType.where[0], rightType.where[1], rightType.where[2]),
                stringifyType(leftType)
            );

            return {
                kind: 'errorType',
                where: Expression.where
            } as errorType;
        };

        case '/=':
        case '/':
        case '-=':
        case '-':
        case '+=':
        case '+':
        case '*=':
        case '*':
        case '**':
        {
            if (leftType.kind == 'str' && rightType.kind == 'str' && (op == '+' || op == '+='))
            {
                return {
                    kind: 'str',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as strType;
            };

            if (isNumeric(leftType) && isNumeric(rightType))
            {
                return getBiggerSize(leftType, rightType);
            };

            if (isFloat(leftType) && isFloat(rightType))
            {
                return getBiggerSize(leftType, rightType);
            }

            break;
        };


        case '%=':
        case '%':
        {
            if (isNumeric(leftType) && isNumeric(rightType))
            {
                return getBiggerSize(leftType, rightType);
            };

            if (isFloat(leftType) && isFloat(rightType))
            {
                return getBiggerSize(leftType, rightType);
            }

            if (isFloat(leftType) && isNumeric(rightType))
            {
                return leftType;
            }

            if (isNumeric(leftType) && isFloat(rightType))
            {
                return rightType;
            }

            break;
        };

        case '<<':
        case '<<=':
        case '>>':
        case '>>=':
        case '&':
        case '&=':
        case '|':
        case '|=':
        case '^':
        case '^=':
        {
            if (isNumeric(leftType) && isNumeric(rightType))
            {
                return getBiggerSize(leftType, rightType);
            };
            
            new error(
                'Type Error',
                `You cannot perform bitshift operations on the '${stringifyType(leftType)}' type and '${stringifyType(rightType)}' type`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.operator.where[0], Expression.operator.where[1], Expression.operator.where[2]),
            );

            break;
        };

        case '==':
        case '!=':
        case '<>':
        {
            return {
                kind: 'byte',
                where: [leftType.where[0], leftType.where[1], rightType.where[2]]
            } as byteType;
        };
    
        case '>':
        case '<':
        case '>=':
        case '<=':
        {  
            if (isNumeric(leftType) && isNumeric(rightType))
            {
                return {
                    kind: 'byte',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as byteType;
            };

            if (isFloat(leftType) && isFloat(rightType))
            {
                return {
                    kind: 'byte',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as byteType;
            }

            if (isFloat(leftType) && isNumeric(rightType))
            {
                return {
                    kind: 'byte',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as byteType;
            }

            if (isNumeric(leftType) && isFloat(rightType))
            {
                return {
                    kind: 'byte',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as byteType;
            }

            new error(
                'Type Error',
                `Comparing a '${stringifyType(leftType)}' to a '${stringifyType(rightType)}' is a mistake since they are of different types`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                `Maybe you meant to compare '${stringifyType(leftType)}' ${op} '${stringifyType(leftType)}'`
            );
            break;
        };
    
        case '||':
        case '&&':
        {
            if (isNumeric(leftType) && isNumeric(rightType))
            {
                return {
                    kind: 'byte',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as byteType;
            };

            break;
        };
    };
    
    new error(
        'Type Error',
        `Operand mismatch: Cannot perform '${op}' on the '${stringifyType(leftType)}' and '${stringifyType(rightType)}' types`,
        TypeChecker.parser.source,
        makePosition(TypeChecker.parser.filename, Expression.operator.where[0], Expression.operator.where[1], Expression.operator.where[2]),
        'Valid operator'
    );

    return {
        kind: 'errorType',
        where: Expression.where
    } as errorType;
};


export const allTypesCompatible = (firstType: simpleType | undefined, secondType: simpleType | undefined): boolean =>
{
    
    if (firstType == undefined && secondType == undefined)
    {
        return true;
    }
    else if (firstType == undefined || secondType == undefined)
    {
        return true;
    };

    if (isNumeric(firstType) && isNumeric(secondType))
    {
        return true;
    }
    if (isFloat(firstType) && isFloat(secondType))
    {
        return true;
    }

    if (firstType.kind != secondType.kind)
    {
        return false;
    };

    if (firstType.kind == 'array' && secondType.kind == 'array')
    {
        return allTypesCompatible(firstType.elementKind!, secondType.elementKind!);
    };

    return true;
};

export const stringifyType = (type: simpleType | undefined): string =>
{
    if (type == undefined)
    {
        return 'null';
    }

    if (type.kind == 'array')
    {
        return stringifyType(type.elementKind) + '[]';
    }

    if (type.kind == 'short')
    {
        return 'short';
    }

    if (type.kind == 'byte')
    {
        return 'byte';
    }

    if (type.kind == 'int')
    {
        return 'int';
    }
      
    if (type.kind == 'long')
    {
        return 'long';
    }

    if (type.kind == 'double')
    {
        return 'double';
    }

    if (type.kind == 'float')
    {
        return 'float';
    }

    if (type.kind == 'str')
    {
        return 'str';
    }

    if (type.kind == 'null')
    {
        return 'null';
    }

    if (type.kind == 'errorType')
    {
        return 'errorType';
    }

    return 'unknown';
};

export const isNumeric = (type: simpleType): boolean => ['byte', 'short', 'int', 'long', 'ubyte', 'ushort', 'uint', 'ulong'].includes(type.kind);
export const isFloat = (type: simpleType): boolean => ['float', 'double'].includes(type.kind);


export const getBiggerSize = (a: simpleType, b: simpleType): simpleType =>
{
    const order = ['byte', 'short', 'int', 'long', 'ubyte', 'ushort', 'uint', 'ulong','float', 'double'];

    const indexA = order.indexOf(a.kind);
    const indexB = order.indexOf(b.kind);

    const wider = indexA > indexB ? a : b;

    return {
        kind: wider.kind,
        where: [a.where[0], a.where[1], b.where[2]]
    } as simpleType;
};