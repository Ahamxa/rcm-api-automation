
# RCM API AUTOMATION

This project is a Node.js API service designed to handle the backend operations of an application (RCM Software). It connects to a database using the provided credentials and serves data on the specified port.

The service was developed using Node.js v20.17.0 and is set up to connect to an Oracle database.




## Requirements

1) Node.js v20.17.0 (Make sure you have the correct version installed)

2) npm (Comes bundled with Node.js)

3) Database: Ensure the database connection string and credentials are valid and accessible.

    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

DB_USER=pcaresp
DB_PASSWORD=pcaresp
DB_CONNECT_STRING=47.185.218.230:1521/pcarespdb

PORT=5000
VERSION=1.3


## Environment Setup

Go to the project directory

```bash
  cd rcm-api-automation
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```


## Accessing the api

Once the service is running, the API will be accessible at:

`http://localhost:5000`

You can verify the API by checking the ipaddress endpoint (replace localhost with the actual IP or domain in a staging/production environment):

`curl http://localhost:5000/ipaddress`

It should return the ip address of your device


