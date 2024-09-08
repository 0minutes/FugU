import 
{
    Lexer
} from "../src/Lexer/Lexer.ts"


const contents = Deno.readTextFileSync('tests/LexerTest.txt');

const lexerr: Lexer = new Lexer('LexerTest.txt', contents);

for (const Token of lexerr.tokens)
{
    console.log(Token);
};

