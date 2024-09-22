import
{
    Type
} from "./Types.ts";

export type GlobalType = 'Global' | 'Subprocess';

export type StatementType = 'ExpressionStatement' | 'EmptyStatement' | 'DeclerationStatement';

export type ExpressionType = 'ArrayLiteralExpression' | 'SequenceExpression' | 'AssignmentExpression' | 'BinaryExpression' | 'UnaryExpression' | 'UnaryUpdateExpression' | 'Literal' | 'Identifier';
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
    valType: Type;
    variables: Identifier[];
    init: Expr;
    where: number[];
};

// Expressions

export interface ExpressionStatement extends Statement
{
    type: 'ExpressionStatement';
    body: Expr[];
};

export interface Expression
{
    type: ExpressionType;
    foldable: boolean;
    where: number[];
};

export interface SequenceExpression extends Expression
{
    type: 'SequenceExpression';
    foldable: boolean;
    expressions: Expr[];
    where: number[];
}

export interface BinaryExpression extends Expression
{
    type: 'BinaryExpression';
    foldable: boolean;
    left: Expr;
    right: Expr;
    operator: string;
    where: number[];
};


export interface AssignmentExpression extends Expression
{
    type: 'AssignmentExpression';
    foldable: boolean;
    left: Identifier;
    right: Expr;
    operator: string;
    where: number[];
};

export interface UnaryExpression extends Expression
{
    type: 'UnaryExpression';
    foldable: boolean;
    operator: string;
    right: Expr;
    where: number[];
};

export interface UnaryUpdateExpression extends Expression
{
    type: 'UnaryUpdateExpression';
    foldable: boolean;
    operator: string;
    prefix: boolean;
    right: Expr;
    where: number[];
};

export interface ArrayExpression extends Expression
{
    type: 'ArrayLiteralExpression';
    foldable: boolean;
    length: number;
    expressions: Expr[];
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



export type Stmt = ExpressionStatement | DeclerationStatement | EmptyStatement;
export type Expr = ArrayExpression | SequenceExpression | BinaryExpression | UnaryExpression | UnaryUpdateExpression | AssignmentExpression | Literal | Identifier;