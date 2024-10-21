
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

    load = 'load',

    store = 'store',
    update = 'update',

    jmp = 'jmp',
    jz = 'jz',

    halt = 'halt',
};

export interface Instruction
{
    type: Instructions;
    argument?: string;

    comment?: string;
};