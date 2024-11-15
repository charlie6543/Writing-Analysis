import os

from flask import Flask, request, redirect, url_for, render_template, json
from document import Document
import json

app = Flask(__name__)

@app.route("/", methods=["POST", "GET"])
def init_interface():
  return render_template('home.html')

@app.route('/process', methods=['POST'])
def process():
  data = request.form.get('data')
  # TODO FORMATTING FOR HTML: COPY PASTE SUPPORT
  doc = Document(str(data))
  wordCounts = doc.getWords()
  jsonWC = json.dumps(wordCounts)
  print (jsonWC)
  return wordCounts
