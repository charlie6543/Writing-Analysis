from fragment import Fragment
import re

class Sentence:
    def __init__(self, sent):
        self.sent = sent
        self.wordNum = sent.count(' ') + 1
        # todo account for additional spaces and such
        temp = re.split(r"[;,:-]", self.sent)
        # todo account for "" and ()
        self.frags = []
        for i in temp:
            if len(i) > 0 and i[0] == ' ': # removing whitespace
                i = i[1:]
            self.frags.append(Fragment(i))

    def __str__(self):
        return self.sent