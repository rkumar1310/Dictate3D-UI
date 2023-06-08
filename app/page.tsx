'use client'

import dynamic from 'next/dynamic'
import { Suspense, useRef, useState } from 'react'
import Arrow from '../src/components/icons/Arrow'
import Chat from '../src/components/icons/Chat'
import Cross from '../src/components/icons/Cross'
import Editor3DContext from '../src/templates/hooks/contexts/Editor3DContext'
import use3dObjects from '../src/templates/hooks/use3dObjects'
import { CommandProps } from '../src/types/types'
import { useContextBridge } from '@react-three/drei'
import toast, { Toaster } from 'react-hot-toast'

const Logo = dynamic(() => import('../src/components/canvas/Examples').then((mod) => mod.Logo), { ssr: false })
const Dog = dynamic(() => import('../src/components/canvas/Examples').then((mod) => mod.Dog), { ssr: false })
const Duck = dynamic(() => import('../src/components/canvas/Examples').then((mod) => mod.Duck), { ssr: false })
const View = dynamic(() => import('../src/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})

// Define a higher order component that wraps a dynamic component with context
const withEditor3DContext = (DynamicComponent) => {
  return (props) => (
    <Editor3DContext.Provider
      value={{ onClickObject: props.onClickObject, cameraRef: props.cameraRef, activeObjectId: props.activeObjectId }}
    >
      <DynamicComponent {...props} />
    </Editor3DContext.Provider>
  )
}

const Common = dynamic(() => import('../src/components/canvas/View').then((mod) => withEditor3DContext(mod.Common)), {
  ssr: false,
})

const TailwindSpinner = () => {
  return (
    <div role='status' className='flex justify-center items-center'>
      <svg
        aria-hidden='true'
        className='inline w-6 h-6 text-gray-50 animate-spin fill-gray-600'
        viewBox='0 0 100 101'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
          fill='currentColor'
        />
        <path
          d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
          fill='currentFill'
        />
      </svg>
      <span className='sr-only'>Loading...</span>
    </div>
  )
}

export default function Page() {
  const [showDialog, setShowDialog] = useState(true)
  const [isLoading, setLoading] = useState(false)
  const [command, setCommand] = useState('add a box')
  const ContextBridge = useContextBridge(Editor3DContext)
  const cameraRef = useRef<any>()

  const { activeObjectId, objects, processCommand, onClickObject } = use3dObjects(cameraRef)
  const onTriggerButtonClick = () => {
    if (!isLoading) {
      setShowDialog(!showDialog)
    }
  }

  const processUserCommand = () => {
    const commandPromise = new Promise((resolve, reject) => {
      setShowDialog(false)
      if (command) {
        // do your search or other side effects here
        setLoading(true)
        fetch('api/process', {
          method: 'POST',
          body: JSON.stringify({ command }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((data: any) => {
            console.log(data)
            setLoading(false)
            setCommand('')
            const commandEnglish = processCommand(data as CommandProps)
            if (commandEnglish) resolve(commandEnglish)
            else reject('No command')
          })
          .catch((err) => {
            setLoading(false)
            reject(err)
          })
      } else {
        setShowDialog(false)
        setLoading(false)
        reject('No command')
      }
    })

    toast.promise(commandPromise, {
      loading: 'Loading',
      success: (command: string) => `${command}`,
      error: (err) => `I don't know how to do that yet.`,
    })
  }

  return (
    <>
      <div className='flex w-screen h-screen flex-col flex-wrap items-center md:flex-row'>
        <div className='relative h-screen w-full md:mb-40'>
          <Toaster />
          <ContextBridge>
            <View orbit className='relative h-full sm:w-full'>
              <Suspense fallback={null}>
                <Common
                  objects={objects}
                  onClickObject={onClickObject}
                  cameraRef={cameraRef}
                  activeObjectId={activeObjectId}
                />
              </Suspense>
            </View>
          </ContextBridge>
          {showDialog && (
            <div className='absolute top-1/2 left-1/2 z-10 bg-gray-800  border-2 border-gray-900 p-8 -translate-x-1/2  -translate-y-1/2 shadow-lg rounded-lg text-center'>
              <textarea
                id='message'
                rows={2}
                className='text-lg grow outline-none w-full bg-gray-700 p-4 rounded-lg resize-none border border-gray-600 text-gray-300'
                placeholder='ask me to do something..'
                onChange={(e) => setCommand(e.target.value)}
                value={command}
              ></textarea>
              <div
                className='w-12 h-12 shadow-lg bg-gray-600 rounded-lg text-center flex justify-center items-center border-2 border-gray-700 mx-auto mt-4'
                onClick={() => processUserCommand()}
              >
                <Arrow className='w-6 h-6 fill-white' />
              </div>
            </div>
          )}
          <div className='absolute bottom-0 left-0 h-20 bg-gradient-to-t from-grey-500 z-10 w-full'>
            <div className='flex flex-row items-center justify-center'>
              <div
                className='w-12 h-12 shadow-lg bg-gray-200 rounded-lg text-center flex justify-center items-center border-2 border-white'
                onClick={() => onTriggerButtonClick()}
              >
                {!isLoading ? (
                  <>
                    {showDialog && <Cross className='w-6 h-6 fill-gray-500' />}
                    {!showDialog && <Chat className='w-6 h-6 fill-gray-500' />}
                  </>
                ) : (
                  <TailwindSpinner />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
