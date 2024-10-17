import
{
    simpleType
} from "./Types.ts";

export type GlobalType = 'Global' | 'Subprocess';

export type StatementType = 'ExpressionStatement' | 'EmptyStatement' | 'DeclerationStatement';
export type ExpressionType = 'ArrayLiteralExpression' | 'SequenceExpression' | 'AssignmentExpression' | 'BinaryExpression' | 'UnaryExpression' | 'UnaryUpdateExpression' | 'Literal' | 'Identifier';
export type LiteralType = 'IntegerLiteral' | 'FloatLiteral' | 'StringLiteral' | 'CharLiteral' | 'NullLiteral';

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
    foldable: boolean;
    mut: boolean;
    simpleType: simpleType;
    variables: Identifier[];
    init: Expr | undefined;
    where: number[];
};

export interface ExpressionStatement
{
    type: 'ExpressionStatement';
    foldable: boolean;
    body: Expr;
    where: number[];
};

// Expressions

export interface ElementAccessExpression
{
    type: 'ElementAccessExpression';
    foldable: boolean;
    right: Expr;
    argument: Expr;
    where: number[];
}

export interface BinaryExpression
{
    type: 'BinaryExpression';
    foldable: boolean;
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
    foldable: boolean;
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
    foldable: boolean;
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
    foldable: boolean;
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
    foldable: boolean;
    elements: Expr[];
    where: number[];
};

export interface Literal
{
    type: 'Literal';
    foldable: boolean;
    kind: LiteralType;
    value: bigint | number | string;
    where: number[];
};

export interface Identifier
{
    type: 'Identifier';
    foldable: boolean;
    value: string;
    where: number[];
};

export type Stmt = ExpressionStatement | DeclerationStatement | EmptyStatement;
export type Expr = ElementAccessExpression | ArrayExpression | BinaryExpression | UnaryExpression | UnaryUpdateExpression | AssignmentExpression | Literal | Identifier;