/*
BUGS:
when re-analyzing, words/letters get eaten

PLAN:
change color variation so it makes more sense for things like paragraphs

add settings + buttons to change analysis
fix bugs when re-analyzing

word graphs
more graphs
analyzing sentence structure?

fiddle with graphs to clean up document getter methods (return object in methods)

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
            paraLengths.push(this.paragraphs[i].length);
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
        this.length = temp.length;

        for(let i = 0; i < temp.length; i++){
            if(temp[i] !== "" && temp[i] !== " "){
                let posInContent = this.body.search(temp[i]);
                let punc = (this.body.charAt(posInContent + temp[i].length));
                if(regex.exec(punc)) temp[i] += punc;
                this.sentences[i] = new Sentence(temp[i] + " ", sentPos);
                sentPos += temp[i].length;
            }
            else{
                this.length--;
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
        for(let i = 0; i < this.length; i++){
            frags.push(this.sentences[i].fragNum);
        }
        return frags;
    }
    // return words in sentences
    getSentenceLengths(){
        let sentWords = [];
        for(let i = 0; i < this.length; i++){
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
        if(content.charAt(0) == " "){
            fragPos++;
        }
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
        if(content.charAt(0) == " "){
            wordPos++;
        }
        for(let i = 0; i < temp.length; i++){
            this.words[i] = new Word(temp[i] + " ", wordPos);
            wordPos += this.words[i].length;
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
        this.content = word.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '');
        this.content = this.content.replace(" ", "");
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
        tablinks[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");
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
                analysis = "";
                let color = '<mark style="background-color: ';
                let cur = doc.paragraphs[i];
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
                para += color + sent + "</mark>";
                para += "</div>";
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
        // console.log(`${analysis}`);
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
            // console.log(`start: ${start} end: ${end} offset: ${offset}`);
            // console.log(`value: -${value}- sent: -${sent}-`);
            if(value.charAt(end) == "." || value.charAt(end) == " ")
                para += color + sent + "</mark>" + value.charAt(end);
            else 
                para += color + sent + "</mark>";
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
    let colors = [];
    for(let i = 0; i < data.length; i++){
        switch(data[i]){
            case 0: case 1: case 2: case 3: case 4: case 5:
                colors.push("rgb(213, 236, 184)");
                break;
            case 6: case 7: case 8:
                colors.push("rgb(184, 236, 206)");
                break;
            case 9: case 10: case 11:
                colors.push("rgb(184, 236, 235)");
                break;
            case 12: case 13: case 14:
                colors.push("rgb(184, 204, 236)");
                break;
            case 15: case 16: case 17:
                colors.push("rgb(189, 184, 236)");
                break;
            case 18: case 19: case 20:
                colors.push("rgb(214, 184, 236)");
                break;
            default:
                colors.push("rgb(248, 171, 255)");
        }
    }
    chart.data.datasets.forEach((dataset) => {dataset.backgroundColor = colors});
    chart.update();
}

let colors = ['rgb(213, 236, 184)', 'rgb(184, 236, 206)', 
    'rgb(184, 236, 235)', 'rgb(184, 204, 236)', 
    'rgb(189, 184, 236)', 'rgb(214, 184, 236)', 
    'rgb(248, 171, 255)', 'rgb(252, 161, 228)',
    'rgb(237, 155, 182)', 'rgb(245, 167, 168)',
    'rgb(245, 187, 146)', 'rgb(245, 222, 146)',
    'rgb(232, 245, 146)' ];
function findDup(doc, prox){
    // look for duplicates within prox
    // maintain dict of words
    // maintain pos of words, put in word class?
    // maintain counter of sentences in dictionary
    // if counter > prox, do not mark as dup
    
    let count = 0;
    let dict = {};
    let offset = 0;
    // maintain pos of words? in dict, have array of all pos
    //console.log("FIND DUP: " + doc.paragraphs);
    for(let i = 0; i < doc.paraNum; i++){
        for(let n = 0; n < doc.paragraphs[i].length; n++){
            count++;
            let words = doc.paragraphs[i].sentences[n].getWords();
            for(let h = 0; h < words.length; h++){
                let word = words[h];
                if(dict.hasOwnProperty(word.content)){
                    dict[word.content].push(word); // words[h].stems[0]
                }
                else{
                    let arr = [word];
                    dict[word.content] = arr;
                }
            }
        }
    }

    // go through dict and sort in order of pos
    let posDict = {};
    let colorI = 0;
    for(let key in dict){
        let dupes = dict[key];
        if(dupes.length <= 1){
            delete dict[key];
            continue;
        }
        for(let i = 0; i < dupes.length - 1; i++){
            let dupe1 = dupes[i];
            let dupe2 = dupes[i + 1];
            if(dupe2.pos - dupe1.endPos <= prox){
                posDict[dupe1.pos] = [colors[colorI], dupe1];
                posDict[dupe2.pos] = [colors[colorI], dupe2];
            }
        }
        colorI++;
        if(colorI > colors.length) colorI = colorI % colors.length;
    }

    let value = doc.body;
    value = value.replace("\n", "");
    let paraEnds = [];
    for(let i = 0; i < doc.paragraphs.length; i++){
        paraEnds.push(doc.paragraphs[i].endPos - 1);
    }
    //console.log(paraEnds);
    let par = 0;
    for(let key in posDict){
        let dupe = posDict[key][1];
        //console.log(`adding underlines for word ${dupe} at pos: ${dupe.pos + offset} and endPos: ${dupe.endPos + offset} while paraend: ${paraEnds[par] + offset}`);
        if(dupe.pos + offset >= paraEnds[par] + offset){
            let paraEnd = paraEnds[par] + offset;
            //console.log(`start: ${dupe.pos + offset} end: ${dupe.endPos + offset} and paraEnd: ${paraEnd}`)
            let before = value.substring(0, paraEnd);
            let after = value.substring(paraEnd);
            //console.log(`before: ${before} and end: ${after}`);
            value = '<p>' + before + "</p>" + after;
            offset += 8;
            //console.log(`start: ${dupe.pos + offset} end: ${dupe.endPos + offset} and paraEnd: ${paraEnds[par] + offset}`)
            par++;
        }
        let start = dupe.pos + offset;
        let end = dupe.endPos + offset - 1;
        let before = value.substring(0, start);
        let sent = value.substring(start, end);
        let after = value.substring(end);
        //console.log(`pos: start ${start} and end ${end} with offset ${offset}`);
        //console.log(`before: ${before} sent: ${sent} and after: ${after}`);
        
        let color = '<mark style="background-color: ' + posDict[key][0] + ';">';
        value = before + color + sent + "</mark>" + after;
        offset += color.length + 7;
        //console.log(value);

        /*value = before + "<u>" + sent + "</u>" + after;

        console.log(value);
        offset += 7;*/
    }

    document.getElementById('editor').innerHTML = value;
}