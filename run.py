from flask import Flask, Response, send_file
from flask import render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename
from markupsafe import escape
import os
import json
import pandas as pd

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './uploads/' 



@app.route("/", methods=["GET"])
def run():
  return render_template("index.html")


def construct_response(status,body,msg="Transacton completed successfully"):
  d = {}
  d['msg'] = msg
  d['body'] = body
  response = Response(json.dumps(d),status=status)
  return response
	

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
          return construct_response(400,{},msg="Failed to obtain filename during upload.")
      if file:
          filename = secure_filename(file.filename)
          file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
          return construct_response(200,{})


@app.route("/api/csv", methods=['GET'])
def csv_list():
  return construct_response(200,{'files': os.listdir(app.config['UPLOAD_FOLDER']) })


@app.route("/api/csv/<filename>", methods=['GET'])
def csv_preview(filename):
	start = 0
	get = 10
	v=request.args.get('start')
	if(v):
		start = int(v)
	v=request.args.get('get')
	if(v):
		get = int(v)
	df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], filename))
	num_rows = len(df.index)
	end = min(start+get,num_rows)
	df = df.iloc[start:end]
	df['state'].fillna('BLANK',inplace=True)
	parsed = df.to_dict(orient="split")
	parsed['total'] = num_rows
	return construct_response(200,parsed)


@app.route("/api/csv/<filename>/download", methods=['GET'])
def csv_download(filename):
	try:
		fp = open(os.path.join(app.config['UPLOAD_FOLDER'], filename),'rb')
	except:
		return construct_response(404,{},"""Could not retrieve file %s"""%(filename))
	return send_file(fp,attachment_filename=filename, as_attachment=True )

@app.route("/api/csv/<filename>/stats", methods=['GET'])
def csv_stats(filename):
  df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], filename))
  df['date'] = pd.to_datetime(df['date'])
  zz = df['date'].groupby(df.date.dt.year).agg('count').to_frame(name="count")
  zz['year'] = zz.index
  return construct_response(200,zz.to_json(orient="split"))

 
if __name__ == "__main__":
    app.run(host='0.0.0.0')
