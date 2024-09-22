import 
{
    Parser
} from './src/Parser/Parser.ts';
import
{
    TypeChecker,
} from './src/TypeChecker/TypeChecker.ts';
import
{
    Environment
} from './src/TypeChecker/Environment.ts';

const main = (): number =>
{
    const env = new Environment(null);

    while (true)
    {
        const input = prompt('>> ', '') as string;
        const parser = new Parser('<stdin>', input);
        const TChecker = new TypeChecker(env, parser);
        
        console.log(parser.ast);
    };
};

main();
