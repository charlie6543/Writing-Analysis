import os

from flask import Flask, request, redirect, url_for

app = Flask(__name__)

@app.route("/", methods=["POST", "GET"])
def init_interface():
  return '''<h1>hello<h1>'''
