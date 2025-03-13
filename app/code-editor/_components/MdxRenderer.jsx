import { MDXRemote } from 'next-mdx-remote/rsc'
import React from 'react'

function MdxRenderer({source}) {

   return (
      <MDXRemote source={source} />
   )
}

export default MdxRenderer