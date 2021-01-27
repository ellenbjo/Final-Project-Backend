import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import listEndpoints from 'express-list-endpoints'

import productsData from './data/products.json'
import designersData from './data/designers.json'
import Product from './models/product'
import Designer from './models/designer'
import Order from './models/order'

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
    minlength: [2, 'Name has to be at least 2 characters long']
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
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
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

//------------- Authentication ---------------
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
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ message: 'Could not sign up user. Please try again.', errors: error})
  }
})

//sign in for existing user
app.post('/sessions', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json(user)
    }
  } catch (error) {
    res.status(400).json({ error: 'Login Failed. Please try again'})
  }
})

//profile
app.get('/users/profile', authenticateUser)
app.get('/users/profile', (req, res) => {
  res.status(200).json(req.user)
})


//------------- Products ---------------
//all products
app.get('/products', async (req, res) => {
  const allProducts = await Product.find()
  res.status(200).json(allProducts)
})

//single product for pdp
app.get('/products/:id', async (req, res) => {
  const { id } = req.params
  try {
    const singleProduct = await Product.findOne({ _id: id})
    if (singleProduct) {
      res.status(200).json(singleProduct)
    } else {
      res.status(400).json({ error: 'No such product found'})
    }
  } catch {
    res.status(400).json({ error: 'Not a valid id. Please try again'})
  }
})

//------------- Designers --------------
//all designers
app.get('/designers', async (req, res) => {
  const allDesigners = await Designer.find()
  res.status(200).json(allDesigners)
})

//single deisgner. not sure if this is needed in frontend
app.get('/designers/:id', async (req, res) => {
  const { id } = req.params
  const designer = await Designer.findOne({ _id: id})

  if (designer) {
    res.json(designer)
  } else {
    res.status(400).json({ error: 'Designer could not be found'})
  }
})

//all products from one designer
app.get('/designers/:id/products', async (req, res) => {
    const designer = await Designer.findById(req.params.id)
    console.log(designer)
    if (designer) {
      const products = await Product.find({
        designer: mongoose.Types.ObjectId(designer.id)
      })
      res.json(products)
    } else {
      res.status(400).json({ error: 'Products from designer could not be found'})
    }
})

// POST--> Add Item/Product to cart
//What info should I send? Should it be connected with the product model in some way?

app.post('/orders', authenticateUser)
app.post('/orders', async (req, res) => {
  try {
    const order = await new Order(req.body).save()
    res.status(200).json(order)
  } catch (error) {
    res.status(400).json({ error: 'Could not save order. Please try again'})
  }
})

//POST--> Add Product to favourite list

/*app.post('users/:id/favourites', authenticateUser)
app.post('/users/:id/favourites', async (req, res) => {
  try {
    const { name, price, designer, imageUrl} = req.body
    const product = await Product.findOne({name})

  } catch (error) {

  }
})*/

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

