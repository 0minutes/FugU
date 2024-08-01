#include <iostream>
#include "shared.hpp"

using std::cout;

int main(int argc, char* argv[])
{
    
    if (argc > 2)
    {
        cout << "usage: " << argv[0] << " [filepath]";
        cout << "Fatal Error: Expected a filepath";
        exit(1);
    };

    

    return 0;
}