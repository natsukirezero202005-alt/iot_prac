import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Works locally and under a GitHub Pages sub-path like /repo-name/.
const IMG = `${import.meta.env.BASE_URL}images/`;

/*
  One image layer.
  - Works with or without the image: a CSS-drawn placeholder (.layer__fallback) shows
    until the real PNG loads. A missing file never shows a broken-image icon.
  - Optional mobileSrc: a smaller image served only on screens <= 700px (saves data on phones).
  - data-speed = how far the layer travels while scrolling (bigger = closer to the camera).
*/
function Layer({ name, src, mobileSrc = null, speed, priority = false }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // Covers images that finished loading before React attached onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <div className={`layer layer--${name}${loaded ? ' is-loaded' : ''}`} data-speed={speed} aria-hidden="true">
      <div className="layer__fallback" />
      <picture>
        {mobileSrc && <source media="(max-width: 700px)" srcSet={mobileSrc} />}
        <img
          ref={imgRef}
          src={src}
          alt=""
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.currentTarget.style.display = 'none'; // keep the placeholder, hide the broken image
          }}
        />
      </picture>
    </div>
  );
}

/*
  Fixed, full-screen college scene. Layers sit behind the page content and move at
  different speeds while the page scrolls (GSAP ScrollTrigger, scrubbed to scroll).
  - triggerRef: the element whose scroll range drives the movement.
  - variant: "home" | "result" (changes the light/tint in CSS only).
  Nothing animates while the page is idle, and nothing moves with reduced motion.
*/
export default function ParallaxScene({ triggerRef, variant = 'home' }) {
  const sceneRef = useRef(null);

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const scene = sceneRef.current;
    if (!trigger || !scene) return undefined;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const small = window.matchMedia('(max-width: 700px)').matches;
      const factor = small ? 0.6 : 1; // gentler movement on phones
      const scrollConfig = {
        trigger,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
      };

      // Each layer starts pushed down by its speed and rises to its natural spot.
      scene.querySelectorAll('[data-speed]').forEach((layer) => {
        const speed = Number(layer.dataset.speed) * factor;
        gsap.fromTo(layer, { yPercent: speed }, { yPercent: 0, ease: 'none', scrollTrigger: scrollConfig });
      });

      // Clouds also drift sideways a little.
      const clouds = scene.querySelector('.layer--clouds');
      if (clouds) gsap.fromTo(clouds, { xPercent: -3 }, { xPercent: 3, ease: 'none', scrollTrigger: scrollConfig });

      // The scene darkens as you scroll so text stays readable.
      const shade = scene.querySelector('.scene__shade');
      if (shade) gsap.fromTo(shade, { opacity: 0.15 }, { opacity: 0.6, ease: 'none', scrollTrigger: scrollConfig });
    });

    return () => mm.revert();
  }, [triggerRef]);

  return (
    <div className={`scene scene--${variant}`} ref={sceneRef} aria-hidden="true">
      {/* BACKGROUND (farthest, barely moves): replace with /images/college-sky.png */}
      <Layer name="sky" src={`${IMG}college-sky.png`} speed={2} priority />

      {/* CLOUDS (slow, drifts sideways): replace with /images/college-clouds.png */}
      <Layer name="clouds" src={`${IMG}college-clouds.png`} speed={5} />

      {/* COLLEGE BUILDING (medium; keep the building near the horizontal centre of the image so it survives mobile cropping): replace with /images/college-building.png */}
      <Layer name="building" src={`${IMG}college-building.png`} speed={8} priority />

      {/* TREES / CAMPUS (slightly faster): replace with /images/college-campus.png */}
      <Layer name="campus" src={`${IMG}college-campus.png`} speed={12} />

      {/* FOREGROUND (fast): replace with /images/college-foreground.png */}
      <Layer name="foreground" src={`${IMG}college-foreground.png`} speed={18} />

      {/* STUDENTS / CLOSEST ELEMENTS (fastest, optional): replace with /images/college-students.png */}
      <Layer name="students" src={`${IMG}college-students.png`} speed={26} />

      {/* Readability shade between the artwork and the page content */}
      <div className="scene__shade" />
    </div>
  );
}
