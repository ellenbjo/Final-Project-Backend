import mongoose from 'mongoose'

const Designer = new mongoose.model('Designer', {
  name: String,
})
 
export default Designer
