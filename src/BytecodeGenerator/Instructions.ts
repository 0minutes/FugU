export const enum InstructionType {
    ADD = 0, // Maths Operands
    SUB,
    MUL,
    POW,
    DIV,
    MOD,
    AND,
    OR,
    NOT,
    EQ,
    NEQ,
    LT,
    GT,
    LTE,
    GTE,
    RSHFT,
    LSHFT,

    BOR, // Bitwise Operands
    BXOR,
    BAND,

    LDI, // Load Immediate [int type]
    LDBI,
    LDSI,
    LDLI,

    LDUI, // Load Immediate [unsigned int type]
    LDBUI,
    LDSUI,
    LDLUI,

    LDF, // Load immidiate [float/double/str/array type]
    LDD,
    LDS,
    LDA,

    LD_NULL,

    LDVI, //Load Variable [int type]
    LDVBI,
    LDVSI,
    LDVLI,

    LDVUI, //Load Variable [unsigned int type]
    LDVUBI,
    LDVUSI,
    LDVULI,

    LDVF, // Load Variable [float/double/str/array type]
    LDVD,
    LDVS,
    LDVA,

    STRI, // Store [int type]
    STRBI,
    STRSI,
    STRLI,

    STRUI, // Store [unsigned int type]
    STRUBI,
    STRUSI,
    STRULI,

    STRF, // Store [float/double/str/array type]
    STRD,
    STRS,
    STRA,

    AACS, // Array Access


    PUSH_SCOPE, // Runtime Instructions
    JZ, // Jump if zero [bytes ahead]
    JMP, // Jump [bytes ahead or back]
    HALT,
};

export interface Instruction {
    type: InstructionType;
    args: number[];
    comment?: string;
}
