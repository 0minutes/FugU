/*
    This Is The ByteCode Runner For
    The Langauge Fugu
*/
#ifdef _WIN32
#include <windows.h>
#endif


#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <cstdint>


#include "Src/Interpreter.cpp"

std::vector<std::string> GetTokens(std::string& Code){
    std::vector<std::string> Vec;
    std::string Temp;
    bool InQuotes = false;


    /*
        There Is A Bug And Doing Something Stupid Like This IS The Only Way To Solve It(Taht I Know Of)
    */
    size_t i = 0;
    while(i < Code.size()){
        switch(Code[i]){
            case '\n':
                i++;
                break;
            case ' ':
                i++;
                break;
            case '\t':
                i++;
                break;
            case '/':
                while(Code[i] != '\n'){
                    i++;
                }
                break;
            case ';':
                Vec.push_back(";");
                i++;
                break;
            default:
                if(std::isalnum(Code[i]) || Code[i] == '_' || Code[i] == '-'){
                    std::string Str;
                    while(std::isalnum(Code[i]) || Code[i] == '_' || Code[i] == ':' || Code[i] == '-'){
                        Str+=Code[i];
                        i++;
                    }
                    Vec.push_back(Str);
                    break;
                }else if(Code[i] == '"'){
                    std::string Str;
                    i++;
                    while(Code[i] != '"'){
                        Str+=Code[i];
                        i++;
                    }

                    Vec.push_back(Str);
                    i++;
                    break;
                }else{
                    i++;
                    break;
                }

        }
    }
    return Vec; 
}


int main(int argc, char* argv[]){
    #ifdef _WIN32
        SetConsoleOutputCP(CP_UTF8); //for Sweet Sweet Emojis other languages(spanish, mandrin) ect..
    #endif

    if(argc == 1){
        std::cerr << "fatal error: no input files";
        exit(1);
    }

    std::vector<std::string> Tokens;
    { //Frees Memory And No Memory Leaks
        std::ifstream File(argv[1], std::ios::in | std::ios::binary);    //Emojisssssss UTF-8!!!!!
        if(!File.is_open()){
            std::cerr << "fatal error: no such file '" << argv[1] << "'";
            exit(1);
        }

        std::string Code((std::istreambuf_iterator<char>(File)), std::istreambuf_iterator<char>()); // This Is Why c++ Is The Best Look At This *HUMAN* Readable code

        Tokens = GetTokens(Code);
    } 


    //Just For Debugging
    size_t Pos = 0;
    bool DumpLex  = false;
    bool DumpInfo = false;

    while(Pos < argc){
        if(strcmp(argv[Pos], "--dump--lexer") == 0){
            DumpLex = true;
        }else if(strcmp(argv[Pos], "--dump--Info") == 0){
            DumpInfo = true;
        }
        Pos++;
    }
    //------------------


    Interpreter IntClss(Tokens);
    IntClss.Run();

    if(DumpLex == true){
        std::cout << "------------------Lexer------------------\n";
        std::cout << Tokens.size() << '\n';
        for(auto i : Tokens){
            std::cout << "(" << i << ")\n";
        }
    }

    if(DumpInfo == true){
        IntClss.Info();
    }

}
