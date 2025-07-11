import {
    Expr
} from "./GlobalNodes.ts";

export type simpleType = nullType | byteType | shortType | intType | longType | ubyteType | ushortType | uintType | ulongType | doubleType | floatType | strType | arrayType | errorType;

export interface nullType
{
    kind: 'null';
    where: number[];
};

export interface byteType
{
    kind: 'byte';
    where: number[];
};

export interface shortType
{
    kind: 'short',
    where: number[],
};

export interface intType
{
    kind: 'int';
    where: number[];
};

export interface longType
{
    kind: 'long';
    where: number[];
};


export interface ubyteType
{
    kind: 'ubyte';
    where: number[];
};

export interface ushortType
{
    kind: 'ushort',
    where: number[],
};

export interface uintType
{
    kind: 'uint';
    where: number[];
};

export interface ulongType
{
    kind: 'ulong';
    where: number[];
};

export interface floatType
{

    kind: 'float';
    where: number[];
};

export interface doubleType
{
    kind: 'double';
    where: number[];
}

export interface strType
{
    kind: 'str';
    where: number[];
};

export interface arrayType
{
    kind: 'array',
    elementKind: simpleType | undefined;
    size: Expr | undefined;
    where: number[];
};

export interface errorType
{
    kind: 'errorType',
    where: number[];
};