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
    unaryCharConstructors,
    Flags,
} from '../shared.ts';

export class Lexer
{
    source: string;
    filename: string;
    listSource: string[];
    tokens: Token[] = [];
    flags: Flags;
    cur: number = 0;
    line: number = 1;

    specialChars: Record<string, TokenType> = specialChars;
    keywords: Record<string, TokenType> = keywords;

    constructor(flags: Flags, source: string, filename: string = 'shell')
    {
        this.source = source;
        this.filename = filename;
        this.flags = flags;
        this.listSource = [...source];
        this.tokens = this.tokenize();
    };

    makeToken(type: TokenType, value: string, start: number, end: number): Token
    {
        return {
            type,
            value,
            loc: makePosition(this.filename, this.line, start, end)
        } as Token;
    };

    next(): string | TokenType
    {
        return this.listSource.length > 0 ? this.listSource[1] : TokenType.eof;
    };

    eat(): string | TokenType
    {
        return this.listSource.length > 0 ? this.listSource.shift()! : TokenType.eof;
    };

    tokenize(): Token[]
    {
        const tokens: Token[] = [];
        this.cur = 0;
        this.line = 1;

        while (this.listSource.length > 0)
        {
            const start = this.cur;
            const char = this.eat();

            if (char === '\t' || char === '\r' || char === ' ' || char === '\v' || char === '\t' || char === '\f')
            {
                this.cur++;
                continue;
            };

            this.cur++;
            
            if (char === '/' && this.listSource[0] === '*')
            {
                this.eat();
                this.cur++;

                while (true)
                {
                    if (this.listSource.length === 0)
                    {
                        new LexerErr('Cannot find the end of a block comment', makePosition(this.filename, this.line, start, this.cur), this.source);
                    };

                    if (this.listSource[0] === '\n')
                    {
                        this.eat();
                        this.line++;
                        this.cur = 0;
                        continue;
                    };
                    
                    if (this.listSource[0] === '*' && this.next() === '/')
                    {
                        this.eat();
                        this.cur++;
                        this.eat();
                        this.cur++;

                        break;
                    };

                    this.eat();
                    this.cur++;
                };

                if (this.listSource[0] === '\n')
                {
                    this.eat();
                    this.line++;
                    this.cur = 0;
                };
            }

            else if (char === '/' && this.listSource[0] === '/')
            {
                this.eat();
                this.cur++;

                while (this.listSource.length > 0 && this.listSource[0] != '\n')
                {
                    this.eat();
                    this.cur++;
                };
                this.eat();
                this.line++;
                this.cur = 0;
            }

            else if (char in this.specialChars)
            {
                this.handleSpecialChars(tokens, char as string, start);
            }

            else if (DIGITS.includes(char))
            {
                this.handleNumber(tokens, char as string, start);
            }

            else if (LETTERS.includes(char) || char === '_')
            {
                this.handleIdentifier(tokens, char as string, start);
            }

            else if (char === '"' || char === '\'')
            {
                this.handleString(tokens, char as string, start);
            }

            else if (char === '\n')
            {
                tokens.push(this.makeToken(TokenType.eol, '\\n', start, this.cur));
                this.line++;
                this.cur = 0;
            }

            else
            {
                new LexerErr (
                    `Cannot figure out the what charecter this is: \`0x${char.charCodeAt(0).toString(16).toUpperCase()}\``,
                    makePosition(this.filename, this.line, start, this.cur),
                    this.source
                );
            };
        };

        tokens.push(this.makeToken(TokenType.eof, TokenType.eof, this.cur, this.cur + 1));
        return tokens;
    };

    handleSpecialChars(tokens: Token[], char: string, start: number): void
    {
        let sequence = char;

        if (char == '<')
        {
            
            if (this.listSource[0] == '=')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else if (this.listSource[0] == '<')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else if (this.listSource[0] == '>')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else
            {
                tokens.push(this.makeToken(this.specialChars[char], char, start, this.cur));
            };
        }

        else if (char == '>')
        {
            if (this.listSource[0] == '=')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else if (this.listSource[0] == '>')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else
            {
                tokens.push(this.makeToken(this.specialChars[char], char, start, this.cur));
            };
        }

        else if (char == '=')
        {
            if (this.listSource[0] == '=')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else
            {
                tokens.push(this.makeToken(this.specialChars[char], char, start, this.cur));
            };
        }

        else if (char == '+')
        {
            if (this.listSource[0] == '=')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else if (this.listSource[0] == '+')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else
            {
                tokens.push(this.makeToken(this.specialChars[char], char, start, this.cur));
            };
        }

        else if (char == '-')
        {
            if (this.listSource[0] == '=')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else if (this.listSource[0] == '-')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else
            {
                tokens.push(this.makeToken(this.specialChars[char], char, start, this.cur));
            };
        }

        else if (char == '*')
        {
            if (this.listSource[0] == '*')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else
            {
                tokens.push(this.makeToken(this.specialChars[char], char, start, this.cur));
            };
        }

        else if (char == '&')
        {
            if (this.listSource[0] == '&')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else
            {
                tokens.push(this.makeToken(this.specialChars[char], char, start, this.cur));
            };
        }

        else if (char == '|')
        {
            if (this.listSource[0] == '|')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else
            {
                tokens.push(this.makeToken(this.specialChars[char], char, start, this.cur));
            };
        }

        else if (this.listSource[0] == '!')
        {
            if (this.listSource[0] == '=')
            {
                sequence += this.eat();
                this.cur++;
                tokens.push(this.makeToken(this.specialChars[sequence], sequence, start, this.cur));
            }

            else
            {
                tokens.push(this.makeToken(this.specialChars[char], char, start, this.cur));
            };
        }

        else if (this.specialChars[char] != undefined)
        {
            tokens.push(this.makeToken(this.specialChars[char], char, start, this.cur));
        }

        else
        {
            new LexerErr(
                `Cannot figure out the special charecter sequence: ${sequence}`,
                makePosition(this.filename, this.line, start, this.cur),
                this.source
            );
        };
    };

    handleNumber(tokens: Token[], char: string, start: number): void
    {
        let number = char;
        let dot = false;

        while (
            this.listSource.length > 0 &&
            (
                DIGITS.includes(this.listSource[0]) ||
                this.listSource[0] === '.' ||
                this.listSource[0] === '_'
            )
        )
        {
            if (this.listSource[0] === '_')
            {
                this.eat();
                this.cur++;
            }
            else if (this.listSource[0] === '.' && !dot)
            {
                dot = true;
                number += this.eat();
                this.cur++;

                if (this.listSource.length === 0 || !DIGITS.includes(this.listSource[0]))
                {
                    this.cur++;
                    new LexerErr(
                        `Unexpectedly got \`${this.eat()}\` while trying to understand a digit literal. Expected a digit (0..9)`,
                        makePosition(this.filename, this.line, start, this.cur),
                        this.source
                    );
                };
            }
            else if (this.listSource[0] === '.' && dot)
            {
                this.eat();
                this.cur++;
                new LexerErr(
                    `Multiple dots in a number`,
                    makePosition(this.filename, this.line, start, this.cur),
                    this.source
                );
            }
            else
            {
                number += this.eat();
                this.cur++;
            };
        };

        const tokenType = dot ? TokenType.float : TokenType.integer;
        tokens.push(this.makeToken(tokenType, number, start, this.cur));
    };

    handleIdentifier(tokens: Token[], char: string, start: number): void
    {
        let identifier = char;

        while (
            this.listSource.length > 0 &&
            (
                LETTERS.includes(this.listSource[0]) ||
                this.listSource[0] === '_' ||
                DIGITS.includes(this.listSource[0])
            )
        )
        {
            identifier += this.eat();
            this.cur++;
        };

        const tokenType = identifier in this.keywords ? this.keywords[identifier] : TokenType.identifier;
        tokens.push(this.makeToken(tokenType, identifier, start, this.cur));
    };

    handleString(tokens: Token[], quote: string, start: number): void
    {
        let string = '';

        if (quote === '"')
        {
            while (this.listSource.length > 0 && this.listSource[0] !== quote && this.listSource[0] != '\n' && this.listSource[0] != '\r')
            {
                string += this.eat();
                this.cur++;
            };
        }
        else
        {
            if (this.listSource.length > 0 && this.listSource[0] !== quote && this.listSource[0] != '\n' && this.listSource[0] != '\r')
            {
                string += this.eat();
                this.cur++;
            };  
        };

        if (this.listSource.length === 0 || this.listSource[0] !== quote)
        {
            this.eat();
            this.cur++;
            new LexerErr(
                `Undereminted ${quote === '"' ? 'string' : 'char'} literal. Expected a ${quote === '"' ? 'double' : 'single'} quote`,
                makePosition(this.filename, this.line, start, this.cur),
                this.source
            );
        };

        this.eat();
        this.cur++;

        if (quote === '"')
        {
            tokens.push(this.makeToken(TokenType.string, string, start, this.cur));
        }
        else
        {
            tokens.push(this.makeToken(TokenType.char, string, start, this.cur));
        };
    };
};
