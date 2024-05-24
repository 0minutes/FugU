// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars
import { Lexer } from './backend/Lexer.ts';
import { Parser } from './backend/Parser.ts';



const VERSION = '1.2.0';
const HOT = 'Parser';

const main = () => {
    console.log(`HOT: ${HOT}!`);
    console.log(`FugU language v${VERSION} type '.exit' to exit!`);
    
    while (true) { 
        
        let userinput = String(prompt('>'));
        let lexer: Lexer = new Lexer(userinput, 'shell');
        let parser: Parser = new Parser(userinput, 'shell');
        if (userinput === '.exit') {
            Deno.exit(0);
        };
        let tokens: any = lexer.tokenize();
        let ast = parser.generateAst();
        console.log(tokens);
        console.log('----------------------------------------------');
        console.log(ast);
        console.log('----------------------------------------------');
    };
};

main();