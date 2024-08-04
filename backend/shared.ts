// TOKEN RELATED

export const DIGITS = '0123456789';
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const enum TokenType
{
    identifier = '<identifier>',
    integer = '<integer>',
    float = '<float>',
    string = '<string>',
    null = '<null>',
    bool = '<boolean>',

    let = '<ssignmentLet>',
    const = '<AssignmentConst>',

    if = '<if>',
    elif = '<elif>',
    else = '<else>',
    switch = '<switch>',
    case = '<case>',
    default = '<default>',

    while = '<while>',
    for = '<for>',
    in = '<in>',
    break = '<break>',

    proc = '<proc>',
    class = '<class>',
    new = '<new>',

    from = '<from>',
    include = '<include>',

    return = '<return>',
    print = '<print>',
    input = '<input>',
    typeof = '<typeof>',

    binaryOp = '<binaryOp>',

    equalsEquals = '<equalsEquals>',
    notEquals = '<notEquals>',

    not = '<not>',
    bitNot = '<bitNot>',
    bitAnd = '<bitAnd>',
    bitOr = '<bitOr>',
    xor = '<xor>',
    and = '<and>',
    or = '<or>',

    less = '<lessThan>',
    lessEquals = '<lessOrEquals>',
    greater = '<greaterThan>',
    greaterEquals = '<greaterOrEquals>',

    rightRight = '<rightRight>',
    leftLeft = '<leftLeft>',

    equals = '<equals>',
    plusPlus = '<plusPlus>',
    minusMinus = '<minusMinus>',
    plusEquals = '<plusEquals>',
    minusEquals = '<minusEquals>',

    oparen = '<openParenthesis>',
    cparen = '<closeParenthesis>',

    ocurly = '<openCurlyParenthesis>',
    ccurly = '<closeCurlyParenthesis>',

    osquare = '<openSquareParenthesis>',
    csquare = '<closeSquareParenthesis>',

    dot = '<dot>',
    comma = '<comma>',
    colon = '<colon>',
    semicolon = '<semicolon>',

    eol = '<endOfLine>',
    eof = '<endOfFile>',
};

export const ValueTypes: Array < string > = [
    TokenType.identifier,
    TokenType.integer,
    TokenType.float,
    TokenType.string,
    TokenType.null,
    TokenType.bool,
];

export const specialChars: Record < string, TokenType > = {
    '+': TokenType.binaryOp,
    '-': TokenType.binaryOp,
    '*': TokenType.binaryOp,
    '/': TokenType.binaryOp,
    '%': TokenType.binaryOp,
    '**': TokenType.binaryOp,
    '(': TokenType.oparen,
    ')': TokenType.cparen,

    '{': TokenType.ocurly,
    '}': TokenType.ccurly,

    '[': TokenType.osquare,
    ']': TokenType.csquare,

    '.': TokenType.dot,
    ',': TokenType.comma,
    ';': TokenType.semicolon,
    ':': TokenType.colon,

    '!=': TokenType.notEquals,
    '==': TokenType.equalsEquals,
    '<>': TokenType.notEquals,

    '!': TokenType.not,
    '~': TokenType.bitNot,
    '^': TokenType.xor,
    '&': TokenType.bitAnd,
    '&&': TokenType.and,
    '|': TokenType.bitOr,
    '||': TokenType.or,

    '>>': TokenType.rightRight,
    '<<': TokenType.leftLeft,


    '<': TokenType.less,
    '>': TokenType.greater,
    '>=': TokenType.lessEquals,
    '<=': TokenType.greaterEquals,

    '=': TokenType.equals,
    '++': TokenType.plusPlus,
    '+=': TokenType.plusEquals,
    '--': TokenType.minusMinus,
    '-=': TokenType.minusEquals,
};

export const unaryBuilders: Record < string, TokenType > = {
    '*': TokenType.binaryOp,
    '<': TokenType.less,
    '>': TokenType.greater,
    '=': TokenType.equals,
    '+': TokenType.binaryOp,
    '-': TokenType.binaryOp,
};

export const unaryChars: Record < string, TokenType > = {
    '&&': TokenType.and,
    '||': TokenType.or,

    '<>': TokenType.notEquals,

    '>=': TokenType.lessEquals,
    '<=': TokenType.greaterEquals,

    '=': TokenType.equals,
    '==': TokenType.equalsEquals,
    '!=': TokenType.notEquals,
    '++': TokenType.plusPlus,
    '+=': TokenType.plusEquals,
    '--': TokenType.minusMinus,
    '-=': TokenType.minusEquals,
    '**': TokenType.binaryOp,
};

export const unaryUpdaters: Record < string, TokenType > = {
    '++': TokenType.plusPlus,
    '--': TokenType.minusMinus,
};

export const unaryBinOps: Record < string, TokenType > = {
    '+': TokenType.binaryOp,
    '-': TokenType.binaryOp,
    '!': TokenType.not,
};

export const keywords: Record < string, TokenType > = {
    'let': TokenType.let,
    'const': TokenType.const,

    'true': TokenType.bool,
    'false': TokenType.bool,
    'null': TokenType.null,

    'print': TokenType.print,
    'input': TokenType.input,

    'class': TokenType.class,
    'new': TokenType.new,

    'from': TokenType.from,
    'include': TokenType.include,

    'proc': TokenType.proc,

    'if': TokenType.if,
    'elif': TokenType.elif,
    'else': TokenType.else,

    'while': TokenType.while,
    'for': TokenType.for,
    'typeof': TokenType.typeof,
    'in': TokenType.in,
};

export interface Token
{
    type: TokenType;
    value: string;
    loc: Position;
};

// ERROR RELATED

export const expected = (prev: TokenType): string =>
{
    switch (prev)
    {
        case TokenType.identifier:
        case TokenType.integer:
        case TokenType.float:
        case TokenType.string:
        case TokenType.null:
        case TokenType.bool:
            return `${ErrorColors.Green_DARK_GREEN}an expression or a ';' ${TokenType.semicolon}${ErrorColors.reset} to end the statement`;

        case TokenType.let:
        case TokenType.const:
            return `${ErrorColors.Green_DARK_GREEN}an identifier${ErrorColors.reset}`;

        case TokenType.binaryOp:
        case TokenType.bitNot:
        case TokenType.bitAnd:
        case TokenType.bitOr:
        case TokenType.xor:
        case TokenType.rightRight:
        case TokenType.leftLeft:
            return `${ErrorColors.Green_DARK_GREEN}an expression or a value${ErrorColors.reset}`;
        case TokenType.equalsEquals:
        case TokenType.notEquals:
        case TokenType.less:
        case TokenType.lessEquals:
        case TokenType.greater:
        case TokenType.greaterEquals:
        case TokenType.equals:
        case TokenType.plusEquals:
        case TokenType.minusEquals:
        case TokenType.and:
        case TokenType.or:
            return `${ErrorColors.Green_DARK_GREEN}an expression or a value${ErrorColors.reset}`;

        case TokenType.plusPlus:
        case TokenType.minusMinus:
            return `${ErrorColors.Green_DARK_GREEN}an identifier or an expression${ErrorColors.reset}`;

        case TokenType.oparen:
            return `${ErrorColors.Green_DARK_GREEN}an expression${ErrorColors.reset}`;
        case TokenType.cparen:
            return `${ErrorColors.Green_DARK_GREEN}an operator or a ';' ${TokenType.semicolon}${ErrorColors.reset} to end the statement`;

        case TokenType.comma:
            return `${ErrorColors.Green_DARK_GREEN}an identifier, value, or parameter${ErrorColors.reset}`;

        case TokenType.eol:
            return `${ErrorColors.Green_DARK_GREEN}a statement or expression${ErrorColors.reset}`;
        case TokenType.eof:
            return `${ErrorColors.Green_DARK_GREEN}an end of file${ErrorColors.reset}`;

        default:
            return `${ErrorColors.Green_DARK_GREEN}an appropriate token${ErrorColors.reset}`;
    };
};
    

export interface Flags
{
    warnings: boolean;
    strictWarnings: boolean;
};

export interface Position
{
    filename: string;
    line: number;
    start: number;
    end: number;
};

export const makePosition = (filename: string, line: number, start: number, end: number): Position =>
{
    return {
        filename,
        line,
        end,
        start
    } as Position;
};

export enum ErrorColors {
    Black_BLACK = '\x1b[30m',

    Red_DARK_RED = '\x1b[31m',

    Green_DARK_GREEN = '\x1b[32m',

    Yellow_DARK_YELLOW = '\x1b[33m',

    Blue_DARK_BLUE = '\x1b[34m',
    
    Magenta_DARK_MAGENTA = '\x1b[35m',

    Cyan_DARK_CYAN = '\x1b[36m',

    Light_gray = '\x1b[37m',

    Dark_gray = '\x1b[90m',

    Light_red = '\x1b[91m',
    
    Light_green = '\x1b[92m',

    Light_yellow = '\x1b[93m',

    Light_blue = '\x1b[94m',

    Light_magenta = '\x1b[95m',

    Light_cyan = '\x1b[96m',

    White_WHITE = '\x1b[97m',

    Bold = '\x1b[1m',

    reset = '\x1b[0m'
}
  

export class Warning
{
    message: string;
    loc: Position;
    source: string;

    constructor(flags: Flags, message: string, loc: Position, source: string, public type: string = 'Uncaught Warning')
    {

        this.message = message;
        this.loc = loc;
        this.source = source;

        console.log(`${ErrorColors.Yellow_DARK_YELLOW}${this.type}${ErrorColors.reset} at ${this.loc.filename}:${this.loc.line}:${this.loc.end}`);
        console.log('\n');

        if (flags.warnings)
        {
            console.log(`${this.loc.line} | ` + this.source.split('\n')[this.loc.line-1]);
            console.log(' '.repeat(String(this.loc.line).length) + ' | '+' '.repeat(this.loc.start) + '^'.repeat(this.loc.end - this.loc.start));
            console.error(' '.repeat(String(this.loc.line).length) + ' | '+' '.repeat(this.loc.start) + `${message}`);  
        };
        
        if (flags.strictWarnings)
        {
            Deno.exit(1);
        };
    };
};

export class TypeConversionWarning extends Warning
{
    constructor(flags: Flags, message: string, loc: Position, source: string)
    {
        super(flags, message, loc, source, 'TypeConversion Warning');
    };
};


export class error
{
    message: string;
    loc: Position;
    source: string;

    constructor(message: string, loc: Position, source: string, pointers: string, public type: string = 'Uncaught Error',)
    {

        this.message = message;
        this.loc = loc;
        this.source = source;

        console.log(`${ErrorColors.Red_DARK_RED}${this.type}${ErrorColors.reset} at ${this.loc.filename}:${this.loc.line}:${this.loc.end}`);
        console.log('\n');

        if (this.loc.line > 1) 
        {
            console.log(`${this.loc.line-1} | ` + this.source.split('\n')[this.loc.line-2]);
            console.log(' '.repeat(String(this.loc.line-1).length) +` |`);
        };
        console.log(`${ErrorColors.Red_DARK_RED}${this.loc.line} | ` + ErrorColors.reset + this.source.split('\n')[this.loc.line - 1]);
        console.log(ErrorColors.Red_DARK_RED + ' '.repeat(String(this.loc.line).length) + ' | ' + ErrorColors.reset + ' '.repeat(this.loc.start) + pointers.repeat(this.loc.end - this.loc.start));
        console.error(ErrorColors.Red_DARK_RED + ' '.repeat(String(this.loc.line).length) + ' | ' + ErrorColors.reset + ' '.repeat(this.loc.start) + `${message}`);
        
        if (this.source.split('\n')[this.loc.line] != undefined)
        {
            console.log(`${this.loc.line+1} | ` + this.source.split('\n')[this.loc.line]);
            console.log(' '.repeat(String(this.loc.line-1).length) +` |`);
        };
        Deno.exit(1);
    };
};

export class SyntaxErr extends error
{
    constructor(message: string, loc: Position, source: string, pointers: string = '^')
    {
        super(message, loc, source, pointers,'SyntaxError');
    };
};

export class LogicalErr extends error
{
    constructor(message: string, loc: Position, source: string, pointers: string = '^')
    {
        super(message, loc, source, pointers, 'LogicalErr');
    };
};

export class ParserErr extends error
{
    constructor(message: string, loc: Position, source: string, pointers: string = '^')
    {
        super(message, loc, source, pointers, 'ParserErr');
    };
};

export class LexerErr extends error
{
    constructor(message: string, loc: Position, source: string, pointers: string = '^')
    {
        super(message, loc, source, pointers, 'LexerError');
    };
};

// NODE TYPES

export const enum NodeType
{
    Program = 'Program',
    ExpressionStatement = 'ExpressionStatement',
    EmptyStatement = 'EmptyStatement',
    BinaryExpression = 'BinaryExpression',
    UnaryExpression = 'UnaryExpression',
    UnaryUpdateExpression = 'UnaryUpdateExpression',
    Identifier = 'Identifier',
    Literal = 'Literal',
};

export interface Program
{
    type: NodeType;
    body: Statement[];
    range: number[];
};

// STATEMENTS

export interface Statement
{
    type: NodeType;
    body: Expression[];
    range: number[];
};

export interface ExpressionStatement extends Statement
{
    type: NodeType;
    body: Expression[];
    range: number[];
};

export interface EmptyStatement extends Statement
{
    type: NodeType,
    range: number[],
}

// EXPRESSIONS

export interface Expression
{
    type: string;

    left ? : Expression;
    right ? : Expression;
    argument ? : Expression;
    operator ? : string;
    prefix ? : boolean;

    value ? : bigint | string | number | boolean | null;
    runtimeValue ? : LiteralValue;

    range: number[];
};

export interface BinaryExpression extends Expression
{
    type: NodeType.BinaryExpression;
    left: Literal | Expression,
    operator: string,
    right: Literal | Expression,
    range: number[],
};

export interface UnaryUpdateExpression extends Expression
{
    type: NodeType.UnaryUpdateExpression;
    operator: string,
    prefix: boolean,
    argument: Expression,
    range: number[],
};

export interface UnaryExpression extends Expression
{
    type: NodeType.UnaryExpression;
    operator: string,
    prefix: boolean,
    argument: Expression,
    range: number[],
};

// LITERAL TYPES

export const enum LiteralValue
{
    Literal = 'Literal',
    NullLiteral = 'NullLiteral',
    NumberLiteral = 'NumberLiteral',
    FloatLiteral = 'FloatLiteral',
    StringLiteral = 'StringLiteral'
};

export interface Identifier extends Expression
{
    type: NodeType.Identifier;
    value: string;
    range: number[];
};

export interface Literal extends Expression
{
    type: NodeType.Literal;
    runtimeValue: LiteralValue;
    value: bigint | number | string | boolean | null;
    range: number[];
};

// BYTECODE

export const enum MethodType
{
    Program,
    ExpressionStmt,
};

export const enum ExpressionType
{
    Literal,
    BinaryExpression,
    UnaryExpression,
    UnaryUpdateExpression,
}

export const enum InstructionType
{

    const0,
    const1,
    const2,
    const3,
    const4,
    const5,
    const6,

    constm1,
    constm2,
    constm3,
    constm4,
    constm5,
    constm6,

    u8,
    u16,
    u32,
    u64,

    s8,
    s16,
    s32,
    s64,


    add,
    sadd,

    sub,

    mul,
    smul,

    pow,

    div,
    mod,
    not,

    eqls,
    neqls,

    gt,
    lt,

    gteqls,
    lteqls,

    shl,
    shr,

    halt = 0xFF,
};


// OTHER

export const CHAR_BIT = 8,
SCHAR_MIN             = (-128),
SCHAR_MAX             =   127,
UCHAR_MAX             =   0xff,

MB_LEN_MAX            =   5,
SHRT_MIN              = (-32768),
SHRT_MAX              =   32767,
USHRT_MAX             =   0xffff,
INT_MIN               = (-2147483647 - 1),
INT_MAX               =   2147483647,
UINT_MAX              =   0xffffffff,
LONG_MIN              = (-2147483647 - 1),
LONG_MAX              =   2147483647,
ULONG_MAX             =   0xffffffff,
LLONG_MAX             =   9223372036854775807,
LLONG_MIN             = BigInt(-9223372036854775807 - 1),
ULLONG_MAX            =   0xffffffffffffffff,

_I8_MIN               = (-127 - 1),
_I8_MAX               =   127,
_UI8_MAX              =   0xff,

_I16_MIN              = (-32767 - 1),
_I16_MAX              =   32767,
_UI16_MAX             =   0xffff,

_I32_MIN              = (-2147483647 - 1),
_I32_MAX              =   2147483647,
_UI32_MAX             =   0xffffffff,

_I64_MIN              = BigInt(-9223372036854775807 - 1),
_I64_MAX              =   9223372036854775807n,
_UI64_MAX             =   18446744073709551615n



export class CustomIntXArray
{
    buffer: number | undefined;
    Bitsize: number;
    IntXArr: number[];
    maxUnsignedValue: number;

    maxSignedValue: number;
    minSignedValue: number;

    constructor(buffer: number | undefined, bitsize: number = 8)
    {
        this.buffer = buffer;
        this.Bitsize = bitsize;
        this.IntXArr = new Array(buffer).fill(0);

        this.maxUnsignedValue = (2**bitsize - 1);

        this.maxSignedValue = (2**bitsize)/2 - 1;
        this.minSignedValue = -((2**bitsize)/2);

        return new Proxy // Basically machine code, least obfuscated code ever made
        (this, 
            {
                // deno-lint-ignore no-explicit-any
                get: function (target: any, idx: any) 
                {
                    if (typeof idx == "string" && !isNaN(Number(idx)))
                    {
                        return target.IntXArr[idx];
                    }
                    
                    else
                    {
                        return target[idx];
                    };
                },
                // deno-lint-ignore no-explicit-any
                set: function (target: any, idx: any, value: any) 
                {
                    if (typeof idx == "string" && !isNaN(Number(idx)))
                    {
                        target.pushSignedIntX(value, Number(idx));
                        return true;
                    }
                    else
                    {
                        target[idx] = value;
                        return true;
                    };
                }
            }
        );
    };

    pushUnsignedIntX(value: number, idx: number) {   
    
        if (idx >= this.IntXArr.length)
        {
            throw new Error("Index is out of buffer bounds");
        };
    
        while (value > this.maxUnsignedValue) {
            this.IntXArr[idx++] = this.maxUnsignedValue;
            value -= this.maxUnsignedValue;
    
            if (idx >= this.IntXArr.length)
            {
                throw new Error("Buffer overflow, cannot store all values");
            };
        };
    
        this.IntXArr[idx] = value;
    };

    pushSignedIntX(value: number, idx: number) {   

    
        if (idx >= this.IntXArr.length)
        {
            throw new Error("Index is out of buffer bounds");
        };
    
        while (value > this.maxSignedValue || value < this.minSignedValue) {
            this.IntXArr[idx++] = value > 0 ? this.maxSignedValue : this.minSignedValue;
            value = value > 0 ? value - this.maxSignedValue : value - this.minSignedValue;
    
            if (idx >= this.IntXArr.length)
            {
                throw new Error("Buffer overflow, cannot store all values");
            };
        };
    
        this.IntXArr[idx] = value;
    };

    toString() 
    {
        return this.IntXArr.toString();
    };

    [Symbol.iterator] = () => {
        let idx = 0;
        return {
            next: () => 
            {
                if (idx >= this.IntXArr.length) return {value: this.IntXArr[idx++], done: false};
                else return {done: true};
            }
        };
    }
};