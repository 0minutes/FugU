import 
{
    Lexer
} from "../src/Lexer/Lexer.ts"

const contents = Deno.readTextFileSync('tests/LexerTest.txt');

const lexer: Lexer = new Lexer('LexerTest.txt', contents);

for (const Token of lexer.tokens)
{
    console.log(Token);
};

