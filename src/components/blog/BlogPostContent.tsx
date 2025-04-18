
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface BlogPostContentProps {
  content: string;
}

const BlogPostContent = ({ content }: BlogPostContentProps) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const isItalian = language === "it";
  
  const modifiedContent = React.useMemo(() => {
    if (!content) return "";
    
    // Identify Maya Johnson quote in both languages
    const englishQuote = `"The emotional intelligence gap between basic and advanced AI implementations is becoming a major competitive differentiator. Companies leading in this area are seeing significant loyalty improvements because customers feel genuinely understood." — Maya Johnson, Chief Customer Experience Officer at Deloitte Digital`;
    const italianQuote = `"Il divario di intelligenza emotiva tra implementazioni IA di base e avanzate sta diventando un importante fattore differenziante competitivo. Le aziende leader in quest'area stanno vedendo significativi miglioramenti nella fedeltà perché i clienti si sentono realmente compresi." — Maya Johnson, Chief Customer Experience Officer presso Deloitte Digital`;
    
    const quoteToFind = isItalian ? italianQuote : englishQuote;
    
    // Only proceed if the quote exists in the content
    if (content.includes(quoteToFind)) {
      // Set the appropriate image URL based on device type
      const desktopImageUrl = "/lovable-uploads/c58f3f96-294d-41f7-8a9b-4dcefa5823ed.png";
      const mobileImageUrl = "/lovable-uploads/329dab58-64c7-4a2a-95fc-b22a6742091b.png";
      const imageUrl = isMobile ? mobileImageUrl : desktopImageUrl;
      
      const imageTag = `
        <div class="my-8">
          <img 
            src="${imageUrl}" 
            alt="Marketing Transformation" 
            class="w-full rounded-lg shadow-md" 
          />
        </div>
      `;
      
      return content.replace(quoteToFind, `${quoteToFind}${imageTag}`);
    }
    
    return content;
  }, [content, isMobile, isItalian]);
  
  return (
    <article className="bg-white rounded-xl shadow-md p-6 md:p-10 mb-12">
      <div 
        className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-a:text-primary prose-a:font-medium prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:p-4 prose-blockquote:rounded-md prose-blockquote:text-gray-700 prose-blockquote:italic prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: modifiedContent }}
      />
      
      <style>{`
        .prose p {
          text-align: justify;
          color: rgb(75 85 99);
        }
        .prose li {
          text-align: justify;
          color: rgb(75 85 99);
        }
      `}</style>
    </article>
  );
};

export default BlogPostContent;
