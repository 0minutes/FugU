import
{
    error,
    makePosition,
} from '../Errors/Errors.ts';

import 
{
    TokenType,
    Token,
    keywords,
    specialCharacters,
} from './TokenTypes.ts';

const DIGITS = '0987654321';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export class Lexer
{
    filename: string;
    source: string;

    splitSource: string[];

    cur: number;
    line: number;

    tokens: Token[];
    

    constructor (filename: string, source: string)
    {
        this.filename = filename;
        this.source = source;
    
        this.splitSource = [...source];

        this.cur = 0;
        this.line = 1;

        this.tokens = this.lexSource();
    };

    eat = (): string =>
    {
        if (this.splitSource.length == 0)
        {
            return 'EOF';
        };

        return this.splitSource.shift() as string;
    };

    at = (): string =>
    {
        if (this.splitSource[0] == undefined)
        {
            return 'EOF';
        };

        return this.splitSource[0] as string;
    };

    peek = (): string =>
    {
        if (this.splitSource[1] == undefined)
        {
            return 'EOF';
        };

        return this.splitSource[1] as string;
    };

    makeToken = (value: string, type: TokenType, start: number): Token =>
    {
        const where = makePosition(this.filename, this.line, start, this.cur);

        return {
            value: value,
            type: type,
            where: where,
        } as Token;
    };

    lexSource = (): Token[] =>
    {
        const tokens: Token[] = [];
        this.cur = 0;
        this.line = 1;

        while (this.splitSource.length > 0)
        {
            const start = this.cur;

            const char = this.eat();
            const peek = this.at();

            this.cur++;


            if (['\t', '\v', '\r', '\f', ' '].includes(char))
            {
                continue;
            }

            else if (char == '/' && peek == '*')
            {
                this.eat();
                this.cur++;
                while (this.splitSource.length > 0)
                {                    
                    if (this.splitSource.length == 0)
                    {
                        new error(
                            'Lexer Error',
                            'Un-ended block comment',
                            this.source,
                            makePosition(this.filename, this.line, this.cur, this.cur+1),
                            '*/'
                        );
                    };

                    if (this.at() == '\n')
                    {
                        this.eat();
                        this.line++;
                        this.cur = 0;
                        continue;
                    };

                    if (this.at() == '*' && this.peek() == '/')
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
            }

            else if (char == '/' && peek == '/')
            {
                this.eat();
                this.cur++;
                while (this.splitSource.length > 0 && this.at() != '\n')
                {
                    this.eat();
                    this.cur++;
                };
            }

            else if (char == '\n')
            {
                this.line++;
                this.cur = 0;
            }

            else if (char in specialCharacters)
            {
                this.handleSpecialCharacters(tokens, char as string, peek, start);
            }

            else if (DIGITS.includes(char))
            {
                this.handleNumbers(tokens, char as string, start);
            }

            else if (char == '"' || char == '\'')
            {
                this.handleString(tokens, char as string, start);
            }

            else if (LETTERS.includes(char) || char == '_')
            {
                this.handleIdentifier(tokens, char as string, start);
            }
    
            else
            {
                new error (
                    'Lexer Error',
                    `Unknown character '${char}' (Unicode 0x${char.charCodeAt(0).toString(16)})`,
                    this.source,
                    makePosition(this.filename, this.line, start, this.cur)
                )
            };
        };

        this.cur++

        if (tokens.length >= 1)
        {
            tokens.push({type: TokenType.eof, value: 'EOF', where: makePosition(this.filename, this.line, tokens[tokens.length-1].where.start+1, tokens[tokens.length-1].where.end+1)});
        }
        else
        {
            tokens.push(this.makeToken('EOF', TokenType.eof, this.cur-1))
        };

        return tokens;
    };

    handleIdentifier(tokens: Token[], char: string, start: number): void
    {
        let identifier = char;

        while (
            this.splitSource.length > 0 &&
            (
                LETTERS.includes(this.splitSource[0]) ||
                this.splitSource[0] == '_' ||
                DIGITS.includes(this.splitSource[0])
            )
        )
        {
            identifier += this.eat();
            this.cur++;
        };

        const tokenType = identifier in keywords ? keywords[identifier] : TokenType.identifier;
        tokens.push(this.makeToken(identifier, tokenType, start));
    };

    handleString(tokens: Token[], quote: string, start: number): void
    {
        let string = '';

        if (quote == '"')
        {
            while (this.splitSource.length > 0 && this.splitSource[0] != quote && this.splitSource[0] != '\n' && this.splitSource[0] != '\r')
            {
                string += this.eat();
                this.cur++;
            };
        }
        else
        {
            while (this.splitSource.length > 0 && this.splitSource[0] != quote && this.splitSource[0] != '\n' && this.splitSource[0] != '\r')
            {
                string += this.eat();
                this.cur++;
            };  
        };

        if (this.splitSource.length == 0 || this.splitSource[0] != quote)
        {
            this.eat();
            this.cur++;
            new error(
                'Lexer Error',
                `Undereminted ${quote == '"' ? 'string' : 'char'} literal. Expected a ${quote == '"' ? 'double' : 'single'} quote`,
                this.source,
                makePosition(this.filename, this.line, start, this.cur)
            );
        };

        if (quote == "'" && string.length > 1)
        {
            new error(
                'Lexer Error',
                `Undereminted char literal. Expected a single quote after the character '${string[0]}' but instead got '${string[1]}'. Maybe you meant to use double quotes instead?`,
                this.source,
                makePosition(this.filename, this.line, start, start + 3)
            );
        };

        this.eat();
        this.cur++;

        if (quote == '"')
        {
            tokens.push(this.makeToken(string, TokenType.str, start));
        }
        else
        {
            tokens.push(this.makeToken(string, TokenType.char, start));
        };
    };

    handleNumbers = (tokens: Token[], char: string, start: number): void =>
    {
        let number = char;
        let dot = false;

        while (
            this.splitSource.length > 0 &&
            (
                '0987654321'.includes(this.splitSource[0]) ||
                this.splitSource[0] == '.' ||
                this.splitSource[0] == '_'
            )
        )
        {
            if (this.splitSource[0] == '_')
            {
                this.eat();
                this.cur++;
            }
            else if (this.splitSource[0] == '.' && !dot)
            {
                dot = true;
                number += this.eat();
                this.cur++;

                if (this.splitSource.length == 0 || !'0987654321'.includes(this.splitSource[0]))
                {
                    this.cur++;

                    new error(
                        'Lexer Error',
                        `Unexpectedly got \`${this.eat()}\` while trying to understand a digit literal. Expected a digit (0..9)`,
                        this.source,
                        makePosition(this.filename, this.line, start, this.cur)
                    );
                };
            }
            else if (this.splitSource[0] == '.' && dot)
            {
                this.eat();
                this.cur++;
                new error(
                    'Lexer Error',
                    `Multiple dots in a number`,
                    this.source,
                    makePosition(this.filename, this.line, start, this.cur),
                );
            }
            else
            {
                number += this.eat();
                this.cur++;
            };
        };

        const tokenType = dot ? TokenType.float : TokenType.int;
        tokens.push(this.makeToken(number, tokenType, start));
    };

    handleSpecialCharacters = (tokens: Token[], char: string, peek: string, start: number): void =>
    {
        let specialChar = '';
    
        if (char == '+')
        {
            specialChar += char;
            if (peek == '+' || peek == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };
        }

        else if (char == '-')
        {
            specialChar += char;
    
            if (peek == '-' || peek == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };

        }

        else if (char == '*')
        {
            specialChar += char;
    
            if (peek == '*' || peek == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };
        }
        
        else if (char == '/')
        {
            specialChar += char;
    
            if (peek == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };
        }
        
        else if (char == '=')
        {
            specialChar += char;
    
            if (peek == '=') {
                specialChar += this.eat();
                this.cur++;
            };
        }
        
        else if (char == '!')
        {
            specialChar += char;
    
            if (peek == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };
        }
        
        else if (char == '>')
        {
            specialChar += char;
    
            if (peek == '=')
            {
                specialChar += this.eat();
                this.cur++;

                tokens.push(this.makeToken(specialChar, specialCharacters[specialChar], start));
                return;
            };

            if (peek == '>')  
            {
                specialChar += this.eat();
                this.cur++;
            };

            if (this.at() == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };
        }
        
        else if (char == '<')
        {
            specialChar += char;
            if (peek == '=')
            {
                specialChar += this.eat();
                this.cur++;
                
                tokens.push(this.makeToken(specialChar, specialCharacters[specialChar], start));
                return;
            };

            if (peek == '>')
            {
                specialChar += this.eat();
                this.cur++;
                
                tokens.push(this.makeToken(specialChar, specialCharacters[specialChar], start));
                return;
            };
            
            if (peek == '<')
            {
                specialChar += this.eat();
                this.cur++;
            };

            if (this.at() == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };
        }
        
        else if (char == '&')
            
            {
            specialChar += char;
    
            if (peek == '&' || peek == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };
        }
        
        else if (char == '|')
            
            {
            specialChar += char;
    
            if (peek == '|' || peek == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };
        }
        
        else if (char == '^')
            
            {
            specialChar += char;
    
            if (peek == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };
        }
        
        else if (char == '~')
        {
            specialChar += char;
        }
        
        else if (char == '%')
        {
            specialChar += char;
    
            if (peek == '=')
            {
                specialChar += this.eat();
                this.cur++;
            };
        } 
        
        else if (char == '?')
        {
            specialChar += char;
        }
        
        else if (char == ':')
        {
            specialChar += char;
        } 
        
        else if (char == ';')
        {
            specialChar += char;
        }
        
        else if (char == ',')
        {
            specialChar += char;
        }
        
        else if (char == '(')
        {
            specialChar += char;
        } 
        
        else if (char == ')')
        {
            specialChar += char;
        }
        
        else if (char == '{')
        {
            specialChar += char;
        } 
        
        else if (char == '}')
        {
            specialChar += char;
        }
        
        else if (char == '[')
        {
            specialChar += char;
        }
        
        else if (char == ']')
        {
            specialChar += char;
        }
        
        else if (char == '.')
        {
            specialChar += char;
    
            if (peek == '.')
            {
                specialChar += this.eat();
                this.cur++;
            };
        }

        tokens.push(this.makeToken(specialChar, specialCharacters[specialChar], start));
    };
};