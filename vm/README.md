# How To Run

To Run A Fugu Program Ensure You Have The Path For Fugub(The ByteCode Folder) And Deno Installed. **Note: If You Are Not On Windows You Have To Compile The ByteCode Yourself By Running Either**  
`C:Fugu/ByteCode> g++ Fugub.cpp -o Fugub`
Or  
`C:Fugu/ByteCode> clang++ Fugub.cpp -o Fugub`
  
Now When Your Done You Can Run Your First Fugu Program Paste The Following Into A
`Main.fugu`  File.

```rust
2 + 2
```

Now This Is A Little Underwhelming As You May Have Expected A Hello, World Program  
But Fugu Does Not Support Printing Currently. Now To Run This Program Enter Your Terminal And Run You May Have To Grant Acsses To Read And Write To Files
`C:PathOfMyFuguFolder> deno main.ts -r Main.fugu -o Main.fb`  

You Should See A `Main.fb` File This Contains The ByteCode.  
To Run This File And Execute The ByteCode Run

`C:PathOfMyFuguFolder> Fugub Main.fb`

Now We Cant Really See Any OutPut So To Get Some Info Run

`C:PathOfMyFuguFolder> Fugub Main.fb --dump--Info`

When You Run This You Should See Something Like

```ts
------------Stack----------
4
--------Lables : Addresses---
{"Name" : "main:", "Value" : 0}
---------------Variables----------
```

And As We Can See We Got The Result 4 On The Stack.  
To See The Result Better At The End Of  Our `Main.fb` File  
We Can Add `invoke 0x01` Into The ByteCode To Print The Rseult
So Our `Main.fb` File Should Look Like This

```llvm
main:
    ipush 0x2
    ipush 0x2
    iadd
    invoke 0x01
```

If You See Some Other Stuff Dont Worry About It Just Ensure Your `Main.fb` Has Something Like This AfterWards You Can Run The Program Again

`C:PathOfMyFuguFolder> Fugub Main.fb`

And We Should 4 Printed To The Console So With The Info You Recived You Run
ByteCode With `Fugub` And Compile The Fugu File To ByteCode with `main.ts`
