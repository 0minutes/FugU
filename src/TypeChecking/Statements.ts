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
    IfStatement,
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
import
{
    Environment
} from "./Environment.ts";

export const checkExpressionStatement = (TypeChecker: TypeChecker, Expression: Expr, Env: Environment): void =>
{
    getExpressionType(TypeChecker, Expression, Env);
};

export const checkIfStatements = (TypeChecker: TypeChecker, IfStatement: IfStatement, Env: Environment): void =>
{
    getExpressionType(TypeChecker, IfStatement.condition, Env);

    const ifEnv: Environment = new Environment(Env)

    for (const Stmt of IfStatement.body)
    {
        TypeChecker.checkStatement(Stmt, ifEnv);
    };
};

export const checkDeclerationStatements = (TypeChecker: TypeChecker, DeclerationStatement: DeclerationStatement, Env: Environment): void =>
{
    const declType: simpleType = DeclerationStatement.simpleType;

    if (DeclerationStatement.init != undefined)
    {
        const initType: simpleType = getExpressionType(TypeChecker, DeclerationStatement.init, Env);
        
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

        if (Env.addVar(variable.value, declType, DeclerationStatement.mut, DeclerationStatement.init != undefined) == undefined)
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