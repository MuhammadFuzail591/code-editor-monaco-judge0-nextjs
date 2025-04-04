import Link from 'next/link'

export const metadata = {
  title: 'CodeBite Editor',
  description: 'An in browser code editor for coding exercises'
}
export default function Home () {
  return (
    <div className='flex items-center flex-col gap-10 justify-center w-full h-full mt-[50vh]'>
      Hello to the code editor
      <Link
        href='code-editor'
        className='p-4 font-bold text-black bg-slate-300'
      >
        Code Editor
      </Link>
    </div>
  )
}
