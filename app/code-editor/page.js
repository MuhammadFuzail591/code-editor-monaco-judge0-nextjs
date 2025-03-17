import Landing from './_components/Landing'
import MdxRenderer from './_components/MdxRenderer'
import { loadBlog } from './utils/file-helper'
import { twoSumProblem } from './utils/problems/two-sum'

async function page () {
  const { frontmatter, content } = await loadBlog(twoSumProblem.mdxData)

  // const renderedMdx = await loadBlog(twoSumProblem.mdxData)

  const renderedMdx = MdxRenderer({ source: content })

  return (
    <div>
      <Landing mdxContent={renderedMdx} frontMatter={frontmatter}/>
    </div>
  )
}

export default page
