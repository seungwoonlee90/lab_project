from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def main():
    return {"members" : ["member1", "member2", "member3"]}

@app.route('/home')
def home():
    return render_template("index.html")

if __name__ == "__main__" :
    app.run(debug=True)