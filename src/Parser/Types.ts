
export type simpleType = nullType | intType | floatType | strType | chrType | arrayType;

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

export interface chrType
{
    kind: 'chr',
    where: number[];
};

export interface arrayType
{
    kind: 'array',
    elementKind: simpleType | undefined;
    where: number[];
};
