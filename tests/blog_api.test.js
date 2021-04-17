const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const listHelper = require('../utils/list_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(listHelper.initialBlogs)
  await User.deleteMany({})
  await User.insertMany(listHelper.initialUser)

  // for (let blog of listHelper.initialBlogs) {
  //   let blogObject = new Blog(blog)
  //   await blogObject.save()
  // }
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json and have a certain number of blog posts', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(response => {
          // console.log('response => ', response.body)
          expect(response.body).toHaveLength(2)
      })      
  })

  test('field named id is exists', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

describe('addition of a new blog', () => {
  test('a valid blog can be added ', async () => {
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await listHelper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(listHelper.initialBlogs.length + 1)

    const title = blogsAtEnd.map(b => b.title)
    expect(title).toContainEqual(
      'Canonical string reduction'
    )
  })

  test('if the likes property is missing from the request', async () => {
    await api
          .get('/api/blogs')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(response => {          
              // expect(response.body[1]).not.toHaveProperty('likes')
              // response.body[1].likes = 0
              // console.log('response ===', response.body[1].likes)
              expect(response.body[1].likes).toBe(0)
          })
  })

  test('POST: /api/blogs, without required field, and response/statusCode = 400', async () => {
    const newBlogX = {
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12
    }

    await api
      .post('/api/blogs')
      .send(newBlogX)
      .expect(400)

  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await listHelper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await listHelper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      listHelper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('alteration of a blog', () => {
  test('update the amount of likes for a blog post', async () => {
    const blogsAtStart = await listHelper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    blogToUpdate.likes = 99

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)

    const blogsAtEnd = await listHelper.blogsInDb()

    expect(blogsAtEnd[0].likes).toBe(99)
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await listHelper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await listHelper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await listHelper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain(`Username '${newUser.username}' already exists`)

    const usersAtEnd = await listHelper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

describe('check that invalid users are not created and invalid add user operation', () => {
  test('Username minimum length', async () => {
    const newUser = {
      username: 'jo',
      name: 'John Mayer',
      password: 'John Mayer',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username, must be at least 3 characters long')
  })

  test('Password minimum length', async () => {
    const newUser = {
      username: 'johnmayer',
      name: 'John Mayer',
      password: 'Jm',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password, must be at least 3 characters long')
  })

  test('Username is mandatory', async () => {
    const newUser = {      
      name: 'John Mayer',
      password: 'John Mayer'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` is mandatory')
  })

  test('Password is mandatory', async () => {
    const newUser = {  
      username: 'johnmayer',    
      name: 'John Mayer'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`password` is mandatory')
  })

  test('The username must be unique', async () => {
    const newUser = {
      username: 'asep',
      name: 'Asep Bruder',
      password: 'asepbruder',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain(`Username '${newUser.username}' already exists`)
  })
})

// afterAll(() => {
//     mongoose.connection.close()
// })

afterAll( async (done) => {
  // console.log("... Test Ended");
  await mongoose.connection.close();
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  done()
})
