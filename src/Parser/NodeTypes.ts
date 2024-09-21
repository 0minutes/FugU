export type GlobalType = 'Global' | 'Subprocess';

export type StatementType = 'ExpressionStatement' | 'EmptyStatement' | 'DeclerationStatement';

export type ExpressionType = 'SequenceExpression' | 'AssignmentExpression' | 'BinaryExpression' | 'UnaryExpression' | 'UnaryUpdateExpression' | 'Literal' | 'Identifier';
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
    foldable: boolean;
    where: number[];
};

export interface EmptyStatement extends Statement
{
    type: 'EmptyStatement';
};

// Declerations

export interface DeclerationStatement extends Statement
{
    type: 'DeclerationStatement';
    foldable: boolean;
    mut: boolean;
    valType: string;
    variables: Identifier[];
    init: Expression;
    where: number[];
};

// Expressions

export interface ExpressionStatement extends Statement
{
    type: 'ExpressionStatement';
    body: Expression[];
};

export interface Expression
{
    type: ExpressionType;
    foldable: boolean;
    where: number[];
};

export interface BinaryExpression extends Expression
{
    type: 'BinaryExpression';
    foldable: boolean;
    left: Expression;
    right: Expression;
    operator: string;
    where: number[];
};


export interface AssignmentExpression extends Expression
{
    type: 'AssignmentExpression';
    foldable: boolean;
    left: Identifier;
    right: Expression;
    operator: string;
    where: number[];
};

export interface UnaryExpression extends Expression
{
    type: 'UnaryExpression';
    foldable: boolean;
    operator: string;
    right: Expression;
    where: number[];
};

export interface UnaryUpdateExpression extends Expression
{
    type: 'UnaryUpdateExpression';
    foldable: boolean;
    operator: string;
    prefix: boolean;
    right: Expression;
    where: number[];
};

export interface Literal extends Expression
{
    type: 'Literal';
    foldable: boolean;
    realType: LiteralType;
    value: bigint | number | string;
    where: number[];
};

export interface Identifier extends Expression
{
    type: 'Identifier';
    foldable: boolean;
    value: string;
    where: number[];
};