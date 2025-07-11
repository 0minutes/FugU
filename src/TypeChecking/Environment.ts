import
{
    simpleType
} from "../Parser/Types.ts";


export interface VariableInfo
{
    type: simpleType;
    mut: boolean;
    init: boolean;
};

export interface procInfo
{
    argsType: simpleType[];
    retType: simpleType;
};


export class Environment
{
    variablePool: Map<string, VariableInfo>;
    procPool: Map<string, procInfo>;

    parentEnv: undefined | Env;

    isGlobal: boolean;
    isProc: boolean;
    isLoop: boolean;

    returnType: simpleType | undefined;

    constructor (parentEnv: undefined | Env = undefined)
    {
        this.variablePool = new Map();
        this.procPool = new Map();

        this.parentEnv = parentEnv;

        this.isGlobal = this.parentEnv == undefined;
        this.isProc = false;
        this.isLoop = false;

        this.returnType = undefined;
    };

    topLevelProc = (): Env | undefined =>
    {
        if (this.isProc)
        {
            return this;
        };

        if (this.parentEnv != undefined)
        {
            return this.parentEnv.topLevelProc();
        };

        return undefined;
    };

    getProc = (key: string): procInfo | undefined =>
    {
        if (this.procPool.has(key))
        {
            return this.procPool.get(key);
        };

        if (this.parentEnv != undefined)
        {
            return this.parentEnv.getProc(key);
        };

        return undefined;
    };
    
    addProc = (key: string, argsType: simpleType[] ,retType: simpleType): procInfo | undefined =>
    {
        if (this.procPool.has(key))
        {
            return undefined;
        };

        const procInfo: procInfo = {
            argsType: argsType,
            retType: retType
        };

        this.procPool.set(key, procInfo);

        return procInfo;
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

    addVar = (key: string, type: simpleType, mut: boolean, init: boolean): VariableInfo | undefined =>
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



export type Env = Environment;