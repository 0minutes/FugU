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
    UnaryExpression,

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
                case NodeType.UnaryExpression:
                {
                    ast = ast as UnaryExpression
                    ExpressionBytecode.push(...this.generateUnaryExpression(ast.argument, ast.operator));
                };
                case NodeType.UnaryUpdateExpression:
                {
                    ast = ast as UnaryExpression
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
                    UnaryUpdateBytecode.push(InstructionType.const1);
                    UnaryUpdateBytecode.push(...this.generateExpression(argument));
                    UnaryUpdateBytecode.push(InstructionType.add);
                    break;
                };

                case '--':
                {
                    UnaryUpdateBytecode.push(InstructionType.const1);
                    UnaryUpdateBytecode.push(...this.generateExpression(argument));
                    UnaryUpdateBytecode.push(InstructionType.sub);
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
                    UnaryUpdateBytecode.push(...this.generateExpression(argument));
                    UnaryUpdateBytecode.push(InstructionType.const1);
                    UnaryUpdateBytecode.push(InstructionType.add);
                    break;
                }
                case '--':
                {
                    UnaryUpdateBytecode.push(...this.generateExpression(argument));
                    UnaryUpdateBytecode.push(InstructionType.const1);
                    UnaryUpdateBytecode.push(InstructionType.sub);
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
                UnaryBytecode.push(...this.generateExpression(argument));
                UnaryBytecode.push(InstructionType.not);
                break;
            }
            case '+':
            {
                UnaryBytecode.push(...this.generateExpression(argument));
                break;
            };
            case '-':
            {
                UnaryBytecode.push(InstructionType.const0);
                UnaryBytecode.push(...this.generateExpression(argument));
                UnaryBytecode.push(InstructionType.sub);
                break;
            }
        }

        return UnaryBytecode;
    };
//
// case NodeType.UnaryUpdateExpression:
//     {
//         
//     };

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