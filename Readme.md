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
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
```
- Install dependencies
```
npm install
```

## Run Backend
```
npm start
```