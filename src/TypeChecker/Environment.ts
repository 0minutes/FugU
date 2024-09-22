import 
{
    Type,
} from '../Parser/Types.ts'

export interface variable
{   
    name: string;
    type: Type;
    assigned: boolean;
    mut: boolean;
}

export class Environment
{
    parentEnv: Environment | null;
    variables: Map<string, variable>;
    
    constructor (parentEnv: Environment | null = null)
    {
        this.parentEnv = parentEnv;
        this.variables = new Map();
    };

    addVariable = (name: string, type: Type, mut: boolean, assigned: boolean): variable | null =>
    {
        const variable = {
            name: name,
            type: type,
            assigned: assigned,
            mut: mut,
        } as variable;

        if (this.variables.has(variable.name))
        {
            return null;
        }

        this.variables.set(variable.name, variable);
        
        return variable;
    };
    
    getVariableInfo = (name: string): variable | null =>
    {
        if (this.variables.has(name))
        {
            return this.variables.get(name)!
        }

        if (this.parentEnv == null)
        {
            return null;
        };

        return this.parentEnv.getVariableInfo(name);
    };
};