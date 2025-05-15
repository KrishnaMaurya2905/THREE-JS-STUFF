// import React, { useRef } from "react";
// import { useScroll, useTransform, motion } from "framer-motion";

// const images = [
//   "https://images.unsplash.com/photo-1746263758817-424611f96b2d?q=80&w=1926&auto=format&fit=crop",
//   "https://images.unsplash.com/photo-1744192955739-fb0f35ead89a?q=80&w=2070&auto=format&fit=crop",
//   "https://images.unsplash.com/photo-1746107709918-b67bfd8e1273?q=80&w=2070&auto=format&fit=crop",
//   "https://images.unsplash.com/photo-1743506124878-0799f4a4848f?q=80&w=2148&auto=format&fit=crop",
//   " https://images.unsplash.com/photo-1746240922260-efbea47dc532?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
// ];

// const ParallaxSlide = () => {
//   const containerRef = useRef(null);
//   const { scrollYProgress } = useScroll({
//     target: containerRef,
//     offset: ["start start", "end end"],
//   });

//   const step = 1 / (images.length - 1); // since first is static

//   const transforms = images.slice(1).map((_, i) => {
//     const start = step * i + step * 0.05; // start anim after 25% of segment
//     const end = step * i + step * 0.95; // finish anim before next begins

//     const height = useTransform(
//       scrollYProgress,
//       [start, end],
//       ["0vh", "100vh"]
//     );
//     const y = useTransform(scrollYProgress, [start, end], ["100px", "0px"]); // Parallax effect

//     return { height, y };
//   });

//   return (
//     <div className="h-full w-full">
//       <div className="h-screen w-full bg-red-500"></div>
//       <div className="h-[400vh] relative w-full" ref={containerRef}>
//         <div className="sticky top-0 h-screen w-full">
//           <div className="w-full h-screen relative">
//             {/* First Image - Static Fullscreen */}
//             <div className="absolute bottom-0 left-0 w-full h-screen ">
//               <img
//                 className="w-full h-full object-cover"
//                 src={images[0]}
//                 alt=""
//               />
//             </div>

//             {/* Other images with parallax + height animation */}
//             {images.slice(1).map((image, i) => (
//               <motion.div
//                 key={i}
//                 style={{
//                   height: transforms[i].height,
//                   y: transforms[i].y,
//                 }}
//                 className="absolute bottom-0 left-0 w-full overflow-hidden z-1"
//               >
//                 <img
//                   className="w-full h-full object-cover"
//                   src={image}
//                   alt=""
//                 />
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="h-screen w-full bg-red-500"></div>
//     </div>
//   );
// };

// export default ParallaxSlide;

import React, { useRef, useEffect, useState } from "react";
import {
  useScroll,
  useMotionValue,
  useVelocity,
  useSpring,
  animate,
  motion,
} from "framer-motion";

const images = [
  "https://images.unsplash.com/photo-1746263758817-424611f96b2d?q=80&w=1926&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1744192955739-fb0f35ead89a?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1746107709918-b67bfd8e1273?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1743506124878-0799f4a4848f?q=80&w=2148&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1746240922260-efbea47dc532?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const ParallaxSlide = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const velocity = useVelocity(scrollYProgress);
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 10,
  });

  const numSlides = images.length - 1;
  const step = 1 / numSlides;

  const imageControls = images.slice(1).map(() => ({
    height: useMotionValue(0),
    y: useMotionValue(100),
  }));

  useEffect(() => {
    const unsub = smoothProgress.on("change", (v) => {
      imageControls.forEach((ctrl, i) => {
        const start = step * i + step * 0.05;
        const end = step * i + step * 0.95;
        const segment = end - start;

        let local = (v - start) / segment;
        local = Math.min(1, Math.max(0, local));

        const targetH = local * window.innerHeight;
        const targetY = 100 - local * 100;

        ctrl.height.set(targetH);
        ctrl.y.set(targetY);

        console.log(`Image ${i}: Height = ${targetH}, Y = ${targetY}`);
      });
    });

    return () => unsub();
  }, [smoothProgress]);

  useEffect(() => {
    let timeout;

    const checkSnap = () => {
      const scroll = scrollYProgress.get();

      imageControls.forEach((ctrl, i) => {
        const start = step * i + step * 0.05;
        const end = step * i + step * 0.95;
        const segment = end - start;

        let local = (scroll - start) / segment;
        local = Math.min(1, Math.max(0, local));

        const snapTo = local >= 0.5 ? window.innerHeight : 0;
        const snapY = local >= 0.5 ? 0 : 100;

        animate(ctrl.height, snapTo, {
          duration: 0.5,
          ease: "easeOut",
        });

        animate(ctrl.y, snapY, {
          duration: 0.5,
          ease: "easeOut",
        });
      });
    };

    const unsubscribe = velocity.on("change", (v) => {
      clearTimeout(timeout);
      if (Math.abs(v) < 0.001) {
        timeout = setTimeout(checkSnap, 100);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [scrollYProgress, velocity]);

  return (
    <div className="w-full h-full">
      <div className="h-screen bg-red-500" />
      <div className="h-[400vh] relative w-full" ref={containerRef}>
        <div className="sticky top-0 h-screen w-full">
          <div className="relative h-full w-full">
            <div className="absolute bottom-0 left-0 w-full h-screen z-0">
              <img
                src={images[0]}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>

            {images.slice(1).map((src, i) => (
              <motion.div
                key={i}
                style={{
                  height: imageControls[i].height,
                  y: imageControls[i].y,
                }}
                className="absolute bottom-0 left-0 w-full overflow-hidden z-10"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-screen bg-red-500" />
    </div>
  );
};

export default ParallaxSlide;
