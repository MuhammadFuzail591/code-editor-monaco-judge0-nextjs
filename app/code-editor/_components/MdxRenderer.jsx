import CodeSnippet from '@/components/CodeSnippet'
import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'


function MdxRenderer({ source }) {

   return (

      <MDXRemote
         source={source}
         components={{
            pre: CodeSnippet
         }}
      />
   )
}

export default MdxRenderer