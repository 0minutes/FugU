// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars
import
{
    TokenType,
    Token,
    makePosition,
    LexerErr,
    LETTERS,
    DIGITS,
    specialChars,
    keywords,
    unaryBuilders,
    unaryChars,
}
from './shared.ts';


export class Lexer
{
    source: string;
    filename: string;
    listSource: string[];

    specialChars: Record <string, TokenType> = specialChars;
    keywords: Record <string, TokenType > = keywords;
    unaryBuilders: Record <string, TokenType> = unaryBuilders;
    unaryChars: Record <string, TokenType> = unaryChars;

    tokens: Token[];

    constructor(source: string, filename ? : string)
    {
        this.filename = filename == undefined ? 'shell' : filename;

        this.source = source;
        this.listSource = source.split('');

        this.tokens = this.tokenize();
    };

    makeToken = (type: TokenType, value: string, loc: any): Token =>
    {
        return {
            type,
            value,
            loc
        } as Token;
    };

    next = (): any =>
    {
        if (this.listSource.length >= 1)
        {
            return this.listSource[1];
        };
        return TokenType.eof;
    };

    eat = (): any =>
    {
        if (this.listSource.length > 0)
        {
            return this.listSource.shift();
        }
        else
        {
            return TokenType.eof;
        };

    };

    tokenize = () =>
    {
        let tokens: Token[] = [];

        let cur = 0;
        let start = 0;
        let line = 0;

        while (this.listSource.length > 0)
        {

            if (this.listSource[0] == '<')
            {
                start = cur;
                let unary = this.eat();
                cur++;
                // @ts-ignore
                if (this.listSource[0] == '=')
                {
                    unary += this.eat();
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }

                else if (this.listSource[0] == '<')
                {
                    unary += this.eat();
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }

                // @ts-ignore
                else if (this.listSource[0] == '>')
                {
                    unary += this.eat();
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }

                else
                {
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                };
            }

            else if (this.listSource[0] == '>')
            {
                start = cur;
                let unary = this.eat();
                cur++;
                // @ts-ignore
                if (this.listSource[0] == '=')
                {
                    unary += this.eat();
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }

                else if (this.listSource[0] == '>')
                {
                    unary += this.eat();
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }

                else
                {
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                };
            }

            else if (this.listSource[0] == '=')
            {
                start = cur;
                let unary = this.eat();
                cur++;
                // @ts-ignore
                if (this.listSource[0] == '=')
                {
                    unary += this.eat();
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }
                else
                {
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }
            }

            else if (this.listSource[0] == '+')
            {
                start = cur;
                let unary = this.eat();
                cur++;
                // @ts-ignore
                if (this.listSource[0] == '=')
                {
                    unary += this.eat();
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }

                else if (this.listSource[0] == '+')
                {
                    unary += this.eat();
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }

                else
                {
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                };
            }

            else if (this.listSource[0] == '-')
            {
                start = cur;
                let unary = this.eat();
                cur++;
                // @ts-ignore
                if (this.listSource[0] == '=')
                {
                    unary += this.eat();
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }

                else if (this.listSource[0] == '-')
                {
                    unary += this.eat();
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }

                else
                {
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                };
            }

            else if (this.listSource[0] == '*')
            {
                start = cur;
                let unary = this.eat();
                cur++;

                if (this.listSource[0] != '*')
                {
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }
                else
                {
                    unary += this.eat()
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }
            }

            else if (this.listSource[0] == '&')
            {
                start = cur;
                let unary = this.eat();
                cur++;

                if (this.listSource[0] != '&')
                {
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }
                else
                {
                    unary += this.eat()
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                };
            }

            else if (this.listSource[0] == '|')
            {
                start = cur;
                let unary = this.eat();
                cur++;

                if (this.listSource[0] != '|')
                {
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                }
                else
                {
                    unary += this.eat()
                    cur++;
                    tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
                };
            }

            else if (this.listSource[0] in this.specialChars)
            {
                start = cur;
                let unary = this.eat();
                cur++;

                tokens.push(this.makeToken(this.specialChars[unary], unary, makePosition(this.filename, line, start, cur)));
            }

            else if (DIGITS.includes(this.listSource[0]))
            {
                start = cur;
                let dot = false;
                let number = '';

                while (this.listSource.length > 0 && DIGITS.includes(this.listSource[0]) || this.listSource[0] == '.')
                {
                    if (this.listSource[0] == '.' && dot == false)
                    {
                        dot = true;
                        number += this.eat();
                        cur++;

                        if (this.listSource.length == 0)
                        {
                            new LexerErr(`Expected a number token instead got '${this.eat()}'`, makePosition(this.filename, line, start, cur), this.source);
                        };

                        if (this.listSource.length > 0 && !(DIGITS.includes(this.listSource[0])))
                        {
                            new LexerErr(`Expected a number token instead got '${this.eat()}'`, makePosition(this.filename, line, start, cur), this.source);
                        };
                    }

                    else if (this.listSource[0] == '.' && dot == true)
                    {
                        start = cur;
                        cur++;

                        new LexerErr(`Unexpected token: '${this.eat()}' during the parsing of a float`, makePosition(this.filename, line, start, cur), this.source)
                    }

                    else
                    {
                        number += this.eat();
                        cur++;
                    };
                };
                if (dot == true)
                {
                    tokens.push(this.makeToken(TokenType.float, number, makePosition(this.filename, line, start, cur)));
                }
                else
                {
                    tokens.push(this.makeToken(TokenType.integer, number, makePosition(this.filename, line, start, cur)));
                };
            }

            else if (LETTERS.includes(this.listSource[0]) || this.listSource[0] == '_')
            {
                start = cur;
                let identifier = ''

                while (this.listSource.length > 0 && (LETTERS.includes(this.listSource[0]) || this.listSource[0] == '_' || DIGITS.includes(this.listSource[0])))
                {
                    identifier += this.eat();
                    cur++;
                };

                if (identifier in this.keywords)
                {
                    tokens.push(this.makeToken(this.keywords[identifier], identifier, makePosition(this.filename, line, start, cur)));
                }
                else
                {
                    tokens.push(this.makeToken(TokenType.identifier, identifier, makePosition(this.filename, line, start, cur)));
                };
            }

            else if (this.listSource[0] == '"')
            {
                start = cur;
                this.eat();
                cur++;
                let string = '';
                while (this.listSource.length > 0 && this.listSource[0] != '"')
                {
                    string += this.eat()
                    cur++;
                };
                if (this.listSource[0] != '"')
                {
                    new LexerErr('Undetermined string literal', makePosition(this.filename, line, start, cur), this.source);
                };
                this.eat();
                cur++;
                tokens.push(this.makeToken(TokenType.string, string, makePosition(this.filename, line, start, cur)));
            }

            else if (this.listSource[0] == '\'')
            {
                start = cur;
                this.eat();
                cur++;
                let string = '';
                while (this.listSource.length > 0 && this.listSource[0] != '\'')
                {
                    string += this.eat()
                    cur++;
                };
                if (this.listSource[0] != '\'')
                {
                    new LexerErr('Undetermined string literal', makePosition(this.filename, line, start, cur), this.source);
                };
                this.eat();
                cur++;
                tokens.push(this.makeToken(TokenType.string, string, makePosition(this.filename, line, start, cur)));
            }

            else if (this.listSource[0] == ' ')
            {
                this.eat();
                cur++;
            }

            else if (this.listSource[0] == '\n')
            {
                start = cur;
                this.eat();
                cur = 0;
                line++;
                tokens.push(this.makeToken(TokenType.eol, '\\n', makePosition(this.filename, line, start, cur)))
            }

            else if (this.listSource[0] == '\t')
            {
                this.eat();
                cur++;
            }

            else if (this.listSource[0] == '\r')
            {
                this.eat();
                // cur++;
            }

            else if (this.listSource[0] == ';')
            {
                start = cur
                this.eat();
                cur++;
                tokens.push(this.makeToken(TokenType.eol, ';', makePosition(this.filename, line, start, cur)))
            }

            else
            {
                start = cur
                cur++;
                new LexerErr(`Unknown charecter token: ${this.listSource[0]}`, makePosition(this.filename, line, start, cur), this.source);
            };
        };

        tokens.push(this.makeToken(TokenType.eof, TokenType.eof, makePosition(this.filename, line, this.source.length, this.source.length + 1)))

        return tokens;
    };
}



// TESTING PURPOSES

// const test = new Lexer('|||&&&', 'tst');
// console.log(test.tokens);