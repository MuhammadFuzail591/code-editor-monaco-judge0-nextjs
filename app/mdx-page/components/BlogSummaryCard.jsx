import React from 'react'

function BlogSummaryCard({ slug, title, abstract, publishedOn }) {
   return (

      <div className='flex flex-col w-6/12 gap-2 px-4 py-6 mt-10 bg-white border rounded-lg'>
         <h2 className='text-2xl font-bold'>
            {title}
         </h2>
         <span className='font-bold '>{publishedOn}</span>
         <h3>{abstract}</h3>
      </div>
   )
}

export default BlogSummaryCard