const dummy = (blogs) => {
  return blogs = 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item
    }
    
    return blogs.length === 0 
        ? 0 
        : blogs.map(blog => blog.likes).reduce(reducer, 0) 
}

module.exports = {
  dummy,
  totalLikes
}