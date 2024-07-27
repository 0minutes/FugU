// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars

import
{
    Lexer
} from './backend/Parser/Lexer.ts';
import
{
    Parser
} from './backend/Parser/Parser.ts';

import
{
    Flags
} from './backend/shared.ts';


const VERSION = '1.5.0';

const shell = (flags: Flags) =>
{
    console.log(`FugU language v${VERSION} type '.exit' to exit!`);

    while (true)
    {

        const userinput = String(prompt('>'));

        if (userinput == '.exit')
        {
            Deno.exit(0);
        };

        if (userinput == '.flags')
        {
            console.log(flags);
            continue;
        };

        let parser: Parser = new Parser(flags, userinput, 'shell');

        let ast = parser.ast;

        console.log('--------------AST--------------');
        console.log(ast)
        console.log('--------------END--------------');
    };
};

const fromFile = (file: string, flags: Flags) =>
{
    let contents;
    try
    {
        contents = Deno.readTextFileSync(file);
    }
    catch (e)
    {
        console.log(`Unknown file path: ${file}`);
        Deno.exit(1);
    };

    let lexer: Lexer = new Lexer(flags, contents, file);
    let parser: Parser = new Parser(flags, contents, file);

    let tokens: any = lexer.tokens;
    let ast = parser.ast;

    console.log(tokens);
    console.log('----------------------------------------------');

    console.log(ast);
    console.log('----------------------------------------------');

    Deno.exit(0);
};

const printHelp = () =>
{
    console.log('Usage: deno run main.ts [-h | --help] | [-r | --run] (path/to/file)');
    console.log('\t--help/-h - prints this message');
    console.log('\t--run/-r  - requires a path to a file. Will run the code provided from a file');
    console.log('Other flags:');
    console.log('\t--no-warnings/-nws - disable warnings');
    console.log('\t--strict-warnings/-sws - crash on warning');
};

const main = () =>
{
    const args = Deno.args;

    const flags: Flags = 
    {
        warnings: true,
        strictWarnings: false,
    };

    if (args.length === 0)
    {
        shell(flags);
    };

    if (args.includes('-nws'))
    {
        flags.warnings = false;
        args.splice(args.indexOf('-nws'), 1);
    };

    if (args.includes('--no-warnings'))
    {
        flags.warnings = false;
        args.splice(args.indexOf('--no-warnings'), 1);
    };

    if (args.includes('-sws'))
    {
        flags.strictWarnings = true;
        args.splice(args.indexOf('-sws'), 1);
    };

    if (args.includes('--strict-warnings'))
    {
        flags.strictWarnings = true;
        args.splice(args.indexOf('--strict-warnings'), 1);
    };

    if (flags.strictWarnings)
    {
        flags.warnings = true;
    };

    for (let i = 0; i < args.length; i++)
    {
        const arg = args[i];

        switch (arg)
        {
            case '-h':
            case '--help':
            {
                printHelp();
                Deno.exit(0);
            };

            case '-r':
            case '--run':
            {
                if (i + 1 >= args.length)
                {
                    console.log('Expected a path to a file');
                    Deno.exit(1);
                };
                const filePath = args[i + 1] as string;
                fromFile(filePath, flags);
                break;
            };
            default:
            {
                console.log(`Unknown argument ${arg}`);
                Deno.exit(1);
            };
        };
    };
    shell(flags);
    return 0;
};

main()