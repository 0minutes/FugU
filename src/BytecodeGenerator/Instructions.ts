
export type Bytecode = Instruction[]
export type Instruction = pushInstruction;
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

    load = 'load',

    store = 'store',
    update = 'update',
};

export interface pushInstruction
{
    type: Instructions;
    argument?: string;

    comment?: string;
};