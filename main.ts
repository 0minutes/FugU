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


const shell = (): number =>
{
    const Env: Environment = new Environment(undefined);

    while (true)
    {
        const input = prompt('>> ', '') as string;
        const parser = new Parser('<stdin>', input);
        const generator = new BytecodeGenerator(parser, Env);

        console.log(generator.Stringbytecode);
    };
};

const fromFile = async (filepath: string, outputFile: string, dump: boolean) =>
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

    const env: Environment = new Environment(undefined);
    const generator: BytecodeGenerator = new BytecodeGenerator(new Parser(filepath, contents), env);

    if (dump)
    {
        console.log(generator.Stringbytecode)
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(generator.Stringbytecode);

    await Deno.writeFile(outputFile + '.fug', data);
};
    
const printHelp = () => 
{
    console.log(`
Usage: deno run main.ts [options]

Options:
    -r, --run <file>           Run the specified file.
    -o, --output <file>        Specify the output file for results.
    -d, --dump                 Dump intermediate results (must be used with --run).
    -h, --help                 Show this help message and exit.

Examples:
    deno run main.ts --run script.txt             Run 'script.txt'.
    deno run main.ts -r script.txt -o output.txt  Run 'script.txt' and output results to 'output.txt'.
    deno run main.ts --run script.txt --dump      Run 'script.txt' and dump intermediate results.

Note:
    --dump can be used to display the output bytecode after running a script.
    if --dump is used without --run an error will be displayed.
    An output file is only needed when a file is being run.
    `);
};
    
const main = async () =>
{
    const ArgvFlags = argParse();

    if (ArgvFlags.dump && !ArgvFlags.run)
    {
        console.error('Expected to dump from a file path');
        Deno.exit(1);
    }

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

        await fromFile(ArgvFlags.filepath as string, ArgvFlags.outputfile, ArgvFlags.dump)

        Deno.exit(0);
    };

    shell();
    return 0;
};


const argParse = () => 
{
    const args = Deno.args;

    const flags =
    {
        help: false,
        run: false,
        outputfile: 'o',
        filepath: undefined,
        dump: false,
    }

    for (let i = 0; i < args.length; i++)
    {
        const arg = args[i];

        switch (arg)
        {
            case '-d':
            case '--dump':
            {
                flags.dump = true;
                break;
            }

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
                
                //@ts-ignore <>
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

    if (!flags.run && flags.outputfile != 'o')
    {
        console.log('No input file to have an output file');
        Deno.exit(0);
    };

    return flags;
};

main();
