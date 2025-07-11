import 
{
    Position
} from '../Errors/Errors.ts'

export const enum TokenType {
    identifier = '<identifier>',
    str = '<str>',
    bool = '<bool>',
    
    byte = '<byte>',
    short = '<short>',
    int = '<int>',
    long = '<long>',

    ubyte = '<ubyte>',
    ushort = '<ushort>',
    uint = '<uint>',
    ulong = '<ulong>',
    float = '<float>',

    oparand = '<operand>',

    AssignmentOperator = '<AssignmentOperator>',
    ReAssignmentOperator = '<ReAssignmentOperator>',
    
    colon = '<colon>',
    semicolon = '<semicolon>',
    comma = '<comma>',
    leftParenthesis = '<leftParenthesis>',
    rightParenthesis = '<rightParenthesis>',
    leftBrace = '<leftBrace>',
    rightBrace = '<rightBrace>',
    leftBracket = '<leftBracket>',
    rightBracket = '<rightBracket>',
    dot = '<dot>',
    arrow = '<arrow>',

    while = '<while>',
    for = '<for>',

    null = '<null>',

    mut = '<AssignmentMut>',
    const = '<AssignmentConst>',

    if = '<if>',
    elif = '<elif>',
    else = '<else>',
    switch = '<switch>',
    case = '<case>',
    default = '<default>',
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

    byteDef = '<byteDef>',
    shortDef = '<shortDef>',
    intDef = '<intDef>',
    longDef = '<longDef>',

    ubyteDef = '<ubyteDef>',
    ushortDef = '<ushortDef>',
    uintDef = '<uintDef>',
    ulongDef = '<ulongDef>',

    floatDef = '<floatDef>',

    strDef = '<strDef>',

    nullDef = '<nullDef>',

    eof = '<eof>',
};

export const specialCharacters: Record<string, TokenType> = {
    '+': TokenType.oparand,
    '-': TokenType.oparand,
    '*': TokenType.oparand,
    '/': TokenType.oparand,
    '**': TokenType.oparand,

    '==': TokenType.oparand,
    '!=': TokenType.oparand,
    '>': TokenType.oparand,
    '<': TokenType.oparand,
    '>=': TokenType.oparand,
    '<=': TokenType.oparand,
    '&&': TokenType.oparand,
    '||': TokenType.oparand,
    '!': TokenType.oparand,
    '<>': TokenType.oparand,
    '&': TokenType.oparand,
    '|': TokenType.oparand,
    '^': TokenType.oparand,
    '~': TokenType.oparand,
    '++': TokenType.oparand,
    '--': TokenType.oparand,

    '=': TokenType.AssignmentOperator,

    '+=': TokenType.ReAssignmentOperator,
    '-=': TokenType.ReAssignmentOperator,
    '*=': TokenType.ReAssignmentOperator,
    '/=': TokenType.ReAssignmentOperator,
    '%': TokenType.oparand,
    '<<': TokenType.oparand,
    '>>': TokenType.oparand,
    '%=': TokenType.ReAssignmentOperator,
    '<<=': TokenType.ReAssignmentOperator,
    '>>=': TokenType.ReAssignmentOperator,
    '&=': TokenType.ReAssignmentOperator,
    '|=': TokenType.ReAssignmentOperator,
    '^=': TokenType.ReAssignmentOperator,

    '?': TokenType.oparand,
    ':': TokenType.colon,
    ';': TokenType.semicolon,
    ',': TokenType.comma,
    '(': TokenType.leftParenthesis,
    ')': TokenType.rightParenthesis,
    '{': TokenType.leftBrace,
    '}': TokenType.rightBrace,
    '[': TokenType.leftBracket,
    ']': TokenType.rightBracket,
    '.': TokenType.dot,
};


export const keywords: Record <string, TokenType> =
{
    'mut': TokenType.mut,
    'const': TokenType.const,

    'TRUE': TokenType.bool,
    'FALSE': TokenType.bool,
    'NULL': TokenType.null,

    'class': TokenType.class,
    'new': TokenType.new,

    'from': TokenType.from,
    'include': TokenType.include,

    'proc': TokenType.proc,
    'return': TokenType.return,

    'if': TokenType.if,
    'elif': TokenType.elif,
    'else': TokenType.else,

    'while': TokenType.while,
    'for': TokenType.for,
    'typeof': TokenType.typeof,
    'in': TokenType.in,

    'byte': TokenType.byteDef,
    'short': TokenType.shortDef,
    'int': TokenType.intDef,
    'long': TokenType.longDef,

    'ubyte': TokenType.ubyteDef,
    'ushort': TokenType.ushortDef,
    'uint': TokenType.uintDef,
    'ulong': TokenType.ulongDef,

    'float': TokenType.floatDef,
    'double': TokenType.floatDef,
    
    'str': TokenType.strDef,

    'null': TokenType.nullDef,
};

export interface Token
{
    value: string;
    type: TokenType;
    where: Position;
};