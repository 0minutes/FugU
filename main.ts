import 
{
    Parser
} from './src/Parser/Parser.ts';

const main = (): number =>
{
    while (true)
    {
        const input = prompt('>> ', '') as string;
        const parser = new Parser('<stdin>', input);

        console.log(parser.ast);
    };
};

main();