import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RoadmapTree from "@/components/roadmap/RoadmapTree";
import ProgressRing from "@/components/roadmap/ProgressRing";
import { ArrowLeft, Download, Share2, Clock, BookOpen, Trophy } from "lucide-react";

const mockRoadmapData = {
  "data-scientist": {
    title: "Data Scientist",
    description: "Master data science from fundamentals to advanced ML",
    totalHours: 180,
    modules: [
      {
        id: "python-basics",
        name: "Python Programming Fundamentals",
        totalHours: 20,
        topics: [
          { id: "python-intro", name: "Introduction to Python", hours: 3, completed: true },
          { id: "python-datatypes", name: "Data Types & Variables", hours: 3, completed: true },
          { id: "python-control", name: "Control Flow & Loops", hours: 4, completed: true },
          { id: "python-functions", name: "Functions & Modules", hours: 4, completed: true },
          { id: "python-oop", name: "Object-Oriented Programming", hours: 6, completed: false },
        ],
      },
      {
        id: "data-analysis",
        name: "Data Analysis with Python",
        totalHours: 25,
        topics: [
          { id: "numpy-basics", name: "NumPy Fundamentals", hours: 5, completed: true },
          { id: "pandas-intro", name: "Pandas Data Manipulation", hours: 6, completed: true },
          { id: "data-cleaning", name: "Data Cleaning Techniques", hours: 5, completed: false },
          { id: "eda", name: "Exploratory Data Analysis", hours: 5, completed: false },
          { id: "visualization", name: "Data Visualization (Matplotlib/Seaborn)", hours: 4, completed: false },
        ],
      },
      {
        id: "statistics",
        name: "Statistics & Probability",
        totalHours: 30,
        topics: [
          { id: "descriptive-stats", name: "Descriptive Statistics", hours: 5, completed: false },
          { id: "probability", name: "Probability Theory", hours: 6, completed: false },
          { id: "distributions", name: "Statistical Distributions", hours: 5, completed: false },
          { id: "hypothesis", name: "Hypothesis Testing", hours: 7, completed: false },
          { id: "regression-stats", name: "Regression Analysis", hours: 7, completed: false },
        ],
      },
      {
        id: "ml-basics",
        name: "Machine Learning Basics",
        totalHours: 40,
        topics: [
          { id: "ml-intro", name: "Introduction to ML", hours: 4, completed: false },
          { id: "linear-regression", name: "Linear Regression", hours: 6, completed: false },
          { id: "logistic-regression", name: "Logistic Regression", hours: 6, completed: false },
          { id: "decision-trees", name: "Decision Trees", hours: 6, completed: false },
          { id: "random-forests", name: "Random Forests", hours: 6, completed: false },
          { id: "svm", name: "Support Vector Machines", hours: 6, completed: false },
          { id: "clustering", name: "Clustering Algorithms", hours: 6, completed: false },
        ],
      },
      {
        id: "advanced-ml",
        name: "Advanced Machine Learning",
        totalHours: 45,
        topics: [
          { id: "ensemble", name: "Ensemble Methods", hours: 8, completed: false },
          { id: "neural-networks", name: "Neural Networks Intro", hours: 10, completed: false },
          { id: "deep-learning", name: "Deep Learning Fundamentals", hours: 12, completed: false },
          { id: "nlp-basics", name: "NLP Basics", hours: 8, completed: false },
          { id: "model-deployment", name: "Model Deployment", hours: 7, completed: false },
        ],
      },
      {
        id: "projects",
        name: "Capstone Projects",
        totalHours: 20,
        topics: [
          { id: "project-eda", name: "EDA Project", hours: 6, completed: false },
          { id: "project-ml", name: "ML Classification Project", hours: 7, completed: false },
          { id: "project-nlp", name: "NLP Project", hours: 7, completed: false },
        ],
      },
    ],
  },
};

const Roadmap = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const roadmap = mockRoadmapData[id as keyof typeof mockRoadmapData] || mockRoadmapData["data-scientist"];
  
  const [modules, setModules] = useState(roadmap.modules);

  const handleTopicComplete = (moduleId: string, topicId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              topics: module.topics.map((topic) =>
                topic.id === topicId
                  ? { ...topic, completed: !topic.completed }
                  : topic
              ),
            }
          : module
      )
    );
  };

  const handleTopicClick = (moduleId: string, topicId: string) => {
    navigate(`/topic/${topicId}`);
  };

  const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);
  const completedTopics = modules.reduce(
    (acc, m) => acc + m.topics.filter((t) => t.completed).length,
    0
  );
  const progress = Math.round((completedTopics / totalTopics) * 100);

  const completedHours = modules.reduce(
    (acc, m) => acc + m.topics.filter((t) => t.completed).reduce((h, t) => h + t.hours, 0),
    0
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{roadmap.title} Roadmap</h1>
              <p className="text-muted-foreground mb-4">{roadmap.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{completedHours}/{roadmap.totalHours} hours</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
                  <BookOpen className="h-4 w-4 text-success" />
                  <span>{completedTopics}/{totalTopics} topics</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
                  <Trophy className="h-4 w-4 text-warning" />
                  <span>{modules.length} modules</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <ProgressRing progress={progress} size={100} strokeWidth={8} />
              <p className="text-sm text-muted-foreground mt-2">Overall Progress</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-border">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Roadmap Tree */}
        <RoadmapTree
          modules={modules}
          onTopicComplete={handleTopicComplete}
          onTopicClick={handleTopicClick}
        />
      </div>
    </div>
  );
};

export default Roadmap;
