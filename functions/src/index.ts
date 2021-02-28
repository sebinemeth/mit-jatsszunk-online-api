import * as functions from 'firebase-functions'
import * as express from 'express'
import { addEntry } from './entryController'

const app = express()

app.get('/', (req, res) => res.status(200).send('mitjatsszunk.online api'))
app.post('/entries', addEntry)

exports.api = functions.https.onRequest(app)