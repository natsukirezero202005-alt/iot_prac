import { useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../components/Header';
import ParallaxScene from '../components/ParallaxScene';
import ModeCard from '../components/ModeCard';
import { questions } from '../data/questions';

gsap.registerPlugin(ScrollTrigger);

// Replace with your college name once you are happy with the artwork.
const COLLEGE_NAME = 'MOOCS IOT';

const FEATURES = [
  { title: `${questions.length} Questions`, text: 'NPTEL assignments, Weeks 1 to 12, in their original wording.' },
  { title: 'Focused Practice', text: 'No timer. Take as long as each question needs.' },
  { title: 'Review Your Mistakes', text: 'After you submit, see your answer next to the correct one.' },
  { title: 'Track Your Progress', text: 'Every finished attempt is saved to your account.' },
];

export default function Home() {
  const rootRef = useRef(null);
  const navigate = useNavigate();

  // Signed-out users are sent to /login by the route guard and returned to /exam afterwards.
  function startMode(mode) {
    navigate(`/exam?mode=${mode}`);
  }

  // Gentle one-time reveals. With reduced motion everything is simply visible.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        gsap.utils.toArray('.reveal').forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });
      },
      rootRef,
    );
    return () => mm.revert();
  }, []);

  return (
    <div className="home" ref={rootRef}>
      <ParallaxScene triggerRef={rootRef} variant="home" />
      <Header variant="scene" />

      <main className="page-content">
        {/* Section 1: Arrival */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__inner">
            <h1 id="hero-title" className="hero__title">
              <span>{COLLEGE_NAME}</span>
              <span>EXAM PREPARATION</span>
            </h1>
            <p className="hero__tagline">Prepare. Practice. Improve.</p>
            <p className="hero__sub">{questions.length} questions designed for focused exam preparation.</p>

            <div className="mode-grid" id="modes">
              <ModeCard mode="practice" onStart={startMode} />
              <ModeCard mode="hard" onStart={startMode} />
            </div>
          </div>
        </section>

        {/* Section 2: Preparation */}
        <section className="prep" aria-labelledby="prep-title">
          <div className="prep__inner">
            <h2 id="prep-title" className="section-title reveal">
              Built for steady preparation
            </h2>
            <ul className="feature-list">
              {FEATURES.map((f) => (
                <li key={f.title} className="feature glass reveal">
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 3: Begin */}
        <section className="begin" aria-labelledby="begin-title">
          <div className="begin__inner">
            <h2 id="begin-title" className="section-title reveal">
              Ready to begin?
            </h2>
            <p className="begin__text reveal">Choose your mode and start practicing.</p>
            <div className="mode-grid reveal">
              <ModeCard mode="practice" onStart={startMode} />
              <ModeCard mode="hard" onStart={startMode} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
