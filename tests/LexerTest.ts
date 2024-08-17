import 
{
    Lexer
} from "../backend/Parser/Lexer.ts"


const contents = Deno.readTextFileSync('tests/LexerTest.txt');

const lexerr: Lexer = new Lexer({warnings: false, strictWarnings: false}, contents, 'LexerTest.txt');

for (const Token of lexerr.tokens)
{
    console.log(Token);
};

