class Word:
    def __init__(self, word):
        self.word = word
        self.length = len(word)

    def __str__(self):
        return self.word