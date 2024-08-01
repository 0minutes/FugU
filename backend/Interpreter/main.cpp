#include <iostream>
#include <vector>
#include <fstream>
#include <string>
#include "shared.hpp"

using std::cout;
using std::vector;

vector<uint8_t> readBytes(std::string &filepath)
{
    std::vector<uint8_t> bytes;
    std::ifstream file(filepath, std::ios::binary);

    if (!file)
    {
        cout << "Unable to open the file " << filepath << "\n";
        exit(1);
    }

    uint8_t byte;

    while (file.read(reinterpret_cast<char*>(&byte), sizeof(byte)))
    {
        bytes.push_back(byte);
    }

    return bytes;
}


int main(int argc, char* argv[])
{
    
    if (argc > 2)
    {
        cout << "usage: " << argv[0] << " [filepath]";
        cout << "Fatal Error: Expected a filepath";
        exit(1);
    }

    else
    {
        std::string filepath = argv[1];
        vector<uint8_t> bytes;

        bytes = readBytes(filepath);

        for (uint8_t byte : bytes)
        {
            std::cout << static_cast<int>(byte) << "\n";
        };
        
    };

    return 0;
}