const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const body = request.body

  const existingUser = await User.find({ username: body.username })
  // console.log('existingUser ', existingUser)
  if (existingUser && existingUser.length) {
    return response.status(400).json({ 
      error: `Username '${body.username}' already exists`
    })
  }

  if (!body.username) {
    return response.status(400).json({ 
      error: '`username` is mandatory' 
    })
  } else if (!body.password) {
    return response.status(400).json({ 
      error: '`password` is mandatory'
    })
  }

  if (body.username && body.username.length < 3){
    return response.status(400).json({ 
      error: 'username, must be at least 3 characters long'
    })
  } else if (body.password && body.password.length < 3){
    return response.status(400).json({ 
      error: 'password, must be at least 3 characters long'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)
    .catch(error => {
        console.log('passwordHash error')
    })

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save().then(result => {
      response.status(200).json(result)
    })
    .catch(error => {      
      response.status(400).json(error)   
    })

  response.json(savedUser)    
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

module.exports = usersRouter