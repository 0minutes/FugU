import
{
    error,
    makePosition,
    warning
} from "../Errors/Errors.ts";

import
{
    Expr,
    Literal,
} from "../Parser/GlobalNodes.ts";

import
{
    FugType,

    UnionType,
    arrayType,

    intType,
    floatType,
    stringType,
    charType,
    nullType,
    stringifyTypes,
    compressUnion,
} from "../Parser/GlobalTypes.ts";

import
{
    TypeChecker
} from "./TypeChecker.ts";

const MIN_I32 = BigInt(-2147483648);
const MAX_I32 = BigInt(2147483647);

const MIN_I64 = BigInt(-9223372036854775808);
const MAX_I64 = BigInt(9223372036854775807);

const MAX_U64 = BigInt(18446744073709551615);

export const getUnionTypes = (TypeChecker: TypeChecker, Union: UnionType): FugType[] =>
{
    const types: FugType[] = [];

    for (const type of Union.types)
    {
        if (type.kind == 'UnionType')
        {
            types.push(...getUnionTypes(TypeChecker, type as UnionType));
        };
        types.push(type);
    };

    return types;
};

export const getIntSize = (TypeChecker: TypeChecker, Expression: Literal): string =>
{
    const value = Expression.value as bigint;

    if (value == 1n || value == 0n)
    {
        return 'u1';
    }

    else if (value >= MIN_I32 && value <= MAX_I32)
    {
        return 'i32';
    }
    
    else if (value >= MIN_I64 && value <= MAX_I64)
    {
        return 'i64';
    }
    
    else if (value >= 0n && value <= MAX_U64)
    {
        return 'u64';
    };

    new warning(
        'Value Warning',
        `value is too ${value > 0n ? 'big' : 'small'} for validation and will ${value > 0n ? 'overflow' : 'underflow'} at runtime`,
        TypeChecker.parser.source,
        makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
        `A ${value > 0n ? 'smaller' : 'bigger'} value`
    );

    return value > 0 ? 'u64' : 'i64';
};
    
export const checkExpression = (TypeChecker: TypeChecker, Expression: Expr): FugType | undefined =>
{
    switch (Expression.type)
    {
        case 'Identifier':
        {
            const value = TypeChecker.env.getVar(Expression.value);

            if (value == undefined)
            {
                new error(
                    'Name Error',
                    `The variable ${Expression.value} seems to have not been defined`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2])
                );
                
                return;
            };

            return value.type;
        };

        case 'Literal':
        {
            return getLiteralType(TypeChecker, Expression);
        };

        case 'UnaryUpdateExpression':
        {
            const identType = checkExpression(TypeChecker, Expression.right) as FugType;

            if (identType.kind == 'integer')
            {
                return identType;
            };

            if (identType.kind == 'float')
            {
                return identType;
            };

            if (identType.kind == 'UnionType')
            {
                for (const type of identType.types)
                {
                    if (type.kind != 'integer' && type.kind != 'float')
                    {
                        new error(
                            'Type Error',
                            `Cannot perform ${Expression.operator} on the ${type.kind} type`,
                            TypeChecker.parser.source,
                            makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                            'Integer or float types'
                        );
                    };
                };

                return identType;
            };

            if (TypeChecker.env.getVar(Expression.right.value)!.init == false)
            {   
                new error(
                    'Type Error',
                    `Cannot perform ${Expression.operator} on the uninitialized variable '${Expression.right.value}'`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                    'Uninitialized'
                );

                return;
            };

            new error(
                'Type Error',
                `Cannot perform ${Expression.operator} on the ${identType.kind} type`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2]),
                'Integer or float types'
            );

            return;
        };

        case 'AssignmentExpression':
        {
            const identType = checkExpression(TypeChecker, Expression.left)!;

            const initType = checkExpression(TypeChecker, Expression.right)!;

            if (TypeChecker.env.getVar(Expression.left.value)!.mut == false)
            {
                new error(
                    'Type Error',
                    `'${Expression.left.value}' is a constant and therefore cannot be re-assigned`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2])
                );

                return;
            };

            if (identType.kind == 'array')
            {
                
            };

            if (identType.kind == 'UnionType' && initType.kind == 'UnionType')
            {
                for (let i = 0; i < initType.types.length; i++) {
                    let overlaps = false;
    
                    for (let j = 0; j < identType.types.length; j++)
                    {
                        if (initType.types[i] == identType.types[j])
                        {
                            overlaps = true;
                            break;
                        }
                    };
    
                    if (!overlaps)
                    {
                        new error(
                            'Type Error',
                            `The types '${stringifyTypes(initType.types)}' do not sufficiently overlap the declared types of '${stringifyTypes(initType.types)}'`,
                            TypeChecker.parser.source,
                            makePosition(TypeChecker.parser.filename, initType.where[0], initType.where[1], initType.where[2]),
                            stringifyTypes(identType.types)
                        );

                        return;
                    };
                };

                return {
                    kind: 'null',
                    where: Expression.where
                } as nullType;
            };

            if (identType.kind == 'UnionType')
            {
                let overlap = false;

                for (const type of identType.types)
                {
                    if (initType.kind == type.kind)
                    {
                        overlap = true;
                        break;
                    };
                };

                if (!overlap)
                {
                    new error(
                        'Type Error',
                        `Cannot assign a ${initType.kind} to ${stringifyTypes(identType.types)}`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2]),
                        stringifyTypes(identType.types)
                    );

                    return;
                };

                return {
                    kind: 'null',
                    where: Expression.where
                } as nullType;
            };

            if (identType.kind != initType.kind)
            {
                new error(
                    'Type Error',
                    `Cannot assign a ${initType.kind} to ${identType.kind}`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2]),
                    identType.kind
                );

                return;
            };

            return {
                kind: 'null',
                where: Expression.where
            } as nullType;
        };

        case 'ArrayLiteralExpression':
        {
            const seenTypes: FugType[] = [];

            for (const element of Expression.elements)
            {
                const type = checkExpression(TypeChecker, element)!;
        
                let exists = false;
        
                for (let i = 0; i < seenTypes.length; i++)
                {
                    if (seenTypes[i].kind === type.kind)
                    {
                        exists = true;
                        break;
                    };
                };

                if (!exists)
                {
                    seenTypes.push(type);
                };
            };

            let childkind = {
                kind: 'UnionType',
                types: seenTypes,
                where: [seenTypes[0].where[0], seenTypes[0].where[1], seenTypes[seenTypes.length-1].where[2]]
            } as UnionType;

            return {
                kind: 'array',
                childkind: compressUnion(childkind),
                where: [seenTypes[0].where[0], seenTypes[0].where[1], seenTypes[0].where[2]]
            } as arrayType;

        };
    };
};

const getLiteralType = (TypeChecker: TypeChecker, Expression: Literal): FugType =>
{
    switch (Expression.kind)
    {
        case 'StringLiteral':
        {
            return {
                kind: 'string',
                where: Expression.where,
            } as stringType;
        };

        case 'CharLiteral':
        {
            return {
                kind: 'char',
                where: Expression.where,
            } as charType;
        };

        case 'FloatLiteral':
        {
            return {
                kind: 'float',
                size: 'f64',
                where: Expression.where,
            } as floatType;
        };

        case 'IntegerLiteral':
        {
            return {
                kind: 'integer',
                size: getIntSize(TypeChecker, Expression),
                where: Expression.where,
            } as intType;
        };

        case 'NullLiteral':
        {
            return {
                kind: 'null',
                where: Expression.where,
            } as nullType;
        };
    };
};