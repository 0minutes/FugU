const generateInteger = (value: number, bitWidth?: number): number[] =>
{
    bitWidth == undefined ? bitWidth = Math.ceil(Math.log2(value)) : bitWidth;
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

console.log(generateInteger(2**16-1))