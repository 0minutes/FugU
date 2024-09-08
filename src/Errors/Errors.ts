
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

export class error
{
    type: string;
    message: string;
    loc: Position;
    source: string;

    lines: string[];

    constructor(type: string, message: string, source: string, loc: Position)
    {
        this.type = type;
        this.message = message;
        this.loc = loc;
        this.source = source;
        this.lines = this.source.split('\n');

        this.displayError();
        Deno.exit(1);
    };

    displayError() {
        const lineNumWidth = String(this.lines.length).length;

        console.error(`${this.type}: ${this.message}`);
        console.error(`--> ${this.loc.filename}:${this.loc.line}:${this.loc.start}`);   

        if (this.loc.line > 1)
        {
            console.error(` ${' '.repeat(lineNumWidth)} |`);
            console.error(` ${String(this.loc.line - 1).padStart(lineNumWidth)} | ${this.lines[this.loc.line - 2]}`);
            console.error(` ${' '.repeat(lineNumWidth)} |`);
        };

        console.error(` ${String(this.loc.line).padStart(lineNumWidth)} | ${this.lines[this.loc.line - 1]}`);
        console.error(` ${' '.repeat(lineNumWidth)} | ${' '.repeat(this.loc.start)}${'^'.repeat(this.loc.end - this.loc.start)}`);

        if (this.loc.line < this.lines.length)
        {
            console.error(` ${String(this.loc.line + 1).padStart(lineNumWidth)} | ${this.lines[this.loc.line]}`);
            console.error(` ${' '.repeat(lineNumWidth)} |`);
        };
    };
};