export enum Instructions {
    LOAD_IDX,
}

export interface Instruction {
    type: Instructions,
    args?: number[];
    comment: string;
}

export enum ConstPoolType {
    int,
    flt,
    str,
    null,
};

export interface ConstPoolItem {
    idx: number[];
    type: ConstPoolType;
    value: number[];
}

export interface ConstPool {
    body: ConstPoolItem[];
}

export const stringToBytes = (value: string): number[] => {
    
    return [];
}

export const intToBytes = (value: number): number[] => {
    let signed = false;
    
    if (value < 0)
    {
        value *= -1;
        signed = true;
    };
    
    const bytes: number[] = [];

    while (value > 0) {
        bytes.push(value & 0xff);
        value = value >> 8;
    };

    return [Number(signed), bytes.length, ...bytes];
};