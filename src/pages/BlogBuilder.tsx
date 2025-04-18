
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { BlogPost } from "@/types";
import blogPostsData from "@/data/blogPostsData";
import { translateText, generateTags, estimateReadingTime } from "@/utils/blogUtils";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type AuthFormData = {
  password: string;
};

type BlogFormData = {
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  tags: string;
  desktopImageUrl: string;
  imageUrl: string;
};

// Password is explicitly set to VanBasten9!
const ADMIN_PASSWORD = "VanBasten9!";

// Extract the default author information from existing blog posts
const DEFAULT_AUTHOR = Object.values(blogPostsData)[0]?.author || "Luciano Tumminello";
const DEFAULT_AUTHOR_IMAGE = Object.values(blogPostsData)[0]?.authorImageUrl || "/lovable-uploads/56f210ad-b756-429e-b8fd-f28fbbee4cfc.png";

// Local storage key for saved password
const SAVED_PASSWORD_KEY = "blog_builder_password";

const BlogBuilder = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [desktopImageFile, setDesktopImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const desktopImageRef = useRef<HTMLInputElement>(null);
  const mobileImageRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const authForm = useForm<AuthFormData>({
    defaultValues: {
      password: "",
    }
  });

  const blogForm = useForm<BlogFormData>({
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      category: "",
      tags: "",
      desktopImageUrl: "",
      imageUrl: ""
    }
  });

  // Check for saved password on mount
  useEffect(() => {
    // Try to get saved password from localStorage
    try {
      const savedPassword = localStorage.getItem(SAVED_PASSWORD_KEY);
      if (savedPassword) {
        console.log("Found saved password");
        authForm.setValue("password", savedPassword);
        setRememberPassword(true);
        
        // Auto-login if saved password is correct
        if (savedPassword === ADMIN_PASSWORD) {
          console.log("Auto-login with saved password");
          setIsAuthenticated(true);
          toast({
            title: "Authentication successful",
            description: "Welcome to the blog builder!",
          });
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, []);

  // Reset form when switching between create and update modes
  useEffect(() => {
    if (!isUpdateMode) {
      blogForm.reset({
        title: "",
        excerpt: "",
        content: "",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        category: "",
        tags: "",
        desktopImageUrl: "",
        imageUrl: ""
      });
      setDesktopImageFile(null);
      setMobileImageFile(null);
    }
  }, [isUpdateMode, blogForm]);

  // Load post data when a post is selected for editing
  useEffect(() => {
    if (selectedPost && blogPostsData[selectedPost]) {
      const post = blogPostsData[selectedPost];
      blogForm.reset({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: post.date,
        category: post.category,
        tags: post.tags.join(", "),
        desktopImageUrl: post.desktopImageUrl,
        imageUrl: post.imageUrl
      });
    }
  }, [selectedPost, blogForm]);

  const onAuthSubmit = (data: AuthFormData) => {
    console.log("Auth submission with password:", data.password);
    console.log("ADMIN_PASSWORD:", ADMIN_PASSWORD);
    console.log("Password match?", data.password === ADMIN_PASSWORD);
    
    // Check exact string match for password
    if (data.password === ADMIN_PASSWORD) {
      console.log("Password correct, setting authenticated");
      
      // Save password if remember is checked
      if (rememberPassword) {
        try {
          localStorage.setItem(SAVED_PASSWORD_KEY, data.password);
          console.log("Password saved to localStorage");
        } catch (error) {
          console.error("Error saving password to localStorage:", error);
        }
      } else {
        try {
          localStorage.removeItem(SAVED_PASSWORD_KEY);
          console.log("Password removed from localStorage");
        } catch (error) {
          console.error("Error removing password from localStorage:", error);
        }
      }
      
      setIsAuthenticated(true);
      toast({
        title: "Authentication successful",
        description: "Welcome to the blog builder!",
      });
    } else {
      console.log("Password incorrect");
      toast({
        title: "Authentication failed",
        description: "Invalid password. Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      toast({
        title: "Image selected",
        description: `${e.target.files[0].name} selected for upload`,
      });
    }
  };

  const onBlogSubmit = async (data: BlogFormData) => {
    // Show a loading toast
    toast({
      title: "Processing...",
      description: "Preparing your blog post data",
    });

    try {
      // Extract primary tags from content for automatic tagging
      const generatedTags = await generateTags(data.content);
      const tagsToUse = data.tags ? data.tags.split(',').map(tag => tag.trim()) : generatedTags;
      
      // Estimate reading time
      const readingTime = estimateReadingTime(data.content);
      const readingTimeText = `${readingTime} min read`;

      // Translate content to Italian
      const translatedTitle = await translateText(data.title, 'en', 'it');
      const translatedExcerpt = await translateText(data.excerpt, 'en', 'it');
      const translatedContent = await translateText(data.content, 'en', 'it');
      const translatedCategory = await translateText(data.category, 'en', 'it');
      const translatedTags = await Promise.all(tagsToUse.map(tag => translateText(tag, 'en', 'it')));
      const translatedDate = await translateText(data.date, 'en', 'it');
      const translatedReadingTime = `${readingTime} min di lettura`;

      // Handle image URLs
      let desktopImageUrl = data.desktopImageUrl;
      let mobileImageUrl = data.imageUrl;

      // If there are new image uploads, create placeholders for them
      // In a real implementation, you would upload these to a server and get URLs back
      if (desktopImageFile) {
        // This would be replaced with actual upload logic in production
        desktopImageUrl = URL.createObjectURL(desktopImageFile);
        toast({
          title: "Desktop image ready",
          description: "Upload the image to your server and replace the URL in the JSON"
        });
      }

      if (mobileImageFile) {
        // This would be replaced with actual upload logic in production
        mobileImageUrl = URL.createObjectURL(mobileImageFile);
        toast({
          title: "Mobile image ready",
          description: "Upload the image to your server and replace the URL in the JSON"
        });
      }

      // Create the blog post object
      const blogPost = {
        title: data.title,
        titleIT: translatedTitle,
        excerpt: data.excerpt,
        excerptIT: translatedExcerpt,
        content: data.content,
        contentIT: translatedContent,
        author: DEFAULT_AUTHOR,
        authorImageUrl: DEFAULT_AUTHOR_IMAGE,
        date: data.date,
        dateIT: translatedDate,
        category: data.category,
        categoryIT: translatedCategory,
        imageUrl: mobileImageUrl,
        desktopImageUrl: desktopImageUrl,
        readingTime: readingTimeText,
        readingTimeIT: translatedReadingTime,
        tags: tagsToUse,
        tagsIT: translatedTags,
      };

      setPreviewData(blogPost);
      setShowPreview(true);

      // Convert to JSON string for copying
      const blogPostJson = JSON.stringify(blogPost, null, 2);

      // Copy to clipboard
      navigator.clipboard.writeText(blogPostJson).then(() => {
        toast({
          title: "Blog post data copied!",
          description: isUpdateMode 
            ? `Update the ${selectedPost} entry in your blogPostsData.ts file with this data` 
            : "Create a new entry in your blogPostsData.ts file with this data and an appropriate slug",
        });
      });
    } catch (error) {
      toast({
        title: "Error processing blog data",
        description: "There was an issue preparing your blog post",
        variant: "destructive",
      });
      console.error("Blog processing error:", error);
    }
  };

  const selectPostToEdit = (slug: string) => {
    setSelectedPost(slug);
    setIsUpdateMode(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleRememberPasswordChange = (checked: boolean) => {
    setRememberPassword(checked);
    if (!checked) {
      localStorage.removeItem(SAVED_PASSWORD_KEY);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 py-16 px-4">
          <div className="container mx-auto max-w-md">
            <h1 className="text-2xl font-bold text-center mb-8">Blog Builder Authentication</h1>
            <Form {...authForm}>
              <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-4">
                <FormField
                  control={authForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter password"
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberPassword} 
                    onCheckedChange={handleRememberPasswordChange}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember my password
                  </label>
                </div>
                
                <Button type="submit" className="w-full">Login</Button>
              </form>
            </Form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Blog Article Builder</h1>
            <div className="flex gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Edit Existing Post</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Select a post to edit</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
                    {Object.entries(blogPostsData).map(([slug, post]) => (
                      <Button 
                        key={slug} 
                        variant="outline" 
                        className="justify-start text-left h-auto py-3"
                        onClick={() => {
                          selectPostToEdit(slug);
                        }}
                      >
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-gray-500">{post.date}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              <Button 
                variant={isUpdateMode ? "default" : "secondary"} 
                onClick={() => setIsUpdateMode(false)}
                disabled={!isUpdateMode}
              >
                Create New Post
              </Button>
              <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Logout</Button>
            </div>
          </div>
          
          <Form {...blogForm}>
            <form onSubmit={blogForm.handleSubmit(onBlogSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={blogForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={blogForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={blogForm.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={blogForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Content (HTML)</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[300px] font-mono text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={blogForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={blogForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated, or leave blank for automatic)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <Label htmlFor="desktopImage">Desktop Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="desktopImage"
                      type="file"
                      accept="image/*"
                      ref={desktopImageRef}
                      onChange={(e) => handleImageUpload(e, setDesktopImageFile)}
                      className="flex-1"
                    />
                    {desktopImageFile && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => {
                          setDesktopImageFile(null);
                          if (desktopImageRef.current) desktopImageRef.current.value = "";
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {desktopImageFile && (
                    <div className="w-full h-40 relative">
                      <img
                        src={URL.createObjectURL(desktopImageFile)}
                        alt="Desktop preview"
                        className="h-full object-contain"
                      />
                    </div>
                  )}
                  <FormField
                    control={blogForm.control}
                    name="desktopImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Or enter desktop image URL directly</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!!desktopImageFile} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="mobileImage">Mobile Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="mobileImage"
                      type="file"
                      accept="image/*"
                      ref={mobileImageRef}
                      onChange={(e) => handleImageUpload(e, setMobileImageFile)}
                      className="flex-1"
                    />
                    {mobileImageFile && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => {
                          setMobileImageFile(null);
                          if (mobileImageRef.current) mobileImageRef.current.value = "";
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {mobileImageFile && (
                    <div className="w-full h-40 relative">
                      <img
                        src={URL.createObjectURL(mobileImageFile)}
                        alt="Mobile preview"
                        className="h-full object-contain"
                      />
                    </div>
                  )}
                  <FormField
                    control={blogForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Or enter mobile image URL directly</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!!mobileImageFile} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button type="submit" size="lg" className="w-full md:w-auto">
                {isUpdateMode ? "Update Blog Post Data" : "Generate Blog Post Data"}
              </Button>
            </form>
          </Form>

          {/* Preview Dialog */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Blog Post Preview</DialogTitle>
              </DialogHeader>
              {previewData && (
                <div className="mt-4 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Title</h2>
                    <p>{previewData.title}</p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Excerpt</h2>
                    <p>{previewData.excerpt}</p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Category</h2>
                    <p>{previewData.category}</p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Date</h2>
                    <p>{previewData.date}</p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Reading Time</h2>
                    <p>{previewData.readingTime}</p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {previewData.tags.map((tag: string, index: number) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Images</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Desktop</p>
                        <div className="h-40 bg-gray-100 flex items-center justify-center">
                          {previewData.desktopImageUrl ? (
                            <img 
                              src={previewData.desktopImageUrl} 
                              alt="Desktop preview" 
                              className="max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-gray-400">No image</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Mobile</p>
                        <div className="h-40 bg-gray-100 flex items-center justify-center">
                          {previewData.imageUrl ? (
                            <img 
                              src={previewData.imageUrl} 
                              alt="Mobile preview" 
                              className="max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-gray-400">No image</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => {
                        const blogPostJson = JSON.stringify(previewData, null, 2);
                        navigator.clipboard.writeText(blogPostJson);
                        toast({
                          title: "Copied again!",
                          description: "Blog post data copied to clipboard"
                        });
                      }}
                      className="w-full"
                    >
                      Copy JSON Again
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogBuilder;
