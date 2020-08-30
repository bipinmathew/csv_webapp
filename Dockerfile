FROM ubuntu:18.04
RUN apt-get update -y
RUN apt-get install -y python3-pip
WORKDIR /opt/app
COPY requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt
COPY . ./
RUN mkdir -p ./uploads
ENTRYPOINT ["python3"]
CMD ["run.py"]
