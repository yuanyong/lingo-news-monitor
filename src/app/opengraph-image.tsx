import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Semantic Web Monitor'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  // Load custom fonts
  const [recklessFont, abcDiatypeFont] = await Promise.all([
    fetch(new URL('./fonts/RecklessTRIAL-Regular.otf', import.meta.url)).then((res) => res.arrayBuffer()),
    fetch(new URL('./fonts/ABCDiatype-Regular.otf', import.meta.url)).then((res) => res.arrayBuffer()),
  ])

  // Read the image file
  const imageData = await fetch(new URL('./../../public/exa_logo.png', import.meta.url)).then(
    (res) => res.arrayBuffer()
  )

  return new ImageResponse(
    (
      <div
        style={{
          background: '#faf7ec', // --secondary-default
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Title - using Reckless for serif heading */}
        <h1
          style={{
            fontSize: '80px',
            fontWeight: '500', // font-medium
            color: '#111827', // --text-light-default
            marginBottom: '60px',
            fontFamily: 'Reckless',
          }}
        >
          Semantic{'\u00A0'}<span style={{ color: '#254bf1' }}>Web Monitor</span>
        </h1>
        
        {/* Powered by Exa - using ABCDiatype for body text */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '32px',
            color: '#737373', // --gray-500
            fontFamily: 'ABCDiatype',
          }}
        >
          <span>Powered by</span>
          <img
            src={imageData as any}
            alt="Exa"
            width="140"
            height="45"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Reckless',
          data: recklessFont,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'ABCDiatype',
          data: abcDiatypeFont,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}