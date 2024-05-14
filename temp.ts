            if (this.listSource[0] in this.unaryBuilders && this.next() in this.unaryBuilders) {
                start = cur;
                let unary = this.eat();
                cur++;
                while (this.listSource.length > 0 && (this.listSource[0] in this.unaryBuilders || this.listSource[0] in this.specialChars)) {
                    unary += this.eat();
                    cur++;
                }
                
                if (!(unary in this.unaryChars)) {
                    return new LexerErr(`Unknown logical expression or operator '${unary}'`, this.makePosition(this.filename, line, start, cur), this.source);
                }
                
                tokens.push(this.makeToken(this.unaryChars[unary], unary, this.makePosition(this.filename, line, start, cur)));
            }