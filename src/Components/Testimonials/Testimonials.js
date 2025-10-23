import React, { useEffect, useRef, useState } from "react";
import TestimonialCard from "./TestimonialCard";
import styles from "./Testimonials.module.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Testimonials = () => {
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  // Title animation - comes from right side
  useEffect(() => {
    gsap.from(titleRef.current, {
      x: 200,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: titleRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  // Cards animation
  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.from(card, {
          x: index % 2 === 0 ? -200 : 200,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
          },
        });
      }
    });
  }, []);

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "TOP PRODUCER | RE/MAX",
      message: "AutoReel transformed my business. My listings get 3x more views and my open house attendance doubled.",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "DEVELOPER | LUXE PROPERTIES",
      message: "The cinematic quality helps us command premium prices – our last project sold out 3 weeks faster.",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "BROKER OWNER | ELITE REALTY",
      message: "My agents save 10+ hours per listing while delivering superior marketing.",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5,
    },
    {
      id: 4,
      name: "David Miller",
      role: "REAL ESTATE CONSULTANT",
      message: "Impressed with the simplicity and speed. Clients love the modern look of our listings.",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
      rating: 4,
    },
    {
      id: 5,
      name: "Sophia Patel",
      role: "AGENT | DREAM HOMES",
      message: "A must-have tool for any serious realtor. It gives me a competitive advantage.",
      image: "https://randomuser.me/api/portraits/women/12.jpg",
      rating: 5,
    },
    {
      id: 6,
      name: "James Anderson",
      role: "PROPERTY INVESTOR",
      message: "Presentation is everything. This tool takes marketing to the next level.",
      image: "https://randomuser.me/api/portraits/men/25.jpg",
      rating: 4,
    },
    {
      id: 7,
      name: "Olivia Brown",
      role: "AGENT | PRIME ESTATES",
      message: "I love how professional my listings look now. It's like having a personal videographer.",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
      rating: 5,
    },
    {
      id: 8,
      name: "Daniel Wilson",
      role: "AGENCY OWNER",
      message: "Helped my agency grow faster by creating strong impressions on new clients.",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      rating: 5,
    },
    {
      id: 9,
      name: "Amelia Scott",
      role: "BROKER | SUNRISE REALTY",
      message: "It saves me hours every week. My clients always compliment the videos.",
      image: "https://randomuser.me/api/portraits/women/25.jpg",
      rating: 5,
    },
    {
      id: 10,
      name: "Robert White",
      role: "LUXURY PROPERTY AGENT",
      message: "The attention to detail is outstanding. Worth every penny!",
      image: "https://randomuser.me/api/portraits/men/60.jpg",
      rating: 5,
    },
  ];

  // Shuffle randomly
  const shuffledTestimonials = [...testimonials].sort(() => Math.random() - 0.5);

  // Slider navigation functions
  const nextSlide = () => {
    const newSlide = Math.min(currentSlide + 1, testimonials.length - 1);
    setCurrentSlide(newSlide);
  };

  const prevSlide = () => {
    const newSlide = Math.max(currentSlide - 1, 0);
    setCurrentSlide(newSlide);
  };

  return (
    <section id="testimonials" className={styles.testimonialsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tagline}>Recommendation by Clients</span>
          <h2 ref={titleRef} className={styles.sectionTitle}>
            Real Clients, Real Stories
          </h2>
          <div className={styles.titleUnderline}></div>
        </div>

        <div className={styles.testimonialsGrid}>
          {shuffledTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              ref={(el) => (cardsRef.current[index] = el)}
              className={styles.gridItem}
            >
              <TestimonialCard testimonial={testimonial} index={index} />
            </div>
          ))}
        </div>

        <div className={styles.mobileSlider}>
          <div 
            className={styles.sliderContainer}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {shuffledTestimonials.map((testimonial, index) => (
              <div key={testimonial.id} className={styles.slide}>
                <TestimonialCard testimonial={testimonial} index={index} />
              </div>
            ))}
          </div>
          
          <button className={styles.sliderArrowLeft} onClick={prevSlide}>
            &#8249;
          </button>
          <button className={styles.sliderArrowRight} onClick={nextSlide}>
            &#8250;
          </button>
          
          <div className={styles.sliderIndicators}>
            {shuffledTestimonials.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${currentSlide === index ? styles.active : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;