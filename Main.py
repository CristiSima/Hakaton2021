from flask import Flask, render_template, request, redirect, make_response, send_from_directory
import Constants
import json

async_mode = None
app = Flask(__name__)
app.config['SECRET_KEY'] = '9f962e1ffa116b1becfdf2581129012f71792a53a9493bb2ce466a4d32ef720f68974042066266ba4a948bed48d4d275bd21e49cbc39044000840d1da571368a'


@app.route('/')
def send_js():
    return render_template('index.html', API_KEY=API_KEY)

@app.route('/original')
def original():
    return render_template('original.html', API_KEY=API_KEY)

@app.route('/test')
def test():
    return render_template('sliding_menu.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory("static",'favicon.ico')

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0")
