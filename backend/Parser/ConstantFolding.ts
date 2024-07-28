// deno-lint-ignore-file
import { Expression } from '../shared.ts';
import
{
    TokenType,
    NodeType,
    Statement,
    Literal,
    LiteralValue,
    error,
    LogicalErr,
    makePosition,
    Flags,
    TypeConversionWarning,
} from '../shared.ts';

export class ConstantFolding
{
    source: string;
    filename: string;
    flags: Flags;

    constructor(flags: Flags, source: string, filename?: string)
    {
        this.filename = filename == undefined ? 'shell' : filename;
        this.source = source;
        this.flags = flags;
    };

    evaluateSimpleIntExpressions(ast: any, integer: boolean = true)
    {
        ast.left.value = BigInt(ast.left.value);
        ast.right.value = BigInt(ast.right.value);

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
                if (ast.right.value == 0)
                {
                    new LogicalErr(`Unable to '/' (<Division>) by 0`, makePosition(this.filename, ast.right.range[0], ast.right.range[1], ast.right.range[2]), this.source);
                };
                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.FloatLiteral,
                    value: ast.left.value / ast.right.value,
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal;
            };

            case '%':
            {
                if (ast.right.value == 0)
                {
                    new LogicalErr(`Unable to '%' (<Modulo>) by 0`, makePosition(this.filename, ast.right.range[0], ast.right.range[1], ast.right.range[2]), this.source);
                };

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

    evaluateUnaryExpr = (ast: any) =>
    {
        if (ast.argument.value != null) ast.argument.value = BigInt(ast.argument.value);

        switch (ast.operator)
        {
            case '!':
            {
                ast.argument = this.foldExpressionStatement(ast.argument);

                if (ast.argument.runtimeValue == LiteralValue.StringLiteral || ast.argument.runtimeValue == LiteralValue.NullLiteral)
                {
                    new TypeConversionWarning(this.flags, `${TokenType.not} operator on the type ${ast.argument.runtimeValue} converts it into a ${LiteralValue.NumberLiteral}`, makePosition(this.filename, ast.range[0], ast.range[1], ast.range[2]), this.source);
                };

                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: !(ast.argument.value),
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal; 
            };

            case '+':
            {
                ast.argument = this.foldExpressionStatement(ast.argument);

                if (ast.argument.runtimeValue == LiteralValue.StringLiteral || ast.argument.runtimeValue == LiteralValue.NullLiteral)
                {
                    new LogicalErr(`Unable to '+' (<unaryPlus>) operator on the type ${ast.argument.runtimeValue}`, makePosition(this.filename, ast.range[0], ast.range[1], ast.range[2]), this.source);
                };

                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: 0n+(ast.argument.value),
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal; 
            };
            case '-':
            {
                ast.argument = this.foldExpressionStatement(ast.argument);

                if (ast.argument.runtimeValue == LiteralValue.StringLiteral || ast.argument.runtimeValue == LiteralValue.NullLiteral)
                {
                    new error(`Unable to '-' (<unaryMinus>) operator on the type ${ast.argument.runtimeValue}`, makePosition(this.filename, ast.range[0], ast.range[1], ast.range[2]), this.source);
                };

                return {
                    type: NodeType.Literal,
                    runtimeValue: LiteralValue.NumberLiteral,
                    value: 0n-(ast.argument.value),
                    range: [ast.range[0], ast.range[1], ast.range[2]],
                } as Literal; 
            };
        };
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
        }
        else if (ast.type == NodeType.UnaryExpression)
        {
            return this.evaluateUnaryExpr(ast);
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
        
        else if (ast.type == NodeType.Program)
        {
            const newBody: Statement[] = [];

            ast.body.forEach((Stmt: Statement) =>
            {
                const folded = this.fold(Stmt);
                newBody.push(folded);
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
