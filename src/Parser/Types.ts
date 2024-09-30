
export type simpleType = nullType | intType | floatType | strType | chrType | arrayType;

export interface nullType
{
    kind: 'null';
    where: number[];
};

export type intSize = 'u1' | 'u8' | 'i8' | 'u16' | 'i16' | 'u32' | 'i32' | 'u64' | 'i64';

export interface intType
{
    kind: 'int';
    size: intSize;
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
