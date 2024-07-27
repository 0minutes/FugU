// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars

/*

ORDER OF PRECEDENCE

Literal Node (parseLiteralNode): 1, 2, 3...
Parentheses (parseLiteralNode): (Literal Node)
Unary Updaters (parseUnaryUpdateExpression): ++, --
Unary Operators (parseUnaryExpr): +, -, !, ~ 
Exponential Operator (parseExponentiationExpr): **
Multiplication etc (parseMultiplicationExpr): *, /, %
Addition and Subtraction (parseAdditiveExpr): +, -
Bitwise Shift (parseBitwiseExpr): <<, >>
Relational (parseRationalExpr): <, <=, >, >=
Equality (parseEqualityExpr): ==, !=
Bitwise and Logical Operators (parseLogicalBitwiseExpr): &, ^, |, &&, ||

*/


import
{
    Lexer
} from './Lexer.ts';

import
{
    ConstantFolding
} from './ConstantFolding.ts';
import
{
    Flags,
    Program,
    Statement,
    Expression,
    Token,
    TokenType,
    SyntaxErr,
    expected,
    makePosition,
    NodeType,
    ExpressionStatement,
    EmptyStatement,
    BinaryExpression,
    UnaryUpdateExpression,
    Identifier,
    Literal,
    unaryUpdaters,
    LiteralValue,
    ValueTypes,
    unaryBinOps,
    UnaryExpression,
} from '../shared.ts';


export class Parser
{
    filename: string;
    source: string;

    lexer: Lexer;
    tokens: Token[];

    ast: Program;

    flags: Flags; 

    constructor(flags: Flags, source: string, filename ? : string)
    {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
        this.flags = flags;

        this.lexer = new Lexer(flags, source, this.filename);

        this.tokens = this.lexer.tokens;

        this.ast = this.parseProgram();
    }

    at = (): Token =>
    {
        return this.tokens[0];
    };

    eof = (): boolean =>
    {
        return this.at().type == TokenType.eof;
    };

    eol = (): boolean =>
    {
        return this.at().type == TokenType.eol || this.at().type == TokenType.semicolon;
    };

    next = (): any =>
    {
        if (this.tokens.length >= 1)
        {
            return this.tokens[1];
        };
        return TokenType.eof;
    };

    eat = (): Token =>
    {
        // if (this.tokens.length > 0)
        // {
        return this.tokens.shift() as Token;
        // };
        // return TokenType.eof;
    };


    parseLiteralNode = (prevToken ? : TokenType): Expression =>
    {
        let token = this.eat();

        switch (token.type)
        {
            case TokenType.integer:
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: BigInt(token.value),
                    range: [token.loc.line, token.loc.start, token.loc.end]
                } as Literal;
            };

            case TokenType.float:
            {
                if (parseInt(token.value) == parseFloat(token.value))
                {
                    return {
                        type: NodeType.Literal,
                        runtimeValue: LiteralValue.NumberLiteral,
                        value: parseInt(token.value),
                        range: [token.loc.line, token.loc.start, token.loc.end]
                    } as Literal;
                }

                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.FloatLiteral,
                    value: parseFloat(token.value),
                    range: [token.loc.line, token.loc.start, token.loc.end]
                } as Literal;
            };

            case TokenType.string:
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.StringLiteral,
                    value: token.value,
                    range: [token.loc.line, token.loc.start, token.loc.end]
                } as Literal;
            };


            case TokenType.bool:
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: 'true' == token.value ? true : false,
                    range: [token.loc.line, token.loc.start, token.loc.end]
                } as Literal;
            };

            case TokenType.null:
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NullLiteral,
                    value: null,
                    range: [token.loc.line, token.loc.start, token.loc.end]
                } as Literal;
            };

            case TokenType.oparen:
            {
                if (this.at().type == TokenType.cparen)
                {
                    new SyntaxErr(`Expected ${expected(prevToken != undefined? prevToken : token.type)} before getting a '${this.at().value}' (${this.at().type}) token`, makePosition(this.filename, this.at().loc.line, this.at().loc.start, this.at().loc.end), this.source);
                };

                let value = this.parseAdditiveExpr(TokenType.oparen);

                if (this.at().type != TokenType.cparen)
                {
                    new SyntaxErr(`Expected a ')' (${TokenType.cparen}) before getting a '${this.at().value}' (${this.at().type}) token`, makePosition(this.filename, this.at().loc.line, this.at().loc.start, this.at().loc.end), this.source);
                };
                this.eat();
                return value;
            };

            case TokenType.identifier:
            {
                return {
                    type: NodeType.Identifier,
                    value: token.value,
                    range: [token.loc.line, token.loc.start, token.loc.end]
                } as Identifier;
            };

            default:
            {   
                new SyntaxErr(`Expected ${expected(prevToken != undefined? prevToken : token.type)} before getting a '${token.value}' (${token.type}) token`, makePosition(this.filename, token.loc.line, token.loc.start, token.loc.end), this.source);
                return {} as Literal; //Lie to compiler since it's asking for me to return Expression but i do, otherwise exit
            };
        };
    };

    parseUnaryUpdateExpression = (prev ? : TokenType): Expression =>
    {
        let token = this.at();

        if (token.value in unaryUpdaters)
        {
            let operator = this.eat();
            let lhs = this.parseLiteralNode(prev != undefined ? prev : operator.type);
            lhs = {
                type: NodeType.UnaryUpdateExpression,
                operator: operator.value,
                prefix: true,
                argument: lhs,
                range: [token.loc.line, lhs.range[1], lhs.range[2]],
            } as UnaryUpdateExpression;

            return lhs;
        }

        else if (ValueTypes.includes(token.type) || token.type == TokenType.oparen)
        {
            let lhs = this.parseLiteralNode(prev != undefined ? prev : token.type);
            if (this.at().value in unaryUpdaters)
            {
                let operator = this.eat();

                lhs = {
                    type: NodeType.UnaryUpdateExpression,
                    operator: operator.value,
                    prefix: false,
                    argument: lhs,
                    range: [token.loc.line, lhs.range[1], lhs.range[2]],
                } as UnaryUpdateExpression;
            };

            return lhs;
        }

        let lhs = this.parseLiteralNode(prev);
        return lhs;
    };

    parseUnaryExpr = (prev ? : TokenType): Expression =>
    {
        let token = this.at();

        if (token.value in unaryBinOps)
        {
            let operator = this.eat();
            let lhs = this.parseLogicalBitwiseExpr(prev != undefined ? prev : operator.type);
            lhs = {
                type: NodeType.UnaryExpression,
                operator: operator.value,
                argument: lhs,
                range: [token.loc.line, lhs.range[1], lhs.range[2]],
            } as UnaryExpression;

            return lhs;
        }

        let lhs = this.parseUnaryUpdateExpression(prev);
        return lhs;
    };

    parseExponentiationExpr = (prev ? : TokenType): Expression =>
    {
        let lhs = this.parseUnaryExpr(prev);
        while ('**' == this.at().value)
        {
            let operator = this.eat();
            let rhs = this.parseUnaryExpr(prev != undefined ? prev : operator.type);
            lhs = {
                type: NodeType.BinaryExpression,
                left: lhs,
                operator: operator.value,
                right: rhs,
                range: [lhs.range[0], lhs.range[1], rhs.range[2]],
            } as BinaryExpression;
        };
        return lhs;
    };

    parseMultiplicationExpr = (prev ? : TokenType): Expression =>
    {
        let lhs = this.parseExponentiationExpr(prev);
        while ('*/%'.includes(this.at().value))
        {
            let operator = this.eat();
            let rhs = this.parseExponentiationExpr(prev != undefined ? prev : operator.type);
            lhs = {
                type: NodeType.BinaryExpression,
                left: lhs,
                operator: operator.value,
                right: rhs,
                range: [lhs.range[0], lhs.range[1], rhs.range[2]],
            } as BinaryExpression;
        };
        return lhs;
    };

    parseAdditiveExpr = (prev ? : TokenType): Expression =>
    {
        let lhs = this.parseMultiplicationExpr(prev);
        while ('+-'.includes(this.at().value))
        {
            let operator = this.eat();
            let rhs = this.parseMultiplicationExpr(prev != undefined ? prev : operator.type);
            lhs = {
                type: NodeType.BinaryExpression,
                left: lhs,
                operator: operator.value,
                right: rhs,
                range: [lhs.range[0], lhs.range[1], rhs.range[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseBitwiseExpr = (prev ? : TokenType): Expression =>
    {
        let lhs = this.parseAdditiveExpr(prev);
        while (['<<', '>>'].includes(this.at().value))
        {
            let operator = this.eat();
            let rhs = this.parseAdditiveExpr(prev != undefined ? prev : operator.type);
            lhs = {
                type: NodeType.BinaryExpression,
                left: lhs,
                operator: operator.value,
                right: rhs,
                range: [lhs.range[0], lhs.range[1], rhs.range[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseRationalExpr = (prev ? : TokenType): Expression =>
    {
        let lhs = this.parseBitwiseExpr(prev);
        while (['<', '>', '<=', '>='].includes(this.at().value))
        {
            let operator = this.eat();
            let rhs = this.parseBitwiseExpr(prev != undefined ? prev : operator.type);
            lhs = {
                type: NodeType.BinaryExpression,
                left: lhs,
                operator: operator.value,
                right: rhs,
                range: [lhs.range[0], lhs.range[1], rhs.range[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseEqualityExpr = (prev ? : TokenType): Expression =>
    {
        let lhs = this.parseRationalExpr(prev);
        while (['==', '!=', '<>'].includes(this.at().value))
        {
            let operator = this.eat();
            let rhs = this.parseRationalExpr(prev != undefined ? prev : operator.type);
            lhs = {
                type: NodeType.BinaryExpression,
                left: lhs,
                operator: operator.value,
                right: rhs,
                range: [lhs.range[0], lhs.range[1], rhs.range[2]],
            } as BinaryExpression;
        };

        return lhs;
    };

    parseLogicalBitwiseExpr = (prev ? : TokenType): Expression =>
    {
        let lhs = this.parseEqualityExpr(prev);

        while (['&', '^', '|', '&&', '||'].includes(this.at().value))
        {
            let operator = this.eat();
            let rhs = this.parseEqualityExpr(prev != undefined ? prev : operator.type);
            lhs = {
                type: NodeType.BinaryExpression,
                left: lhs,
                operator: operator.value,
                right: rhs,
                range: [lhs.range[0], lhs.range[1], rhs.range[2]],
            } as BinaryExpression;

        };

        return lhs;
    };

    parseExpression = (): Expression =>
    {
        let Expr = {} as Expression;
        let token = this.at();

        switch (token.type)
        {
            default:
            {
                Expr = this.parseLogicalBitwiseExpr();
                break;
            };
        };

        if (this.at().type == TokenType.semicolon)
        {
            this.eat();
            return Expr;
        }

        else
        {
            new SyntaxErr(`Expected an ';' (${TokenType.semicolon}) before getting a '${this.at().value}' (${this.at().type}) token`, makePosition(this.filename, this.at().loc.line, this.at().loc.start, this.at().loc.end), this.source);
        };
        return Expr; // Lie to compiler since it's asking for me to return Expression but i do, otherwise exit
    };

    parseStatement = (): Statement =>
    {
        let Stmt = {} as Statement;
        let token = this.at();
        switch (token.type)
        {
            case TokenType.semicolon:
            case TokenType.eol:
            {
                if (token.value != ';')
                {
                    Stmt = {
                        type: NodeType.EmptyStatement,
                        range: [token.loc.line, token.loc.start, this.at().loc.end],
                    } as EmptyStatement;
                    this.eat();
                    break;
                }
                else
                {
                    Stmt = {
                        type: NodeType.EmptyStatement,
                        range: [token.loc.line, token.loc.start, this.at().loc.end],
                    } as EmptyStatement;
                    this.eat();
                    break;
                };
            };

            default:
            {
                Stmt = {
                    type: NodeType.ExpressionStatement,
                    body: [this.parseExpression()],
                    range: [0, 0]
                } as ExpressionStatement;

                Stmt.range = [token.loc.line, token.loc.start, Stmt.body[Stmt.body.length - 1].range[2]];
                break;
            };
        };

        return Stmt;
    };

    parseProgram = (): Program =>
    {
        let program: Program = {
            type: NodeType.Program,
            body: [],
            range: [0, 0],
        } as Program;

        while (!this.eof())
        {
            const statement = this.parseStatement();
            
            if (statement.type == NodeType.EmptyStatement)
            {
                continue;
            };

            program.body.push(statement);
        };
        
        if (program.body.length == 0)
        {
            program.range = [0, 0, this.at().loc.end];
        }

        else
        {
            program.range = [program.body[0].range[0], 0, this.source.length];
        };

        const Folding = new ConstantFolding(this.flags, this.source, this.filename);

        program = Folding.fold(program);

        return program;
    };
};


// TESTING PURPOSES

// const test = new Parser('1/3**2', 'tst');
// console.log(test.ast);