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
    ByteEncoder
} from './backend/Bytecode/ByteEncoder.ts'

import
{
    Flags
} from './backend/shared.ts';

const EXTENSION = '.fugu';
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

        // let lexer: Lexer = new Lexer(flags, userinput, 'shell');
        let generator: ByteEncoder = new ByteEncoder(flags, userinput, 'shell');
        
        // let tokens = lexer.tokens;
        // let ast = generator.parser.ast;
        let bytecode = generator.bytecode;

        console.log('--------------BYTES------------');
        console.log(generator.ast);
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
    let generator: ByteEncoder = new ByteEncoder(flags, contents, file);
    
    // let tokens = lexer.tokens;
    // let ast = generator.parser.ast;
    let bytecode = generator.bytecode;

    console.log('--------------BYTES------------');
    console.log(bytecode);
    console.log('--------------END--------------');

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
        shellMode: true,
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
                flags.shellMode = false;

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