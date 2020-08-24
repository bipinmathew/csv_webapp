from flask import Flask
from flask import render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename
from markupsafe import escape
import os
import json
import pandas as pd

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './uploads/' 

ALLOWED_EXTENSIONS = {'csv'}
def allowed_file(filename):
  return '.' in filename and \
         filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", methods=["GET"])
def run():
  return render_template("index.html")


@app.route("/api/csv", methods=['POST'])
def csv_put():
  if request.method == 'POST':
      # check if the post request has the file part
      if 'file' not in request.files:
          flash('No file part')
          return redirect(request.url)
      file = request.files['file']
      # if user does not select file, browser also
      # submit an empty part without filename
      if file.filename == '':
          return {'status':'failed'},400
      if file and allowed_file(file.filename):
          filename = secure_filename(file.filename)
          file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
          return {'status':'finished'},200


@app.route("/api/csv", methods=['GET'])
def csv_list():
	return {'files': os.listdir(app.config['UPLOAD_FOLDER']) } ,200


@app.route("/api/csv/<filename>", methods=['GET'])
def csv_preview(filename):
  df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], filename))
  df = df.head(10)
  parsed = df.to_json(orient="split")
  return {'csv': parsed},200
 
if __name__ == "__main__":
    app.run(host='0.0.0.0')
