import Landing from './_components/Landing'
import MdxRenderer from './_components/MdxRenderer'
import { loadBlog } from './utils/file-helper'
import { twoSumProblem } from './utils/problems/two-sum'

export const metadata = {
  title: 'CodeBite Editor',
  description: "An in browser code editor for coding exercises"
}

async function page () {
  const { frontmatter, content } = await loadBlog(twoSumProblem.mdxData)

  // const renderedMdx = await loadBlog(twoSumProblem.mdxData)

  const renderedMdx = MdxRenderer({ source: content })

  return (
    <div className='h-screen'>
      <Landing mdxContent={renderedMdx} frontMatter={frontmatter}/>
    </div>
  )
}

export default page
