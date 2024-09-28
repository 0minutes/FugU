import
{
    FugType
} from "../Parser/GlobalTypes.ts";


export interface VariableInfo
{
    type: FugType;
    mut: boolean;
    init: boolean;
};

export class Environment
{
    variablePool: Map<string, VariableInfo>;
    parentEnv: undefined | Environment;

    constructor (parentEnv: undefined | Environment)
    {
        this.variablePool = new Map();
        this.parentEnv = parentEnv;
    };

    getVar = (key: string): VariableInfo | undefined =>
    {
        if (this.variablePool.has(key))
        {
            return this.variablePool.get(key);
        };

        if (this.parentEnv != undefined)
        {
            return this.parentEnv.getVar(key);
        };

        return undefined;
    };

    addVar = (key: string, type: FugType, mut: boolean, init: boolean): VariableInfo | undefined =>
    {
        if (this.variablePool.has(key))
        {
            return undefined;
        };

        const variable: VariableInfo =
        {
            type: type,
            mut: mut,
            init: init
        };

        this.variablePool.set(key, variable);

        return variable;
    };
};