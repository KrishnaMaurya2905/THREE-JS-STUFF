import React, { useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'

const HorizontalScroll = () => {
  const scrollRef = useRef()

  useEffect(() => {
    const lenis = new Lenis({
      direction: 'horizontal',
        duration: 1.5,
      gestureDirection: 'both', // allow vertical gestures to trigger horizontal scroll
      smooth: true,
    })

    const raf = (time) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div ref={scrollRef} className="min-h-screen">
      <div className="lenis-smooth h-screen w-[4000px] flex">
        {[...Array(10)].map((_, i) => (
          <section
            key={i}
            className={`w-screen h-screen flex-shrink-0 flex items-center justify-center text-5xl font-bold ${
              i % 2 === 0 ? 'bg-blue-200' : 'bg-pink-200'
            }`}
          >
            Section {i + 1}
          </section>
        ))}
      </div>
    </div>
  )
}

export default HorizontalScroll
