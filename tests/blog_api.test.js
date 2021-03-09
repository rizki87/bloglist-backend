const mongoose = require('mongoose')
const supertest = require('supertest')
const listHelper = require('../utils/list_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of listHelper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

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

// test('if the title and url properties are missing from the request data ', async (done) => {
//   const newBlog = {
//     title: "Canonical string reduction",
//     url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
//     likes: 12
//   }
//     return await api
//       .post('/api/blogs')
//       .send(newBlog)
//       .expect('Content-Type', /application\/json/)
//       // .expect((res) => {
//       //   console.log('kode = ', res)
//       //   expect(res.status).toBe(400)
//       //   done()
//       // })

//       // .then(function (err, res) {
//       //   expect(res.statusCode).to.equal(400)
//       //   done()
//       // });

//       // .set('Content-type', 'application/json')
//       // .expect(res => {
//       //   console.log('kode = ', res.statusCode)
//       //   expect(res.statusCode).toBe(400)
//       //   done()
//       // })
//       // .end(function(err, res){
//       //   // console.log('status kode === ',res.statusCode)
//       //   expect(res.statusCode).toBe(400)
//       //   done()
//       // })
//       // .end(done)

//   // const res = await api.post('/api/blogs').send(newBlog)
//   // console.log('kode = ', res)
//   // expect(res.status).toBe(415);

// })

afterAll(async () => {
    await mongoose.connection.close()
})