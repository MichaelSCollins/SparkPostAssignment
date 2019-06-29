import mongoose from 'mongoose'
import crypto from 'crypto'
const TextSchema = new mongoose.Schema({
  path: {
    type: String
  },
  fileName: {
    type: String
  },
  
  data: {
    type: String
  },
  size: {
    type: Number
  },
  trigramCount: {
    type: Number
  }
})

export default mongoose.model('Text', TextSchema)
