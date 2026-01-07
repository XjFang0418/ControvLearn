import { useState, useEffect } from "react";
import { 
  BookOpen, 
  User, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  BookText
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

const BackgroundReading = () => {
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
  
  // 学习流程步骤 - 高亮当前步骤
  const learningSteps: LearningStep[] = [
    {
      id: "1",
      name: "议题介绍",
      description: "理解争议的核心问题和背景",
      isCurrent: false
    },
    {
      id: "2",
      name: "背景阅读",
      description: "了解相关事实、数据和研究",
      isCurrent: true
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
  
  // 获取场景化背景故事 - 根据议题ID返回不同的背景故事
  const getScenarioBackground = () => {
    if (!topic) return "";
    
    switch(topic.id) {
      case "1": // 核污染水排海
        return `2023年春夏之交，福岛海岸的风有些不同寻常。渔民田中先生像往常一样准备出海，但港口的气氛却异常沉重。几个月前，日本政府宣布了福岛第一核电站处理水排海计划，这一决定在全球范围内引发了巨大争议。

福岛核事故已经过去12年，但它的影响远未结束。东京电力公司表示，经过处理的核污染水中氚等放射性物质浓度符合国际标准，但很多科学家和环保组织对此持谨慎态度。根据国际原子能机构的报告，虽然排放计划符合安全标准，但仍存在一些不确定性，特别是长期环境影响方面。

在福岛，当地渔民的担忧最为直接。他们的生计依赖于海洋资源，而排海计划可能导致消费者对海产品安全的担忧，进而影响整个渔业产业链。与此同时，一些专家认为，科学评估表明排海是目前可行的选择之一，其他处理方式如继续储存或蒸汽释放也各有优缺点。

这场争论不仅涉及科学数据和技术评估，还触及了信任、责任和代际伦理等深层次问题。不同国家、不同群体基于各自的立场和利益，对这一问题有着截然不同的看法。`;
      
      case "2": // 人工智能是否会取代人类工作
        return `2022年的一个雨夜，软件工程师李明坐在办公室里，盯着电脑屏幕上的代码陷入沉思。他刚刚看到一条新闻：某科技巨头发布了一款新的AI编程助手，能够自动生成高质量的代码，效率比人类程序员高出数倍。这让他开始担心自己的工作是否在不久的将来会被人工智能取代。

李明的担忧并非个例。随着ChatGPT、DALL-E等生成式AI的迅速发展，越来越多的职业领域感受到了技术变革的压力。根据麦肯锡全球研究院的一份报告，到2030年，全球可能有多达8亿个工作岗位被自动化技术取代。同时，也有研究表明，AI的发展可能创造新的就业机会，推动经济增长。

在工厂车间，自动化生产线已经取代了部分重复性劳动；在医院，AI辅助诊断系统正在帮助医生提高诊断准确率；在金融行业，智能算法正在改变传统的风险管理模式。这些变化既带来了效率提升，也引发了关于就业结构变化、收入不平等和教育体系改革的讨论。

这场关于AI与就业的争论，本质上是关于人类未来工作形态的思考。我们应该如何看待技术进步带来的挑战和机遇？个人、企业和政府应该如何应对这些变化？`;
      
      default:
        return `随着${topic.tags[0]}领域的快速发展，${topic.title}这一问题日益成为公众关注的焦点。不同立场的人们基于各自的知识背景、价值观念和利益诉求，对这一问题有着不同的看法。

最近的一项调查显示，超过60%的受访者认为这一争议需要更多的科学研究和公众讨论。与此同时，一些关键事件的发生也推动了相关政策的制定和调整。

在这场复杂的争议中，各种声音交织在一起，形成了一幅多元的社会图景。理解这些不同的声音，分析它们背后的逻辑和证据，是我们参与这场讨论的基础。`;
    }
  };
  
  // 获取引导问题 - 根据议题ID返回不同的引导问题
  const getGuidingQuestions = () => {
    if (!topic) return [];
    
    switch(topic.id) {
      case "1": // 核污染水排海
        return [
          "报道中提到了哪些科学数据和研究？这些证据的来源是什么？可信度如何？",
          "关于核污染水排海的长期环境影响，存在哪些不确定性？",
          "不同利益相关者（渔民、科学家、政府官员、普通民众）可能关注哪些不同的方面？",
          "国际社会对这一问题的看法有哪些主要分歧？这些分歧背后的原因是什么？"
        ];
        
      case "2": // 人工智能是否会取代人类工作
        return [
          "文章中引用了哪些关于AI影响就业的研究数据？这些数据的时效性和可靠性如何？",
          "AI技术在不同行业的影响程度有什么差异？为什么会有这些差异？",
          "你认为哪些工作最容易被AI取代？哪些工作相对安全？为什么？",
          "面对AI技术的发展，个人和社会应该如何做准备？"
        ];
        
      default:
        return [
          "这篇背景介绍中提供了哪些关键事实和数据？它们的来源是什么？",
          "围绕这个议题，存在哪些主要的不确定性和争议点？",
          "不同立场的人可能会如何解读这些信息？为什么？",
          "这个议题对社会、经济或环境可能产生哪些长期影响？"
        ];
    }
  };
  
    // 页面加载时标记当前步骤为已完成
   useEffect(() => {
     if (!isLoading && topic) {
       markStepCompleted(2); // 当前是第2步：背景阅读
       
       // 记录最近学习页面
       updateLastVisitedLearningPage({
         topicId: id,
         topicTitle: topic.title,
         stepId: 2,
         routePath: getStepRoute(id, 2),
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
  
  // 返回议题介绍
  const handleBackToIntroduction = () => {
    navigate(`/topic/${id}`);
  };
  
  // 进入下一步：记录初始直觉
  const handleNextStep = () => {
    // 跳转到初始直觉记录页面（S1-3）
    navigate(`/topic/${id}/initial-intuition`);
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
             <div className="hidden md:flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/profile')}>
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
      {/* 顶部导航栏 - 复用 S0-1、S0-2 和 S1-1 的样式 */}
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
        {/* 页面主标题区 */}
        <section className="bg-gradient-to-r from-blue-50 to-cyan-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* AI生成议题标识 */}
            {topic.isAIGenerated && (
              <div className="inline-block bg-blue-100 px-3 py-1 text-sm text-blue-700 font-medium flex items-center mb-4">
                <Sparkles className="w-4 h-4 mr-1" />
                你创建的议题
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              背景阅读：走进争议的现场
            </h1>
            
            <p className="text-xl text-gray-600 italic mb-8">
              "你将看到真实世界中围绕该议题的研究、事件与声音。"
            </p>
          </div>
        </section>
        
        {/* 场景化背景故事区 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div 
                className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm animate-slide-up"
              >
                <div className="flex items-center text-blue-600 mb-6">
                  <BookText className="w-6 h-6 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-800">背景故事</h2>
                </div>
                
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {getScenarioBackground()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* 引导问题区 */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-8">
                <h2 className="text-xl font-bold text-blue-800 mb-4">阅读提示：阅读时思考这些问题（不用回答）</h2>
                
                <ul className="space-y-3">
                   {getGuidingQuestions().map((question, index) => (
                    <li 
                      key={index}
                      className="flex items-start animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ChevronRight className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        
         {/* 学习流程总览（两行四列布局） */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 z-10
                          ${step.isCurrent 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                            : "bg-white text-gray-500 border border-gray-200"
                          }`}
                      >
                        {step.id}
                      </div>
                      
                      {/* 步骤标题 */}
                      <div className={`text-center ${step.isCurrent ? "font-medium" : ""}`}>
                        <h3 className={`text-gray-800 text-sm ${step.isCurrent ? "text-blue-600" : ""}`}>
                          {step.name}
                        </h3>
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 z-10
                          ${step.isCurrent 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                            : "bg-white text-gray-500 border border-gray-200"
                          }`}
                      >
                        {step.id}
                      </div>
                      
                      {/* 步骤标题 */}
                      <div className={`text-center ${step.isCurrent ? "font-medium" : ""}`}>
                        <h3 className={`text-gray-800 text-sm ${step.isCurrent ? "text-blue-600" : ""}`}>
                          {step.name}
                        </h3>
                      </div>
                    </div>
                  ))}
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
                onClick={handleBackToIntroduction}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                返回议题介绍
              </button>
              
              <button 
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center"
              >
                继续：记录我的初始直觉
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BackgroundReading;