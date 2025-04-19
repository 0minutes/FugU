
// export const generateIfStatement = (BytecodeGenerator: BytecodeGenerator, Statement: IfStatement, Env: Env): void =>
// {
//     generateExpression(BytecodeGenerator, Statement.condition, Env);

//     const jzIdx = BytecodeGenerator.Bytecode.length;

//     BytecodeGenerator.Bytecode.push(
//         {
//             type: Instructions.jz,
//             argument: '',
//             comment: 'If the top of the stack is 0 jump'
//         }
//     );
    
//     for (const Stmt of Statement.body)
//     {
//         BytecodeGenerator.generateStatement(Stmt, Env);
//     };

//     const jmpIdx = BytecodeGenerator.Bytecode.length;

//     BytecodeGenerator.Bytecode.push(
//         {
//             type: Instructions.jmp,
//             argument: '',
//             comment: ''
//         }
//     )

//     BytecodeGenerator.Bytecode[jzIdx].argument = '0x' + (BytecodeGenerator.Bytecode.length - jzIdx-1).toString(16);
//     BytecodeGenerator.Bytecode[jzIdx].comment = `Jump if zero ${'0x' + (BytecodeGenerator.Bytecode.length - jzIdx-1).toString(16)} times`

//     if (Statement.alternate != undefined)
//     {
//         if (Statement.alternate.type == 'ElseStatement')
//         {
//             for (const Stmt of Statement.alternate.body)
//             {
//                 BytecodeGenerator.generateStatement(Stmt, Env);
//             };
//         };
//         if (Statement.alternate.type == 'IfStatement')
//         {
//             generateIfStatement(BytecodeGenerator, Statement.alternate, Env);
//         };
//     };

//     BytecodeGenerator.Bytecode[jmpIdx].argument = '0x' + (BytecodeGenerator.Bytecode.length-jmpIdx-1).toString(16);
//     BytecodeGenerator.Bytecode[jmpIdx].comment = `Jump ${'0x' + (BytecodeGenerator.Bytecode.length-jmpIdx-1).toString(16)} times`
// };