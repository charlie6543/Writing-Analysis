import os

from flask import Flask, request, redirect, url_for, render_template

app = Flask(__name__)

@app.route("/", methods=["POST", "GET"])
def init_interface():
  return render_template('home.html')
