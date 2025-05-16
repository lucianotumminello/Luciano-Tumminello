
import { BlogPostsStore } from './types';
import { 
  getAllBlogPosts, 
  getBlogPost 
} from './blogPostQueries';
import { 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost,
  duplicateBlogPost
} from './blogPostOperations';
import { mockApiReset } from './mockApi';

// Run this function from the browser console to test the blog system
export const runBlogSystemTests = async () => {
  console.log("Running blog system tests...");
  
  try {
    console.log("1. Resetting mock server to initial state");
    mockApiReset();
    
    console.log("2. Getting all blog posts");
    const initialPosts = await getAllBlogPosts();
    console.log("Initial posts:", initialPosts);
    
    console.log("3. Creating a new blog post");
    const newPostSlug = "test-post-" + Date.now();
    await createBlogPost(newPostSlug, {
      title: "Test Post",
      titleIT: "Post di Test",
      excerpt: "This is a test post",
      excerptIT: "Questo è un post di test",
      content: "<p>Test content</p>",
      contentIT: "<p>Contenuto di test</p>",
      author: "Test Author",
      authorImageUrl: "/test-image.jpg",
      date: "15 May 2023",
      dateIT: "15 Maggio 2023",
      category: "Test",
      categoryIT: "Test",
      imageUrl: "/test-image.jpg",
      desktopImageUrl: "/test-desktop-image.jpg",
      readingTime: "1 min read",
      readingTimeIT: "1 min di lettura",
      tags: ["test"],
      tagsIT: ["test"]
    });
    
    console.log("4. Getting the new blog post");
    const newPost = await getBlogPost(newPostSlug);
    console.log("New post:", newPost);
    
    console.log("5. Updating the blog post");
    await updateBlogPost(newPostSlug, {
      ...newPost!,
      title: "Updated Test Post",
      titleIT: "Post di Test Aggiornato"
    });
    
    console.log("6. Getting the updated blog post");
    const updatedPost = await getBlogPost(newPostSlug);
    console.log("Updated post:", updatedPost);
    
    console.log("7. Duplicating the blog post");
    const duplicatedPostSlug = newPostSlug + "-duplicate";
    await duplicateBlogPost(newPostSlug, duplicatedPostSlug);
    
    console.log("8. Getting the duplicated blog post");
    const duplicatedPost = await getBlogPost(duplicatedPostSlug);
    console.log("Duplicated post:", duplicatedPost);
    
    console.log("9. Getting all blog posts after operations");
    const finalPosts = await getAllBlogPosts();
    console.log("Final posts:", finalPosts);
    
    console.log("10. Deleting the blog posts");
    await deleteBlogPost(newPostSlug);
    await deleteBlogPost(duplicatedPostSlug);
    
    console.log("11. Getting all blog posts after deletion");
    const postsAfterDeletion = await getAllBlogPosts();
    console.log("Posts after deletion:", postsAfterDeletion);
    
    console.log("All tests completed successfully!");
    return true;
  } catch (error) {
    console.error("Test failed:", error);
    return false;
  }
};

// Export this function to make it available in the browser console
(window as any).runBlogSystemTests = runBlogSystemTests;
