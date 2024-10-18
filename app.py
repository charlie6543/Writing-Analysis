import os

from flask import Flask, request, redirect, url_for

app = Flask(__name__)

def init_interface():
  return '''<h1>hello<h1>'''
