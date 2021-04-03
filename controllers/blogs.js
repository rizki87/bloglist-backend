const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
    .catch(error => {
      console.log('onRejected function called: ' + error.message)
      response.status(400).json(error)
    })

  // try {
  //   var user = new User(req.body);
  //   await user.save();
  //   res.status(200).send(user);
  // } catch (error) {
  //   if (error.name === "ValidationError") {
  //     let errors = {};

  //     Object.keys(error.errors).forEach((key) => {
  //       errors[key] = error.errors[key].message;
  //     });

  //     return res.status(400).send(errors);
  //   }
  //   res.status(500).send("Something went wrong");
  // }

})

module.exports = blogsRouter