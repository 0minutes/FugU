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
    type errorType,
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
import type { Environment } from './Environment.ts';

export const getExpressionType = (TypeChecker: TypeChecker, Expression: Expr, env: Environment): simpleType =>
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
                    'Type Warning',
                    `Cannot reassign the '${stringifyType(initType)}' type to the declared type of '${stringifyType(identType)}'`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, initType.where[0], initType.where[1], initType.where[2]),
                    stringifyType(identType)
                );
            };

            return getBinaryExpressionType(TypeChecker, Expression, env);
        };

        case 'ElementAccessExpression':
        {
            const leftType = getExpressionType(TypeChecker, Expression.left, env);

            if (Expression.left.type == 'AssignmentExpression')
            {
                new error(
                    'Type Warning',
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
                        'Type Warning',
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
                        'Type Warning',
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
                'Type Warning',
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

                if (!allTypesCompatible(currentElementKind, ElementKind!))
                {
                    
                    new error(
                        'Type Warning',
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
                            'Type Warning',
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
                        'Type Warning',
                        `The variable '${element.value}' is not initialized and can therefore not be operated on`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, element.where[0], element.where[1], element.where[2]),
                        'Initialize it first'
                    );
                };
            };

            if (Expression.operator.kind == '+' || Expression.operator.kind == '-')
            {
                if (elementKind.kind == 'int' || elementKind.kind == 'float')
                {
                    return elementKind;
                };

                
                new error(
                    'Type Warning',
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
                    'Type Warning',
                    `The variable '${Expression.right.value}' is not initialized and can therefore not be operated on`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2]),
                    'Initialize it first'
                );
            };

            
            new error(
                'Type Warning',
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
            'Type Warning',
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
            'Type Warning',
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

    if (leftType == undefined)
    {
        
        new error(
            'Type Warning',
            `Cannot perfrom operations on empty array`,
            TypeChecker.parser.source,
            makePosition(TypeChecker.parser.filename, Expression.left.where[0], Expression.left.where[1], Expression.left.where[2]),
        );
    };

    if (rightType == undefined)
    {
        
        new error(
            'Type Warning',
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
                'Type Warning',
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

        case '+=':
        case '+':
        {
            if (leftType.kind == 'array')
            {
                if (allTypesCompatible(leftType.elementKind, rightType))
                {
                    return {
                        kind: 'array',
                        elementKind: rightType,
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    };
                }
                else
                {
                    
                    new error(
                        'Type Warning',
                        `Cannot push the '${stringifyType(rightType)}' type into an array of '${stringifyType(leftType.elementKind)}'`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, rightType.where[0], rightType.where[1], rightType.where[2]),
                        stringifyType(leftType.elementKind)
                    );

                    return {
                        kind: 'errorType',
                        where: Expression.where
                    } as errorType;
                };
            };

            if (leftType.kind == 'str')
            {
                const compatibleTypes: simpleType['kind'][] = ['str', 'int', 'float'];

                if (rightType.kind == 'array')
                {
                    if (allTypesCompatible(leftType, rightType.elementKind))
                    {
                        return rightType;
                    }
                    else
                    {
                        
                        new error(
                            'Type Warning',
                            `Cannot push the '${stringifyType(leftType)}' type into an array of '${stringifyType(rightType.elementKind)}'`,
                            TypeChecker.parser.source,
                            makePosition(TypeChecker.parser.filename, leftType.where[0], leftType.where[1], leftType.where[2]),
                            stringifyType(rightType.elementKind)
                        );
    
                        return {
                            kind: 'errorType',
                            where: Expression.where
                        } as errorType;
                    };
                };

                if (compatibleTypes.includes(rightType.kind))
                {
                    return {
                        kind: 'str',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as strType;
                };
            };

            if (leftType.kind == 'int')
            {
                if (rightType.kind == 'array')
                {
                    if (allTypesCompatible(leftType, rightType.elementKind))
                    {
                        return rightType;
                    }
                    else
                    {
                        
                        new error(
                            'Type Warning',
                            `Cannot push the '${stringifyType(leftType)}' type into an array of '${stringifyType(rightType.elementKind)}'`,
                            TypeChecker.parser.source,
                            makePosition(TypeChecker.parser.filename, leftType.where[0], leftType.where[1], leftType.where[2]),
                            stringifyType(rightType.elementKind)
                        );
    
                        return {
                            kind: 'errorType',
                            where: Expression.where
                        } as errorType;
                    };
                };
                
                if (rightType.kind == 'str')
                {
                    return {
                        kind: 'str',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as strType;
                };

                if (rightType.kind == 'int')
                {
                    Expression.left as Literal;
                    Expression.right as Literal;

                    return {
                        kind: 'int',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as intType;
                };
            };

            if (leftType.kind == 'float')
            {
                if (rightType.kind == 'array')
                {
                    if (allTypesCompatible(leftType, rightType.elementKind))
                    {
                        return rightType;
                    }
                    else
                    {
                        
                        new error(
                            'Type Warning',
                            `Cannot push the '${stringifyType(leftType)}' type to an array of '${stringifyType(rightType.elementKind)}'`,
                            TypeChecker.parser.source,
                            makePosition(TypeChecker.parser.filename, leftType.where[0], leftType.where[1], leftType.where[2]),
                            stringifyType(rightType.elementKind)
                        );
    
                        return {
                            kind: 'errorType',
                            where: Expression.where
                        } as errorType;
                    };
                };

                if (rightType.kind == 'str')
                {
                    return {
                        kind: 'str',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as strType;
                };

                if (rightType.kind == 'float')
                {
                    return {
                        kind: 'float',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as floatType;
                };
            };

            break;
        };

        case '-=':
        case '-':
        {
            if (leftType.kind == 'array' && rightType.kind == 'int')
            {
                return {
                    kind: 'array',
                    elementKind: leftType.elementKind,
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                };
            };

            if (leftType.kind == 'int')
            {
                if (rightType.kind == 'int')
                {
                    return {
                        kind: 'int',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as intType;
                };
            };

            if (leftType.kind == 'float')
            {
                if (rightType.kind == 'float')
                {
                    return {
                        kind: 'float',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as floatType;
                };
            };

            break;
        };

        case '*=':
        case '*':
        {
            if (leftType.kind == 'int')
            {
                if (rightType.kind == 'int')
                {
                    return {
                        kind: 'int',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as intType;
                };

                if (rightType.kind == 'str')
                {
                    return {
                        kind: 'str',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as strType;
                };
            };

            if (leftType.kind == 'float' && rightType.kind == 'float')
            {
                return {
                    kind: 'float',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as floatType;
            };

            if (leftType.kind == 'str' && rightType.kind == 'int')
            {
                return {
                    kind: 'str',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as strType;
            };

            break;
        };

        case '**':
        {
            if (leftType.kind == 'int')
                {
                    if (rightType.kind == 'int')
                    {
                        return {
                            kind: 'float',
                            where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                        } as floatType;
                    };
                };
    
                if (leftType.kind == 'float')
                {
                    if (rightType.kind == 'float')
                    {
                        return {
                            kind: 'float',
                            where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                        } as floatType;
                    };
                };
            break;
        };

        case '/=':
        case '/':
        {
            if (leftType.kind == 'int')
            {
                if (rightType.kind == 'int')
                {
                    return {
                        kind: 'float',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as floatType;
                };
            };

            if (leftType.kind == 'float')
            {
                if (rightType.kind == 'float')
                {
                    return {
                        kind: 'float',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as floatType;
                };
            };
            break;
        };

        case '%=':
        case '%':
        {
            if (
                (leftType.kind == 'int' && rightType.kind == 'int' ) ||
                (leftType.kind == 'float' && rightType.kind == 'float')
            )
            {
                return {
                    kind: 'float',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as floatType;
            };
            
            
            new error(
                'Type Warning',
                `You cannot perform the modulo operator on the '${stringifyType(leftType)}' type and '${stringifyType(rightType)}' type`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.operator.where[0], Expression.operator.where[1], Expression.operator.where[2]),
            );

            break;
        };

        case '<<':
        case '<<=':
        case '>>':
        case '>>=':
        {
            if (leftType.kind == 'int' && rightType.kind == 'int')
            {
                return {
                    kind: 'int',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as intType;
            };

            
            new error(
                'Type Warning',
                `You cannot perform bitshift operations on the '${stringifyType(leftType)}' type and '${stringifyType(rightType)}' type`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.operator.where[0], Expression.operator.where[1], Expression.operator.where[2]),
            );

            break;
        };

        case '&':
        case '&=':
        case '|':
        case '|=':
        case '^':
        case '^=':
        {
            if (leftType.kind == 'int' && rightType.kind == 'int')
            {
                return {
                    kind: 'int',
                    where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                } as intType;
            };

            
            new error(
                'Type Warning',
                `You cannot perform bitwise operations on the '${stringifyType(leftType)}' type and '${stringifyType(rightType)}' type`,
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
                kind: 'int',
                where: [leftType.where[0], leftType.where[1], rightType.where[2]]
            } as intType;
        };
    
        case '>':
        case '<':
        case '>=':
        case '<=':
        {
            if (!allTypesCompatible(leftType, rightType))
            {
                
                new error(
                    'Type Warning',
                    `Comparing a '${stringifyType(leftType)}' to a '${stringifyType(rightType)}' might be a mistake since they are of different types`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                    `Maybe you meant to compare '${stringifyType(leftType)}' ${op} '${stringifyType(leftType)}'`
                );
            };

            return {
                kind: 'int',
                where: [leftType.where[0], leftType.where[1], rightType.where[2]]
            } as intType;
        };
    
        case '||':
        case '&&':
        {
            return {
                kind: 'int',
                where: [leftType.where[0], leftType.where[1], rightType.where[2]]
            } as intType;
        };
    
        case 'in':
        {
            if (rightType.kind == 'array')
            {
                if (allTypesCompatible(rightType.elementKind, leftType))
                {
                    return {
                        kind: 'int',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as intType;
                };

                
                new error(
                    'Type Warning',
                    `Cannot search for the '${stringifyType(leftType)}' type in a list made of the '${stringifyType(rightType.elementKind)}' type`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, leftType.where[0], leftType.where[1], leftType.where[2]),
                    stringifyType(rightType.elementKind)
                );
            };

            
            new error(
                'Type Warning',
                `Cannot search for the '${stringifyType(leftType)}' type in a non array type of '${stringifyType(rightType)}'`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, rightType.where[0], rightType.where[1], rightType.where[2]),
                stringifyType(leftType) + '[]'
            );

            break;
        };
    };

    
    new error(
        'Type Warning',
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
    let strType = '';

    if (type == undefined)
    {
        return 'null'
    };

    if (type.kind == 'array')
    {
        strType += '[]'

        strType = stringifyType(type.elementKind) + strType;
    }

    else
    {
        strType = type.kind + strType;
    };

    return strType;
};
