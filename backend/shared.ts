// deno-lint-ignore-file no-explicit-any

// TOKEN RELATED

export const DIGITS = '0123456789';
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const enum TokenType {
    identifier = 'identifier',
    integer = 'integer',
    float = 'float',
    string = 'string',
    null = 'null',
    bool = 'bool',
    
    //Variable Assignment 
    let = 'let',
    const = 'const',

    // Control Flow
    if = 'if',
    else = 'else',
    switch = 'switch',
    case = 'case',
    default = 'default',
    
    // Loops
    while = 'while',
    for = 'for',
    in = 'in',
    
    // Functions and objects
    proc = 'proc',
    class = 'class',
    new = 'new',
    
    // Module
    from = 'from',
    import = 'import',

    // Other
    return = 'return',
    print = 'print',
    input = 'input',
    typeof = 'typeof',


    // Operators and logical expressions

    binaryOp = 'binaryOp',

    equalsEquals = 'equalsEquals',
    notEquals = 'notEquals',
    
    not = 'not',
    and = 'and',
    or = 'or',

    less = 'less',
    lessEquals = 'lessEquals',
    greater = 'greater',
    greaterEquals = 'greaterEquals',

    equals = 'equals',
    plusPlus = 'plusPlus',
    minusMinus = 'minusMinus',
    plusEquals = 'plusEquals',
    minusEquals = 'minusEquals',

    oparen = 'oparen',
    cparen = 'cparen',

    ocurly = 'ocurly',
    ccurly = 'ccurly',

    osquare = 'osquare',
    csquare = 'csquare',

    dot = 'dot',
    comma = 'comma',
    colon = 'colon',

    eol = 'eol',
    eof = 'eof',
};

export const specialChars:Record<string, TokenType> = {
    '+' : TokenType.binaryOp,
    '-' : TokenType.binaryOp,
    '*' : TokenType.binaryOp,
    '/' : TokenType.binaryOp,
    '%' : TokenType.binaryOp,

    '(' : TokenType.oparen,
    ')' : TokenType.cparen,

    '{' : TokenType.ocurly,
    '}' : TokenType.ccurly,

    '[' : TokenType.osquare,
    ']' : TokenType.csquare,

    '.' : TokenType.dot,
    ',' : TokenType.comma,
    ';' : TokenType.eol,
    ':' : TokenType.colon,

    '==': TokenType.equalsEquals,
    '<>': TokenType.notEquals,
    
    '!' : TokenType.not,
    '&&': TokenType.and,
    '||': TokenType.or,

    '<' : TokenType.less,
    '>' : TokenType.greater,
    '>=': TokenType.lessEquals,
    '<=': TokenType.greaterEquals,

    '=' : TokenType.equals,
    '++': TokenType.plusPlus,
    '+=': TokenType.plusEquals,
    '--': TokenType.minusMinus,
    '-=': TokenType.minusEquals,
};
//!> 
export const unaryBuilders: Record<string, TokenType> = {
    '*': TokenType.binaryOp,
    '<' : TokenType.less,
    '>' : TokenType.greater,
    '=' : TokenType.equals,
    '+' : TokenType.binaryOp,
    '-' : TokenType.binaryOp,
};

export const unaryChars: Record<string, TokenType> = {
    '&&': TokenType.and,
    '||': TokenType.or,

    '<>': TokenType.notEquals,

    '>=': TokenType.lessEquals,
    '<=': TokenType.greaterEquals,

    '=' : TokenType.equals,
    '==': TokenType.equalsEquals,
    '++': TokenType.plusPlus,
    '+=': TokenType.plusEquals,
    '--': TokenType.minusMinus,
    '-=': TokenType.minusEquals,
    '**': TokenType.binaryOp,
};

export const keywords: Record<string, TokenType> = {
    'let': TokenType.let,
    'const': TokenType.const,
    'true': TokenType.bool,
    'false': TokenType.bool,
    'print': TokenType.print,
    'input': TokenType.input,
    'class': TokenType.class,
    'new': TokenType.new,
    'from': TokenType.from,
    'import': TokenType.import,
    'proc': TokenType.proc,
    'if': TokenType.if,
    'else': TokenType.else,
    'while': TokenType.while,
    'for': TokenType.for,
    'typeof': TokenType.typeof,
    'in': TokenType.in,
};

export interface Token {
    type: TokenType;
    value?: string;
    loc: Position;
};

// ERROR RELATED

export interface Position {
    filename: string;
    line: number;
    start: number;
    end: number;
};

export const makePosition = (filename: string, line: number, start: number, end: number): Position => {
    return { filename, line, end, start } as Position;
};

export class Error { 
    message: string;
    loc: Position;
    source: string;
    
    constructor(message: string, loc: Position, source: string, public type: string = 'Uncaught'){

        this.message = message;
        this.loc = loc;
        this.source = source;

        console.log(this.source);
        console.log(' '.repeat(this.loc.start)+'^'.repeat(this.loc.end-this.loc.start));
        console.error(`${this.loc.filename}:${this.loc.line}:${this.loc.end}: ${this.type}: ${message}`);
        Deno.exit(1);
    };

};

export class SyntaxErr extends Error {
    constructor(message: string, loc: Position, source: string) {
        super(message, loc, source, 'SyntaxError');
    }
};

export class ParserErr extends Error {
    constructor(message: string, loc: Position, source: string) {
        super(message, loc, source, 'ParserErr');
    }
};

export class LexerErr extends Error {
    constructor(message: string, loc: Position, source: string) {
        super(message, loc, source, 'LexerError');
    }
};

// NODE TYPES

export interface Program {
    type: 'Program';
    body: Statement[];
    range: [number, number];
};

export interface Statement {
    type: string;
    body: Expression[];
    range: [number, number];
};

export interface Expression {
    type: string;
    body: any[];
    range: [number, number];
};

export interface BinaryExpression extends Expression {
    type: 'BinaryExpression';
    body: [
        left: Node,
        operator: string,
        right: Node,
        range: [number, number],
    ];
    range: [number, number],
};

export interface Node {
    type: string;
    value: string;
    range: [number, number];
};

export interface Literal extends Node {
    type: 'Literal';
    value: string;
    range: [number, number];
};

export interface EmptyStatement extends Statement {
    type:'EmptyStatement';
    body: [];
    range: [number, number];
};