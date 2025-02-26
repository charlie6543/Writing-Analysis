

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
        this.body = body.trim();
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
    getSentencesPerParagraph(){
        let paraLengths = [];
        for(let i = 0; i < this.paragraphs.length; i++){
            paraLengths.push(this.paragraphs[i].sentNum);
        }
        return paraLengths;
    }
    getFragsPerParagraph(){
        // todo currently returns in sentence
        let fragParas = [];
        for(let i = 0; i < this.paragraphs.length; i++){
            fragParas = fragParas.concat(this.paragraphs[i].getFragNums());
        }
        return fragParas;
    }
    getWordsPerParagraph(){
        let paraLengths = [];
        for(let i = 0; i < this.paragraphs.length; i++){
            paraLengths.push(this.paragraphs[i].wordNum);
        }
        return paraLengths;
    }
    getFragsPerSentence(){
        let frags = [];
        for(let i = 0; i < this.paragraphs.length; i++){
            frags = frags.concat(this.paragraphs[i].getFragNums());
        }
        return frags;
    }
    getWordsPerSentence(){
        let wordCounts = [];
        for (let i = 0; i < this.paragraphs.length; i++){
            wordCounts = wordCounts.concat(this.paragraphs[i].getSentenceLengths());
        }
        return wordCounts;
    }
    getWordsPerFrag(){
        let fragLen = [];
        for(let i = 0; i < this.paragraphs.length; i++){
            for(let h = 0; h < this.paragraphs[i].sentences.length; h++){
                for(let m = 0; m < this.paragraphs[i].sentences[h].fragments.length; m++){
                    fragLen.push(this.paragraphs[i].sentences[h].fragments[m].wordNum);
                    
                    //console.log(this.paragraphs[i].sentences[h].fragments[m].wordNum);
                }
            }
        }
        return fragLen;
    }
    getLettersPerWord(){
        let wordLengths = [];
        for (let i = 0; i < this.paragraphs.length; i++){
            wordLengths = wordLengths.concat(this.paragraphs[i].getWordLengths());
        }
        return wordLengths;
    }
    // choices:
    // -sentences in paragraph
    // -fragments in paragraph ?
    // -words in paragraphs
    // -fragments in sentence
    // words in sentence
    // --words in fragments
    // letters in words
}

class Paragraph {
    // return object ? parse lengths in document level? todo
    constructor(body) {
        this.body = body.trim();
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
    // get fragments in sentences
    getFragNums(){
        let frags = [];
        for(let i = 0; i < this.sentNum; i++){
            frags.push(this.sentences[i].fragNum);
        }
        return frags;
    }
    // return words in sentences
    getSentenceLengths(){
        let sentWords = [];
        for(let i = 0; i < this.sentNum; i++){
            sentWords.push(this.sentences[i].wordNum);
        }
        return sentWords;
    }
    // return letters in words
    getWordLengths(){
        let wordLens = [];
        for(let i = 0; i < this.sentences.length; i++){
            for(let h = 0; h < this.sentences[i].fragments.length; h++){
                for(let n = 0; n < this.sentences[i].fragments[h].words.length; n++){
                    wordLens.push(this.sentences[i].fragments[h].words[n].length);
                }
            }
        }
        return wordLens;
    }
}

class Sentence{
    constructor(content){
        this.content = content.trim();
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
    getWords(){
        let words = [];
        for(let i = 0; i < this.fragNum; i++){
            for(let n = 0; n < this.fragments[i].wordNum; n++){
                words.push(this.fragments[i].words[n]);
            }
        }
        return words;
    }
}


class SentenceFragment{
    // todo extra whitespace: dead word?
    constructor(content){
        this.content = content.trim();
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
        console.log(word);
        this.word = word;
        this.length = word.length;
        this.stems = [];
        fetch('https://www.dictionaryapi.com/api/v3/references/collegiate/json/' + word + '?key=cbe3146d-2936-4b82-9a89-55dc60c2ef67')
        .then(response => {
            if (response.ok) {
                return response.json(); // Parse the response data as JSON
            } else {
                throw new Error('API request failed');
            }
        })
        .then(data => {
            // Process the response data here
            //console.log(data);
            this.stems = this.stems.concat(data[0]["meta"]["stems"]);
            //console.log(this.stems[0]);
        })
        .catch(error => {
            // Handle any errors here
            //console.error(error);
            this.stems[0] = this.word;
            //console.log("error " + this.stems)
        });
        console.log(this)
    }
    toString(){
        return this.word;
    }
}