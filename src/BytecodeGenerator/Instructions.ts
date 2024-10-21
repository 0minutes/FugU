
export type Bytecode = Instruction[]

export enum Instructions
{
    ipush = 'ipush',
    fpush = 'fpush',
    spush = 'spush',

    npush = 'npush',

    iadd = 'iadd',
    fadd = 'fadd',
    sadd = 'sadd',

    imin = 'imin',
    fmin = 'fmin',

    smul = 'smul',
    imul = 'imul',
    fmul = 'fmul',

    idiv = 'idiv',
    fdiv = 'fdiv',

    ipow = 'ipow',
    fpow = 'fpow',


    eq = 'eq',
    neq = 'neq',
    gt = 'gt',
    lt = 'lt',
    gteq = 'gteq',
    lteq = 'lteq',
    
    and = 'and',
    or = 'or',
    not = 'not',
    
    bitAnd = 'bitAnd',
    bitOr = 'bitOr',
    xOr = 'xor',
    bitNot = 'bitNot',

    fmod = 'fmod',
    imod = 'imod',
    rshift = 'rshift',
    lshift = 'rshift',

    load = 'load',

    store = 'store',
    update = 'update',

    jmp = 'jmp',
    jz = 'jz',
};

export interface Instruction
{
    type: Instructions;
    argument?: string;

    comment?: string;
};