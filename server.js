import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import listEndpoints from 'express-list-endpoints'

import productsData from './data/products.json'
import designersData from './data/designers.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/finalproject"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const port = process.env.PORT || 8081
const app = express()

//move this model to a seperate folder
//how to import when schema and model is seperate?
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [2, 'Name is too short']
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 4
  },
  street: {
    type: String,
    required: true
  },
  postalCode: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex'),
    unique: true
  }
})

// mongoose pre-hook executes "this" right before the specified action (param-->save) is executed 
//week 20 lecture 2, 19 minutes in.
//salt adds som variation to the hash function, per user 
userSchema.pre('save', async function(next){
  const user = this

  if (!user.isModified('password')) {
    return next()
  }

  const salt = bcrypt.genSaltSync(10)
  user.password = bcrypt.hashSync(user.password, salt)

  next()
})

const User = mongoose.model('User', userSchema)

const Product = new mongoose.model('Product', {
  name: String,
  price: Number,
  dimensions: String,
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer'
  },
  Category: String
})

const Designer = new mongoose.model('Designer', {
  name: String,
})

const authenticateUser = async (req, res, next) => {
  try {
    const accessToken = req.header('Authorization')
    const user = await User.findOne({ accessToken })
    if (!user) {
      throw 'Login Error'
    }
    req.user = user
    next()
  } catch (error) {
    const errorMessage = 'Try to login again'
    res.status(401).json({ error: errorMessage})
  }
}

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

if (process.env.RESET_DATABASE) {
  const populateDatabase = async () => {
    await Product.deleteMany()
    await Designer.deleteMany()

    let designers = []

    designersData.forEach( async item => {
      const newDesigner = new Designer(item)
      
      designers.push(newDesigner)
      await newDesigner.save()
    })

    productsData.forEach( async productItem => {
      const newProduct = new Product({
        ...productItem,
        designer: designers.find(designer => designer.name === productItem.designer)
      })
      await newProduct.save()
    })
  }
  populateDatabase()
}

// Listing all endpoints
app.get('/', (req, res) => {
  res.send(listEndpoints(app))
})

//signup for new user
app.post('/users', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      street,
      postalCode,
      city,
      phoneNumber
    } = req.body
    const user = await new User({
      name,
      email,
      password,
      street,
      postalCode,
      city,
      phoneNumber
    }).save()
    res.status(200).json({ userId: user._id, accesToken: user.accessToken})
  } catch (error) {
    res.status(400).json({ message: 'Could not sign up user. Please try again.', errors: error})
  }
})

app.post('/sessions', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({ userId: user._id, accessToken: user.accesToken})
    }
  } catch (error) {
    res.status(400).json({ erro: 'Login Failed. Please try again'})
  }
})

app.get('/users/:id/profile', authenticateUser)
app.get('/users/:id/profile', async (req, res) => {
  const testMessage = `${req.user.name}`
  res.status(200).json({testMessage})
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
