
import  { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
gsap.registerPlugin(Draggable, InertiaPlugin);
export default function ParaSlider({slides}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    const slideElems = gsap.utils.toArray('.carousel-slide');
    const prev = prevRef.current;
    const next = nextRef.current;
    let activeSlide;
    let firstRun = true;

    gsap.set('.carousel', { overflow: 'visible', 'scroll-snap-type': 'none' });

   
    gsap.set('.carousel-nav', { display: 'block' });


    // create seamless horizontal loop
    const loop = horizontalLoop(slideElems, {
      paused: true,
      paddingRight: 10,
      center: true,
      draggable: true,
      onChange: (slide, index) => {
        if (activeSlide) {
          gsap.to('.carousel h2, .carousel h5', { overwrite: true, opacity: 0, ease: 'power3' });
          gsap.to('.active', { opacity: 0.3 });
          activeSlide.classList.remove('active');
        }
        slide.classList.add('active');
        activeSlide = slide;

        // intro animation for new active slide
        gsap.timeline({ defaults:{ ease:'power1.inOut' } })
          .to('.active', { opacity: 1, ease: 'power2.inOut' }, 0)
          .to('.carousel-nav div', { duration: 0.2, opacity: 0, ease: 'power1.in' }, 0)
          .set('.carousel-nav div', { innerText: `${index + 1}/${slideElems.length}` }, 0.2)
          .to('.carousel-nav div', { duration: 0.4, opacity: 0.5, ease: 'power1.inOut' }, 0.2)
          .to('.active h2, .active h5', { opacity: 1, ease: 'power1.inOut' }, 0.3)
          .fromTo(
            '.active h2, .active h5',
            { y: (i) => [40, 60][i] },
            {
              duration: 1.5,
              y: 0,
              ease: 'expo',
              stagger: {
                each: 0.1,
                from: 'start',
              }
            },
            0.3
          )
          .progress(firstRun ? 1 : 0);
      },
      onUpdate: slideImgUpdate
    });
    function arrowBtnOver(e) { gsap.to(e.target, { opacity: 0.4 }); }
    function arrowBtnOut(e) { gsap.to(e.target, { opacity: 1 }); }

    next.addEventListener('pointerover', arrowBtnOver);
    next.addEventListener('pointerout', arrowBtnOut);
    next.addEventListener('click', () => loop.next({ duration: 1, ease: 'expo' }));

    prev.addEventListener('pointerover', arrowBtnOver);
    prev.addEventListener('pointerout', arrowBtnOut);
    prev.addEventListener('click', () => loop.previous({ duration: 1, ease: 'expo' }));

    // each slide can function as a button
    slideElems.forEach((slide, i) => {
      slide.addEventListener('click', () => loop.toIndex(i, { duration: 1, ease: 'expo' }));
    });

    // set initial opacity for slides
    gsap.set('.carousel-slide', { opacity: (i) => (i === 0 ? 1 : 0.3) });
    gsap.set('.carousel-slide h2', { opacity: (i) => (i === 0 ? 1 : 0) });
    gsap.set('.carousel-slide h5', { opacity: (i) => (i === 0 ? 1 : 0) });

    // center on initial slide
    loop.toIndex(0, { duration: 0 });
    firstRun = false;

    // cleanup
    return () => {
      next.removeEventListener('pointerover', arrowBtnOver);
      next.removeEventListener('pointerout', arrowBtnOut);
      prev.removeEventListener('pointerover', arrowBtnOver);
      prev.removeEventListener('pointerout', arrowBtnOut);
    };
  }, [slides]);

  return (
    <section>
      <div className="carousel" aria-label="horizontal carousel of images">
        {slides.map(({ image, title, subtitle }, idx) => (
          <div key={idx} className="carousel-slide">
            <img src={image} alt={title} />
            <h2>{title}</h2>
            <h5>{subtitle}</h5>
          </div>
        ))}
      </div>
      <nav className="carousel-nav">
        <button className="prev" ref={prevRef} tabIndex="0" aria-label="Previous Slide" />
        <button className="next" ref={nextRef} tabIndex="0" aria-label="Next Slide" />
        <div>1/{slides.length}</div>
      </nav>
    </section>
  );
}
function horizontalLoop(items, config) {
  let timeline;
  items = gsap.utils.toArray(items);
  config = config || {};
  gsap.context(() => { 
    let onChange = config.onChange,
      lastIndex = 0,
      tl = gsap.timeline({repeat: config.repeat, onUpdate: onChange && function() {
          slideImgUpdate({items}); 
          let i = tl.closestIndex();
          if (lastIndex !== i) {
            lastIndex = i;
            onChange(items[i], i);
          }
        }, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      spaceBefore = [],
      xPercents = [],
      curIndex = 0,
      indexIsDirty = false,
      center = config.center,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1), 
      timeOffset = 0,
      container = center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode,
      totalWidth,
      getTotalWidth = () => items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX + spaceBefore[0] + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX") + (parseFloat(config.paddingRight) || 0),
      populateWidths = () => {
        let b1 = container.getBoundingClientRect(), b2;
        items.forEach((el, i) => {
          widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
          xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / widths[i] * 100 + gsap.getProperty(el, "xPercent"));
          b2 = el.getBoundingClientRect();
          spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
          b1 = b2;
        });
        gsap.set(items, { 
          xPercent: i => xPercents[i]
        });
        totalWidth = getTotalWidth();
      },
      timeWrap,
      populateOffsets = () => {
        timeOffset = center ? tl.duration() * (container.offsetWidth / 2) / totalWidth : 0;
        center && times.forEach((t, i) => {
          times[i] = timeWrap(tl.labels["label" + i] + tl.duration() * widths[i] / 2 / totalWidth - timeOffset);
        });
      },
      getClosest = (values, value, wrap) => {
        let i = values.length,
          closest = 1e10,
          index = 0, d;
        while (i--) {
          d = Math.abs(values[i] - value);
          if (d > wrap / 2) {
            d = wrap - d;
          }
          if (d < closest) {
            closest = d;
            index = i;
          }
        }
        return index;
      },
      populateTimeline = () => {
        let i, item, curX, distanceToStart, distanceToLoop;
        tl.clear();
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = xPercents[i] / 100 * widths[i];
          distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
          distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
          tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
            .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
            .add("label" + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        timeWrap = gsap.utils.wrap(0, tl.duration());
      },
      refresh = (deep) => {
        let progress = tl.progress();
        tl.progress(0, true);
        populateWidths();
        deep && populateTimeline();
        populateOffsets();
        deep && tl.draggable && tl.paused() ? tl.time(times[curIndex], true) : tl.progress(progress, true);
      },
      onResize = () => refresh(true),
      proxy;
    gsap.set(items, {x: 0});
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener("resize", onResize);
    function toIndex(index, vars) {
      vars = vars || {};
      (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length); // always go in the shortest direction
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) { // if we're wrapping the timeline's playhead, make the proper adjustments
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) {
        vars.modifiers = {time: timeWrap};
      }
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);    
      return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
    }
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.closestIndex = setCurrent => {
      let index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = () => indexIsDirty ? tl.closestIndex(true) : curIndex;
    tl.next = vars => toIndex(tl.current()+1, vars);
    tl.previous = vars => toIndex(tl.current()-1, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true); // pre-render for performance
    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }
    if (config.draggable && typeof(Draggable) === "function") {
      proxy = document.createElement("div")
      let wrap = gsap.utils.wrap(0, 1),
        ratio, startProgress, draggable, dragSnap, lastSnap, initChangeX, wasPlaying,
        align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio)),
        syncIndex = () => tl.closestIndex(true);
      typeof(InertiaPlugin) === "undefined" && console.warn("InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club");
      draggable = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: "x",
        onPressInit() {
          let x = this.x;
          gsap.killTweensOf(tl);
          wasPlaying = !tl.paused();
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 1 / totalWidth;
          initChangeX = (startProgress / -ratio) - x;
          gsap.set(proxy, {x: startProgress / -ratio});
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        inertia: true,
        snap(value) {
          if (Math.abs(startProgress / -ratio - this.x) < 10) {
            return lastSnap + initChangeX
          }
          let time = -(value * ratio) * tl.duration(),
            wrappedTime = timeWrap(time),
            snapTime = times[getClosest(times, wrappedTime, tl.duration())],
            dif = snapTime - wrappedTime;
          Math.abs(dif) > tl.duration() / 2 && (dif += dif < 0 ? tl.duration() : -tl.duration());
          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          syncIndex();
          draggable.isThrowing && (indexIsDirty = true);
        },
        onThrowComplete: () => {
          syncIndex();
          wasPlaying && tl.play();
        }
      })[0];
      tl.draggable = draggable;
    }
    tl.closestIndex(true);
    lastIndex = curIndex;
    onChange && onChange(items[curIndex], curIndex);
    timeline = tl;
    return () => window.removeEventListener("resize", onResize); // cleanup
  });
  return timeline;
}

function slideImgUpdate({ items, innerWidth }) {
  items.forEach( slide => {
    const rect = slide.getBoundingClientRect();
    const prog = gsap.utils.mapRange(-rect.width, innerWidth, 0, 1, rect.x);
    const val = gsap.utils.clamp(0, 1, prog );
    gsap.set(slide.querySelector("img"), {
      xPercent: gsap.utils.interpolate(0, -50, val)
    });
  });
}