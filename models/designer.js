import mongoose from 'mongoose'

const Designer = new mongoose.model('Designer', {
  name: String,
  imageUrl: String
})
 
export default Designer
