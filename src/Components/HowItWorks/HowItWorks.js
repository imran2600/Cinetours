import React, { useEffect, useRef } from 'react';
 import styles from './HowItWorks.module.css';
 import { SplitText } from 'gsap/SplitText';
 import { gsap, ScrollTrigger } from '../../utils/gsapConfig';
 import HIW1 from '../../assets/images/HIW1.jpg';
 import HIW2 from '../../assets/images/HIW2.jpg';
 import HIW3 from '../../assets/images/HIW3.jpg';


 const UploadIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
     <polyline points="17 8 12 3 7 8"/>
     <line x1="12" y1="3" x2="12" y2="15"/>
   </svg>
 );

 const VideoIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
     <polygon points="23 7 16 12 23 17 23 7"/>
     <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
   </svg>
 );

 const DownloadIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
     <polyline points="7 10 12 15 17 10"/>
     <line x1="12" y1="15" x2="12" y2="3"/>
   </svg>
 );

 gsap.registerPlugin(SplitText, ScrollTrigger);

 const HowItWorks = () => {
   const containerRef = useRef(null);
   const sectionsRef = useRef([]);
   const imagesRef = useRef([]);
   const headingsRef = useRef([]);
   const outerWrappersRef = useRef([]);
   const innerWrappersRef = useRef([]);
   const titleRef = useRef(null);
   const animating = useRef(false);
   const currentIndex = useRef(0);
   const sectionRef = useRef(null);

   const steps = [
     {
       icon: <UploadIcon />,
       title: 'Upload your listing photos',
       description: 'Select and upload the photos for your property.',
       background: HIW1
     },
     {
       icon: <VideoIcon />,
       title: <>AI editing creates <br /> your videos</>,
       description: 'Our AI tools stitch together cinematic walkthroughs.',
       background: HIW2
     },
     {
       icon: <DownloadIcon />,
       title: 'Download & post in 24–48 hours',
       description: 'Receive your video and share it anywhere.',
       background: HIW3
     }
   ];

   const gotoSection = (index, direction) => {
     if (animating.current) return;
     animating.current = true;

     const fromTop = direction === -1;
     const dFactor = fromTop ? -1 : 1;

     const tl = gsap.timeline({
       defaults: { duration: 1.25, ease: "power1.inOut" },
       onComplete: () => animating.current = false
     });

     if (currentIndex.current >= 0) {
       gsap.set(sectionsRef.current[currentIndex.current], { zIndex: 0 });
       tl.to(imagesRef.current[currentIndex.current], { yPercent: -15 * dFactor })
         .set(sectionsRef.current[currentIndex.current], { autoAlpha: 0 });
     }

     gsap.set(sectionsRef.current[index], { autoAlpha: 1, zIndex: 1 });

     tl.fromTo([outerWrappersRef.current[index], innerWrappersRef.current[index]],
       { yPercent: i => i ? -100 * dFactor : 100 * dFactor },
       { yPercent: 0 }, 0
     )
     .fromTo(imagesRef.current[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
     .fromTo(new SplitText(headingsRef.current[index], { type: "chars", charsClass: styles.clipText }).chars, {
       autoAlpha: 0,
       yPercent: 150 * dFactor
     }, {
       autoAlpha: 1,
       yPercent: 0,
       duration: 1,
       ease: "power2",
       stagger: {
         each: 0.02,
         from: "random"
       }
     }, 0.2);

     currentIndex.current = index;
   };

   useEffect(() => {
     const splitTitle = new SplitText(titleRef.current, {
       type: "chars",
       charsClass: styles.char
     });

     gsap.set(splitTitle.chars, {
       opacity: 0,
       y: 100,
       rotationX: -90,
       scale: 0.5
     });

     gsap.to(splitTitle.chars, {
       opacity: 1,
       y: 0,
       rotationX: 0,
       scale: 1,
       duration: 1.5,
       ease: "back.out(1.7)",
       stagger: {
         each: 0.05,
         from: "center"
       },
       scrollTrigger: {
         trigger: sectionRef.current,
         start: "top 85%",
         end: "top 30%",
         scrub: 1,
         markers: false
       }
     });

     return () => {
       splitTitle.revert();
     };
   }, []);

   // Auto-play the slides
   useEffect(() => {
     let timer;
     const autoPlay = () => {
       timer = setTimeout(() => {
         let newIndex = currentIndex.current + 1;
         if (newIndex >= steps.length) {
           newIndex = 0; 
         }
         gotoSection(newIndex, 1);
         autoPlay();
       }, 5000); 
     };

     gsap.set(sectionsRef.current[0], { autoAlpha: 1, zIndex: 1 });
     gsap.set(outerWrappersRef.current[0], { yPercent: 0 });
     gsap.set(innerWrappersRef.current[0], { yPercent: 0 });
     gsap.set(imagesRef.current[0], { yPercent: 0 });

     autoPlay();

     return () => {
       clearTimeout(timer);
     };
   }, [steps.length]);

   return (
     <section className={styles.section} ref={sectionRef}>
       <div className={styles.skyblueBackground}></div>
       
       <div className={styles.header}>
         <h2 ref={titleRef} className={styles.sectionTitle}>How It Works</h2>
         <p className={styles.sectionSubtitle}>Watch the process unfold</p>
       </div>
       
       <div className={styles.container} ref={containerRef}>
         {steps.map((step, index) => (
           <div
             key={index}
             className={styles.stepSection}
             ref={el => {
               sectionsRef.current[index] = el;
             }}
           >
             <div
               className={styles.outer}
               ref={el => outerWrappersRef.current[index] = el}
             >
               <div
                 className={styles.inner}
                 ref={el => innerWrappersRef.current[index] = el}
               >
                 <div
                   className={styles.bg}
                   style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url(${step.background})` }}
                   ref={el => imagesRef.current[index] = el}
                 >
                   <div className={styles.contentContainer}>
                     <div className={styles.blurCard}>
                       <div className={styles.stepIcon}>
                         {step.icon}
                       </div>
                       <h3
                         className={styles.stepTitle}
                         ref={el => headingsRef.current[index] = el}
                       >
                         {step.title}
                       </h3>
                       <p className={styles.stepDescription}>{step.description}</p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         ))}
       </div>
     </section>
   );
 };

 export default HowItWorks;