// deno-lint-ignore-file
import { ByteEncoder } from "./ByteEncoder.ts";

// Signed Char: -128 to 127
// Unsigned Char: 0 to 255
// Short Int: -32768 to 32767
// Unsigned Short Int: 0 to 65535
// Int: -2147483648 to 2147483647
// Unsigned Int: 0 to 4294967295
// Long Int: -2147483648 to 2147483647
// Unsigned Long Int: 0 to 4294967295
// Long Long Int: -9223372036854775808 to 9223372036854775807
// Unsigned Long Long Int: 0 to 18446744073709551615

import 
{
    _I8_MIN,
    _I8_MAX,
    _UI8_MAX,

    _I16_MIN,
    _I16_MAX, 
    _UI16_MAX,

    _I32_MIN,
    _I32_MAX,
    _UI32_MAX,

    _I64_MIN,
    _I64_MAX,
    _UI64_MAX,
} from '../shared.ts';

import
{
    makePosition,
    Warning,

    Literal,
    LiteralValue,

    ConstPoolType,
    InstructionType,
} from "../shared.ts";

export class LiteralGenerator
{
    parent: ByteEncoder;

    constructor (parent: ByteEncoder)
    {
        this.parent = parent;
    }

    generateLiteral = (ast: Literal): number[] =>
    {
        const LiteralBytecode: number[] = [];
        
        switch (ast.runtimeValue)
        {
            case (LiteralValue.NumberLiteral):
            {
                LiteralBytecode.push(...this.generateNumberLiterals(ast as Literal));
                break;
            };
            case LiteralValue.NullLiteral:
            {
                LiteralBytecode.push(InstructionType.cosntnull);
                break;
            };
            case LiteralValue.StringLiteral:
            {
                this.parent.ConstPoolCounter++;
                this.parent.ConstPool.set(this.parent.ConstPoolCounter, [ConstPoolType.StringInfo, ast.value as string]);
                LiteralBytecode.push(InstructionType.ldc, ...this.generateInteger(this.parent.ConstPoolCounter));
                break;
            };
            case LiteralValue.FloatLiteral:
            {
                this.parent.ConstPoolCounter++;
                this.parent.ConstPool.set(this.parent.ConstPoolCounter, [ConstPoolType.DoubleInfo, ...this.generateIEEE754(ast.value as number)]);
                LiteralBytecode.push(InstructionType.ldc, ...this.generateInteger(this.parent.ConstPoolCounter));
                break;
            };
        };

        return LiteralBytecode;
    };

    generateNumberLiterals = (ast: Literal): number[] =>
    {
        const NumberBytecode: number[] = [];

        if (ast.value as number >= 0)
        {
            switch (ast.value)
            {
                case 0n:
                case 0: NumberBytecode.push(InstructionType.const0); break;
                case 1n:
                case 1: NumberBytecode.push(InstructionType.const1); break;
                case 2n:
                case 2: NumberBytecode.push(InstructionType.const2); break;
                case 3n:
                case 3: NumberBytecode.push(InstructionType.const3); break;
                case 4n:
                case 4: NumberBytecode.push(InstructionType.const4); break;
                case 5n:
                case 5: NumberBytecode.push(InstructionType.const5); break;
                case 6n:
                case 6: NumberBytecode.push(InstructionType.const6); break;
            
                default:
                {
                    if (ast.value as number <= _UI8_MAX)
                    {
                        NumberBytecode.push(InstructionType.u8);
                        ast.value = Number(ast.value)
                        NumberBytecode.push(...this.generateInteger(ast.value, 8));
                    }
                    else if (ast.value as number <= _UI16_MAX)
                    {
                        NumberBytecode.push(InstructionType.u16);
                        ast.value = Number(ast.value)
                        NumberBytecode.push(...this.generateInteger(ast.value, 16));
                    }
                    else if (ast.value as number <= _UI32_MAX)
                    {
                        NumberBytecode.push(InstructionType.u32);
                        ast.value = Number(ast.value)
                        NumberBytecode.push(...this.generateInteger(ast.value, 32));
                    }
                    else if (ast.value as number <= _UI64_MAX)
                    {
                        this.parent.ConstPoolCounter++
                        this.parent.ConstPool.set(this.parent.ConstPoolCounter, [ConstPoolType.BigIntInfo, ...this.generateBigInteger(ast.value as bigint, 64)])
                        NumberBytecode.push(InstructionType.ldc, ...this.generateInteger(this.parent.ConstPoolCounter));
                    }
                    else
                    {
                        new Warning(
                            this.parent.flags,
                            `Overflow of the U64 integer '${ast.value as number}' changes its value to '${ast.value as bigint % _UI64_MAX}'`,
                            makePosition(this.parent.filename, ast.range[0], ast.range[1], ast.range[2]),
                            this.parent.source, 'UIntOverflow');
                        ast.value = ast.value as bigint % _UI64_MAX;
                        NumberBytecode.push(...this.generateNumberLiterals(ast));
                    };
                };
            };    
        }

        else if (Number(ast.value) < 0)
        {
            switch (ast.value)
            {
                case -1n:
                case -1: NumberBytecode.push(InstructionType.constm1); break;
                case -2n:
                case -2: NumberBytecode.push(InstructionType.constm2); break;
                case -3n:
                case -3: NumberBytecode.push(InstructionType.constm3); break;
                case -4n:
                case -4: NumberBytecode.push(InstructionType.constm4); break;
                case -5n:
                case -5: NumberBytecode.push(InstructionType.constm5); break;
                case -6n:
                case -6: NumberBytecode.push(InstructionType.constm6); break;

                default:
                {
                    if (ast.value as number >= _I8_MIN)
                    {
                        NumberBytecode.push(InstructionType.s8);
                        ast.value = Number(ast.value)
                        NumberBytecode.push(...this.generateInteger(ast.value, 8));
                    }
                    else if (ast.value as number >= _I16_MIN)
                    {
                        NumberBytecode.push(InstructionType.s16);
                        ast.value = Number(ast.value)
                        NumberBytecode.push(...this.generateInteger(ast.value, 16));
                    }
                    else if (ast.value as number >= _I32_MIN)
                    {
                        NumberBytecode.push(InstructionType.s32);
                        ast.value = Number(ast.value)
                        NumberBytecode.push(...this.generateInteger(ast.value, 32));
                    }
                    else if (ast.value as number >= _I64_MIN)
                    {
                        NumberBytecode.push(InstructionType.s64);
                        NumberBytecode.push(...this.generateBigInteger(ast.value as bigint, 64));
                    }
                    else
                    {
                        new Warning(
                            this.parent.flags,
                            `Overflow of the I64 integer '${ast.value}' changes its value to '${ast.value as bigint % _I64_MIN}'`,
                            makePosition(this.parent.filename,ast.range[0], ast.range[1], ast.range[2]),
                            this.parent.source, 'IntOverflow');
                        ast.value = ast.value as bigint % _I64_MIN;

                        NumberBytecode.push(...this.generateNumberLiterals(ast));
                    };
                };
            };    
        };

        return NumberBytecode;
    };


    generateIEEE754(value: number) {
        const IEEE754 = [];

        const sign = value < 0 ? 1 : 0;
        if (sign) value = -value;
    
        if (value === 0)
        {
            IEEE754.push(8, 0, 0, 0, 0, 0, 0, 0, 0);
            return IEEE754;
        }
    
        if (value === Infinity)
        {
            IEEE754.push(8, (sign << 7) | 0x7F, 0xF0, 0, 0, 0, 0, 0, 0);
            return IEEE754;
        }
    
        if (isNaN(value))
        {
            IEEE754.push(8, (sign << 7) | 0x7F, 0xF8, 0, 0, 0, 0, 0, 0);
            return IEEE754;
        }
    
        let exponent = 0;
        let mantissa = value;
    
        while (mantissa >= 2)
        {
            mantissa /= 2;
            exponent++;
        }
    
        while (mantissa < 1)
        {
            mantissa *= 2;
            exponent--;
        }
    
        exponent += 1023;
        mantissa -= 1;
    
        let mantissaBitsLow = 0;
        let mantissaBitsHigh = 0;
        for (let i = 0; i < 52; i++)
        {
            mantissa *= 2;
            if (mantissa >= 1)
            {
                if (i < 32)
                {
                    mantissaBitsLow |= 1 << (i);
                } 
                else
                {
                    mantissaBitsHigh |= 1 << (i - 32);
                }
                mantissa -= 1;
            }
        }
    
        const exponentBits = (exponent << 20) | (mantissaBitsHigh & 0xFFFFF);
        const signBits = sign << 31;
    
        IEEE754.push(
            exponentBits & 0xFF, (exponentBits >> 8) & 0xFF,
            (exponentBits >> 16) & 0xFF, (signBits | (exponentBits >> 24)) & 0xFF,
            mantissaBitsLow & 0xFF, (mantissaBitsLow >> 8) & 0xFF,
            (mantissaBitsLow >> 16) & 0xFF, (mantissaBitsLow >> 24) & 0xFF
        );
    
        IEEE754.reverse();
        IEEE754.unshift(8);
    
        return IEEE754;
    }
    

    generateInteger = (value: number, bitWidth?: number): number[] =>
    {
        if (value == 0)
        {
            bitWidth = 8;
        }
        else
        {
            bitWidth = bitWidth == undefined ? Math.ceil(Math.log2(value + 1)) : bitWidth;
        };
    
        const Chunks = Math.ceil(bitWidth / 8);
        const IntegerBytecode: number[] = [];
    
        for (let i = 0; i < Chunks; i++)
        {
            const chunkValue = (value >> (i * 8)) & 0xff;
            IntegerBytecode.push(chunkValue);
        };
        
        IntegerBytecode.unshift(Chunks);
    
        return IntegerBytecode;
    };

    generateBigInteger = (value: bigint, bitWidth?: number): number[] =>
    {
        bitWidth == undefined ? bitWidth = Math.ceil(Math.log2(Number(value))) : bitWidth;
        const Chunks = (Math.ceil(bitWidth / 8));
        const IntegerBytecode: number[] = [];
    
        for (let i = 0n; i < Chunks; i++)
        {
            const chunkValue = Number((value >> (i * 8n)) & 0xffn);
            IntegerBytecode.push(chunkValue);
        };
        
        IntegerBytecode.unshift(Chunks);
    
        return IntegerBytecode;
    };

    generateString = (value: string): number[] =>
    {
        const stringBytecode: number[] = [];
        
        for (let i = 0; i < value.length; i++)
        {
            stringBytecode.push()
        };

        return stringBytecode;
    };
};
