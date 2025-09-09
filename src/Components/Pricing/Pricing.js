import React, { useEffect, useRef, useState } from 'react';
import styles from './Pricing.module.css';
import { Container, Row, Col } from 'react-bootstrap';
import useAdminData from '../../pages/AdminPortal/hooks/useAdminData.js';
import { gsap, ScrollTrigger } from '../../utils/gsapConfig';
import buildingImage from '../../assets/images/building1.png';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Pricing = () => {
  const { getPublicPricing } = useAdminData();
  const pricingPlans = getPublicPricing();
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderTrackRef = useRef(null);

  // Slider navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === pricingPlans.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? pricingPlans.length - 1 : prev - 1));
  };

  // Update slider position when currentSlide changes
  useEffect(() => {
    if (sliderTrackRef.current) {
      const slideWidth = 100; // 100% per slide
      sliderTrackRef.current.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
    }
  }, [currentSlide]);

  useEffect(() => {
    // Animation for section title
    gsap.fromTo(`.${styles.sectionTitle}`, 
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8,
        scrollTrigger: {
          trigger: `.${styles.sectionTitle}`,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animation for background image
    gsap.fromTo(`.${styles.backgroundImage}`, 
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 1.5,
        scrollTrigger: {
          trigger: `.${styles.pricingSection}`,
          start: 'top bottom',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animation for cards
    cardRefs.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(card, 
          { y: 100, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.6, 
            delay: index * 0.2,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Hover animation
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { y: -10, duration: 0.3 });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { y: 0, duration: 0.3 });
        });
      }
    });
  }, []);

  // Add cards to refs array
  const addToRefs = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  return (
    <section className={styles.pricingSection} ref={sectionRef}>
      {/* Background Image */}
      <div 
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${buildingImage})` }}
      ></div>
      
      <Container>
        <Row className="justify-content-center mb-5">
          <Col xs={12} className="text-center">
            <h2 className={styles.sectionTitle}>Start here and scale up</h2>
            <div className={styles.titleUnderline}></div>
            <p className={styles.sectionSubtitle}>
              Choose the plan that works best for your business needs
            </p>
          </Col>
        </Row>

        {/* Desktop View - Original Grid Layout */}
        <Row className={styles.pricingCards}>
          {pricingPlans.map((plan, index) => (
            <Col 
              key={index} 
              lg={2} 
              md={4} 
              sm={6}
              className={styles.pricingCol}
              ref={addToRefs}
            >
              <div className={`${styles.pricingCard} ${plan.popular ? styles.popularCard : ''}`}>
                {plan.popular && (
                  <div className={styles.popularBadge}>Most Popular</div>
                )}
                
                <div className={styles.cardHeader}>
                  <h3 className={styles.planName}>{plan.package}</h3>
                </div>
                
                <div className={styles.priceSection}>
                  <div className={styles.price}>{plan.price}</div>
                </div>
                
                <div className={styles.featuresList}>
                  <div className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    Up to {plan.photocount} contacts
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    Unlimited team members
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    Payments
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    Authentication
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    CRM
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    Email marketing
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    Help desk
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span>
                    Reporting
                  </div>
                </div>
                
                <button className={styles.ctaButton}>
                  Get started
                </button>
              </div>
            </Col>
          ))}
        </Row>

        {/* Mobile View - Slider (Hidden on desktop) */}
        <div className={styles.pricingSlider}>
          <div className={styles.sliderContainer}>
            {/* Slider Arrows */}
            <button className={styles.sliderArrow} onClick={prevSlide}>
              &#8249;
            </button>
            <button className={`${styles.sliderArrow} ${styles.sliderArrowRight}`} onClick={nextSlide}>
              &#8250;
            </button>
            
            {/* Slider Track */}
            <div className={styles.sliderTrack} ref={sliderTrackRef}>
              {pricingPlans.map((plan, index) => (
                <div key={index} className={styles.slide}>
                  <div className={`${styles.pricingCard} ${plan.popular ? styles.popularCard : ''}`}>
                    {plan.popular && (
                      <div className={styles.popularBadge}>Most Popular</div>
                    )}
                    
                    <div className={styles.cardHeader}>
                      <h3 className={styles.planName}>{plan.package}</h3>
                    </div>
                    
                    <div className={styles.priceSection}>
                      <div className={styles.price}>{plan.price}</div>
                    </div>
                    
                    <div className={styles.featuresList}>
                      <div className={styles.featureItem}>
                        <span className={styles.checkIcon}>✓</span>
                        Up to {plan.photocount} contacts
                      </div>
                      <div className={styles.featureItem}>
                        <span className={styles.checkIcon}>✓</span>
                        Unlimited team members
                      </div>
                      <div className={styles.featureItem}>
                        <span className={styles.checkIcon}>✓</span>
                        Payments
                      </div>
                      <div className={styles.featureItem}>
                        <span className={styles.checkIcon}>✓</span>
                        Authentication
                      </div>
                      <div className={styles.featureItem}>
                        <span className={styles.checkIcon}>✓</span>
                        CRM
                      </div>
                      <div className={styles.featureItem}>
                        <span className={styles.checkIcon}>✓</span>
                        Email marketing
                      </div>
                      <div className={styles.featureItem}>
                        <span className={styles.checkIcon}>✓</span>
                        Help desk
                      </div>
                      <div className={styles.featureItem}>
                        <span className={styles.checkIcon}>✓</span>
                        Reporting
                      </div>
                    </div>
                    
                    <button className={styles.ctaButton}>
                      Get started
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* "Slide for more packages" text */}
          <p className={styles.slideHint}>Slide for more packages</p>
          
          {/* Dots Navigation */}
          <div className={styles.sliderNav}>
            {pricingPlans.map((_, index) => (
              <div
                key={index}
                className={`${styles.sliderDot} ${currentSlide === index ? styles.active : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Pricing;