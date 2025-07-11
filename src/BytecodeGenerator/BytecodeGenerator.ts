import 
{
    Stmt
} from "../Parser/GlobalNodes.ts";

import type {
    Parser
} from "../Parser/Parser.ts";

import {
    InstructionType,
    Instruction
} from "./Instructions.ts";


import
{
    generateDeclarationStatement,
    generateIfStatement,
    generateAssignmentStatement,
} from "./Statements.ts";

export interface ScopeVariable {
    slot: number;
    type: string;
}

export type Scope = Map<string, ScopeVariable>;

export class BytecodeGenerator
{
    parser: Parser;

    scopes: Scope[] = [];
    slot: number;

    bytes: Instruction[];

    constructor(Parser: Parser)
    {
        this.parser = Parser;
        this.bytes = [];
        this.slot = 0;
        this.scopes.push(new Map());
    };

    enterScope = (): void =>
    {
        this.scopes.push(new Map());
    }

    exitScope = (): void =>
    {
        this.scopes.pop();
    };

    declareVariable = (id: string, type: string): void =>
    {
        this.slot += 1;

        const Var: ScopeVariable = {
            slot: this.slot,
            type: type,
        };

        this.scopes[this.scopes.length - 1].set(id, Var);
    };

    lookupVariable = (id: string): ScopeVariable =>
    {
        for (let i = this.scopes.length - 1; i >= 0; i--)
        {
            if (this.scopes[i].has(id))
            {
                return this.scopes[i].get(id)!;
            };
        };

        throw new Error(`Variable ${id} not found`);
    };

    generateStatement = (Statement: Stmt): Instruction[] =>
    {
        const bytes: Instruction[] = [];

        switch (Statement.type)
        {
            case 'IfStatement':
            {
                bytes.push(...generateIfStatement(this, Statement));
                break;
            };

            case "DeclerationStatement":
            {
                bytes.push(...generateDeclarationStatement(this, Statement));
                break;
            }

            case "AssignmentStatement":
            {
                bytes.push(...generateAssignmentStatement(this, Statement));
                break;
            };

            // case 'ProcStatement':
            // {
            //     generateProcStatement(this, Statement);
            //     break;
            // }

            // case 'ReturnStatement':
            // {
            //     generateReturnStatement(this, Statement);
            //     break;
            // }
        };

        return bytes;
    };

    generateGlobal = (): Instruction[] =>
    {
        this.bytes = [];

        for (const Statement of this.parser.ast.body)
        {
            this.bytes.push(...this.generateStatement(Statement));
        };

        this.bytes.push({type: InstructionType.HALT, args: [], comment: "HALT"});

        return this.bytes;
    };
};