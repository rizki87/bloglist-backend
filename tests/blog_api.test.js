const mongoose = require('mongoose')
const supertest = require('supertest')
const listHelper = require('../utils/list_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(listHelper.initialBlogs)

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

afterAll(() => {
    mongoose.connection.close()
})

afterAll( async (done) => {
  // console.log("... Test Ended");
  await mongoose.connection.close();
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  done()
})
