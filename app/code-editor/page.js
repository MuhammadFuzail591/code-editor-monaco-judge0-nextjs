import Landing from './_components/Landing'
import MdxRenderer from './_components/MdxRenderer';

async function page () {
  const mdxContent = `
  # Wellcome to the Blog
  This is an example of **Mdx Content**
  - item 1
  - item 2
  `;

  const renderedMdx = await MdxRenderer({source: mdxContent})

  return (
    <div>
      <Landing mdxContent={renderedMdx} />
    </div>
  )
}

export default page
