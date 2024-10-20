import
{ 
    TypeChecker,
} from "./TypeChecker.ts";

import 
{
    allTypesCompatible,
    getExpressionType,
    stringifyType,
} from './Expressions.ts';

import
{
    DeclerationStatement,
    Expr,
    Identifier,
} from "../Parser/GlobalNodes.ts";

import 
{
    simpleType
} from "../Parser/Types.ts";

import 
{
    error,
    makePosition
} from "../Errors/Errors.ts";

export const checkExpressionStatement = (TypeChecker: TypeChecker, Expression: Expr): void =>
{
    getExpressionType(TypeChecker, Expression);
};

export const checkDeclerationStatements = (TypeChecker: TypeChecker, DeclerationStatement: DeclerationStatement): void =>
{
    const declType: simpleType = DeclerationStatement.simpleType;

    if (DeclerationStatement.init != undefined)
    {
        const initType: simpleType = getExpressionType(TypeChecker, DeclerationStatement.init);
        
        if (!allTypesCompatible(declType, initType))
        {
            new error(
                'Type Error',
                `Fatal: Cannot assign the '${stringifyType(initType)}' type to the declared type of '${stringifyType(declType)}'`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, initType.where[0], initType.where[1], initType.where[2]),
                stringifyType(declType)
            );
    
            return;
        };
    };

    for (let i = 0; i < DeclerationStatement.variables.length; i++)
    {
        const variable: Identifier = DeclerationStatement.variables[i];

        if (TypeChecker.env.addVar(variable.value, declType, DeclerationStatement.mut, DeclerationStatement.init != undefined) == undefined)
        {
            new error(
                'Name Error',
                `Fatal: The variable '${variable.value}' has already been declared and therefore cannot be re-declared`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, variable.where[0], variable.where[1], variable.where[2])
            );
        };
    };
};