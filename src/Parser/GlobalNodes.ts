import
{
    simpleType
} from "./Types.ts";

export type GlobalType = 'Global' | 'Subprocess';

export type StatementType = 'ExpressionStatement' | 'EmptyStatement' | 'DeclerationStatement';
export type ExpressionType = 'ArrayLiteralExpression' | 'SequenceExpression' | 'AssignmentExpression' | 'BinaryExpression' | 'UnaryExpression' | 'UnaryUpdateExpression' | 'Literal' | 'Identifier';
export type LiteralType = 'IntegerLiteral' | 'FloatLiteral' | 'StringLiteral' | 'NullLiteral';

export interface Global
{
    type: GlobalType;
    file: string;
    body: Stmt[];
    where: number[];
};

// Statements

export interface EmptyStatement
{
    type: 'EmptyStatement';
};

export interface DeclerationStatement
{
    type: 'DeclerationStatement';
    mut: boolean;
    simpleType: simpleType;
    variables: Identifier[];
    init: Expr | undefined;
    where: number[];
};

export interface IfStatement
{
    type: 'IfStatement';
    condition: Expr;
    body: Stmt[];
    alternate: IfStatement | ElseStatement | undefined;
    where: number[];
};

export interface FunctionStatement
{
    type: 'FunctionStatement';
    simpleType: simpleType;
    args: Argument[];
    body: Stmt[];
    where: number[];
}

export interface ElseStatement
{
    type: 'ElseStatement';
    body: Stmt[];
    where: number[];
};

export interface ExpressionStatement
{
    type: 'ExpressionStatement';
    body: Expr;
    where: number[];
};

export interface ReturnStatement
{
    type: 'ReturnStatement';
    Expression: Expr;
    where: number[];
}

// Expressions

export interface Argument
{
    type: 'Argument';
    variable: Identifier;
    simpleType: simpleType;
    where: number[];
}

export interface ElementAccessExpression
{
    type: 'ElementAccessExpression';
    left: Expr;
    index: Expr;
    where: number[];
}

export interface BinaryExpression
{
    type: 'BinaryExpression';
    left: Expr;
    right: Expr;
    operator: {
        kind: string;
        where: number[]
    };
    where: number[];
};


export interface AssignmentExpression
{
    type: 'AssignmentExpression';
    left: Identifier;
    right: Expr;
    operator: {
        kind: string;
        where: number[]
    };
    where: number[];
};

export interface UnaryExpression
{
    type: 'UnaryExpression';
    operator: {
        kind: string;
        where: number[]
    };
    right: Expr;
    where: number[];
};

export interface UnaryUpdateExpression
{
    type: 'UnaryUpdateExpression';
    operator: {
        kind: string;
        where: number[]
    };
    prefix: boolean;
    right: Identifier;
    where: number[];
};

export interface ArrayExpression
{
    type: 'ArrayLiteralExpression';
    elements: Expr[];
    where: number[];
};

export interface Literal
{
    type: 'Literal';
    kind: LiteralType;
    value: bigint | number | string;
    where: number[];
};

export interface Identifier
{
    type: 'Identifier';
    value: string;
    where: number[];
};

export interface FunctionCall
{
    type: "FunctionCall";
    caller: Expr;
    args: Expr[];
    where: number[];
}

export type Stmt = ReturnStatement | FunctionStatement | ExpressionStatement | IfStatement | DeclerationStatement | EmptyStatement;
export type Expr = FunctionCall | Argument | ElementAccessExpression | ArrayExpression | BinaryExpression | UnaryExpression | UnaryUpdateExpression | AssignmentExpression | Literal | Identifier;