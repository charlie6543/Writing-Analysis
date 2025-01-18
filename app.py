import os

from flask import Flask, request, redirect, url_for, render_template, json
from document import Document
import re

app = Flask(__name__)

@app.route("/", methods=["POST", "GET"])
def init_interface():
  return render_template('home.html')

@app.route('/process', methods=['POST'])
def process():
  data = request.form.get('data')
  '''doc = [[]]
  print("hello")
  frags = re.split(r"[.!?,:;-]", data)
  punc = []
  tracker = 0
  for frag in frags:
    tracker += len(frag)
    if(tracker >= len(data)): 
      break
    print(data[tracker])
    punc.append(data[tracker])
    tracker += 1
  doc.append(frags)
  doc.append(punc)
  return doc'''

  doc = Document(str(data))
  wordCounts = doc.getWords()
  print(len(wordCounts))
  return wordCounts