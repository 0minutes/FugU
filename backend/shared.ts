// TOKEN RELATED

export const DIGITS = '0123456789';
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const enum TokenType {
    identifier = '<Identifier>',
    integer = '<Integer>',
    float = '<Float>',
    string = '<String>',
    null = '<Null>',
    bool = '<Boolean>',
    
    let = '<AssignmentLet>',
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
    and = '<and>',
    or = '<or>',

    less = '<lessThan>',
    lessEquals = '<lessOrEquals>',
    greater = '<greaterThan>',
    greaterEquals = '<greaterOrEquals>',

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

    eol = '<endOfLine>',
    eof = '<endOfFile>',
};

export const expected = (prev: TokenType): string => {
    switch(prev) {
        case TokenType.identifier:
            return 'an operator or an end of statement';
        case TokenType.integer:
        case TokenType.float:
        case TokenType.string:
        case TokenType.null:
        case TokenType.bool:
            return 'an operator or an end of statement';

        case TokenType.let:
        case TokenType.const:
            return 'an identifier';

        case TokenType.if:
        case TokenType.elif:
        case TokenType.while:
        case TokenType.for:
        case TokenType.switch:
            return 'an expression or a block';
        case TokenType.else:
            return 'a block';
        case TokenType.case:
            return 'a value';
        case TokenType.default:
            return 'a block';

        case TokenType.in:
            return 'an iterable';

        case TokenType.proc:
        case TokenType.class:
            return 'an identifier';
        case TokenType.new:
            return 'a class name';

        case TokenType.from:
            return 'a module name';
        case TokenType.include:
            return 'a module or identifier';

        case TokenType.return:
            return 'an expression';
        case TokenType.print:
        case TokenType.input:
            return 'a string or expression';
        case TokenType.typeof:
            return 'an expression';

        case TokenType.binaryOp:
            return 'an expression or a value';
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
            return 'an expression or a value';

        case TokenType.plusPlus:
        case TokenType.minusMinus:
            return 'an identifier or an expression';

        case TokenType.oparen:
            return 'an expression or closing parenthesis';
        case TokenType.cparen:
            return 'an operator or an end of statement';
        case TokenType.ocurly:
            return 'a block or closing curly brace';
        case TokenType.ccurly:
            return 'an operator or an end of statement';
        case TokenType.osquare:
            return 'an index or closing square bracket';
        case TokenType.csquare:
            return 'an operator or an end of statement';

        case TokenType.dot:
            return 'an identifier or method';
        case TokenType.comma:
            return 'an identifier, value, or parameter';
        case TokenType.colon:
            return 'a value or block';

        case TokenType.eol:
            return 'a statement or expression';
        case TokenType.eof:
            return 'an end of file';

        default:
            return 'an appropriate token';
    }
}



export const specialChars:Record<string, TokenType> = {
    '+' : TokenType.binaryOp,
    '-' : TokenType.binaryOp,
    '*' : TokenType.binaryOp,
    '/' : TokenType.binaryOp,
    '%' : TokenType.binaryOp,
    '**': TokenType.binaryOp,
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

export const unaryOperators: Record <string, TokenType> = {
    '&&': TokenType.and,
    '||': TokenType.or,

    '<>': TokenType.notEquals,

    '>=': TokenType.lessEquals,
    '<=': TokenType.greaterEquals,

    '==': TokenType.equalsEquals,

    '**': TokenType.binaryOp,
}

export const unaryUpdaters: Record <string, TokenType> = {
    '++': TokenType.plusPlus,
    '--': TokenType.minusMinus,
};

export const keywords: Record<string, TokenType> = {
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

export interface Token {
    type: TokenType;
    value: string;
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

export class Warning { 
    message: string;
    loc: Position;
    source: string;
    
    constructor(message: string, loc: Position, source: string, public type: string = 'Uncaught Warning'){

        this.message = message;
        this.loc = loc;
        this.source = source;

        console.log(this.source);
        console.log(' '.repeat(this.loc.start)+'^'.repeat(this.loc.end-this.loc.start));
        console.log(`${this.loc.filename}:${this.loc.line}:${this.loc.end}: ${this.type}: ${message}`);
    };
};

export class EmptyStatementWarning extends Warning {
    constructor(message: string, loc: Position, source: string) {
        super(message, loc, source, 'Empty Statement Warning');
    }
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

export const enum NodeType {
    Program = 'Program',
    ExpressionStatement = 'ExpressionStatement',
    EmptyStatement = 'EmptyStatement',
    BinaryExpression = 'BinaryExpression',
    UnaryUpdateExpression = 'UnaryUpdateExpression',
    EndStatement = 'EndStatement'
}

export interface Program {
    type: NodeType;
    body: Statement[];
    range: number[];
};

// STATEMENTS

export interface Statement {
    type: NodeType;
    body: Expression[];
    range: number[];
};

export interface EndStatement extends Statement {
    type: NodeType;
    range: number[];
}

export interface ExpressionStatement extends Statement {
    type: NodeType;
    body: Expression[];
    range: number[];
};

export interface EmptyStatement extends Statement {
    type: NodeType,
    range: number[],
}

// EXPRESSIONS

export interface Expression {
    type: string;
    range: number[];
};

export interface BinaryExpression extends Expression {
    type: 'BinaryExpression';
    left: Literal | Expression,
    operator: string,
    right: Literal | Expression,
    range: number[],
};

export interface UnaryUpdateExpression extends Expression {
    type: 'UnaryUpdateExpression';
    operator: string,
    prefix: boolean,
    argument: Literal | Expression,
    range: number[],
};

// NODES

export interface Node {
    type: string;
    value: string | number | boolean | null;
    range: number[];
};

export interface Literal extends Node {
    type: 'Literal';
    runtimeValue: 'Literal' | 'NullLiteral' | 'BoolLiteral' | 'NumberLiteral' | 'FloatLiteral' | 'StringLiteral';
    value: string | number | boolean | null;
    range: number[];
};

export interface Identifier extends Node {
    type: 'Identifier';
    value: string;
    range: number[];
};

// RUNTIME RELATED