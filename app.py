import os

from flask import Flask, request, redirect, url_for, render_template, json

app = Flask(__name__)

@app.route("/", methods=["POST", "GET"])
def init_interface():
  print('hi')
  return render_template('home.html')

@app.route('/process', methods=['POST'])
def process():
  data = request.form.get('data')
  print(data)
  return str(data)