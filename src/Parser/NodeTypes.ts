export type GlobalType = 'Global' | 'Subprocess';
export type StatementType = 'ExpressionStatement' | 'EmptyStatement';
export type ExpressionType = 'BinaryExpression' | 'UnaryExpression' | 'UnaryUpdateExpression' | 'Literal' | 'Identifier';
export type LiteralType = 'IntegerLiteral' | 'FloatLiteral' | 'StringLiteral' | 'CharLiteral' | 'NullLiteral';

export interface Global
{
    type: GlobalType;
    file: string;
    body: Statement[];
    where: number[];
};

// Statements

export interface Statement
{
    type: StatementType;
    where: number[];
};

export interface EmptyStatement extends Statement
{
    type: 'EmptyStatement';
};

export interface ExpressionStatement extends Statement
{
    type: 'ExpressionStatement';
    body: Expression[];
};

// Expressions

export interface Expression
{
    type: ExpressionType;
    where: number[];
};

export interface BinaryExpression extends Expression
{
    type: 'BinaryExpression';
    left: Expression;
    right: Expression;
    operator: string;
    where: number[];
};

export interface UnaryExpression extends Expression
{
    type: 'UnaryExpression';
    operator: string;
    right: Expression;
    where: number[];
};

export interface UnaryUpdateExpression extends Expression
{
    type: 'UnaryUpdateExpression';
    operator: string;
    prefix: boolean;
    right: Expression;
    where: number[];
};

export interface Literal extends Expression
{
    type: 'Literal';
    realType: LiteralType;
    value: bigint | number | string;
    where: number[];
};

export interface Identifier extends Expression
{
    type: 'Identifier';
    value: string;
    where: number[];
};