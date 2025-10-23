import React, { useState, useEffect, useRef } from "react";
import { gsap } from 'gsap';

import {  ScrollTrigger } from '../../utils/gsapConfig';
import styles from "./VideoComparison.module.css";
import { Container, Row, Col } from "react-bootstrap";


const VideoComparison = ({
  title,
  description,
  comparisons,
  slideInterval = 5000,
  showLabels = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const frameRef = useRef(null);
  const titleRef = useRef(null);
  const animationRef = useRef(null);

  // Reset video when source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current
        .play()
        .catch((e) => console.log("Autoplay prevented:", e));
    }
  }, [activeIndex, comparisons]);

  // Animate floating background circles
  useEffect(() => {
    const circles = containerRef.current.querySelectorAll(`.${styles.bgCircle}`);
    if (circles.length > 0) {
      circles.forEach((circle, i) => {
        gsap.set(circle, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          width: 80 + Math.random() * 120,
          height: 80 + Math.random() * 120,
        });

        gsap.to(circle, {
          x: "+=" + (Math.random() * 200 - 100),
          y: "+=" + (Math.random() * 200 - 100),
          repeat: -1,
          yoyo: true,
          duration: 6 + Math.random() * 4,
          ease: "sine.inOut",
        });
      });
    }
  }, []);

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && comparisons?.length) {
        goToNext();
      }
    }, slideInterval);
    return () => clearInterval(interval);
  }, [isPlaying, comparisons?.length, slideInterval, activeIndex]);

  const goToPrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? comparisons.length - 1 : prev - 1
    );
    resetAutoPlay();
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % comparisons.length);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), slideInterval * 2);
  };

  // GSAP animations
  useEffect(() => {
    // Create elegant animated background
    const createShapes = () => {
      const shapesContainer = containerRef.current.querySelector('.VideoComparison_bgAnimation__HgyZ');
      if (!shapesContainer) return;
      
      const shapes = [];
      const shapeTypes = ['circle', 'square', 'triangle'];
      
      for (let i = 0; i < 12; i++) {
        const shape = document.createElement("div");
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        shape.className = `${styles.bgShape} ${styles[type]}`;
        shapesContainer.appendChild(shape);
        shapes.push(shape);
        
        gsap.set(shape, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          rotation: Math.random() * 360,
          opacity: 0.1 + Math.random() * 0.2,
          scale: 0.3 + Math.random() * 0.7
        });
        
        gsap.to(shape, {
          x: "+=" + (Math.random() * 300 - 150),
          y: "+=" + (Math.random() * 300 - 150),
          rotation: "+=" + (Math.random() * 180 - 90),
          opacity: 0.05 + Math.random() * 0.15,
          scale: 0.4 + Math.random() * 0.6,
          duration: 15 + Math.random() * 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    };
    
    createShapes();

    // Title animation - triggered by scroll
    const titleElement = titleRef.current;
    if (titleElement) {
      const textContainer = document.createElement("div");
      textContainer.className = styles.animatedTextContainer;
      
      const text = title;
      const words = text.split(" ");
      
      words.forEach((word, i) => {
        const wordSpan = document.createElement("span");
        wordSpan.className = styles.word;
        wordSpan.textContent = word + (i < words.length - 1 ? " " : "");
        textContainer.appendChild(wordSpan);
      });
      
      titleElement.innerHTML = "";
      titleElement.appendChild(textContainer);
      
      const wordElements = titleElement.querySelectorAll(`.${styles.word}`);
      if (wordElements.length > 0) {
        gsap.set(wordElements, {
          opacity: 0,
          y: 80
        });
        
        animationRef.current = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "top 5%",
            toggleActions: "play reverse play reverse",
          }
        });
        
        animationRef.current.to(wordElements, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "power2.out"
        });
      }
    }

    if (frameRef.current) {
      gsap.fromTo(
        frameRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );
    }
    
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [title]);

  return (
    <Container
      fluid
      className={`${styles.sectionWrapper} py-3 py-md-5`}
      ref={containerRef}
    >
      <div className={styles.bgAnimation}>
      </div>

      {/* Header */}
      <Row className="mb-3 mb-md-5 mx-0" ref={headingRef}>
        <Col xs={12} className="px-0">
          <div className={`${styles.headerDesign} text-center`}>
            <h2 className={`${styles.title} mb-2 mb-md-3`} ref={titleRef}>{title}</h2>
            {description && (
              <p className={`${styles.description} mb-0`}>{description}</p>
            )}
          </div>
        </Col>
      </Row>

      {/* Comparison */}
      <Row className="justify-content-center mx-0">
        <Col xs={12} className="px-0">
          <div className={styles.comparisonContainer}>
            <div className={styles.comparisonFrame} ref={frameRef}>
              <div className={styles.mediaWrapper}>
                <button
                  className={`${styles.navArrow} ${styles.arrowLeft}`}
                  onClick={goToPrev}
                >&#8249;
                  <i className="bi bi-chevron-left"></i>
                </button>

                <div className={styles.mediaGrid}>
                  <div className={styles.mediaColumn}>
                    <div className={styles.mediaFrame}>
                      <img
                        src={comparisons[activeIndex]?.photo}
                        alt="Before"
                        className={styles.mediaContent}
                        loading="lazy"
                      />
                    </div>
                    {showLabels && (
                      <div className={styles.labelContainer}>
                        <span className={styles.mediaLabel}>Before</span>
                      </div>
                    )}
                  </div>

                  {/* AFTER - Fixed structure */}
                  <div className={styles.mediaColumn}>
                    <div className={styles.mediaFrame}>
                      <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={styles.mediaContent}
                      >
                        <source
                          src={comparisons[activeIndex]?.video}
                          type="video/mp4"
                        />
                      </video>
                    </div>
                    {showLabels && (
                      <div className={styles.labelContainer}>
                        <span className={styles.mediaLabel}>After</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Arrow */}
                <button
                  className={`${styles.navArrow} ${styles.arrowRight}`}
                  onClick={goToNext}
                >&#8250;
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center mx-0 mt-3 mt-md-4">
        <Col xs="auto" className="px-0">
          <div className={styles.indicators}>
            {comparisons?.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${
                  index === activeIndex ? styles.active : ""
                }`}
                onClick={() => {
                  setActiveIndex(index);
                  resetAutoPlay();
                }}
              />
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default VideoComparison;