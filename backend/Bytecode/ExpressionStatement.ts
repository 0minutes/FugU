// deno-lint-ignore-file
import { ByteEncoder } from "./ByteEncoder.ts";
import { LiteralGenerator } from "./Literals.ts";
import
{
    makePosition,
    SyntaxErr,

    NodeType,

    LiteralValue,


    Expression,
    Literal,
    InstructionType,
    BinaryExpression,
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
                    const LiteralGen = new LiteralGenerator(this.parent);
                    ExpressionBytecode.push(...LiteralGen.generateLiteral(ast));
                    break;
                };
    
                case NodeType.BinaryExpression:
                {
                    ast = ast as BinaryExpression;
                    traverse(ast.left);
                    traverse(ast.right);
                    
                    ExpressionBytecode.push(...this.generateBinaryExpression(ast.left, ast.operator, ast.right))
                    break;
                };
            };
        };

        traverse(ast);

        return ExpressionBytecode;
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
                    ExpressionBytecode.push(InstructionType.sadd);
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

                ExpressionBytecode.push(InstructionType.sub);
                break;
            };

            case '*':
            {

                if (left.runtimeValue == LiteralValue.StringLiteral || right.runtimeValue == LiteralValue.StringLiteral)
                {
                    ExpressionBytecode.push(InstructionType.smul);
                    break;
                };

                if (left.runtimeValue == LiteralValue.NullLiteral || right.runtimeValue == LiteralValue.NullLiteral)
                {
                    new SyntaxErr(`Unsupported '${operator}' operand for the Null type`, makePosition(this.parent.filename, left.range[0], left.range[1], right.range[2]), this.parent.source);
                };

                ExpressionBytecode.push(InstructionType.mul);
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

                ExpressionBytecode.push(InstructionType.div);
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

                ExpressionBytecode.push(InstructionType.pow);
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
    
                ExpressionBytecode.push(InstructionType.mod);
                break;
            };

            case '!':
            {
                ExpressionBytecode.push(InstructionType.not);
                break;
            };

            case '==':
            {
                ExpressionBytecode.push(InstructionType.eqls);
                break;
            };
            case '!=':
            {
                ExpressionBytecode.push(InstructionType.neqls);
                break;
            };

            case '>':
            {
                ExpressionBytecode.push(InstructionType.gt);
                break;
            };
            case '<':
            {
                ExpressionBytecode.push(InstructionType.lt);
                break;
            };

            case '>=':
            {
                ExpressionBytecode.push(InstructionType.gteqls);
                break;
            };
            case '<=':
            {
                ExpressionBytecode.push(InstructionType.lteqls);
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
    
                    
                ExpressionBytecode.push(InstructionType.shl);
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
                    
                ExpressionBytecode.push(InstructionType.shr);
                break
            };
        };

        return ExpressionBytecode;
    };
}