// deno-lint-ignore-file no-explicit-any ban-types
import { LiteralValue } from './shared.ts';
import {
    NodeType,
    Statement,
    Literal,
    Warning,
    makePosition,
} from './shared.ts';

export class ConstantFolding {
    source: string;
    filename: string;
    constructor(source: string, filename?: string) {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
    };

    evaluateSimpleIntExpressions(ast: any, parseFunc: Function = parseInt)
    {
        switch (ast.operator)
        {
            /*

            To unconfuse you

            case <operator>:
            {
                const result = (parseFunc)left <operator> (parseFunc)right;
                return {
                    type: Number.Literal,
                    runtimeValue: LiteralValue.NumberLiteral <IF rounded number is the same as the result OTHERWISE> LiteralValue.FloatLiteral,
                    value: result,
                } as Literal;
            };

            */
           
            case '+':
            {
                const result = parseFunc(ast.left.value) + parseFunc(ast.right.value);
                return {
                    type: NodeType.Literal,
                    runtimeValue: Number(result) == result && result % 1 == 0 ? LiteralValue.NumberLiteral : LiteralValue.FloatLiteral,
                    value: result,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal
            };
            case '-':
            {
                const result = parseFunc(ast.left.value) - parseFunc(ast.right.value);
                return {
                    type: NodeType.Literal,
                    runtimeValue: Number(result) == result && result % 1 == 0 ? LiteralValue.NumberLiteral : LiteralValue.FloatLiteral,
                    value: result,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal
            };
            case '*':
            {
                const result = parseFunc(ast.left.value) * parseFunc(ast.right.value);
                return {
                    type: NodeType.Literal,
                    runtimeValue: Number(result) == result && result % 1 == 0 ? LiteralValue.NumberLiteral : LiteralValue.FloatLiteral,
                    value: result,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal
            };
            case '/':
            {
                const result = parseFunc(ast.left.value) / parseFunc(ast.right.value);
                return {
                    type: NodeType.Literal,
                    runtimeValue: Number(result) == result && result % 1 == 0 ? LiteralValue.NumberLiteral : LiteralValue.FloatLiteral,
                    value: result,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal
            };
        };
        return ast;
    };

    foldExpressionStatement(ast: any)
    {
        if (ast.type == NodeType.Literal)
        {
            return ast;
        }

        else if (ast.type == NodeType.BinaryExpression)
        {
            
            ast.left = this.foldExpressionStatement(ast.left);
            ast.right = this.foldExpressionStatement(ast.right);

            if (ast.left.runtimeValue == LiteralValue.NumberLiteral && ast.right.runtimeValue == LiteralValue.NumberLiteral)
            {
                return this.evaluateSimpleIntExpressions(ast, parseInt);
            }
            else if (ast.left.runtimeValue == LiteralValue.FloatLiteral || ast.right.runtimeValue == LiteralValue.FloatLiteral)
            {
                return this.evaluateSimpleIntExpressions(ast, parseFloat);
            };
        };

        return ast;

    };

    fold = (ast: any) =>
    {
        if (ast.type == NodeType.ExpressionStatement)
        {
            ast.body[0] = this.foldExpressionStatement(ast.body[0]);
            return ast;
        }

        else if (ast.type == NodeType.EmptyStatement)
        {
            new Warning('Empty Statement', makePosition(this.filename, ast.range[0], ast.range[1], ast.range[2]), this.source);
            return 'Next';
        }
        
        else if (ast.type == NodeType.Program)
        {
            const newBody: Statement[] = [];

            ast.body.forEach((Stmt: Statement) => {
                    const folded = this.fold(Stmt);

                    if (folded != 'Next') {
                        newBody.push(folded);
                    };
                }
            );

            ast.body = newBody;
            
            return ast;
        }

        else
        {
            return ast;
        };
    };
}; 
