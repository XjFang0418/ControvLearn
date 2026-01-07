import { useState, useEffect } from "react";
import { 
  BookOpen, 
  User, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight
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

// 定义初始直觉记录类型
interface InitialIntuitionData {
  value: number | "undecided";
  note: string;
}

const InitialIntuition = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 模拟议题数据（从 S0-1 获取并扩展）
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 初始直觉状态
  const [intuitionValue, setIntuitionValue] = useState(50);
  const [note, setNote] = useState("");
  const [isUndecided, setIsUndecided] = useState(false);
  
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
      isCurrent: false
    },
    {
      id: "3",
      name: "初始直觉记录",
      description: "记录你对争议的第一反应和想法",
      isCurrent: true
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
  
  // 获取直觉描述文本
  const getIntuitionDescription = () => {
    if (isUndecided) {
      return "你当前的状态：暂不表态，这也是一种有效记录。";
    }
    
    if (intuitionValue < 30) {
      return "你当前的直觉：明显偏向担忧风险";
    } else if (intuitionValue < 40) {
      return "你当前的直觉：比较担忧风险";
    } else if (intuitionValue < 60) {
      return "你当前的直觉：比较居中，还没想好";
    } else if (intuitionValue < 70) {
      return "你当前的直觉：比较相信风险可控";
    } else {
      return "你当前的直觉：明显相信风险可控";
    }
  };
  
    // 页面加载时标记当前步骤为已完成
   useEffect(() => {
     if (!isLoading && topic) {
       markStepCompleted(3); // 当前是第3步：初始直觉记录
       
       // 记录最近学习页面
       updateLastVisitedLearningPage({
         topicId: id,
         topicTitle: topic.title,
         stepId: 3,
         routePath: getStepRoute(id, 3),
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
        
        // 尝试从localStorage中加载已保存的直觉记录
        // 用于后续立场轨迹对比
        const savedIntuition = localStorage.getItem(`topic_${id}_initial_intuition`);
        if (savedIntuition) {
          const parsed: InitialIntuitionData = JSON.parse(savedIntuition);
          
          if (parsed.value === "undecided") {
            setIsUndecided(true);
            setIntuitionValue(50);
          } else {
            setIntuitionValue(parsed.value as number);
          }
          
          setNote(parsed.note);
          
          // 提示用户已有记录
          toast.info("已找到之前的记录，可以随时修改");
        }
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
  
  // 处理直觉值变化
  const handleIntuitionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUndecided) {
      setIntuitionValue(parseInt(e.target.value));
    }
  };
  
  // 处理"未决定"状态变化
  const handleUndecidedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newState = e.target.checked;
    setIsUndecided(newState);
    
    if (newState) {
      setIntuitionValue(50);
    }
  };
  
  // 返回背景阅读
  const handleBackToBackgroundReading = () => {
    // 保存当前直觉记录
    saveIntuitionRecord();
    navigate(`/topic/${id}/background-reading`);
  };
  
// 进入下一步：视角拼图
  const handleNextStep = () => {
    // 保存当前直觉记录
    saveIntuitionRecord();
    
    // 标记该议题为"学习中"（原型模拟）
    toast.success("已保存你的初始直觉记录");
    
    // 跳转到视角拼图页面（S1-4）
    navigate(`/topic/${id}/perspective-puzzle`);
  };
  
  // 保存当前直觉记录到localStorage
  // 保存当前议题的初始直觉到前端状态
  const saveIntuitionRecord = () => {
    const intuitionData: InitialIntuitionData = {
      value: isUndecided ? "undecided" : intuitionValue,
      note: note
    };
    
    localStorage.setItem(`topic_${id}_initial_intuition`, JSON.stringify(intuitionData));
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
      {/* 顶部导航栏 - 复用 S0-1、S0-2、S1-1 和 S1-2 的样式 */}
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
                <AlertCircle className="w-4 h-4 mr-1" />
                你创建的议题
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              初始直觉记录：此刻你的第一反应
            </h1>
            
            <p className="text-xl text-gray-600 italic mb-8">
              "这不是测试，也不是最终立场，只是帮你记下现在的想法，方便之后回顾。"
            </p>
          </div>
        </section>
        
        {/* 直觉滑杆区 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
               <div 
                 className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm animate-fade-in"
               >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">你对「{topic.title}」的直觉感受</h2>
                
                {/* 滑杆本体 */}
                <div className="mb-6">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-700 font-medium">更担忧风险</span>
                    <span className="text-gray-700 font-medium">更相信可控</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intuitionValue}
                      onChange={handleIntuitionChange}
                      disabled={isUndecided}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                        isUndecided ? 'bg-gray-200' : 'bg-gray-200'
                      }`}
                      style={{
                        background: isUndecided 
                          ? 'linear-gradient(to right, #E5E7EB 0%, #E5E7EB 100%)' 
                          : `linear-gradient(to right, #EF4444 0%, #FBBF24 45%, #3B82F6 50%, #10B981 55%, #2563EB 100%)`
                      }}
                    />
                    
                    {/* 滑块 */}
                    <div 
                      className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full transition-all ${
                        isUndecided ? 'bg-gray-400' : 'bg-blue-600 shadow-lg'
                      }`}
                      style={{
                        left: `${intuitionValue}%`,
                        transform: 'translate(-50%, -50%)',
                        scale: isUndecided ? 1 : 1.2
                      }}
                    ></div>
                    
                    {/* 中间标签 */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        说不清 / 介于中间
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 直觉描述文本 */}
                <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-blue-800 font-medium">
                    {getIntuitionDescription()}
                  </p>
                </div>
                
                {/* "我现在说不清楚"选项 */}
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="undecided"
                    checked={isUndecided}
                    onChange={handleUndecidedChange}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="undecided" className="ml-2 text-gray-700">
                    暂时说不清楚，只先记录为"未决定"
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* 文本输入区 */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
               <div 
                 className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm animate-fade-in"
               >
                <h2 className="text-xl font-bold text-gray-800 mb-4">用 1–2 句话记下此刻的想法（可选）</h2>
                
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="你可以简单写下：你现在为什么更担忧 / 更相信可控？
或者，你对哪些问题还完全搞不清楚？"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </section>
        
        {/* 提示与说明小框 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-6">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-yellow-600 mr-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">小提示</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="mr-2 text-yellow-500">•</span>
                        <span>这里的记录不会被评分，也没有标准答案。</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-yellow-500">•</span>
                        <span>在后面的学习中，你可以随时改变看法；我们只是在保存你思考旅程中的一个"路标"。</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
         {/* 学习流程总览 */}
        <section className="py-12 bg-gray-50">
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
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <button 
                onClick={handleBackToBackgroundReading}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                返回背景阅读
              </button>
              
              <button 
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center"
              >
                继续：进入视角拼图
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default InitialIntuition;