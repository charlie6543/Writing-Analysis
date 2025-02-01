function format(command, value) {
    document.execCommand(command, false, value);
}

function changeSize(){
    const size = document.getElementById('fontSize').value;
    document.execCommand('fontSize', false, size);
}


class Document {
    constructor(body){
        this.self = this;
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
    getWords(){
        let frags = this.getFragments();
        let ret = [];
        for(let i = 0; i < frags.length; i++){
            ret.push(frags.words);
        }
        return ret;
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
    getWordLengths(){
        let wordLengths = [];
        for (let i = 0; i < this.paragraphs.length; i++){
            for(let n = 0; n < this.paragraphs[i].sentences.length; n++){
                for(let h = 0; h < this.paragraphs[i].sentences[n].fragments.length; h++){
                    for(let j = 0; j < this.paragraphs[i].sentences[n].fragments[h].words.length; j++){
                        let word = this.paragraphs[i].sentences[n].fragments[h].words[j];
                        wordLengths.push(word.length);
                    }
                }
            }
        }
        for(let h = 0; h < wordLengths.length; h++){
            console.log(wordLengths[h]);
        }
        return wordLengths;
    }
    getParagraphSents(){
        paraLengths = [];
        for(let i = 0; i < this.paragraphs.length; i++){
            paraLengths = paragraphs[i].sentences.length;
        }
        return paraLengths;
    }
    getParagraphWords(){
        paraLengths = [];
        for(let i = 0; i < this.paragraphs.length; i++){
            let words = 0
            for(let n = 0; n < this.paragraphs[i].sentences.length; n++){
                for(let h = 0; h < this.paragraphs[i].sentences[n].fragments.length; h++){
                    for(let j = 0; j < this.paragraphs[i].sentences[n].fragments[h].words; j++){
                        words++;
                    }
                }
            }
            paraLengths.push(words);
        }
        return paraLengths;
    }
    // choices:
    // words in sentence
    // letters in words
    // sentences in paragraph
    // fragments in sentence
    // words in paragraphs
    // words in fragments
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
        this.length = word.length;
    }
    toString(){
        return this.word;
    }
}