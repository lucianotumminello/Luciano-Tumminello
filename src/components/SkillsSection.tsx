
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChartIcon, BriefcaseIcon, UsersIcon, ListChecksIcon, CodeIcon, LightbulbIcon } from "lucide-react";

const SkillsSection = () => {
  const skillCategories = [
    {
      title: "Marketing & Growth Skills",
      icon: <BarChartIcon className="h-8 w-8 text-primary" />,
      skills: [
        "Google Analytics",
        "Data Analysis",
        "SEO",
        "SEM",
        "Social Media Marketing",
        "Video Ads",
        "Display Ads",
        "Programmatic Advertising",
        "Digital Marketing",
        "Data-Driven Marketing Strategies",
        "B2B Marketing",
        "B2C Marketing",
        "AI and Automation Proficiency",
        "ROI Optimization"
      ]
    },
    {
      title: "Strategic Leadership Skills",
      icon: <UsersIcon className="h-8 w-8 text-primary" />,
      skills: [
        "Client Relationship Management",
        "Cross-Functional Project Leadership",
        "International Marketing Leadership",
        "Strategic Data-Driven Decision Making",
        "Team Leadership",
        "Team Development",
        "Strategic Vision",
        "Change Management",
        "Emotional Intelligence"
      ]
    },
    {
      title: "Operational Efficiency Skills",
      icon: <ListChecksIcon className="h-8 w-8 text-primary" />,
      skills: [
        "Operational Optimization",
        "Process Automation",
        "Project Management"
      ]
    },
    {
      title: "Business Strategy & Financial Skills",
      icon: <LightbulbIcon className="h-8 w-8 text-primary" />,
      skills: [
        "Strategic Planning",
        "Revenue Growth",
        "Digital Transformation",
        "Financial Acumen"
      ]
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Expertise & Skills</h2>
          <Separator className="w-24 h-1 mx-auto mt-4 bg-primary" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillCategories.map((category, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader className="pb-2 bg-gray-50">
                <div className="flex items-center gap-3">
                  {category.icon}
                  <CardTitle>{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIndex) => (
                    <Badge 
                      key={skillIndex}
                      variant="outline"
                      className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-1.5 font-medium"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
