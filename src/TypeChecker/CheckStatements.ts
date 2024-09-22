import
{
    makePosition, 
    error
} from "../Errors/Errors.ts";

import
{
    DeclerationStatement,
} from "../Parser/NodeTypes.ts";
import
{
    strUnionType
} from "../Parser/Types.ts";

import
{
    checkUnionType,
    getExpressionType,
} from './CheckExpressions.ts'

import
{
    TypeChecker,
} from "./TypeChecker.ts";


export const checkDeclerationStatement = (TypeChecker: TypeChecker, Statement: DeclerationStatement): void =>
{
    const declaredType = Statement.Type;
    const initType = getExpressionType(TypeChecker, Statement.init);

    if (Statement.initialized && declaredType.type == 'UnionType')
    {
        if (!checkUnionType([initType.type], declaredType))
        {
            new error(
                'Type Error',
                `Type mismatch, cannot assign ${strUnionType(declaredType.types)} to ${initType.type}`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, Statement.init.where[0], Statement.init.where[1], Statement.init.where[2]),
                `${strUnionType(declaredType.types)}`
            );
        };
    }

    else if (Statement.initialized && declaredType != initType)
    {
        new error(
            'Type Error',
            `Type mismatch, cannot assign ${declaredType} to ${initType}`,
            TypeChecker.parser.source,
            makePosition(TypeChecker.parser.filename, Statement.init.where[0], Statement.init.where[1], Statement.init.where[2]),
            `${declaredType}`
        );
    };

    for (const variable of Statement.variables)
    {
        if (TypeChecker.Env.addVariable(variable.value, initType, Statement.mut, Statement.initialized) == null)
        {
            new error(
                'Name Error',
                `The variable ${variable.value} has already been declared`,
                TypeChecker.parser.source,
                makePosition(TypeChecker.parser.filename, variable.where[0], variable.where[1], variable.where[2]),
                'Different Identifier'
            )
        };
    };



};