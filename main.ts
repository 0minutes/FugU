// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars

import 
{
    ByteEncoder
} from './backend/Bytecode/ByteEncoder.ts';

import
{
    Parser
} from './backend/Parser/Parser.ts';

import
{
    Flags
} from './backend/shared.ts';

interface argvFlags
{
    help: boolean;
    run: boolean;
    filepath: string | null;
    outputfile: string;
    flags: Flags,
}

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

        let generator: ByteEncoder = new ByteEncoder(flags, userinput, 'shell');

        let bytecode = generator.bytecode;

        console.log('--------------BYTECODE--------------');
        console.log(bytecode)
        console.log('--------------END-------------------');
    };
};

const fromFile = async (filepath: string, outputFile: string, flags: Flags) =>
{
    let contents;
    try
    {
        contents = Deno.readTextFileSync(filepath);
    }
    catch (e)
    {
        console.log(`Unknown file path: ${filepath}`);
        Deno.exit(1);
    };

    let generator: ByteEncoder = new ByteEncoder(flags, contents, filepath);

    await generator.writeToFile(outputFile);
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

const argParse = (): argvFlags => 
{
    const args = Deno.args;

    const flags: argvFlags =
    {
        help: false,
        run: false,
        outputfile: 'a.fug',
        filepath: null,
        flags: {
            warnings: true,
            strictWarnings: false,
        } as Flags
    }

    if (args.includes('-nws'))
    {
        flags.flags.warnings = false;
        args.splice(args.indexOf('-nws'), 1);
    };

    if (args.includes('--no-warnings'))
    {
        flags.flags.warnings = false;
        args.splice(args.indexOf('--no-warnings'), 1);
    };

    if (args.includes('-sws'))
    {
        flags.flags.strictWarnings = true;
        args.splice(args.indexOf('-sws'), 1);
    };

    if (args.includes('--strict-warnings'))
    {
        flags.flags.strictWarnings = true;
        args.splice(args.indexOf('--strict-warnings'), 1);
    };

    if (flags.flags.strictWarnings)
    {
        flags.flags.warnings = true;
    };

    for (let i = 0; i < args.length; i++)
    {
        const arg = args[i];

        switch (arg)
        {
            case '-h':
            case '--help':
            {
                flags.help = true;
                break;
            };

            case '-r':
            case '--run':
            {
                if (i + 1 >= args.length)
                {
                    console.log('Expected a path to a file');
                    Deno.exit(1);
                };
                if (args[i+1].startsWith('-'))
                {
                    console.log('Expected a valid path to a file');
                    Deno.exit(1);
                };

                i++;
                const filePath = args[i] as string;
                flags.filepath = filePath;

                flags.run = true;

                break;
            };

            case '-o':
            case '--output':
            {
                if (i + 1 >= args.length)
                {
                    console.log('Expected a path to a file');
                    Deno.exit(1);
                };
                if (args[i+1].startsWith('-'))
                {
                    console.log('Expected a valid path to a file');
                    Deno.exit(1);
                };
                i++;
                flags.outputfile = args[i] as string;
                break;
            };

            default:
            {
                console.log(`Unknown argument ${arg}`);
                Deno.exit(1);
            };
        };
    };
    return flags;
}

const main = async () =>
{
    const ArgvFlags: argvFlags = argParse();

    if (ArgvFlags.help)
    {
        printHelp();
        Deno.exit(1);
    }

    if (ArgvFlags.run)
    {
        if (ArgvFlags.filepath == null)
        {
            console.error('Expected a file path');
            Deno.exit(1);
        };



        fromFile(ArgvFlags.filepath as string, ArgvFlags.outputfile, ArgvFlags.flags)

        Deno.exit(0);
    };

    shell(ArgvFlags.flags);
    return 0;
};

main()