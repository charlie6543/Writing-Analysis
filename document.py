from sentence import Sentence
import re

class Document:

    def __init__(self, body):
        self.body = body
        temp = re.split(r"[.!?]", body)
        self.sentences = []
        for i in temp:
            if len(i) > 0 and i[0] == ' ': # removing whitespace
                i = i[1:]
            self.sentences.append(Sentence(i))

    def __str__(self):
        return self.body

    def getWords(self):
        wordCounts = []
        for i in self.sentences:
            wordCounts.append(i.wordNum)
        return wordCounts
        #return self.sentences

    def getStruct(self):
        structures = []
        for sentence in self.sentences:
            punc = ""
            for fragment in sentence:
                punc += fragment.separator
            print(punc)
            structures.append(punc)

