
export type simpleType = nullType | intType | floatType | strType | arrayType | errorType;

export interface nullType
{
    kind: 'null';
    where: number[];
};

export interface intType
{
    kind: 'int';
    where: number[];
};

export interface floatType
{

    kind: 'float';
    where: number[];
};

export interface strType
{
    kind: 'str';
    where: number[];
};

export interface arrayType
{
    kind: 'array',
    elementKind: simpleType | undefined;
    where: number[];
};

export interface errorType
{
    kind: 'errorType',
    where: number[];
};