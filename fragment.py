from word import Word

class Fragment:
    def __init__(self, fragment, separator):
        self.separator = separator
        self.fragment = fragment
        temp = fragment.split()
        self.wordNum = len(temp)
        self.words = []
        for i in temp:
            self.words.append(Word(i))
        
    def __str__(self):
        return self.fragment