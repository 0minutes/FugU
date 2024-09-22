
import
{
    TokenType
} from "../Lexer/TokenTypes.ts";

import
{
    Parser
} from "./Parser.ts";

import
{
    Identifier,
} from './NodeTypes.ts'

import
{
    parseLiteral,
} from './Expressions.ts'

export type baseTypes = 'TypeReference' |'Array' | 'int' | 'str' | 'char' |'float';

export interface baseType
{
    type: baseTypes;
    where: number[];
};

export type intSize = 'u8' | 'u16' | 'u32' | 'u64' | 'i8' | 'i16' | 'i32' | 'i64'

export interface intType extends baseType
{
    type: 'int';
    size: intSize;
    where: number[];
};

export interface arrayType extends baseType
{
    type: 'Array';
    elements: baseType;
    where: number[];
};

export interface typeRef extends baseType
{
    type: 'TypeReference';
    typeName: Identifier;
    where: number[];
};

export interface floatType extends baseType
{
    type: 'float';
    where: number[];
};


export interface strType extends baseType
{
    type: 'str';
    where: number[];
};

export interface charType extends baseType
{
    type: 'char';
    where: number[];
};

export type Type = baseType | typeRef | intType | arrayType | strType | charType | floatType;

export const parseTypeDef = (parser: Parser): Type =>
{
    const token = parser.expectMultiple(
        [
            TokenType.typeDef,
            TokenType.identifier,
        ],
        true,
        `Expected a valid type such as u8, str etc or a type reference instead of '${parser.at().value}'`,
        'Valid Type'
    );

    let base: Type = {
    } as baseType; 

    switch (token.value)
    {
        case 'u1':
        case 'u8':
        case 'u16':
        case 'u32':
        case 'u64':
        case 'i8':
        case 'i16':
        case 'i32':
        case 'i64':
        {
            base = {
                type: 'int',
                size: token.value,
                where: [token.where.line, token.where.start, token.where.end]
            } as intType;
            break;
        };

        case 'float':
        {
            base = {
                type: 'float',
                where: [token.where.line, token.where.start, token.where.end]
            } as floatType;

            break;
        };
        
        case 'str':
        {
            base = {
                type: 'str',
                where: [token.where.line, token.where.start, token.where.end]
            } as strType;

            break;
        };

        case 'char':
        {
            base = {
                type: 'char',
                where: [token.where.line, token.where.start, token.where.end]
            } as charType;

            break;
        };

        default:
        {
            base = {
                type: 'TypeReference',
                typeName: parseLiteral(parser, token),
                where: [token.where.line, token.where.start, token.where.end]
            } as typeRef;
        };
    };

    
    while (parser.at().type == TokenType.leftBracket)
    {
        parser.eat();
        const rightBracket = parser.expect(
            TokenType.rightBracket,
            true,
            `Expected ']' after '[' instead of ${parser.at().value} to specify the array type`,
            ']'
        );

        base = {
            type: 'Array',
            elements: base,
            where: [token.where.line, token.where.start, rightBracket.where.end]
        } as arrayType;
    };

    return base;
};