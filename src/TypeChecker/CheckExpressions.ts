import {
    Expr
} from "../Parser/NodeTypes.ts";

import {
    baseTypes
} from "../Parser/Types.ts";

import {
    TypeChecker
} from "./TypeChecker.ts";

import {
    error,
    makePosition,
} from '../Errors/Errors.ts'

export const getExpressionType = (TypeChecker: TypeChecker, Expression: Expr): baseTypes =>
{
    switch (Expression.type)
    {
        case 'Literal':
        {
            return Expression.realType;
        };

        case 'Identifier':
        {
            const Type = TypeChecker.Env.getVariableInfo(Expression.value)

            if (Type == null)
            {
                new error(
                    'Name Error',
                    `Unable to find the variable ${Expression.value}`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.where[0], Expression.where[1], Expression.where[2])
                );
            }

            return Type!.type;
        };

        case 'UnaryUpdateExpression':
        {
            const Type = TypeChecker.Env.getVariableInfo(Expression.right.value);
            
            if (Type == null)
            {
                new error(
                    'Name Error',
                    `Unable to find the variable ${Expression.right.value}`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2])
                );

                return 'null';
            };

            if (Type.type == 'int' || Type.type == 'float')
            {
                return Type.type;
            };

            new error(
                'Type Error',
                `Cannot perform a UnaryUpdate on the ${Type.type} type`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Expression.right.where[0], Expression.right.where[1], Expression.right.where[2]),
                'int or float'
            )
            break;
        };
    };

    return 'null';
};