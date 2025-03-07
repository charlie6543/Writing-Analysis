/*document.querySelector("div[contenteditable]").addEventListener("keydown", formatDoc, event);

function formatDoc(event){
    // problem: backspace
    // problem: duplicate punct
    // problem: copy paste
    let key = event.key;
    let doc = document.querySelector("div[contenteditable");
    switch (key){
        case '!': case '.': case '?':
            doc.textContent += "hi";

    }

}
    

BUGS:
pos is fucked up for word and frag
>> adds extra whitespace at end by adding char at end. for frags, this is the punc
>> no idea for words, that shits fucked
when re-analyzing, words/letters get eaten

word dupes are fucked
also no paragraphs for word dupes

PLAN:
html issues fix?

word graphs
more graphs
analyzing sentence structure?

fiddle with graphs to clean up document getter methods (return object in methods)
fiddle with pos values in fragment, word
deal with extra whitespaces
overhaul ui
> add colors to graphs
add settings + buttons to change analysis

> use api to match stems instead of exact word
>> convert to async/await
>> hide api key
> disclude common words like 'a'

TODO:
protecting against SQL injection: replace with &amp shit ?


highlighting text to only analyze that section

*/
//import key from './env.js';
//console.log(key);

document.getElementById("submit").addEventListener("click", runAnalysis);
document.getElementById("picker").addEventListener("change", unhide);

function format(command, value) {
    document.execCommand(command, false, value);
}

function changeSize(){
    const size = document.getElementById('fontSize').value;
    document.execCommand('fontSize', false, size);
}


class Document {
    constructor(body){
        this.body = body.innerText;
        let paras = this.body.split("\n");
        // in some cases discounts the first paragraph
        this.paragraphs = [];
        let pos = 0;
        if(paras.length == 0){
            this.paragraphs[0] = new Paragraph(this.body, 0);
        }
        for(let i = 0; i < paras.length; i++){
            if(paras[i] != "" && paras[i] != " "){
                let text = paras[i];
                this.paragraphs.push(new Paragraph(text, pos));
                pos += text.length;
            }
        }
        this.paraNum = this.paragraphs.length;
        this.wordNum = this.body.split(" ").length;
    }
    toString(){
        return this.body;
    }
    getSentences(){
        let sents = [];
        for(let i = 0; i < this.paragraphs.length; i++){
            sents.push.apply(sents, this.paragraphs[i].sentences);
        }
        return sents;
    }
    getFragments(){
        let frags = [];
        let sents = this.getSentences();
        for(let i = 0; i < sents.length; i++){
            frags.push.apply(frags, sents[i].fragments);
        }
        return frags;
    }
    getWords(){
        let words = [];
        let frags = this.getFragments();
        for(let i = 0; i < frags.length; i++){
            words.push.apply(words, frags[i].words);
        }
        return words;
    }
    getSentencesPerParagraph(){
        let paraLengths = [];
        for(let i = 0; i < this.paragraphs.length; i++){
            paraLengths.push(this.paragraphs[i].sentNum);
        }
        return paraLengths;
    }
    getFragsPerParagraph(){
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
                    fragLen.push(this.paragraphs[i].sentences[h].fragments[m].length);
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
}

class Paragraph {
    constructor(body, pos) {
        this.body = body.trim();
        this.sentences = [];
        this.pos = pos;
        this.endPos = pos + this.body.length + 1;
        let regex = /[.?!]+/;
        let temp = this.body.split(regex);
        let sentPos = pos;
        this.sentNum = temp.length;

        for(let i = 0; i < temp.length; i++){
            if(temp[i] !== "" && temp[i] !== " "){
                let posInContent = this.body.search(temp[i]);
                let punc = (this.body.charAt(posInContent + temp[i].length));
                if(regex.exec(punc)) temp[i] += punc;
                this.sentences[i] = new Sentence(temp[i] + " ", sentPos);
                sentPos += temp[i].length;
            }
            else{
                this.sentNum--;
            }
        }
        this.wordNum = this.body.split(" ").length;
    }
    toString(){
        return this.body;
    }
    getFragments(){
        let frags = [];
        for(let i = 0; i < this.sentences.length; i++){
            frags.push.apply(frags, this.sentences[i].fragments);
        }
        return frags;
    }
    getWords(){
        let words = [];
        let frags = this.getFragments();
        for(let i = 0; i < frags.length; i++){
            words.push.apply(words, frags[i].words);
        }
        return words;
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
            sentWords.push(this.sentences[i].length);
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
    constructor(content, pos){
        this.content = content;
        this.fragments = [];
        let regex = /[,;:-]/;
        let temp = this.content.trim().split(regex);

        this.pos = pos;
        this.endPos = pos + this.content.length;
        let fragPos = pos;
        for(let i = 0; i < temp.length; i++){
            let posInContent = this.content.search(temp[i]);
            let punc = (this.content.charAt(posInContent + temp[i].length));
            if(regex.exec(punc)) temp[i] += punc;
            this.fragments[i] = new SentenceFragment(temp[i] + " ", fragPos);
            fragPos += temp[i].length;
        }
        this.fragNum = temp.length;
        this.length = this.content.split(" ").length;
    }
    toString(){
        return this.content;
    }
    getWords(){
        let words = [];
        for(let i = 0; i < this.fragNum; i++){
            words.push.apply(words, this.fragments[i].words);
        }
        return words;
    }
}


class SentenceFragment{
    constructor(content, pos){
        this.content = content;
        this.words = [];
        let temp = this.content.trim().split(" ");
        this.pos = pos;
        this.endPos = pos + content.length;
        let wordPos = pos;
        for(let i = 0; i < temp.length; i++){
            this.words[i] = new Word(temp[i] + " ", wordPos);
            wordPos += temp[i].length;
        }
        this.length = temp.length;
    }
    toString(){
        return this.content;
    }
}

class Word{
    constructor(word, pos){
        this.word = word;
        this.length = word.length;
        this.pos = pos;
        this.endPos = pos + this.length;
        this.stems = [];
        // probably the problem is that the word dup finder is being run
        // before the fetch finishes, thus stems is still uninitialized
        /*fetch('https://www.dictionaryapi.com/api/v3/references/collegiate/json/' + word + '?key' + apiKey)
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
        });*/
        //console.log(this)
    }
    toString(){
        return this.word;
    }
}




function openGraphs(event, tabName){
    var i, tabcontent, tablinks;
    
    tabcontent = document.getElementsByClassName("tabcontent");
    for(i = 0; i < tabcontent.length; i++){
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for(i = 0; i < tablinks.length; i++){
        tablinks[i].className = tablinks[i].className.replace("  active", "");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += "  active";
}

function runAnalysis(){
    let docVal = document.getElementById('editor');
    let value = docVal.textContent;
    let doc = new Document(docVal);
    updateCharts(doc);
    let highlightBy = document.getElementById("picker").value;
    if(highlightBy == "dup"){
        findDup(doc, document.getElementById("prox").value);
    }
    else{
        addColors(value, doc, highlightBy);
    }
}
function unhide(){
    if(document.getElementById("picker").value == "dup"){
        document.getElementById("dupPicker").classList.remove("hidden");
    }
    else{
        document.getElementById("dupPicker").classList.add("hidden");
    }
}

// TODO: change cases for each color
// depending on highlightBy/ user settings
function addColors(value, doc, highlightBy){
    let offset = 0;
    let newDoc = "";
    for(let i = 0; i < doc.paragraphs.length; i++){
        let para = "<div>";
        let analysis = [];
        switch(highlightBy){
            case "paragraph": 
                // TODO
                analysis = doc.paragraphs;
                break;
            case "sentence":
                analysis = doc.paragraphs[i].sentences;
                break;
            case "frag":
                analysis = doc.paragraphs[i].getFragments();
                break;
            case "words":
                analysis = doc.paragraphs[i].getWords();
                break;
        }
        for(let n = 0; n < analysis.length; n++){
            let color = '<mark style="background-color: ';
            let cur = analysis[n];
            let sentLength = cur.length;
            switch(sentLength){
                case 0: case 1: case 2: case 3: case 4: case 5:
                    color += "rgb(213, 236, 184)";
                    break;
                case 6: case 7: case 8:
                    color += "rgb(184, 236, 206)";
                    break;
                case 9: case 10: case 11:
                    color += "rgb(184, 236, 235)";
                    break;
                case 12: case 13: case 14:
                    color += "rgb(184, 204, 236)";
                    break;
                case 15: case 16: case 17:
                    color += "rgb(189, 184, 236)";
                    break;
                case 18: case 19: case 20:
                    color += "rgb(214, 184, 236)";
                    break;
                default:
                    color += "rgb(248, 171, 255)";
            }
            color += ';">';
            // add to start of sentence
            let start = cur.pos + offset;
            let end = cur.endPos + offset - 1;
            let sent = value.substring(start, end);
            para += color + sent + "</mark>" + value.charAt(end);
            //offset += 59;
        }
        para += "</div>";
        // todo some issues with whitespace/punctuation/etc being removed (whitespace for spaces, etc)
        newDoc += para;
    }
    document.getElementById('editor').innerHTML = newDoc;
}


function updateCharts(body){
    updateChart(wordPerSentChart, body.getWordsPerSentence());
    updateChart(letterPerWordChart, body.getLettersPerWord());
    updateChart(sentPerParaChart, body.getSentencesPerParagraph());
    updateChart(wordPerParaChart, body.getWordsPerParagraph());
    updateChart(fragPerParaChart, body.getFragsPerParagraph());
    updateChart(fragPerSentChart, body.getFragsPerSentence());
    updateChart(wordPerFragChart, body.getWordsPerFrag());
}

function updateChart(chart, data){
    chart.data.labels = data;
    chart.data.datasets.forEach((dataset) => {dataset.data = data});
    chart.update();
}

function findDup(doc, prox){
    // look for duplicates within prox
    // maintain dict of words
    // maintain pos of words, put in word class?
    // maintain counter of sentences in dictionary
    // if counter > prox, do not mark as dup
    
    let count = 0;
    let dict = {};
    // maintain pos of words? in dict, have array of all pos
    //console.log("FIND DUP: " + doc.paragraphs);
    for(let i = 0; i < doc.paraNum; i++){
        for(let n = 0; n < doc.paragraphs[i].sentNum; n++){
            count++;
            let words = doc.paragraphs[i].sentences[n].getWords();
            for(let h = 0; h < words.length; h++){
                let word = words[h];
                if(dict.hasOwnProperty(word.word)){
                    dict[word.word].push(word); // words[h].stems[0]
                }
                else{
                    let arr = [word];
                    dict[word.word] = arr;
                }
            }
        }
    }
    let value = doc.body;
    for(let key in dict){
        let dupes = dict[key];
        if(dupes.length <= 1){
            delete dict[key];
            continue;
        }

        let offset = 0;
        // TODO PROBLEM:: HTML ERASED
        for(let i = 0; i < dupes.length - 1; i++){
            let dupe1 = dupes[i];
            let dupe2 = dupes[i + 1];
            //console.log(`dupe1: ${dupe1} dupe2: ${dupe2} diff: ${dupe2.pos - dupe1.endPos} while prox=${prox}`);
            if(dupe2.pos - dupe1.endPos <= prox){
                // add to start of sentence
                let start = dupe1.pos + offset;
                let end = dupe1.endPos + offset;
                let before = value.substring(0, start);
                let sent = value.substring(start, end);
                let after = value.substring(end);
                value = before + "<u>" + sent + "</u>" + after;
                offset += 7;

                start = dupe2.pos + offset;
                end = dupe2.endPos + offset;
                before = value.substring(0, start);
                sent = value.substring(start, end);
                after = value.substring(end);
                value = before + "<u>" + sent + "</u>" + after;
                offset += 7;
            }
            
        }
        
    }
    document.getElementById('editor').innerHTML = value;
    // iterate thru dict, remove all with only one entry
    // compare proximity between entries
    // if prox less than a certain amount, highlihgt
}