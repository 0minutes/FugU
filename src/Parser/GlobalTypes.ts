import { TokenType } from "../Lexer/TokenTypes.ts";
import { parseExpression } from "./Expressions.ts";
import
{
    Expr
} from "./GlobalNodes.ts";

import
{
    Parser
} from "./Parser.ts";

export type intSize = 'u1' | 'u8' | 'u16' | 'u64' | 'i8' | 'i16' | 'i32' | 'i64';
export type TypeName = 'integer' | 'float' | 'string' | 'char' | 'null' | 'array' | 'UnionType';

export interface intType
{
    kind: 'integer';
    size: intSize;
    where: number[];
};

export interface floatType
{
    kind: 'float';
    size: 'f64' | 'f32'
    where: number[];
};

export interface stringType
{
    kind: 'string';
    where: number[];
};

export interface charType
{
    kind: 'char';
    where: number[];
};

export interface nullType
{
    kind: 'null';
    where: number[];
};

export interface arrayType
{
    kind: 'array';
    childkind: UnionType;
    where: number[];
};

export interface UnionType
{
    kind: 'UnionType';
    types: FugType[];
    where: number[];
};

export type FugType = nullType | intType | floatType | stringType | charType | arrayType | UnionType;

export const stringifyTypes = (Types: FugType[]): string =>
{
    let str = '';

    for (let i = 0; i < Types.length; i++)
    {
        if (i > 0)
        {
            str += ' | ';
        }

        str += Types[i].kind;
    }

    return str;
};

export const compressUnion = (Union: UnionType): UnionType =>
{
    const types: FugType[] = [];

    const newUnion: UnionType = {
        kind: 'UnionType',
        types: types,
        where: Union.where
    };

    for (const Type of Union.types)
    {
        if (Type.kind == 'UnionType')
        {
            types.push(...compressUnion(Type).types);
            continue;
        };

        types.push(Type);
    };  

    newUnion.types = types;

    return newUnion;
};

export const parseType = (parser: Parser, Union: boolean /* To only parse 1 type*/): FugType =>
{
    const token = parser.expectMultiple (
        [
            TokenType.leftParenthesis,

            TokenType.u1Def,
            TokenType.u8Def,
            TokenType.u16Def,
            TokenType.u32Def,
            TokenType.u64Def,
            TokenType.i8Def,
            TokenType.i16Def,
            TokenType.i32Def,
            TokenType.i64Def,
        
            TokenType.f32Def,
            TokenType.f64Def,

            TokenType.strDef,
            TokenType.chrDef,
        ],
        true,
        'Expected a valid type definition',
        'i64 str chr...'
    );

    let baseType: FugType;

    switch (token.type)
    {
        case TokenType.leftParenthesis:
        {
            baseType = parseType(parser, false);

            parser.expect(TokenType.rightParenthesis, true, `Expected a ')' (${TokenType.rightParenthesis}) to end the type definiton`)
            break;
        };

        case TokenType.chrDef:
        {
            baseType = {
                kind: 'char',
                where: [token.where.line, token.where.start, token.where.end]
            } as charType;

            break;
        };
    
        case TokenType.f32Def:
        case TokenType.f64Def:
        {
            baseType = {
                kind: 'float',
                size: token.value,
                where: [token.where.line, token.where.start, token.where.end]
            } as floatType;

            break;
        };

        case TokenType.strDef:
        {
            baseType = {
                kind: 'string',
                where: [token.where.line, token.where.start, token.where.end]
            } as stringType;

            break;
        };

        default:
        {
            baseType = {
                kind: 'integer',
                size: token.value,
                where: [token.where.line, token.where.start, token.where.end]
            } as intType;

            break;
        };
    };


    while (parser.at().type == TokenType.leftBracket)
    {
        parser.eat();

        const rightBracket = parser.expect(
            TokenType.rightBracket,
            true,
            `Expected ']' at the end of array type definition instead of '${parser.at().value}' `,
            ']'
        );

        baseType = {
            kind: 'array',
            childkind: baseType,
            where: [token.where.line, token.where.start, rightBracket.where.end]
        } as arrayType;
    };


    if (parser.at().value == '|' && !Union)
    {
        const types: FugType[] = [baseType];

        while(parser.at().value == '|')
        {
            parser.eat();
            types.push(parseType(parser, true));  
        };

        baseType = compressUnion({
            kind: 'UnionType',
            types: types,
            where: [types[0].where[0], types[0].where[1], types[types.length-1].where[2]]
        });
    };  

    return baseType;
};
