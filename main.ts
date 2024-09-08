import 
{
    Lexer
} from './src/Lexer/Lexer.ts'


const main = (): number =>
{   
    while (true)
    {
        const input = prompt('>> ', '') as string;
        const lexer = new Lexer('stdin', input)


        for (const token of lexer.tokens)
        {
            console.log(token);
        };
    };
};

main();