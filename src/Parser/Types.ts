
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
    Expr,
    Identifier,
} from './NodeTypes.ts'

import
{
    parseLiteral,
} from './Expressions.ts'

import
{
    parseExpression
} from "./Expressions.ts";

export type baseTypes = 'UnionType' | 'TypeReference' |'Array' | 'int' | 'str' | 'char' | 'float' | 'null';

export interface baseType
{
    type: baseTypes;
    where: number[];
};

export type intSize = 'u1' | 'u8' | 'u16' | 'u32' | 'u64' | 'i8' | 'i16' | 'i32' | 'i64'

export interface UnionType extends baseType
{
    type: 'UnionType',
    types: Type[],
    where: number[],
};

export interface intType extends baseType
{
    type: 'int';
    size: intSize;
    where: number[];
};

export interface arrayType extends baseType
{
    type: 'Array';
    length: Expr;
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

export interface nullType extends baseType
{
    type: 'null';
    where: number[];
};


export type Type =  UnionType | typeRef | intType | arrayType | strType | charType | floatType | nullType;

export const strUnionType = (items: Type[]): string =>
{
    const values = items.map(item => item.type);
    
    if (values.length == 0) return '';
    if (values.length == 1) return values[0];
    
    const lastValue = values.pop();

    return values.length ? `${values.join(' | ')} | ${lastValue}` : lastValue || '';
};

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

    let base = {
    } as Type; 

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
        const tok = parser.eat();

        let len = {
            type: 'Literal',
            foldable: true,
            kind: 'IntegerLiteral',
            value: -1n,
            where: [tok.where.line, tok.where.start, tok.where.end],
        } as Expr;
        
        if (parser.at().type != TokenType.rightBracket)
        {
            len = parseExpression(parser, 2);
        };

        const rightBracket = parser.expect(
            TokenType.rightBracket,
            true,
            `Expected ']' instead of '${parser.at().value}' to specify the array type`,
            ']'
        );

        base = {
            type: 'Array',
            length: len,
            elements: base,
            where: [token.where.line, token.where.start, rightBracket.where.end]
        } as arrayType;
    };


    if (parser.at().value == '|')
    {
        const types: Type[] = [base];

        while(parser.at().value == '|')
        {
            parser.eat();
            types.push(parseTypeDef(parser));  
        };

        base = {
            type: 'UnionType',
            types: types,
            where: [types[0].where[0], types[0].where[1], types[types.length-1].where[2]]
        };
    };


    return base;
};