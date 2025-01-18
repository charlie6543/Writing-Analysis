function format(command, value) {
    document.execCommand(command, false, value);
}

function changeSize(){
    const size = document.getElementById('fontSize').value;
    document.execCommand('fontSize', false, size);
}


class Document {
    constructor(body){
        this.body = body;
        this.paragraphs = [];
        let temp = this.body.split('/n');
        for(let i = 0; i < temp.length; i++){
            this.paragraphs[i] = new Paragraph(temp[i]);
        }
        this.paraNum = temp.length;
        this.wordNum = this.body.split(" ").length;
    }
    toString(){
        return this.body;
    }
    getSentLengths(){
        let wordCounts = [];
        for (let i = 0; i < this.paragraphs.length; i++){
            for(let n = 0; n < this.paragraphs[i].sentences.length; n++){
                wordCounts.push(this.paragraphs[i].sentences[n].wordNum);
            }
        }
        return wordCounts;
    }
}

class Paragraph {
    constructor(body) {
        this.body = body;
        this.sentences = [];
        let temp = this.body.split(/[.?!]+/);
        for(let i = 0; i < temp.length; i++){
            this.sentences[i] = new Sentence(temp[i]);
        }
        this.sentNum = temp.length;
        this.wordNum = this.body.split(" ").length;
    }
    toString(){
        return this.body;
    }
}

class Sentence{
    constructor(content){
        this.content = content;
        this.fragments = [];
        let temp = this.content.split(/[,;:-]+/);
        for(let i = 0; i < temp.length; i++){
            this.fragments[i] = new SentenceFragment(temp[i]);
        }
        this.fragNum = temp.length;
        this.wordNum = this.content.split(" ").length;
    }
    toString(){
        return this.content;
    }
}


class SentenceFragment{
    // todo extra whitespace: dead word?
    constructor(content){
        this.content = content;
        this.words = [];
        let temp = this.content.split(" ");
        for(let i = 0; i < temp.length; i++){
            this.words[i] = new Word(temp[i]);
        }
        this.wordNum = temp.length;
    }
    toString(){
        return this.content;
    }
}

class Word{
    constructor(word){
        this.word = word;
    }
    toString(){
        return this.word;
    }
}