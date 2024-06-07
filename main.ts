// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars


import { Lexer } from './backend/Lexer.ts';
import { Parser } from './backend/Parser.ts';


const VERSION = '1.2.0';
const HOT = 'Parser';

const shell = () => {
    console.log(`HOT: ${HOT}!`);
    console.log(`FugU language v${VERSION} type '.exit' to exit!`);
    
    while (true) { 
        
        let userinput = String(prompt('>'));

        if (userinput == 'exit') {
            Deno.exit(0);
        };

        let lexer: Lexer = new Lexer(userinput, 'shell');
        let parser: Parser = new Parser(userinput, 'shell');
        
        let tokens = lexer.tokens;
        let ast = parser.ast;

        console.log(tokens);
        console.log('----------------------------------------------');
        console.log(ast)
        console.log('----------------------------------------------');
    };
};

const fromFile = (file: string) => {
    let contents;
    try {
        contents = Deno.readTextFileSync(file);
    } 
    
    catch (e) {
        console.log(`Unknown file path: ${file}`);
        Deno.exit(1);
    };

    let lexer: Lexer = new Lexer(contents, file);
    let parser: Parser = new Parser(contents, file);

    let tokens: any = lexer.tokens;
    let ast = parser.ast;
    console.log(tokens);
    console.log('----------------------------------------------');

    console.log(ast);
    console.log('----------------------------------------------');
};

const printHelp = () => {
    console.log('Usage: deno run main.ts [-h | --help] | [-r | --run] (path/to/file)');
    console.log('\t--help/-h - prints this message');
    console.log('\t--run/-r  - requires a path to a file. Will run the code provided from a file');
};

const main = () => {
    const args = Deno.args;

    if (args.length === 0) {
        shell();
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '-h':
            case '--help':
                printHelp();
                break;

            case '-r':
            case '--run':
                if (i + 1 >= args.length) {
                    console.log('Expected a path to a file');
                    Deno.exit(1);
                }
                const filePath = args[i + 1] as string;
                fromFile(filePath);
                break;

            default:
                console.log(`Unknown argument ${arg}`);
                Deno.exit(1);
        }
    }

    return 0;
};

main();
