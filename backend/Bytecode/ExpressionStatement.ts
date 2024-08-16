// deno-lint-ignore-file
import { ByteEncoder } from "./ByteEncoder.ts";
import
{
    makePosition,
    SyntaxErr,

    NodeType,

    LiteralValue,

    Expression,
    Literal,
    BinaryOps,
    InstructionType,
    BinaryExpression,
    UnaryExpression,
    ExpressionType,
} from "../shared.ts";

export class ExpressionStatementGenerator
{
    parent: ByteEncoder;

    constructor (parent: ByteEncoder)
    {
        this.parent = parent;
    };
    
    generateExpression = (ast: Expression): number[] =>
    {
        const ExpressionBytecode: number[] = [];

        const traverse = (ast: any) =>
        {
            switch (ast.type)
            {
                case NodeType.Literal:
                {
                    ExpressionBytecode.push(ExpressionType.Literal);
                    ExpressionBytecode.push(...this.parent.LiteralGen.generateLiteral(ast));
                    break;
                };
    
                case NodeType.BinaryExpression:
                {
                    ast = ast as BinaryExpression;
                    ExpressionBytecode.push(ExpressionType.BinaryExpression);
                    ExpressionBytecode.push(...this.generateBinaryExpression(ast.left, ast.operator, ast.right));
                    traverse(ast.left);
                    traverse(ast.right);
                    break;
                };

                case NodeType.UnaryExpression:
                {
                    ast = ast as UnaryExpression
                    ExpressionBytecode.push(ExpressionType.UnaryExpression);
                    ExpressionBytecode.push(...this.generateUnaryExpression(ast.argument, ast.operator));
                };
                
                case NodeType.UnaryUpdateExpression:
                {
                    ast = ast as UnaryExpression
                    ExpressionBytecode.push(ExpressionType.UnaryUpdateExpression);
                    ExpressionBytecode.push(...this.generateUnaryUpdateExpression(ast.argument, ast.operator, ast.prefix));
                };
            };
        };

        traverse(ast);

        return ExpressionBytecode;
    };
    generateUnaryUpdateExpression = (argument: Literal, operator: string, prefix: boolean) =>
    {
        const UnaryUpdateBytecode: number[] = [];

        if (prefix)
        {
            switch (operator)
            {
                case '++':
                {
                    UnaryUpdateBytecode.push(BinaryOps.add);
                    UnaryUpdateBytecode.push(InstructionType.const1);
                    UnaryUpdateBytecode.push(...this.generateExpression(argument));
                    break;
                };

                case '--':
                {
                    UnaryUpdateBytecode.push(BinaryOps.sub);
                    UnaryUpdateBytecode.push(...this.generateExpression(argument));
                    UnaryUpdateBytecode.push(InstructionType.const1);
                    break;
                };
            };
        }
        
        else
        {
            switch (operator)
            {
                case '++':
                {
                    UnaryUpdateBytecode.push(BinaryOps.add);
                    UnaryUpdateBytecode.push(...this.generateExpression(argument));
                    UnaryUpdateBytecode.push(InstructionType.const1);
                    break;
                }
                case '--':
                {
                    UnaryUpdateBytecode.push(BinaryOps.sub);
                    UnaryUpdateBytecode.push(...this.generateExpression(argument));
                    UnaryUpdateBytecode.push(InstructionType.const1);
                    break;
                };
            };
        };
        return UnaryUpdateBytecode;
    };

    generateUnaryExpression = (argument: Literal, operator: string): number[] => 
    {
        const UnaryBytecode: number[] = [];
        
        switch (operator)
        {
            case '!':
            {
                UnaryBytecode.push(BinaryOps.not);
                UnaryBytecode.push(...this.generateExpression(argument));
                break;
            }
            case '+':
            {
                UnaryBytecode.push(...this.generateExpression(argument));
                break;
            };
            case '-':
            {
                UnaryBytecode.push(BinaryOps.sub);
                UnaryBytecode.push(InstructionType.const0);
                UnaryBytecode.push(...this.generateExpression(argument));
                break;
            }
        }

        return UnaryBytecode;
    };

    generateBinaryExpression = (left: Literal, operator: string, right: Literal) =>
    {
        const ExpressionBytecode: number[] = [];

        switch (operator)
        {
            case '+':
            {
                if (left.runtimeValue == LiteralValue.StringLiteral || right.runtimeValue == LiteralValue.StringLiteral)
                {
                    ExpressionBytecode.push(BinaryOps.sadd);
                    break;
                };

                if (left.runtimeValue == LiteralValue.NullLiteral || right.runtimeValue == LiteralValue.NullLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for the Null type`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                };

                break;
            };

            case '-':
            {
                if (left.runtimeValue == LiteralValue.NullLiteral || right.runtimeValue == LiteralValue.NullLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for Strings`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                };

                if (left.runtimeValue == LiteralValue.StringLiteral || right.runtimeValue == LiteralValue.StringLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for nulls`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                    break;
                };

                ExpressionBytecode.push(BinaryOps.sub);
                break;
            };

            case '*':
            {

                if (left.runtimeValue == LiteralValue.StringLiteral || right.runtimeValue == LiteralValue.StringLiteral)
                {
                    ExpressionBytecode.push(BinaryOps.smul);
                    break;
                };

                if (left.runtimeValue == LiteralValue.NullLiteral || right.runtimeValue == LiteralValue.NullLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for the Null type`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                };

                ExpressionBytecode.push(BinaryOps.mul);
                break;
            };

            case '/':
            {
                if (left.runtimeValue == LiteralValue.NullLiteral || right.runtimeValue == LiteralValue.NullLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for Strings`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                };

                if (left.runtimeValue == LiteralValue.StringLiteral || right.runtimeValue == LiteralValue.StringLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for nulls`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                    break;
                };

                ExpressionBytecode.push(BinaryOps.div);
                break;
            };

            case '**':
            {
                if (left.runtimeValue == LiteralValue.NullLiteral || right.runtimeValue == LiteralValue.NullLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for Strings`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                };

                if (left.runtimeValue == LiteralValue.StringLiteral || right.runtimeValue == LiteralValue.StringLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for nulls`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                    break;
                };

                ExpressionBytecode.push(BinaryOps.pow);
                break;
            };

            case '%':
            {
                if (left.runtimeValue == LiteralValue.NullLiteral || right.runtimeValue == LiteralValue.NullLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for Strings`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                };

                if (left.runtimeValue == LiteralValue.StringLiteral || right.runtimeValue == LiteralValue.StringLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for nulls`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                    break;
                };
    
                ExpressionBytecode.push(BinaryOps.mod);
                break;
            };

            case '!':
            {
                ExpressionBytecode.push(BinaryOps.not);
                break;
            };

            case '==':
            {
                ExpressionBytecode.push(BinaryOps.eqls);
                break;
            };
            case '!=':
            {
                ExpressionBytecode.push(BinaryOps.neqls);
                break;
            };

            case '>':
            {
                ExpressionBytecode.push(BinaryOps.gt);
                break;
            };
            case '<':
            {
                ExpressionBytecode.push(BinaryOps.lt);
                break;
            };

            case '>=':
            {
                ExpressionBytecode.push(BinaryOps.gteqls);
                break;
            };
            case '<=':
            {
                ExpressionBytecode.push(BinaryOps.lteqls);
                break;
            };

            case '<<':
            {
                if (left.runtimeValue == LiteralValue.NullLiteral || right.runtimeValue == LiteralValue.NullLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for Strings`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                };

                if (left.runtimeValue == LiteralValue.StringLiteral || right.runtimeValue == LiteralValue.StringLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for nulls`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                    break;
                };
    
                    
                ExpressionBytecode.push(BinaryOps.shl);
                break;
            };
            case '>>':
            {
                if (left.runtimeValue == LiteralValue.NullLiteral || right.runtimeValue == LiteralValue.NullLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for Strings`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                };

                if (left.runtimeValue == LiteralValue.StringLiteral || right.runtimeValue == LiteralValue.StringLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for nulls`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                    break;
                };
                    
                ExpressionBytecode.push(BinaryOps.shr);
                break
            };
        };

        return ExpressionBytecode;
    };
}