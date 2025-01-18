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
        tracker = 0
        for i in temp:
            if len(i) > 0 and i[0] == ' ': # removing whitespace
                i = i[1:]
                tracker += 1
            tracker += len(i)
            if tracker >= len(sent):
                self.frags.append(Fragment(i, '.'))
            else:
                self.frags.append(Fragment(i, sent[tracker]))
                tracker += 1

    def __str__(self):
        return self.sent