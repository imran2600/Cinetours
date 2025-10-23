import React, { useEffect, useRef } from 'react';
import styles from './CostComparison.module.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiClock, FiDollarSign, FiFilm, FiCheckCircle, FiXCircle } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const CostComparison = () => {
  const titleRef = useRef(null);

  const comparisonData = [
    {
      category: "Time",
      icon: <FiClock className={styles.icon}/>,
      items: [
        { feature: "Turnaround", ai: "24-48 hours", traditional: "2-3 weeks", advantage: "83% faster" },
        { feature: "Scheduling", ai: "Instant upload", traditional: "1-2 week wait", advantage: "No delays" }
      ]
    },
    {
      category: "Cost",
      icon: <FiDollarSign className={styles.icon}/>,
      items: [
        { feature: "Production", ai: "$49-$149", traditional: "$1,500-$5,000", advantage: "90% cheaper" },
        { feature: "Recurring", ai: "None", traditional: "$200+/month", advantage: "No equipment costs" }
      ]
    },
    {
      category: "Quality",
      icon: <FiFilm className={styles.icon}/>,
      items: [
        { feature: "Resolution", ai: "4K HDR", traditional: "4K", advantage: "Equal quality" },
        { feature: "Revisions", ai: "Unlimited", traditional: "$150/revision", advantage: "More flexibility" }
      ]
    }
  ];

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { x: 200, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }
  }, []);

  return (
    <section className={styles.section}>
      <img src="/images/building.png" alt="Building" className={styles.buildingImage} />

      <div className={styles.container}>
        <div className={styles.titleContainer} ref={titleRef}>
          <h2 className={styles.mainTitle}>Comparison with Traditional Video Shooting</h2>
          <p className={styles.subtitle}>
            See how AI video generation saves time and money while delivering professional results
          </p>
        </div>

        <div className={styles.desktopTable}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Category</th>
                <th>Feature</th>
                <th><FiCheckCircle /> AI Service</th>
                <th><FiXCircle /> Traditional</th>
                <th>Advantage</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((category, catIndex) => (
                <React.Fragment key={catIndex}>
                  {category.items.map((item, itemIndex) => (
                    <tr key={itemIndex} className={styles.tableRow}>
                      {itemIndex === 0 && (
                        <td rowSpan={category.items.length} className={styles.categoryCell}>
                          {category.icon} {category.category}
                        </td>
                      )}
                      <td className={styles.featureCell}>{item.feature}</td>
                      <td className={styles.aiCell}>{item.ai}</td>
                      <td className={styles.traditionalCell}>{item.traditional}</td>
                      <td className={styles.advantageCell}>{item.advantage}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.mobileCards}>
          {comparisonData.map((category, catIndex) => (
            <div key={catIndex} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                {category.icon}
                <h3 className={styles.categoryTitle}>{category.category}</h3>
              </div>
              
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className={styles.comparisonCard}>
                  <h4 className={styles.featureTitle}>{item.feature}</h4>
                  
                  <div className={styles.comparisonRow}>
                    <div className={styles.serviceType}>
                      <FiCheckCircle className={styles.aiIcon} />
                      <span>AI Service</span>
                    </div>
                    <div className={styles.serviceValue}>
                      {item.ai}
                    </div>
                  </div>
                  
                  <div className={styles.comparisonRow}>
                    <div className={styles.serviceType}>
                      <FiXCircle className={styles.traditionalIcon} />
                      <span>Traditional</span>
                    </div>
                    <div className={styles.serviceValue}>
                      {item.traditional}
                    </div>
                  </div>
                  
                  <div className={styles.advantageBadge}>
                    {item.advantage}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CostComparison;