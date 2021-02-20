const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect(response => {
            expect(response.body).toHaveLength(2)
        })
})

afterAll(() => {
    mongoose.connection.close()
})