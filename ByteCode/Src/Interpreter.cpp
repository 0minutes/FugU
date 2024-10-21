#ifndef INTERPRETER_CPP  //Haeder Files Are Boring
#define INTERPRETER_CPP

#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <cstdint>
#include <map>
#include <regex>
#include <sstream>
#include <cmath>

#define pub public:

class Interpreter{
    using InvokeRun = void(Interpreter::*)();

    std::vector<std::string> OpCodes;
    std::map<std::string, size_t> Lables;
    std::vector<std::string> Stack;
    std::map<std::string, std::string> Vars;
    std::vector<size_t> RetStack;
    std::map<size_t, size_t> GetPos;

    size_t Pos = 0;

    std::map<std::string, InvokeRun> Invokes = {
        {"0x00", &Interpreter::ExitProc},
        {"0x01", &Interpreter::Print},
        {"0x02", &Interpreter::Input}
    };

    std::string Eat(){
        auto Tok = OpCodes[Pos];
        Pos++;
        return Tok;
    }


    //-------------INVOKES-------------
    void ExitProc(){
        exit(std::stoul(Stack.back()));
    }

    void Print(){
        std::cout << Stack.back();
        Stack.pop_back();
    }

    void Input(){
        std::string InputVal;
        std::getline(std::cin, InputVal);

        Stack.push_back(InputVal);
    }
    //-----------------------------------


    std::string Number(std::string Number){
        if(Number.substr(0, 2) == "0x" || Number.substr(0, 2) == "0X"){
            uint64_t Val;
            std::stringstream Results; 
            std::stringstream ValStream;
            ValStream << std::hex << Number;
            ValStream >> Val;
            Results << Val;
            return Results.str();
        }
        return Number;
    }

    std::string String(std::string Str){
        std::string NewString;

        size_t indx = 0;
        while(Str.size() > indx){
            if(Str[indx] == '\\'){
                indx++;
                switch(Str[indx]){
                    case 'n':
                        NewString+="\n";
                        break;
                    case 't':
                        NewString+="\t";
                        break;
                }
                indx++;
            }else{
                NewString+=Str[indx];
                indx++;
            }
        }
        return NewString;
    }

    bool IsNumber(std::string& Num){
        std::regex HexPattern("^[0-9a-fA-F]+$");
        if(std::regex_match(Num, HexPattern)){
            return true;
        }
        return false;
    }

    void Eval(std::string OpCode){
        #define push(a) Stack.push_back(a);
        #define Pop() Stack.back(); Stack.pop_back();
        
        if(OpCode == "ipush")
        {
            Eat();
            push(Number(Eat()));
        }
        else if(OpCode == "fpush")
        {
            Eat();

            auto FirstHalf = Number(OpCodes[Pos]); Eat(); 
            auto SecondHalf = Number(OpCodes[Pos]); Eat(); 

            while(SecondHalf.size() != 20){
                SecondHalf+="0";
            }

            push(FirstHalf + "." + SecondHalf);
        }else if(OpCode == "spush")
        {
            Eat();
            push(String(Eat()))

        }else if(OpCode == "npush"){
            Eat();
            Eat();
            push("NULL");
        }
        else if(OpCode == "fadd")
        {
            Eat();
            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            push(std::to_string(std::stod(Op1) + std::stod(Op2)));
        }
        else if(OpCode == "sadd")
        {
            Eat();
            auto Op1 = Pop();
            auto Op2 = Pop();

            push(Op2 + Op1)
        }
        else if(OpCode == "iadd")
        {
            Eat();

            auto Op1 = Pop();
            auto Op2 = Pop();

            bool Op1_Is_UnSinged = (Op1.find("-") == std::string::npos);
            bool Op2_Is_UnSigned = (Op2.find("-") == std::string::npos);

            if(Op1_Is_UnSinged ==  false || Op2_Is_UnSigned == false){
                push(std::to_string(std::stoll(Op1) + std::stoll(Op2)));
            }else{
                push(std::to_string(std::stoull(Op1) + std::stoull(Op2)));
            }
        }
        else if(OpCode == "imin")
        {
            Eat();
            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            bool Op1_Is_UnSinged = (Op1.find("-") == std::string::npos);
            bool Op2_Is_UnSigned = (Op2.find("-") == std::string::npos);

            if(Op1_Is_UnSinged ==  false || Op2_Is_UnSigned == false){
                push(std::to_string(std::stoll(Op1) - std::stoll(Op2)));
            }else{
                push(std::to_string(std::stoull(Op1) - std::stoull(Op2)));
            }
        }
        else if(OpCode == "fmin")
        {
            Eat();
            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            push(std::to_string(std::stod(Op1) - std::stod(Op2)));            
        }else if(OpCode == "smul")
        {
            Eat();
            auto Op1 = Pop(); 
            auto Op2 = Pop();

            auto Number = IsNumber(Op1) ? Op1 : Op2; 
            auto String = IsNumber(Op1) == false ? Op1 : Op2;    

            std::string Str;
            size_t pos = 0;
            while(pos < std::stoll(Number)){
                Str+=String;
                pos++;
            }

            push(Str);
        }
        else if(OpCode == "imul")
        {
            Eat();
            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            bool Op1_Is_UnSinged = (Op1.find("-") == std::string::npos);
            bool Op2_Is_UnSigned = (Op2.find("-") == std::string::npos);

            if(Op1_Is_UnSinged ==  false || Op2_Is_UnSigned == false){
                push(std::to_string(std::stoll(Op1) * std::stoll(Op2)));
            }else{
                push(std::to_string(std::stoull(Op1) * std::stoull(Op2)));
            }

        }
        else if(OpCode == "fmul")
        {
            Eat();
            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            push(std::to_string(std::stod(Op1) * std::stod(Op2)));
        }
        else if(OpCode == "idiv")
        {
            Eat();
            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            bool Op1_Is_UnSinged = (Op1.find("-") == std::string::npos);
            bool Op2_Is_UnSigned = (Op2.find("-") == std::string::npos);

            if(Op1_Is_UnSinged ==  false || Op2_Is_UnSigned == false){
                push(std::to_string(std::stoll(Op1) / std::stoll(Op2)));
            }else{
                push(std::to_string(std::stoull(Op1) / std::stoull(Op2)));
            }
        }
        else if(OpCode == "fdiv")
        {
            Eat();
            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            push(std::to_string(std::stod(Op1) / std::stod(Op2)));
        }
        else if(OpCode == "ipow")
        {
            Eat();

            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            bool Op1_Is_UnSinged = (Op1.find("-") == std::string::npos);
            bool Op2_Is_UnSigned = (Op2.find("-") == std::string::npos);

            if(Op1_Is_UnSinged ==  false || Op2_Is_UnSigned == false){
                push(std::to_string(static_cast<int64_t>(pow(std::stoll(Op1), std::stoll(Op2)))));
            }else{
                push(std::to_string(static_cast<uint64_t>(pow(std::stoull(Op1), std::stoull(Op2)))));
            }            
        }
        else if(OpCode == "fpow")
        {
            Eat();
            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            push(std::to_string(pow(std::stod(Op1), std::stod(Op2))));
        }
        else if(OpCode == "eq")
        {
            Eat();
            auto Op1 = Pop();
            auto Op2 = Pop();
            push(std::to_string(Op1 == Op2));
        }
        else if(OpCode == "neq")
        {   
            Eat();
            auto Op1 = Pop();
            auto Op2 = Pop();
            push(std::to_string(Op1 != Op2));

        }
        else if(OpCode == "gt")
        {
            Eat();
            auto Op1 = Pop();
            auto Op2 = Pop();

            bool IsInt = (Op1.find(".") == std::string::npos);

            if(IsInt == true){
                bool Op1_Is_UnSinged = (Op1.find("-") == std::string::npos);
                bool Op2_Is_UnSigned = (Op2.find("-") == std::string::npos);

                if(Op1_Is_UnSinged ==  false || Op2_Is_UnSigned == false){
                    push(std::to_string(std::stoll(Op1) > std::stoll(Op2)));
                }else{
                    push(std::to_string(std::stoull(Op1) > std::stoull(Op2)));
                }            
            }else{
                push(std::to_string(std::stod(Op1) > std::stod(Op2)));            
            }
        }
        else if(OpCode == "lt")
        {
            Eat();
            auto Op1 = Pop();
            auto Op2 = Pop();

            bool IsInt = (Op1.find(".") == std::string::npos);

            if(IsInt == true){
                bool Op1_Is_UnSinged = (Op1.find("-") == std::string::npos);
                bool Op2_Is_UnSigned = (Op2.find("-") == std::string::npos);

                if(Op1_Is_UnSinged ==  false || Op2_Is_UnSigned == false){
                    push(std::to_string(std::stoll(Op1) < std::stoll(Op2)));
                }else{
                    push(std::to_string(std::stoull(Op1) < std::stoull(Op2)));
                }            
            }else{
                push(std::to_string(std::stod(Op1) < std::stod(Op2)));            
            }
        }
        else if(OpCode == "gteq")
        {
            Eat();
            auto Op1 = Pop();
            auto Op2 = Pop();

            bool IsInt = (Op1.find(".") == std::string::npos);

            if(IsInt == true){
                bool Op1_Is_UnSinged = (Op1.find("-") == std::string::npos);
                bool Op2_Is_UnSigned = (Op2.find("-") == std::string::npos);

                if(Op1_Is_UnSinged ==  false || Op2_Is_UnSigned == false){
                    push(std::to_string(std::stoll(Op1) >= std::stoll(Op2)));
                }else{
                    push(std::to_string(std::stoull(Op1) >= std::stoull(Op2)));
                }            
            }else{
                push(std::to_string(std::stod(Op1) >= std::stod(Op2)));            
            }
        }
        else if(OpCode == "lteq")
        {
            Eat();
            auto Op1 = Pop();
            auto Op2 = Pop();

            bool IsInt = (Op1.find(".") == std::string::npos);

            if(IsInt == true){
                bool Op1_Is_UnSinged = (Op1.find("-") == std::string::npos);
                bool Op2_Is_UnSigned = (Op2.find("-") == std::string::npos);

                if(Op1_Is_UnSinged ==  false || Op2_Is_UnSigned == false){
                    push(std::to_string(std::stoll(Op1) <= std::stoll(Op2)));
                }else{
                    push(std::to_string(std::stoull(Op1) <= std::stoull(Op2)));
                }            
            }else{
                push(std::to_string(std::stod(Op1) <= std::stod(Op2)));            
            }
        }
        else if(OpCode == "and")
        {
            Eat();
            auto Op1 = Pop();
            auto Op2 = Pop();
            push(std::to_string(std::stoi(Op1) == true && std::stoi(Op2) == true));
        }
        else if(OpCode == "or")
        {
            Eat();
            auto Op1 = Pop();
            auto Op2 = Pop();
            push(std::to_string(std::stoi(Op1) == true  || std::stoi(Op2) == true));            
        }
        else if(OpCode == "not")
        {
            Eat();
            auto Op = Pop();
            push(std::to_string(!std::stoi(Op)))
        }
        else if(OpCode == "fmod")
        {
            Eat();
            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            push(std::to_string(fmod(std::stod(Op1),  std::stod(Op2))));            
        }
        else if(OpCode == "imod")
        {
            Eat();

            auto Op1 = Pop(); 
            auto Op2 = Pop(); 

            bool Op1_Is_UnSinged = (Op1.find("-") == std::string::npos);
            bool Op2_Is_UnSigned = (Op2.find("-") == std::string::npos);

            if(Op1_Is_UnSinged ==  false || Op2_Is_UnSigned == false){
                push(std::to_string(std::stoll(Op1) % std::stoll(Op2)));
            }else{
                push(std::to_string(std::stoull(Op1) % std::stoull(Op2)));
            }      
        }
        else if(OpCode == "jz")
        {   
            Eat();
            auto Op = Pop();
            auto JumpTo = Eat();
            if(std::stoi(Op) == 0){
                this->Pos = GetPos[std::stoull(Number(JumpTo))];//Change Later To Reset For EveryLable
            }

        }
        else if(OpCode == "store")
        {
            Eat();
            auto Ident = Eat();
            auto Val = Pop();

            Vars[Ident] = Val;
        }
        else if(OpCode == "load")
        {
            Eat();
            auto Ident = Eat();

            push(Vars[Ident]);
        }
        else if(OpCode == "update")
        {
            Eat();
            auto Ident = Eat();
            auto Val = Pop();

            Vars[Ident] = Val;
        }
        else if(OpCode == "call")
        {
            Eat();
            size_t Ret = Pos;
            auto Calling = Eat();

            auto GetFunc = Lables.find(Calling+":");
            this->Pos = GetFunc->second;

            RetStack.push_back(Ret);
        }
        else if(OpCode == "ret")
        {
            this->Pos = RetStack.back(); RetStack.pop_back();
        }
        else if(OpCode == "invoke")
        {
            Eat();
            auto InvokeName = Eat();
            (this->*(Invokes.find(InvokeName)->second))();
        }
        else{
            Eat();
        }
    }
    
    pub Interpreter(std::vector<std::string>& OpCodes){
        this->OpCodes = OpCodes;
    }

    pub void Run(){
        for(size_t i = 0; i < OpCodes.size(); i++){
            if(OpCodes[i].back() == ':'){
                Lables[OpCodes[i]] = i; 
            }
        }

        auto MainLablePos = Lables.find("main:");
        if(MainLablePos == Lables.end()){
            std::cerr << "Cannot Find Main(Entry Point), Program Terminated"; 
            exit(1);
        }


        size_t Idx = 0;
        size_t LastArea = 0;
        size_t Pc = 0;
        while(Idx < OpCodes.size()){
            if(OpCodes[Idx].back() == ':'){
                LastArea++;
            }
            if(OpCodes[Idx] == ";"){
                GetPos.insert(std::make_pair(Pc, LastArea));
                Pc++;
                LastArea = Idx + 1;
            }
            Idx++;
        }

        //excutions
        this->Pos = MainLablePos->second;
        while(Pos < OpCodes.size()){
            Eval(OpCodes[Pos]);
        }
    }

    pub void Info(){
        std::cout << "------------Stack----------\n";
        for(int i = Stack.size() - 1; i >= 0; --i){
            std::cout << Stack[i] << "\n";
        }

        std::cout << "--------Lables : Addresses---\n";
        for(auto& [key, value] : Lables){
            std::cout << "{\"Name\" : \"" << key << "\", \"Value\" : " << value << "}\n";
        }

        std::cout << "---------------Variables----------\n";
        for(auto& [key, value] : Vars){
            std::cout << "{\"Name\" : \"" << key << "\", \"Value\" : " << value << "}\n";
        }

        std::cout << "---------------Jump Pos----------\n";
        for(auto& [key, value] :  GetPos){
            std::cout << "{\"Name\" : \"" << key << "\", \"Value\" : " << value << "}\n";
        }
    }
};


#endif