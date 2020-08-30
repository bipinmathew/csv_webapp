FROM ubuntu:18.04
RUN apt-get update -y
RUN apt-get install -y python3-pip
WORKDIR /opt/app
COPY requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt
COPY . ./
RUN mkdir -p ./uploads

RUN apt-get install -y npm
RUN npm install -g browserify
RUN npm install --package-lock
RUN browserify -o static/js/build.js main.js


ENTRYPOINT ["python3"]
CMD ["run.py"]
