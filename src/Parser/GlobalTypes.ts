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
export type TypeName = 'integer' | 'float' | 'string' | 'char' | 'array' | 'UnionType' | 'ParenthesizedType';

export interface intType
{
    type: TypeName;
    size: intSize;
    where: number[];
};

export interface floatType
{
    type: TypeName;
    where: number[];
};

export interface stringType
{
    type: TypeName;
    where: number[];
};

export interface charType
{
    type: TypeName;
    where: number[];
}

export interface arrayType
{
    type: TypeName;
    length: Expr | undefined;
    childType: FugType;
    where: number[];
};

export interface UnionType
{
    type: TypeName;
    types: FugType[];
    where: number[];
};

export interface ParenthesizedType
{
    type: TypeName;
    types: FugType;
    where: number[]
};

export type FugType = intType | floatType | stringType | charType | arrayType | UnionType | ParenthesizedType;

export const parseType = (parser: Parser, Union: boolean /* To only parse 1 type*/): FugType =>
{
    const token = parser.expectMultiple (
        [
            TokenType.leftParenthesis,
            TokenType.leftBracket,

            TokenType.u1Def,
            TokenType.u8Def,
            TokenType.u16Def,
            TokenType.u32Def,
            TokenType.u64Def,
            TokenType.i8Def,
            TokenType.i16Def,
            TokenType.i32Def,
            TokenType.i64Def,
        
            TokenType.floatDef,
            TokenType.strDef,
            TokenType.chrDef,
        ],
        true,
        'Expected a type definition',
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

        case TokenType.u1Def:
        case TokenType.u8Def:
        case TokenType.u16Def:
        case TokenType.u32Def:
        case TokenType.u64Def:
        case TokenType.i8Def:
        case TokenType.i16Def:
        case TokenType.i32Def:
        case TokenType.i64Def:
        {
            baseType = {
                type: 'integer',
                size: token.value,
                where: [token.where.line, token.where.start, token.where.end]
            } as intType;

            break;
        };
    
        case TokenType.floatDef:
        {
            baseType = {
                type: 'float',
                where: [token.where.line, token.where.start, token.where.end]
            } as floatType;

            break;
        };

        case TokenType.strDef:
        {
            baseType = {
                type: 'string',
                where: [token.where.line, token.where.start, token.where.end]
            } as floatType;

            break;
        };
    
        default: // TokenType.chrDef
        {
            baseType = {
                type: 'char',
                where: [token.where.line, token.where.start, token.where.end]
            } as charType;

            break;
        };
    };


    while (parser.at().type == TokenType.leftBracket)
    {
        parser.eat();

        let len = undefined;
        
        if (parser.at().type != TokenType.rightBracket)
        {
            len = parseExpression(parser, 2);
        };

        const rightBracket = parser.expect(
            TokenType.rightBracket,
            true,
            `Expected ']' at the end of array type definition instead of '${parser.at().value}' `,
            ']'
        );

        baseType = {
            type: 'array',
            length: len,
            childType: baseType,
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

        baseType = {
            type: 'UnionType',
            types: types,
            where: [types[0].where[0], types[0].where[1], types[types.length-1].where[2]]
        };
    };
    
    return baseType;
};
