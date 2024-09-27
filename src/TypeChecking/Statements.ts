import
{
    DeclerationStatement,

    Expr,
} from "../Parser/GlobalNodes.ts";
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

};