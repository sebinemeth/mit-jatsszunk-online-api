import * as functions from 'firebase-functions'
import * as express from 'express'
import { addEntry } from './entryController'

const api = express()

api.get('/', (req, res) => res.status(200).send('mitjatsszunk.online api'))
api.post('/entries', addEntry)

exports.app = functions.https.onRequest(api)