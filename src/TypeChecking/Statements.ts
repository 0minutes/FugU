import
{ 
    TypeChecker,
} from "./TypeChecker.ts";

import 
{
    allTypesCompatible,
    getExpressionType,
    stringifyType,

    isNumeric,
    isFloat,

} from './Expressions.ts';

import
{
    DeclerationStatement,
    Expr,
    Identifier,
    IfStatement,
    ReturnStatement,
    ProcStatement,
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
    Env,
    Environment,
} from "./Environment.ts";

export const checkExpressionStatement = (TypeChecker: TypeChecker, Expression: Expr, Env: Environment): void =>
{
    getExpressionType(TypeChecker, Expression, Env);
}

export const checkIfStatements = (TypeChecker: TypeChecker, IfStatement: IfStatement, Env: Environment): void =>
{
    getExpressionType(TypeChecker, IfStatement.condition, Env);

    const ifEnv: Environment = new Environment(Env)

    for (const Stmt of IfStatement.body)
    {
        TypeChecker.checkStatement(Stmt, ifEnv);
    };
}

export const checkDeclerationStatements = (TypeChecker: TypeChecker, DeclerationStatement: DeclerationStatement, Env: Environment): void =>
{
    const declType: simpleType = DeclerationStatement.simpleType;

    if (declType.kind == 'array')
    {
        if (declType.size != undefined)
        {
            if (getExpressionType(TypeChecker, declType.size, Env).kind != 'int')
            {
                new error(
                    'Type Error',
                    `Fatal: The size of an array must be an integer type, but got '${stringifyType(getExpressionType(TypeChecker, declType.size, Env))}'`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, declType.size.where[0], declType.size.where[1], declType.size.where[2]),
                    'int'
                );

                return;
            }
        }
        
    }

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

    const variable: Identifier = DeclerationStatement.variable;

    if (Env.addVar(variable.value, declType, DeclerationStatement.mut, DeclerationStatement.init != undefined) == undefined)
    {
        new error(
            'Name Error',
            `Fatal: The variable '${variable.value}' has already been declared and therefore cannot be re-declared`,
            TypeChecker.parser.source,
            makePosition(TypeChecker.parser.filename, variable.where[0], variable.where[1], variable.where[2])
        );
    };
}

export const checkReturnStatement = (TypeChecker: TypeChecker, ReturnStatement: ReturnStatement, Env: Env): void =>
{
    const procEnv = Env.topLevelProc();

    if (procEnv == undefined)
    {
        new error (
            'Syntax Error',
            'Return outside of function statement',
            TypeChecker.parser.source,
            makePosition(TypeChecker.parser.filename, ReturnStatement.where[0], ReturnStatement.where[1], ReturnStatement.where[2])
        )

        return;
    };

    if (getExpressionType(TypeChecker, ReturnStatement.Expression, Env).kind != (procEnv).returnType!.kind)
    {
        new error(
            'Type Error',
            `The return statement must return a ${stringifyType(procEnv.returnType)} instead of ${stringifyType(getExpressionType(TypeChecker, ReturnStatement.Expression, Env))}`,
            TypeChecker.parser.source,
            makePosition(TypeChecker.parser.filename, ReturnStatement.Expression.where[0], ReturnStatement.Expression.where[1], ReturnStatement.Expression.where[2]),
            stringifyType(procEnv.returnType)
        );

        return;
    };
}

export const checkProcStatement = (TypeChecker: TypeChecker, ProcStatement: ProcStatement, Env: Environment): void =>
{
    const args: simpleType[] = [];
    const procEnv = new Environment(Env);

    procEnv.isProc = true;
    procEnv.returnType = ProcStatement.simpleType

    for (const arg of ProcStatement.args)
    {
        args.push(getExpressionType(TypeChecker, arg, Env));
        procEnv.addVar(arg.variable.value, getExpressionType(TypeChecker, arg, Env), true, true);
    };
    
    for (const Stmt of ProcStatement.body)
    {
        TypeChecker.checkStatement(Stmt, procEnv);
    };

    if (Env.addProc(ProcStatement.value.value, args, ProcStatement.simpleType) == undefined)
    {
        new error(
            'Name Error',
            `The procedure '${ProcStatement.value.value}' has already been declared and therefore cannot be re-declared`,
            TypeChecker.parser.source,
            makePosition(TypeChecker.parser.filename, ProcStatement.value.where[0], ProcStatement.value.where[1], ProcStatement.value.where[2])
        );
    };
}