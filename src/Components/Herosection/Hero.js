import React, { useLayoutEffect, useRef } from 'react';
import styles from './Hero.module.css';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

import {  ScrollTrigger } from '../../utils/gsapConfig';
import cloudImage from '../../assets/images/clouds.png';
import houseImage from '../../assets/images/house.png';


const Hero = ({ title, subtitle }) => {
  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 5px 15px rgba(0,0,0,0.18)" },
    tap: { scale: 0.98 }
  };

  const heroRef = useRef(null);
  const cloudsRef = useRef(null);
  const houseRef = useRef(null);
  const textRef = useRef(null);
  const buttonsRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const hero = heroRef.current;
      if (!hero) return;

      const clouds = cloudsRef.current;
      const house = houseRef.current;
      const text = textRef.current;
      
      if (!clouds || !house || !text) return;
      
      const buttons = gsap.utils.toArray('.hero-button', hero);

      gsap.set(clouds, { y: -200, opacity: 0 });
      gsap.set(house, { x: 300, opacity: 0 });
      gsap.set(text, { x: -100, opacity: 0 });
      gsap.set(buttons, { x: -80, opacity: 0 });

      const entryTl = gsap.timeline();
      entryTl
        .to(clouds, { y: 0, opacity: 0.8, duration: 1.4, ease: "power2.out" }, 0)
        .to(house, { x: 0, opacity: 1, duration: 1.2, delay: 0.15, ease: "back.out(1.7)" }, 0)
        .to(text, { x: 0, opacity: 1, duration: 1.0, delay: 0.35, ease: "power2.out" }, 0.15)
        .to(buttons, { x: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out" }, 0.5);

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top", 
          end: () => "+=" + Math.max(hero.offsetHeight, window.innerHeight * 0.6), 
          scrub: 0.3, 
        }
      });

      scrollTl
        .to(clouds, { y: -200, opacity: 0, ease: "none" }, 0)
        .to(house, { x: 300, opacity: 0, ease: "none" }, 0)
        .to(text, { x: -100, opacity: 0, ease: "none" }, 0)
        .to(buttons, { x: -80, opacity: 0, stagger: 0.12, ease: "none" }, 0);

    }, heroRef);

    return () => ctx.revert(); 
  }, []);

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.skyBackground}></div>

      <div ref={cloudsRef} className={styles.cloudsContainer}>
        <img src={cloudImage} alt="Clouds" className={styles.clouds} />
      </div>

      <div className={styles.content}>
        <div ref={textRef} className={styles.textContent}>
          <h1>{title}</h1>
          <p>{subtitle}</p>

          <div ref={buttonsRef} className={styles.buttonGroup}>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className={`${styles.primaryButton} hero-button`}
            >
              <Link to="/portal">Get Started</Link>
            </motion.button>

          
          </div>
        </div>

        <div className={styles.houseContainer}>
          <img ref={houseRef} src={houseImage} alt="House" className={styles.house} />
        </div>
      </div>
    </section>
  );
};

export default Hero;