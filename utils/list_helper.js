var _ = require('lodash')
const Blog = require('../models/blog')

const initialBlogs = [
        {
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7
        },
        {
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            // likes: 5
        }
]

const dummy = (blogs) => {
  return blogs = 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item.likes
    }

    return blogs.length === 0 
        ? 0 
        : blogs.reduce(reducer, 0) 
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return []
    } else {
        const reducer = blogs.reduce((sum, item) => item.likes > sum ? item.likes : sum, 0)    
        const favBlog = blogs.find(blog => blog.likes === reducer); 
        return {
            title: favBlog.title,
            author: favBlog.author,
            likes: favBlog.likes
        }
    }
}

const mostBlogs = (blogs) => {
    const authors = _.map(_.countBy(blogs, 'author'), (val, key) => ({ author: key, blogs: val }))
    const theMostAuthor = _.maxBy(authors, 'blogs')

    return blogs.length === 0 
        ? []
        : theMostAuthor
}

const mostLikes = (blogs) => {
    const lists = _.map(_.groupBy(blogs, 'author'), (val, key) => ({ author: key, likes: _.sumBy(val, 'likes') }))
    const theMostLikes = _.maxBy(lists, 'likes')

    return blogs.length === 0
        ? []
        : theMostLikes
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs,
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  blogsInDb
}