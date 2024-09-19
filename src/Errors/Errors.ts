
export const makePosition = (filename: string, line: number, start: number, end: number): Position =>
    {
        return {
            filename,
            line,
            end,
            start
        } as Position;
    };

export interface Position
{
    filename: string;
    line: number;
    start: number;
    end: number;
};

// export class error
// {
//     type: string;
//     message: string;
//     loc: Position;
//     source: string;

//     under: string | undefined;

//     lines: string[];

//     constructor(type: string, message: string, source: string, loc: Position, under?: string)
//     {
//         this.type = type;
//         this.message = message;
//         this.loc = loc;
//         this.source = source;
//         this.lines = this.source.split('\n');
//         this.under = under;

//         this.displayError();
//         Deno.exit(1);
//     };

//     displayError() {
//         const lineNumWidth = String(this.lines.length).length;

//         console.error(`${this.type}: ${this.message}`);
//         console.error(`--> ${this.loc.filename}:${this.loc.line}:${this.loc.start}`);   

//         if (this.loc.line > 1)
//         {
//             console.error(` ${' '.repeat(lineNumWidth)} |`);
//             console.error(` ${String(this.loc.line - 1).padStart(lineNumWidth)} | ${this.lines[this.loc.line - 2]}`);
//             console.error(` ${' '.repeat(lineNumWidth)} |`);
//         };

//         console.error(` ${String(this.loc.line).padStart(lineNumWidth)} | ${this.lines[this.loc.line - 1]}`);
//         console.error(` ${' '.repeat(lineNumWidth)} | ${' '.repeat(this.loc.start)}${'^'.repeat(this.loc.end - this.loc.start)}`);

//         if (this.under != undefined)
//         {
//             console.error(` ${' '.repeat(lineNumWidth)} | ${' '.repeat(this.loc.start)}${this.under}`);
//             console.error(` ${' '.repeat(lineNumWidth)} |`);
//         };

//         if (this.loc.line < this.lines.length)
//         {
//             console.error(` ${String(this.loc.line + 1).padStart(lineNumWidth)} | ${this.lines[this.loc.line]}`);
//             console.error(` ${' '.repeat(lineNumWidth)} |`);
//         };
//     };
// };

export class error
{
    type: string;
    message: string;
    loc: Position;
    source: string;
    under: string | undefined;
    lines: string[];

    constructor(type: string, message: string, source: string, loc: Position, under?: string)
    {
        this.type = type;
        this.message = message;
        this.loc = loc;
        this.source = source;
        this.lines = this.source.split('\n');
        this.under = under;

        this.displayError();
        Deno.exit(1);
    };

    displayError()
    {
        const green = "\x1b[32m";
        const yellow = "\x1b[33m";
        const reset = "\x1b[0m";

        const lineNumWidth = String(this.lines.length).length;

        const currentLine = String(this.loc.line).padStart(lineNumWidth);
        const previousLine = this.loc.line > 1 ? String(this.loc.line - 1).padStart(lineNumWidth) : '';
        const nextLine = this.loc.line < this.lines.length ? String(this.loc.line + 1).padStart(lineNumWidth) : '';

        const pointerLine = `${' '.repeat(this.loc.start)}${'^'.repeat(this.loc.end - this.loc.start)}`;
        const underLine = this.under ? `${' '.repeat(this.loc.start)}${green}${this.under}${reset}` : '';

        const emptyLine = `${' '.repeat(lineNumWidth)} |`;

        console.error(`${this.type}: ${this.message}`);
        console.error(`${yellow}--> ${this.loc.filename}:${this.loc.line}:${this.loc.start}${reset}`);

        if (this.loc.line > 1)
        {
            console.error(emptyLine);
            console.error(`${previousLine} | ${this.lines[this.loc.line - 2]}`);
            console.error(emptyLine);
        };

        console.error(`${currentLine} | ${this.lines[this.loc.line - 1]}`);
        console.error(`${emptyLine} ${pointerLine}`);

        if (this.under)
        {
            console.error(`${emptyLine} ${underLine}`);
            console.error(emptyLine);
        };

        if (this.loc.line < this.lines.length)
        {
            console.error(`${nextLine} | ${this.lines[this.loc.line]}`);
            console.error(emptyLine);
        };
    };
};

export class warning
{
    type: string;
    message: string;
    loc: Position;
    source: string;
    under: string | undefined;
    lines: string[];

    constructor(type: string, message: string, source: string, loc: Position, under?: string)
    {
        this.type = type;
        this.message = message;
        this.loc = loc;
        this.source = source;
        this.lines = this.source.split('\n');
        this.under = under;

        this.displayError();
    };

    displayError()
    {
        const green = "\x1b[32m";
        const yellow = "\x1b[33m";
        const reset = "\x1b[0m";

        const lineNumWidth = String(this.lines.length).length;

        const currentLine = String(this.loc.line).padStart(lineNumWidth);
        const previousLine = this.loc.line > 1 ? String(this.loc.line - 1).padStart(lineNumWidth) : '';
        const nextLine = this.loc.line < this.lines.length ? String(this.loc.line + 1).padStart(lineNumWidth) : '';

        const pointerLine = `${' '.repeat(this.loc.start)}${'^'.repeat(this.loc.end - this.loc.start)}`;
        const underLine = this.under ? `${' '.repeat(this.loc.start)}${green}${this.under}${reset}` : '';

        const emptyLine = `${' '.repeat(lineNumWidth)} |`;

        console.error(`${this.type}: ${this.message}`);
        console.error(`${yellow}--> ${this.loc.filename}:${this.loc.line}:${this.loc.start}${reset}`);

        if (this.loc.line > 1)
        {
            console.error(emptyLine);
            console.error(`${previousLine} | ${this.lines[this.loc.line - 2]}`);
            console.error(emptyLine);
        };

        console.error(`${currentLine} | ${this.lines[this.loc.line - 1]}`);
        console.error(`${emptyLine} ${pointerLine}`);

        if (this.under)
        {
            console.error(`${emptyLine} ${underLine}`);
            console.error(emptyLine);
        };

        if (this.loc.line < this.lines.length)
        {
            console.error(`${nextLine} | ${this.lines[this.loc.line]}`);
            console.error(emptyLine);
        };
    };
};