import React from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getBlogPostList } from './helpers/file-helper'
import BlogSummaryCard from './components/BlogSummaryCard'
import dateFormatter from './helpers/dateFormatter'
async function MdxBlogPage () {
  const blogs = await getBlogPostList()

  return (
    <div className='flex flex-col items-center justify-center pb-8 bg-gradient-to-b from-yellow-100 to-yellow-400'>
      <h1 className='mt-12 text-4xl font-bold'>New Content</h1>

      {blogs.map(blog => (
        <BlogSummaryCard
          key={blog.slug}
          title={blog.title}
          abstract={blog.abstract}
          publishedOn={dateFormatter(blog.publishedOn)}
        />
      ))}
    </div>
  )
}

export default MdxBlogPage
