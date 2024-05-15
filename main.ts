// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars
import { Lexer } from './backend/Lexer.ts';
import { Parser } from './backend/Parser.ts';

const VERSION = '1.1.0';

const main = () => {
    console.log(`FugU language v${VERSION} type '.exit' to exit!`);
    
    while (true) { 
        
        let userinput = prompt('>') as string;
        let lexer: Lexer = new Lexer(userinput, 'shell');
        let parser: Parser = new Parser(userinput, 'shell');
        if (userinput === '.exit') {
            Deno.exit()
        };
        let tokens: any = lexer.tokenize();
        let ast = parser.parse();
        console.log(tokens);
        console.log('----------------------------------------------');
        console.log(ast);
        console.log(ast.body[0].body)
        console.log('----------------------------------------------');
    };
};

main();