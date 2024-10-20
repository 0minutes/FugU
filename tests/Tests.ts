
import { Parser } from "../src/Parser/Parser.ts";
import { Environment } from "../src/TypeChecking/Environment.ts";
import { TypeChecker } from "../src/TypeChecking/TypeChecker.ts";

const contents = Deno.readTextFileSync('tests/test.txt');
const parser: Parser = new Parser('test.txt', contents);

const env: Environment = new Environment(undefined);
new TypeChecker(parser, env);