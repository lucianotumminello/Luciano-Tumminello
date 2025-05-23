
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

// Responsive and lazy-loading for SEO and performance
const ProfileImage = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Preload high-priority image
  useEffect(() => {
    // Create preload link for critical image
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = "/lovable-uploads/2598eb07-464e-4495-a4bd-acc4b5070f3a.png";
    document.head.appendChild(preloadLink);
    
    // Use priority hints for modern browsers
    if (imageRef.current) {
      // @ts-ignore - Experimental feature
      imageRef.current.fetchPriority = 'high';
    }
  }, []);
  
  // Use intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Preload the image when it's about to come into view
          const img = new Image();
          img.src = "/lovable-uploads/2598eb07-464e-4495-a4bd-acc4b5070f3a.png";
          img.onload = () => setImageLoaded(true);
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px', // Start loading 200px before it comes into view
      threshold: 0.01
    });
    
    const element = document.getElementById('profile-image-container');
    if (element) observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Generate different image sizes for responsive loading with WebP format
  const imageSrcSet = `
    /lovable-uploads/2598eb07-464e-4495-a4bd-acc4b5070f3a.png?format=webp 970w,
    /lovable-uploads/2598eb07-464e-4495-a4bd-acc4b5070f3a.png?width=672&format=webp 672w,
    /lovable-uploads/2598eb07-464e-4495-a4bd-acc4b5070f3a.png?width=480&format=webp 480w
  `;

  // Low-quality image placeholder (LQIP) for faster perceived performance
  const lqip = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAIAAoBAREA/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUI/8QAIRAAAQMDBAMAAAAAAAAAAAAAAQIDBQQGESEABzFBURIj/9oACAEBAAA/AClVbele3d5v1BuIplOulyfadWnqpAbbcR+6R8kAkZBO/K8KNzejtv6Nb1JuDdNDqTq22VFMVtsrCCSBzjAJ+jnzrSwuDQaZY0sklSJSFMJAOSU+eOdKnX//2Q==";

  return (
    <section className="py-10 md:py-20 px-4 bg-gray-50 layout-optimized">
      <div className="container mx-auto max-w-5xl">
        <div 
          id="profile-image-container"
          className="w-full relative min-h-[200px]"
        >
          {/* Low quality image placeholder - visible immediately */}
          <div 
            className={cn(
              "absolute inset-0 bg-cover bg-center rounded-lg overflow-hidden transition-opacity duration-300",
              imageLoaded ? "opacity-0" : "opacity-100"
            )}
            style={{
              backgroundImage: `url('${lqip}')`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)"
            }}
            aria-hidden="true"
          />
          
          {/* Main image - loads with higher quality */}
          <img 
            ref={imageRef}
            src="/lovable-uploads/2598eb07-464e-4495-a4bd-acc4b5070f3a.png" 
            alt="Luciano Tumminello Portrait" 
            className={cn(
              "w-full h-auto object-cover rounded-lg shadow-xl ring-2 ring-primary/20 transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="eager" /* Critical above-the-fold image */
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
            srcSet={imageSrcSet}
            width="970"
            height="647"
            style={{ aspectRatio: "970/647", background: "linear-gradient(135deg, #F2FCE2 5%, #E5DEFF 100%)" }}
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
};

export default ProfileImage;
