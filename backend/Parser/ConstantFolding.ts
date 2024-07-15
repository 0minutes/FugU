// deno-lint-ignore-file
import { LiteralValue } from '../shared.ts';
import {
    NodeType,
    Statement,
    Literal,
    Warning,
    makePosition,
} from '../shared.ts';

export class ConstantFolding {
    source: string;
    filename: string;
    constructor(source: string, filename?: string)
    {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
    };

    evaluateSimpleIntExpressions(ast: any, integer: boolean = true)
    {
        switch (ast.operator)
        {
            case '+':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: integer ? LiteralValue.NumberLiteral : LiteralValue.FloatLiteral,
                    value: ast.left.value + ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };
            case '-':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: integer ? LiteralValue.NumberLiteral : LiteralValue.FloatLiteral,
                    value: ast.left.value - ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };
            
            case '**':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: integer ? LiteralValue.NumberLiteral : LiteralValue.FloatLiteral,
                    value: ast.left.value ** ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };  

            case '*':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: integer ? LiteralValue.NumberLiteral : LiteralValue.FloatLiteral,
                    value: ast.left.value * ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };
            case '/':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.FloatLiteral,
                    value: ast.left.value / ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };

            case '%':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.FloatLiteral,
                    value: ast.left.value % ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };

            case '==':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: ast.left.value == ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };

            case '<>':
            case '!=':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: ast.left.value != ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };

            case '<':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: ast.left.value < ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };
            
            case '>':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: ast.left.value > ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };
            case '<=':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: ast.left.value <= ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };

            case '>=':
            {
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: ast.left.value >= ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
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
                return this.evaluateSimpleIntExpressions(ast);
            };
            
            if (ast.left.runtimeValue == LiteralValue.FloatLiteral || ast.right.runtimeValue == LiteralValue.FloatLiteral)
            {
                return this.evaluateSimpleIntExpressions(ast, false);
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

            ast.body.forEach((Stmt: Statement) =>
            {
                const folded = this.fold(Stmt);

                if (folded != 'Next')
                {
                    newBody.push(folded);
                };
            });

            ast.body = newBody;
            
            return ast;
        }

        else
        {
            return ast;
        };
    };
}; 
