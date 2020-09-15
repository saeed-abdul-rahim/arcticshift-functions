import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp();

import * as express from 'express'
import * as cors from 'cors'
import { routes } from './routes'

import { supportRoute } from './config/db';
import { sendSupportMessage } from './controllers/support'

const app = express()
app.use(express.json())
app.use(cors({ origin: true }))
routes(app)

export const support = functions.region('asia-east2').firestore
.document(`${supportRoute}/{addKey}`)
.onCreate(snap => {
    return sendSupportMessage(snap)
})

export const api = functions.region('asia-east2').https.onRequest(app)
