import React, { useEffect, useRef, useState } from 'react';
import styles from './Pricing.module.css';
import { Container, Row, Col } from 'react-bootstrap';
import useAdminData from '../AdminPortal/hooks/useAdminData.js';
import { gsap } from '../../utils/gsapConfig';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PricingPage = () => {
  const { getPublicPricing } = useAdminData();
  const pricingPlans = getPublicPricing();
  const sectionRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderTrackRef = useRef(null);
  const addOnsRef = useRef(null);

  const particlesRef = useRef(null);
  const floatingShapesRef = useRef(null);
  const gradientOrbsRef = useRef(null);

  const pricingCardsRef = useRef([]);
  const addOnItemsRef = useRef([]);

  const videoLengths = {
    Express: "30–45 seconds",
    Quick: "~60 seconds",
    Standard: "60–90 seconds",
    Pro: "90–120 seconds",
    Ultra: "120–150 seconds"
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === pricingPlans.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? pricingPlans.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (sliderTrackRef.current) {
      const slideWidth = 100; 
      sliderTrackRef.current.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
    }
  }, [currentSlide]);

  useEffect(() => {
    const particles = particlesRef.current.children;
    const floatingShapes = floatingShapesRef.current.children;
    const gradientOrbs = gradientOrbsRef.current.children;

    gsap.to(particles, {
      y: (i) => (i % 2 === 0 ? -20 : 20),
      x: (i) => (i % 3 === 0 ? -15 : 15),
      rotation: (i) => (i % 2 === 0 ? -5 : 5),
      duration: 4 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      stagger: 0.2,
      ease: "sine.inOut"
    });

    gsap.to(floatingShapes, {
      y: -30,
      rotation: 360,
      duration: 20,
      repeat: -1,
      yoyo: true,
      stagger: 0.5,
      ease: "none"
    });

    gsap.to(gradientOrbs, {
      scale: 1.2,
      opacity: 0.7,
      duration: 8,
      repeat: -1,
      yoyo: true,
      stagger: 0.3,
      ease: "sine.inOut"
    });

    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      gsap.to(particles, {
        x: (i) => i * x * 10,
        y: (i) => i * y * 5,
        duration: 1.5,
        ease: "power2.out",
        overwrite: "auto"
      });

      gsap.to(floatingShapes, {
        x: x * 20,
        y: y * 10,
        duration: 2,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    gsap.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 });
  }, []);

  useEffect(() => {
    if (pricingCardsRef.current.length > 0) {
      gsap.utils.toArray(pricingCardsRef.current).forEach((card, index) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: index * 0.1,
            scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" },
            ease: "back.out(1.7)" }
        );
      });
    }
  }, [pricingPlans]);

  useEffect(() => {
    gsap.fromTo(addOnsRef.current, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 1,
      scrollTrigger: { trigger: addOnsRef.current, start: "top 80%", toggleActions: "play none none none" }
    });

    if (addOnItemsRef.current.length > 0) {
      gsap.utils.toArray(addOnItemsRef.current).forEach((item, index) => {
        gsap.fromTo(item,
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: index * 0.1,
            scrollTrigger: { trigger: item, start: "top 85%", toggleActions: "play none none none" },
            ease: "back.out(1.7)" }
        );
      });
    }
  }, []);

  const addOns = {
    narration: [
      { name: "Voiceover (AI-generated)", price: "$30", description: "Professional AI voice reading your script or property highlights." },
      { name: "Talk-through narration", price: "$80", description: "AI avatar walking into the scene or a digital avatar of the agent delivering a walkthrough." }
    ],
    social: [
      { name: "Reel Split", price: "$50", description: "Cuts your property video into 3 vertical reels (10–25 sec each)." }
    ],
    delivery: [
      { name: "Rush Delivery 12 hr turnaround", price: "$50" },
      { name: "Revisions (per extra round)", price: "$10" },
      { name: "Premium Edit", price: "$40", description: "Adds advanced transitions, smoother pacing, and cinematic polish." }
    ],
    bundles: [
      { name: "Social Boost Pack", price: "$90", description: "Reel Split + Voiceover + Rush Delivery → $130 value" },
      { name: "Agent Presenter Pack", price: "$150", description: "Talk-through narration + AI avatar of agent + Premium Edit → $180 value" },
      { name: "Full Marketing Pack", price: "$200", description: "Everything included → $250 value" }
    ]
  };

  return (
    <div style={{ paddingTop: '0px' }}>
      <section className={styles.pricingSection} ref={sectionRef}>
        
        <div className={styles.animatedBackground}>
          <div ref={particlesRef} className={styles.particlesContainer}>
            {[...Array(15)].map((_, i) => (<div key={i} className={styles.particle}></div>))}
          </div>
          <div ref={floatingShapesRef} className={styles.floatingShapes}>
            <div className={styles.floatingShape}></div>
            <div className={styles.floatingShape}></div>
            <div className={styles.floatingShape}></div>
          </div>
          <div ref={gradientOrbsRef} className={styles.gradientOrbs}>
            <div className={styles.gradientOrb}></div>
            <div className={styles.gradientOrb}></div>
            <div className={styles.gradientOrb}></div>
          </div>
          <div className={styles.animatedGrid}></div>
        </div>

        <Container>
          <Row className="justify-content-center mb-5">
            <Col xs={12} className="text-center">
              <h2 className={styles.sectionTitle}>Start here and scale up</h2>
              <div className={styles.titleUnderline}></div>
              <p className={styles.sectionSubtitle}>Choose the plan that works best for your business needs</p>
            </Col>
          </Row>

          {/* Desktop View */}
          <Row className={styles.pricingCards}>
            {pricingPlans.map((plan, index) => (
              <Col key={index} lg={2} md={4} sm={6} className={styles.pricingCol}>
                <div className={`${styles.pricingCard} ${plan.popular ? styles.popularCard : ''}`}
                  ref={el => pricingCardsRef.current[index] = el}>
                  {plan.popular && <div className={styles.popularBadge}>Popular</div>}

                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>{plan.package}</h3>
                  </div>

                  <div className={styles.priceSection}>
                    <div className={styles.price}>{plan.price}</div>
                  </div>

                  <div className={styles.featuresList}>
                    <div className={styles.featureItem}>
                      <span className={styles.checkIcon}>✓</span>
                      Video Length: {videoLengths[plan.package] || "—"}
                    </div>
                    <div className={styles.featureItem}>
                      <span className={styles.checkIcon}>✓</span>
                      Photos: {plan.photocount}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <div className={styles.pricingSlider}>
            <div className={styles.sliderContainer}>
              <button className={styles.sliderArrow} onClick={prevSlide}>&#8249;</button>
              <button className={`${styles.sliderArrow} ${styles.sliderArrowRight}`} onClick={nextSlide}>&#8250;</button>
              <div className={styles.sliderTrack} ref={sliderTrackRef}>
                {pricingPlans.map((plan, index) => (
                  <div key={index} className={styles.slide}>
                    <div className={`${styles.pricingCard} ${plan.popular ? styles.popularCard : ''}`}>
                      {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
                      <div className={styles.cardHeader}><h3 className={styles.planName}>{plan.package}</h3></div>
                      <div className={styles.priceSection}><div className={styles.price}>{plan.price}</div></div>
                      <div className={styles.featuresList}>
                        <div className={styles.featureItem}>
                          <span className={styles.checkIcon}>✓</span>
                          Video Length: {videoLengths[plan.package] || "—"}
                        </div>
                        <div className={styles.featureItem}>
                          <span className={styles.checkIcon}>✓</span>
                          Photos: {plan.photocount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className={styles.slideHint}>Slide for more packages</p>
            <div className={styles.sliderNav}>
              {pricingPlans.map((_, index) => (
                <div key={index}
                  className={`${styles.sliderDot} ${currentSlide === index ? styles.active : ''}`}
                  onClick={() => setCurrentSlide(index)} />
              ))}
            </div>
          </div>

          <div ref={addOnsRef} className={styles.addOnsSection}>
            <Row className="justify-content-center mb-5">
              <Col xs={12} className="text-center">
                <h2 className={styles.sectionTitle}>Add More, Do More</h2>
                <div className={styles.titleUnderline}></div>
                <p className={styles.sectionSubtitle}>Enhance your experience with these premium additions</p>
              </Col>
            </Row>
            <Row>
              <Col md={6} lg={3} className={styles.addOnCategory}>
                <div className={styles.addOnHeader}><h3>Narration & Presentation</h3></div>
                {addOns.narration.map((item, index) => (
                  <div key={index} className={styles.addOnItem} ref={el => addOnItemsRef.current.push(el)}>
                    <div className={styles.addOnName}>{item.name}</div>
                    <div className={styles.addOnPrice}>{item.price}</div>
                    <div className={styles.addOnDescription}>{item.description}</div>
                  </div>
                ))}
              </Col>
              <Col md={6} lg={3} className={styles.addOnCategory}>
                <div className={styles.addOnHeader}><h3>Social Media</h3></div>
                {addOns.social.map((item, index) => (
                  <div key={index} className={styles.addOnItem} ref={el => addOnItemsRef.current.push(el)}>
                    <div className={styles.addOnName}>{item.name}</div>
                    <div className={styles.addOnPrice}>{item.price}</div>
                    <div className={styles.addOnDescription}>{item.description}</div>
                  </div>
                ))}
              </Col>
              <Col md={6} lg={3} className={styles.addOnCategory}>
                <div className={styles.addOnHeader}><h3>Delivery & Edits</h3></div>
                {addOns.delivery.map((item, index) => (
                  <div key={index} className={styles.addOnItem} ref={el => addOnItemsRef.current.push(el)}>
                    <div className={styles.addOnName}>{item.name}</div>
                    <div className={styles.addOnPrice}>{item.price}</div>
                    {item.description && <div className={styles.addOnDescription}>{item.description}</div>}
                  </div>
                ))}
              </Col>
              <Col md={6} lg={3} className={styles.addOnCategory}>
                <div className={styles.addOnHeader}><h3>Add-On Bundles</h3></div>
                {addOns.bundles.map((item, index) => (
                  <div key={index} className={styles.addOnItem} ref={el => addOnItemsRef.current.push(el)}>
                    <div className={styles.addOnName}>{item.name}</div>
                    <div className={styles.addOnPrice}>{item.price}</div>
                    <div className={styles.addOnDescription}>{item.description}</div>
                  </div>
                ))}
              </Col>
            </Row>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default PricingPage;
