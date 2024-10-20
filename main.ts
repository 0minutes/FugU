import
{
    BytecodeGenerator
} from './src/BytecodeGenerator/BytecodeGenerator.ts';

import
{
    Parser
} from './src/Parser/Parser.ts';

import
{
    Environment,
} from './src/TypeChecking/Environment.ts';


const main = (): number =>
{
    const Env: Environment = new Environment(undefined);

    while (true)
    {
        const input = prompt('>> ', '') as string;
        const parser = new Parser('<stdin>', input);
        const generator = new BytecodeGenerator(parser, Env);

        console.log(parser.ast);
        console.log(generator.Stringbytecode);
    };
};

main();
