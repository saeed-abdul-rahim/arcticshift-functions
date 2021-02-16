# Arcticshift Functions

This is the Backend for [Arcticshift Angular](https://github.com/saeed-abdul-rahim/arcticshift-angular)

### Initial Steps
##### Installation
#
```
$ npm i
```

##### Login to Firebase and update project name in file: .firebaserc
#
```
{
  "projects": {
    "default": "<YOUR_FIREBASE_PROJECT>"
  }
}
```

##### Create Shop `Remove or comment out the API after creation`
#
```
curl --location --request POST 'https://<YOUR-CLOUDFUNCTION-URL>/api/v1/shop' \
--header 'Content-Type: application/json' \
--data-raw '{
    "shopId": "<SHOP_ID>",
    "name": "<SHOP_NAME>"
}'
```
##### Create Admin `Remove or comment out the API after creation`
#
```
curl --location --request POST 'https://<YOUR-CLOUDFUNCTION-URL>/api/v1/user/admin' \
--header 'Content-Type: application/json' \
--data-raw '{
    "shopId": "<SHOP_ID>",
    "email": "<YOUR_EMAIL>"
}'
```
###### You will recieve password in your email to login to your admin account.
Go to <YOUR_HOSTING_URL>/admin/login

### Razorpay Config
Get the razorpay `ID`, `Secret` and `Webhook Secret` from razorpay dashboard and execute following command in project:
```
firebase functions:config:set razorpay.webhook="<YOUR_WEBHOOK_SECRET>" razorpay.secret="<YOUR_SECRET_KEY>" razorpay.id="<YOUR_ID>"
```
### Email Config
Email is using OAuth2 setup which requires `ID`, `SECRET`, `Refresh Token`, `Access Token`.
You can set like below
```
firebase functions:config:set gmail.email="<YOUR_EMAIL>" gmail.id="<CLIENT_ID>" gmail.secret="<CLIENT_SECRET>" gmail.refresh="<REFRESH_TOKEN>" gmail.access="<ACCESS_TOKEN>"
```
You can change all settings in /src/config/index.ts
nodemailer settings are in: /src/mail/index.ts

### Deploy Cloud Functions
```
firebase deploy
```

### Project Structure
### src/index.ts
Start of the project

#### src/auth
This folder is for security i.e Admin / Staff / User level access

#### src/config
Global config stored here including path urls and collection names

#### src/controllers
Business Logic of the application

#### src/models
Models / Types of all collections and CRUD operation methods

#### src/mail
Scripts related to mail (Settings and templates)

#### src/payment
Methods for payment Gateway APIs (Razorpay..)

#### src/responseHandler
API Output / response handler

#### src/routes
All the public routes of the API

#### src/storage
Storage related methods (upload / download / delete)

#### src/webhooks
Webhook methods
