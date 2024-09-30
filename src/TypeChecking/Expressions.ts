import
{
    TypeChecker,
} from './TypeChecker.ts'

import
{
    simpleType,
    nullType,
    floatType,
    strType,
    chrType,
    intType,
    arrayType,
} from "../Parser/Types.ts";

import 
{
BinaryExpression,
    Expr,
    Literal,
} from "../Parser/GlobalNodes.ts";

import 
{
    error,
    makePosition
} from '../Errors/Errors.ts';

export const getExpressionType = (TypeChecker: TypeChecker, Expression: Expr): simpleType =>
{
    switch (Expression.type)
    {
        case 'BinaryExpression':
        {
            return getBinaryExpressionType(TypeChecker, Expression);
        };
        
        case 'AssignmentExpression':
        {
            const identType = getExpressionType(TypeChecker, Expression.left);

            if (TypeChecker.env.getVar(Expression.left.value)!.mut == false)
            {
                new error(
                    'Name Error',
                    `The variable '${Expression.left.value}' is a constant and cannot be reassigned`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2])
                );
            };

            const initType = getExpressionType(TypeChecker, Expression.right);

            if (!allTypesCompatible(identType, initType))
            {
                new error(
                    'Type Error',
                    `Cannot assign the ${stringifyType(initType)} to the declared type of ${stringifyType(identType)}`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, initType.where[0], initType.where[1], initType.where[2]),
                    stringifyType(identType)
                );
            };

            return identType;
        };

        case 'ArrayLiteralExpression':
        {
            let ElementKind = undefined;

            for (let i = 0; i < Expression.elements.length; i++)
            {
                const element = Expression.elements[i];

                if (i == 0)
                {
                    ElementKind = getExpressionType(TypeChecker, element);
                    continue;
                };

                const currentElementKind = getExpressionType(TypeChecker, element);

                if (!allTypesCompatible(currentElementKind, ElementKind!))
                {
                    new error(
                        'Type Error',
                        `Expected to only have the ${stringifyType(ElementKind!)} type in the array instead of ${stringifyType(getExpressionType(TypeChecker, element))}. Cannot have different types in the same array`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, element.where[0], element.where[1], element.where[2]),
                        stringifyType(ElementKind)
                    );
                };

                if (element.type == 'Identifier')
                {
                    if (!(TypeChecker.env.getVar(element.value)!.init))
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
            const elementKind = getExpressionType(TypeChecker, Expression);

            const element = Expression.right;

            if (element.type == 'Identifier')
            {
                if (!(TypeChecker.env.getVar(element.value)!.init))
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

            if (Expression.operator == '+' || Expression.operator == '-')
            {
                if (elementKind.kind == 'int' || elementKind.kind == 'float')
                {
                    return elementKind;
                };

                new error(
                    'Type Error',
                    `Cannot perform ${Expression.operator} on the ${stringifyType(elementKind)} type`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                    'int or float type'
                );

                return {
                    kind: 'null',
                    where: Expression.where
                } as nullType;
            };

            return elementKind;
        };

        case 'UnaryUpdateExpression':
        {
            const identType = getExpressionType(TypeChecker, Expression.right);

            if (identType.kind == 'int' || identType.kind == 'float')
            {
                return identType;
            };

            if (TypeChecker.env.getVar(Expression.right.value)!.init == false)
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
                `Cannot perform ${Expression.operator} on the ${stringifyType(identType)} type`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                'int or float type'
            );

            return {
                kind: 'null',
                where: Expression.where
            } as nullType;
        };

        case 'Identifier':
        {
            const simpleType = TypeChecker.env.getVar(Expression.value);

            if (simpleType == undefined)
            {
                new error(
                    'Name Error',
                    `The variable ${Expression.value} is not defined`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2])
                );

                return {
                    kind: 'null',
                    where: Expression.where,
                } as nullType;
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

        case 'CharLiteral':
        {
            return {
                kind: 'chr',
                where: Literal.where
            } as chrType;
        };
        case 'IntegerLiteral':
        {
            return {
                kind: 'int',
                size: getIntegerSize(Literal.value as bigint),
                where: Literal.where
            } as intType;
        };
    };
};

export const allTypesCompatible = (firstType: simpleType | undefined, secondType: simpleType | undefined): boolean =>
{
    if (firstType == undefined && secondType == undefined)
    {
        return true;
    }
    else if (firstType == undefined || secondType == undefined)
    {
        return false;
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
    }

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

export const getBinaryExpressionType = (TypeChecker: TypeChecker, Expression: BinaryExpression): simpleType =>
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
            kind: 'null',
            where: Expression.left.where
        } as nullType;
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
            kind: 'null',
            where: Expression.right.where
        } as nullType;
    };

    const leftType = getExpressionType(TypeChecker, Expression.left);
    const rightType = getExpressionType(TypeChecker, Expression.right);

    const op = Expression.operator;

    switch (op)
    {
        case '+':
        {
            if (leftType.kind == 'str')
            {
                const compatibleTypes: simpleType['kind'][] = ['str', 'chr', 'int', 'float'];

                if (compatibleTypes.includes(rightType.kind))
                {
                    return {
                        kind: 'str',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as strType;
                };
            };

            if (leftType.kind == 'chr')
            {
                const compatibleTypes: simpleType['kind'][] = ['str', 'chr'];
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

                if (rightType.kind == 'int')
                {
                    Expression.left as Literal;
                    Expression.right as Literal;

                    return {
                        kind: 'int',
                        size: getBiggerIntSize(leftType.size, rightType.size),
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as intType;
                };
            };

            if (leftType.kind == 'float')
            {

                if (rightType.kind == 'str')
                {
                    return {
                        kind: 'str',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as strType;
                };

                if (rightType.kind == 'float' || rightType.kind == 'int')
                {
                    return {
                        kind: 'float',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as floatType;
                };
            };

            break;
        };

        case '-':
        {
            if (leftType.kind == 'int')
            {
                if (rightType.kind == 'int')
                {
                    return {
                        kind: 'int',
                        size: getBiggerIntSize(leftType.size, rightType.size).replace('u', 'i'),
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as intType;
                };

                if (rightType.kind == 'float')
                {
                    return {
                        kind: 'float',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as floatType;
                };
            };

            if (leftType.kind == 'float')
            {
                if (rightType.kind == 'int' || rightType.kind == 'float')
                {
                    return {
                        kind: 'float',
                        where: [leftType.where[0], leftType.where[1], rightType.where[2]]
                    } as floatType;
                };
            };

            break;
        };
    };

    new error(
        'Type Error',
        `Operand mismatch: Cannot perform '${op}' on the ${stringifyType(leftType)} and ${stringifyType(rightType)} types`,
        TypeChecker.parser.source,
        makePosition(TypeChecker.parser.filename, leftType.where[0], leftType.where[1], rightType.where[2])
    );
};

export const getIntegerSize = (value: bigint): string =>
{
    let size;

    switch (true)
    {
        case value === 0n || value === 1n:
        {
            size = 'u1';
            break;
        };

        case value >= 0n && value <= 255n:
        {
            size = 'u8';
            break;
        };
        
        case value >= 0n && value <= 65535n:
        {
            size = 'u16';
            break;
        };

        case value >= 0n && value <= 4294967295n:
        {
            size = 'u32';
            break;
        };

        case value >= 0n:
        {
            size = 'u64';
            break;
        };

        case value >= -128n && value <= 127n:
        {
            size = 'i8';
            break;
        };

        case value >= -32768n && value <= 32767n:
        {
            
            size = 'i16';
            break;
        };

        case value >= -2147483648n && value <= 2147483647n:
        {
            size = 'i32';
            break;
        };

        default:
        {
            size = 'i64';
            break;
        }
    }

    return size;
}

function getBiggerIntSize(leftSize: string, rightSize: string): string
{

    const sizeMap: Record<string, number> = {
        'u1': 1,
        'u8': 8, 'i8': 8,
        'u16': 16, 'i16': 16,
        'u32': 32, 'i32': 32,
        'u64': 64, 'i64': 64
    };

    const leftBitSize = sizeMap[leftSize];
    const rightBitSize = sizeMap[rightSize];

    if (leftSize.startsWith('i') || rightSize.startsWith('i'))
    {
        const biggerSize = leftBitSize >= rightBitSize ? leftBitSize : rightBitSize;
        return biggerSize == leftBitSize && leftSize.startsWith('i') ? leftSize : rightSize.startsWith('i') ? rightSize : `i${biggerSize}`;
    };

    return leftBitSize > rightBitSize ? leftSize : rightSize;
}