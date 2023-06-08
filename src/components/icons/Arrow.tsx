import { HTMLAttributes } from 'react'

const Arrow = (props: HTMLAttributes<SVGElement>) => {
  return (
    <svg
      version='1.1'
      id='Layer_1'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      x='0px'
      y='0px'
      viewBox='0 0 800 800'
      xmlSpace='preserve'
      fill='currentColor'
      {...props}
    >
      <g id='Arrow__x2F__Chevron_x5F_Right'>
        <g id='Vector'>
          <path
            d='M300,666.7c-8.5,0-17.1-3.3-23.6-9.8c-13-13-13-34.1,0-47.1L486.2,400L276.4,190.2c-13-13-13-34.1,0-47.1
			c13-13,34.1-13,47.1,0l233.3,233.3c13,13,13,34.1,0,47.1L323.6,656.9C317.1,663.4,308.5,666.7,300,666.7z'
          />
        </g>
      </g>
    </svg>
  )
}
export default Arrow
