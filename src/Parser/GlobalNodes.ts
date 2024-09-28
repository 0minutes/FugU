import
{
    FugType
} from "./GlobalTypes.ts";

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

// Declerations

export interface DeclerationStatement
{
    type: 'DeclerationStatement';
    foldable: boolean;
    mut: boolean;
    FugType: FugType;
    variables: Identifier[];
    initialized: boolean;
    init: Expr | undefined;
    where: number[];
};

// Expressions

export interface ExpressionStatement
{
    type: 'ExpressionStatement';
    foldable: boolean;
    body: Expr[];
    where: number[];
};

export interface SequenceExpression
{
    type: 'SequenceExpression';
    foldable: boolean;
    expressions: Expr[];
    where: number[];
}

export interface BinaryExpression
{
    type: 'BinaryExpression';
    foldable: boolean;
    left: Expr;
    right: Expr;
    operator: string;
    where: number[];
};


export interface AssignmentExpression
{
    type: 'AssignmentExpression';
    foldable: boolean;
    left: Identifier;
    right: Expr;
    operator: string;
    where: number[];
};

export interface UnaryExpression
{
    type: 'UnaryExpression';
    foldable: boolean;
    operator: string;
    right: Expr;
    where: number[];
};

export interface UnaryUpdateExpression
{
    type: 'UnaryUpdateExpression';
    foldable: boolean;
    operator: string;
    prefix: boolean;
    right: Identifier;
    where: number[];
};

export interface ArrayExpression
{
    type: 'ArrayLiteralExpression';
    foldable: boolean;
    length: number;
    expressions: Expr[];
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
export type Expr = ArrayExpression | SequenceExpression | BinaryExpression | UnaryExpression | UnaryUpdateExpression | AssignmentExpression | Literal | Identifier;