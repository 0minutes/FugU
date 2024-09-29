import
{ 
    TypeChecker,
} from "./TypeChecker.ts";

import 
{
    getExpressionType,
} from './Expressions.ts';

import
{
    Expr,
} from "../Parser/GlobalNodes.ts";

export const checkExpressionStatement = (TypeChecker: TypeChecker, Expression: Expr): void =>
{
    getExpressionType(TypeChecker, Expression);
};