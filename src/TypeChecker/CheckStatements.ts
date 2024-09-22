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

    if (declaredType.type == 'UnionType' && Statement.initialized)
    {
        let inTypes = false;
        for (const type of declaredType.types)
        {
            if (type.type == initType)
            {
                inTypes = true;
                break;
            }

            if (!inTypes)
            {
                new error(
                    'Type Error',
                    `Type mismatch, cannot assign ${strUnionType(declaredType.types)} to ${initType}`,
                    TypeChecker.parser.source,
                    makePosition(TypeChecker.parser.filename, Statement.init.where[0], Statement.init.where[1], Statement.init.where[2]),
                    strUnionType(declaredType.types)
                );
            };
        }
    }

    else if (Statement.initialized && declaredType.type != initType)
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