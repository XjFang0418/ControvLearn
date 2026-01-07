import { useState, useEffect } from "react";
import BackgroundReading from "./BackgroundReading";
import { 
  BookOpen, 
  BookText, 
  User, 
  HelpCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getStepRoute, isStepCompleted, markStepCompleted, updateLastVisitedLearningPage } from "@/lib/utils";
import { toast } from "sonner";

// 定义议题类型（复用 S0-1 中的类型）
interface Topic {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: "入门" | "进阶";
  duration: number;
  isAIGenerated?: boolean;
  subjectTags?: string[];
  controversyType?: string[];
}

// 定义学习步骤类型
interface LearningStep {
  id: string;
  name: string;
  description: string;
  isCurrent: boolean;
}

const TopicIntroduction = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 模拟议题数据（从 S0-1 获取并扩展）
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 模拟议题列表数据
  const topics: Topic[] = [
    {
      id: "1",
      title: "核污染水排海是否可接受？",
      description: "探讨核污染水排海的科学依据、环境影响和国际争议",
      tags: ["环境", "科技伦理"],
      difficulty: "进阶",
      duration: 35,
      subjectTags: ["环境科学", "工程技术"],
      controversyType: ["科学不确定性", "风险评估", "价值冲突"]
    },
    {
      id: "2",
      title: "人工智能是否会取代人类工作？",
      description: "分析AI技术发展对就业市场的影响和未来职业趋势",
      tags: ["AI技术", "就业"],
      difficulty: "入门",
      duration: 25,
      subjectTags: ["计算机科学", "经济学"],
      controversyType: ["技术影响", "社会结构变化", "就业政策"]
    },
    {
      id: "3",
      title: "基因编辑技术的伦理边界在哪里？",
      description: "讨论CRISPR等基因编辑技术的应用前景和伦理挑战",
      tags: ["生物技术", "伦理"],
      difficulty: "进阶",
      duration: 40,
      subjectTags: ["生物学", "医学伦理学"],
      controversyType: ["伦理边界", "技术风险", "社会公平"]
    },
    {
      id: "4",
      title: "新能源汽车是否真的环保？",
      description: "从全生命周期角度评估新能源汽车的环境影响",
      tags: ["环境", "可持续发展"],
      difficulty: "入门",
      duration: 20,
      subjectTags: ["环境科学", "能源工程"],
      controversyType: ["生命周期评估", "资源利用效率", "技术发展路径"]
    },
    {
      id: "5",
      title: "社交媒体是否损害了青少年的心理健康？",
      description: "研究社交媒体使用与青少年心理健康之间的关系",
      tags: ["心理健康", "社会影响"],
      difficulty: "入门",
      duration: 30,
      subjectTags: ["心理学", "社会学"],
      controversyType: ["行为研究", "心理健康影响", "教育干预"]
    },
    {
      id: "6",
      title: "大数据时代的个人隐私该如何保护？",
      description: "探讨数据收集、使用和保护的平衡问题",
      tags: ["数据隐私", "科技伦理"],
      difficulty: "进阶",
      duration: 35,
      subjectTags: ["法学", "信息技术"],
      controversyType: ["数据权利", "技术实现", "法律监管"]
    }
  ];
  
   // 学习流程步骤 - 更新为8步流程
  const learningSteps: LearningStep[] = [
    {
      id: "1",
      name: "议题介绍",
      description: "理解争议的核心问题和背景",
      isCurrent: true
    },
    {
      id: "2",
      name: "背景阅读",
      description: "了解相关事实、数据和研究",
      isCurrent: false
    },
    {
      id: "3",
      name: "初始直觉记录",
      description: "记录你对争议的第一反应和想法",
      isCurrent: false
    },
    {
      id: "4",
      name: "视角拼图",
      description: "从多角度理解不同立场的观点",
      isCurrent: false
    },
    {
      id: "5",
      name: "论证解剖",
      description: "深入分析论证结构和证据质量",
      isCurrent: false
    },
    {
      id: "6",
      name: "对话模拟",
      description: "模拟不同立场之间的对话",
      isCurrent: false
    },
    {
      id: "7",
      name: "元认知反思",
      description: "反思自己的思考过程和认知偏差",
      isCurrent: false
    },
    {
      id: "8",
      name: "立场回顾与变化轨迹",
      description: "回顾立场变化并总结学习收获",
      isCurrent: false
    }
  ];
  
    // 页面加载时标记当前步骤为已完成
   useEffect(() => {
     if (!isLoading && topic) {
       markStepCompleted(1); // 当前是第1步：议题介绍
       
       // 记录最近学习页面
       updateLastVisitedLearningPage({
         topicId: id,
         topicTitle: topic.title,
         stepId: 1,
         routePath: getStepRoute(id, 1),
         visitedAt: Date.now()
       });
     }
   }, [isLoading, topic, id]);
   
   // 模拟获取议题数据
  useEffect(() => {
    setIsLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      // 查找对应ID的议题
      const selectedTopic = topics.find(t => t.id === id);
      
      if (selectedTopic) {
        setTopic(selectedTopic);
      } else {
        // 如果找不到议题，显示错误提示并返回首页
        toast.error("未找到该议题，请返回议题广场重新选择");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
      
      setIsLoading(false);
    }, 500);
  }, [id, navigate]);
  
  // 返回议题广场
  const handleBackToHome = () => {
    navigate("/");
  };
  
  // 进入下一步：背景阅读
  const handleNextStep = () => {
    // 标记该议题为"学习中"（原型模拟）
    // 在实际应用中，这里会更新后端或本地存储中的议题状态
    toast.success("已开始学习，进入背景阅读环节");
    
     // 跳转到背景阅读页面（S1-2）
    navigate(`/topic/${id}/background-reading`);
  };
  
  // 处理步骤点击
  const handleStepClick = (stepId: number) => {
    if (stepId === parseInt(learningSteps.find(s => s.isCurrent)?.id || '0')) {
      // 当前步骤，不处理
      return;
    }
    
    if (stepId === 1) {
      // 第1步永远允许进入
      navigate(getStepRoute(id, stepId));
      return;
    }
    
    const previousStepId = stepId - 1;
    if (!isStepCompleted(previousStepId)) {
      toast.info('请先完成前一步');
      return;
    }
    
    navigate(getStepRoute(id, stepId));
  };
  
  // 如果正在加载或找不到议题，显示加载状态
  if (isLoading || !topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 顶部导航栏 - 复用样式 */}
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-blue-600 font-bold text-xl">ControvLearn</div>
              <div className="text-gray-500 text-sm hidden md:inline-block">科学争议素养微课</div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-blue-600 hover:text-blue-700 transition-colors flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                议题广场
              </a>
              <a href="/my-learning" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                <User className="w-4 h-4 mr-2" />
                我的学习
              </a>
              <a href="/help" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" />
                帮助
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  张
                </div>
                <span className="text-gray-700">张同学</span>
              </div>
              <button className="md:hidden text-gray-600">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">加载中...</h2>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 - 复用 S0-1 和 S0-2 的样式 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600 font-bold text-xl">ControvLearn</div>
            <div className="text-gray-500 text-sm hidden md:inline-block">科学争议素养微课</div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-blue-600 hover:text-blue-700 transition-colors flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              议题广场
            </a>
            <a href="/my-learning" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
              <User className="w-4 h-4 mr-2" />
              我的学习
            </a>
            <a href="/help" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" />
              帮助
            </a>
          </nav>
          
           <div className="flex items-center space-x-4">
             <div className="hidden md:flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                张
              </div>
              <span className="text-gray-700">张同学</span>
            </div>
            <button className="md:hidden text-gray-600" onClick={() => navigate('/profile')}>
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* 议题标题与关键信息区（Hero 区） */}
        <section className="bg-gradient-to-r from-blue-50 to-cyan-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* AI生成议题标识 */}
            {topic.isAIGenerated && (
              <div className="inline-block bg-blue-100 px-3 py-1 text-sm text-blue-700 font-medium flex items-center mb-4">
                <Sparkles className="w-4 h-4 mr-1" />
                你创建的议题
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
              {topic.title}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {/* 学科相关性标签 */}
              {topic.subjectTags?.map((tag, index) => (
                <span 
                  key={`subject-${index}`} 
                  className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
              
              {/* 争议类型标签 */}
              {topic.controversyType?.map((type, index) => (
                <span 
                  key={`type-${index}`} 
                  className="text-xs font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-800"
                >
                  {type}
                </span>
              ))}
              
              {/* 难度等级标签 */}
              <span 
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  topic.difficulty === "入门" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {topic.difficulty}
              </span>
              
              {/* 学习预计时长标签 */}
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-800 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                约 {topic.duration} 分钟
              </span>
            </div>
            
            <p className="text-gray-600 text-lg mb-8 max-w-3xl">
              这是一个需要权衡与判断的问题，没有绝对的标准答案。通过学习和思考，你将提升科学争议分析能力。
            </p>
          </div>
        </section>
        
        {/* 「这个争议为什么重要？」说明区 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">这个争议为什么重要？</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:-translate-y-1.5 transition-transform duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">现实背景</h3>
                <p className="text-gray-600">
                  随着{topic.tags[0]}领域的快速发展，{topic.title}这一问题日益凸显，成为社会各界关注的焦点。这一争议涉及多方面的现实因素和复杂考量。
                </p>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:-translate-y-1.5 transition-transform duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">不同立场</h3>
                <p className="text-gray-600">
                  围绕这一争议，存在多种不同的立场和观点。一些人认为应该采取更加谨慎的态度，而另一些人则主张更开放的政策。各种观点都有其依据和考量。
                </p>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:-translate-y-1.5 transition-transform duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">学习意义</h3>
                <p className="text-gray-600">
                  通过学习这个议题，你将训练证据评估、风险判断和价值权衡等关键思维能力，提升自己的科学争议素养和批判性思维能力。
                </p>
              </div>
            </div>
          </div>
        </section>
        
          {/* 学习流程总览 - 改为两行四列布局 */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">学习流程总览</h2>
            
            <div className="relative">
              {/* 第一行连接线 */}
              <div className="absolute top-[37%] left-[10%] right-[10%] h-1 bg-gray-200 transform -translate-y-1/2 -z-10 hidden md:block"></div>
              {/* 第二行连接线 */}
              <div className="absolute bottom-[37%] left-[10%] right-[10%] h-1 bg-gray-200 transform translate-y-1/2 -z-10 hidden md:block"></div>
              {/* 中间连接线 */}
              <div className="absolute top-1/2 left-1/2 h-16 bg-gray-200 transform -translate-x-1/2 -translate-y-1/2 -z-10 hidden md:block"></div>
              
              {/* 两行四列布局 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 第一行 */}
                {learningSteps.slice(0, 4).map((step) => (
                    <div 
                      key={step.id}
                      className={`flex flex-col items-center mb-8 relative cursor-pointer ${!step.isCurrent ? 'hover:opacity-90 hover:-translate-y-1.5 transition-all duration-300' : ''}`}
                      onClick={() => handleStepClick(parseInt(step.id))}
                    >
                    {/* 步骤圆圈 */}
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 z-10
                        ${step.isCurrent 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                          : "bg-white text-gray-500 border border-gray-200"
                        }`}
                    >
                      {step.id}
                    </div>
                    
                    {/* 步骤标题和描述 */}
                    <div className={`text-center ${step.isCurrent ? "font-medium" : ""}`}>
                      <h3 className={`text-gray-800 font-medium mb-1 ${step.isCurrent ? "text-blue-600" : ""}`}>
                        {step.name}
                      </h3>
                      <p className="text-gray-500 text-sm px-2">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
                {/* 第二行 */}
                {learningSteps.slice(4, 8).map((step) => (
                    <div 
                      key={step.id}
                      className={`flex flex-col items-center relative cursor-pointer ${!step.isCurrent ? 'hover:opacity-90 hover:-translate-y-1.5 transition-all duration-300' : ''}`}
                      onClick={() => handleStepClick(parseInt(step.id))}
                    >
                    {/* 步骤圆圈 */}
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 z-10
                        ${step.isCurrent 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                          : "bg-white text-gray-500 border border-gray-200"
                        }`}
                    >
                      {step.id}
                    </div>
                    
                    {/* 步骤标题和描述 */}
                    <div className={`text-center ${step.isCurrent ? "font-medium" : ""}`}>
                      <h3 className={`text-gray-800 font-medium mb-1 ${step.isCurrent ? "text-blue-600" : ""}`}>
                        {step.name}
                      </h3>
                      <p className="text-gray-500 text-sm px-2">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* 学习提示与认知引导区 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">学习提示</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <ChevronRight className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>在进入具体材料之前，先思考：这个问题中可能涉及哪些不确定性？</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>你不需要马上选边站队，保持开放的心态，先收集和分析信息。</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>注意区分事实、观点和价值判断，这是分析科学争议的关键能力。</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* 操作按钮区 */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <button 
                onClick={handleBackToHome}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                返回议题广场
              </button>
              
              <button 
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center"
              >
                进入下一步：背景阅读
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TopicIntroduction;