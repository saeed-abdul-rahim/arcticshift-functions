import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp();

import express from 'express'
import cors from 'cors'

import { routes } from './routes'
import { supportRoute } from './config/db';
import { createUserDb } from './controllers/user'
import { sendSupportMessage } from './controllers/support'
import { generateThumbnails } from './controllers/storage';

const app = express()
app.use(express.json())
app.use(cors({ origin: true }))
routes(app)

export const authOnCreate = functions.auth.user().onCreate(createUserDb)

export const onFileUpload = functions.storage
    .object()
    .onFinalize(async object => {
        if (object.contentType && object.contentType.includes('image')) {
            return generateThumbnails(object)
        } else {
            return false
        }
})

export const support = functions.region('asia-east2').firestore
    .document(`${supportRoute}/{addKey}`)
    .onCreate(snap => {
        return sendSupportMessage(snap)
})

export const api = functions.region('asia-east2').https.onRequest(app)
