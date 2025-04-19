import {
    Global
} from "../Parser/GlobalNodes.ts";

import {
    Instructions,
    Instruction,
    ConstPool,
    ConstPoolItem,
    ConstPoolType,
    intToBytes,
} from './common.ts'

export class BytecodeGenerator {
    global: Global;

    constPool: ConstPool;
    instructions: number[];

    constructor (global: Global) {
        this.global = global;
        this.instructions = [];
        this.constPool = {
            body: []
        };
    };

    constPoolAdd = (type: ConstPoolType, value: number[]): number[] => {
        const idx = intToBytes(this.constPool.body.length);

        this.constPool.body.push({
            idx: idx,
            type: type,
            value: value
        });
        
        return idx;
    };

    generateHumanReadable = (): Instruction[] => {
        const Program: Instruction[] = [];
        
        for (const Statement of this.global.body) {
            Program.push(generateHRStatement(this, Statement))
        };

        return Program;
    };
}