# A CSV Web Application 
This program is a simple web based application to upload CSVs, preview their contents, do a simple count aggregation by year on CSVs containing date columns, and download these same CSVs.

## Technologies.
This application was built using Flask for the backend and VueJS for the front end. There is no database involved because it is unnecessary. We are using the file system as a database. The application is packaged using Docker and can be deployed using docker-compose. 

## Installing
After cloning this repo, enter the repo directory and run

```bash
docker-compose up
```

This will start the application listenning on http://localhost:5000.

## Notes

This application is very rudimentary. The following should be kept in mind:

*This application is not meant for "big-data". The entire CSV is, at various points, stored in memory on the server side.

*This application is not designed for concurrent access. It is possible for multiple users to trample on each other if they upload the same CSV for example.

*This application uses the single threaded development webserver that comes with flask. This means only a single instance of the application can run and only a single client can be served at any given time.

