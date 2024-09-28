import { error, makePosition } from "../Errors/Errors.ts";
import
{
    DeclerationStatement,

    Expr,
} from "../Parser/GlobalNodes.ts";
import
{
    FugType,
    stringifyTypes,
} from "../Parser/GlobalTypes.ts";

import
{
    checkExpression,
} from "./Expressions.ts";

import
{
    TypeChecker
} from "./TypeChecker.ts";


export const checkExpressionStatement = (TypeChecker: TypeChecker, Statement: Expr): void =>
{
    checkExpression(TypeChecker, Statement);
};

export const checkDeclerationStatement = (TypeChecker: TypeChecker, Statement: DeclerationStatement): void =>
{
    const delcaredType: FugType = Statement.FugType;

    if (Statement.init != undefined)
    {
        const initType: FugType = checkExpression(TypeChecker, Statement.init)!;

        if (delcaredType.kind == 'UnionType' && initType.kind == 'UnionType')
        {
            for (let i = 0; i < initType.types.length; i++) {
                let overlaps = false;

                for (let j = 0; j < delcaredType.types.length; j++)
                {
                    if (initType.types[i] == delcaredType.types[j])
                    {
                        overlaps = true;
                        break;
                    };
                };

                if (!overlaps)
                {
                    new error(
                        'Type Error',
                        `The types '${stringifyTypes(initType.types)}' do not sufficiently overlap the declared types of '${stringifyTypes(delcaredType.types)}'`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, initType.where[0], initType.where[1], initType.where[2]),
                        stringifyTypes(delcaredType.types)
                    );

                    return;
                };
            };
        }

        else if (delcaredType.kind == 'UnionType' && !(initType.kind == 'UnionType'))
        {
            let overlaps = false;

            for (const type of delcaredType.types)
            {
                if (type.kind == initType.kind)
                {
                    overlaps = true;
                    break;
                };
            };
            if (!overlaps)
            {
                new error(
                    'Type Error',
                    `The type '${stringifyTypes([initType])}' does not sufficiently overlap the declared types of '${stringifyTypes(delcaredType.types)}'`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, initType.where[0], initType.where[1], initType.where[2]),
                    stringifyTypes(delcaredType.types)
                );

                return;
            };
        }

        else if (initType.kind == 'UnionType' && !(delcaredType.kind == 'UnionType'))
        {
            let overlaps = false;

            for (const type of initType.types)
            {
                if (type.kind == initType.kind)
                {
                    overlaps = true;
                };
            };
            if (!overlaps)
            {
                new error(
                    'Type Error',
                    `The types '${stringifyTypes(initType.types)}' does not sufficiently overlap the declared type of '${stringifyTypes([delcaredType])}'`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, initType.where[0], initType.where[1], initType.where[2]),
                    stringifyTypes([delcaredType])
                );

                return;
            };
        }

        else if (delcaredType.kind == 'array' && initType.kind == 'array')
        {
            for (let i = 0; i < initType.childkind.length; i++) {
                let overlaps = false;

                for (let j = 0; j < delcaredType.types.length; j++)
                {
                    if (initType.types[i] == delcaredType.types[j])
                    {
                        overlaps = true;
                        break;
                    };
                };

                if (!overlaps)
                {
                    new error(
                        'Type Error',
                        `The types '${stringifyTypes(initType.types)}' do not sufficiently overlap the declared types of '${stringifyTypes(delcaredType.types)}'`,
                        TypeChecker.parser.source,
                        makePosition(TypeChecker.parser.filename, initType.where[0], initType.where[1], initType.where[2]),
                        stringifyTypes(delcaredType.types)
                    );

                    return;
                };
            };   
        }

        else if (initType.kind != delcaredType.kind)
        {
            new error(
                'Type Error',
                `The type '${stringifyTypes([initType])}' does not sufficiently overlap the declared type of '${stringifyTypes([delcaredType])}'`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, initType.where[0], initType.where[1], initType.where[2]),
                stringifyTypes([delcaredType])
            );

            return;
        };
    };

    for (const variable of Statement.variables)
    {
        if (TypeChecker.env.addVar(variable.value, delcaredType, Statement.mut, Statement.init != undefined) == undefined)
        {
            new error(
                'Name Error',
                `The variable '${variable.value}' has already been declared`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, variable.where[0], variable.where[1], variable.where[2]),
                'Different Identifier'
            );
        };
    };
};