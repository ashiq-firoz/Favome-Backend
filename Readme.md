# Favome Backend

## Stack
- Node.js
- Express.js

### Setting up
- Create a .env file with fields : 
```
PORT=
MERCHANT_ID=
PHONE_PE_HOST_URL=  #phonepe url to start transaction
STATUS_URL= #phonepe url to check payment status
SALT_INDEX=  #phonepe salt index
SALT_KEY=  #phonepe salt key
BACKEND_URL=
SUCCESS_URL=
FAILED_URL=
MAILSERVER_URL=
NOTIFICATION_URL=
```
- Install dependencies
```
npm install
```

## Run Backend
```
npm start
```