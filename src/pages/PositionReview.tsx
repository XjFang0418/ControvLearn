// S1-8 立场回顾与变化轨迹：清晰呈现学生从"初始直觉"到"当前立场"的变化轨迹，并生成一份可编辑的学习小结
import { useState, useEffect } from "react";
// 已移除 framer-motion 依赖，使用 CSS 过渡效果替代
import { 
  BookOpen, 
  User, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clipboard,
  Copy,
  Check,
  Circle,
  Square
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getStepRoute, isStepCompleted, markStepCompleted, updateLastVisitedLearningPage } from "@/lib/utils";
import { toast } from "sonner";

// 定义议题类型
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
interface InitialStanceData {
  value: number | "undecided";
  note: string;
  timestamp?: number;
}

// 定义元认知反思结果类型
interface MetaReflectionResult {
  highlightEvidenceId: string | null;
  highlightEvidenceComment: string;
  reflection: {
    q1IdentityPerspective: string;
    q2InitialBasis: string;
    q3StanceChange: string;
    q4RemainingQuestions: string;
  };
  selfEval: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  };
  timestamp: number;
}

// 定义立场回顾结果类型
interface StanceReviewResult {
  initial: {
    value: number | "undecided";
    comment: string;
  };
  final: {
    value: number;
    comment: string;
  };
  trajectorySummary: {
    labelInitial: string;
    labelFinal: string;
    diff: number;
    text: string;
  };
  summaryText: string;
  timestamp: number;
}

const PositionReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 模拟议题数据
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 从前面步骤读取的数据
  const [initialStance, setInitialStance] = useState<InitialStanceData | null>(null);
  const [metaReflection, setMetaReflection] = useState<MetaReflectionResult | null>(null);
  
  // 当前页面的状态
  const [finalStanceValue, setFinalStanceValue] = useState(50);
  const [finalStanceComment, setFinalStanceComment] = useState("");
  const [stanceSummaryText, setStanceSummaryText] = useState("");
  
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
      isCurrent: true
    }
  ];

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
    }
  ];

  // S1-8：从 S1-3 读取初始立场数据
  // 模拟获取议题数据和前面步骤的数据
  useEffect(() => {
    setIsLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      // 查找对应ID的议题
      const selectedTopic = topics.find(t => t.id === id);
      
      if (selectedTopic) {
        setTopic(selectedTopic);
        
         // 记录最近学习页面
        updateLastVisitedLearningPage({
          topicId: id,
          topicTitle: selectedTopic.title,
          stepId: 8,
          routePath: getStepRoute(id, 8),
          visitedAt: Date.now()
        });
        
        // 尝试从localStorage中加载数据
        loadDataFromLocalStorage();
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
  
  // 从localStorage加载前面步骤的数据
  const loadDataFromLocalStorage = () => {
    try {
      // 加载初始直觉数据
      const savedIntuition = localStorage.getItem(`topic_${id}_initial_intuition`);
      if (savedIntuition) {
        const parsed: InitialStanceData = JSON.parse(savedIntuition);
        setInitialStance(parsed);
        
        // 如果初始立场是确定的数值，设置最终立场的默认值为初始值
        if (typeof parsed.value === 'number') {
          setFinalStanceValue(parsed.value);
        }
      }
      
      // 加载元认知反思数据
      const savedReflection = localStorage.getItem(`topic_${id}_meta_reflection`);
      if (savedReflection) {
        const parsed: MetaReflectionResult = JSON.parse(savedReflection);
        setMetaReflection(parsed);
      }
      
                        // 加载之前保存的立场回顾数据（如果有）
                        const savedPositionReview = localStorage.getItem(`topic_${id}_stance_review`);
                        if (savedPositionReview) {
                          const parsed: StanceReviewResult = JSON.parse(savedPositionReview);
                          setFinalStanceValue(parsed.final.value);
                          setFinalStanceComment(parsed.final.comment);
                          setStanceSummaryText(parsed.summaryText);
                        } else {
                          // 不管数据齐不齐，都生成一份草稿
                          setTimeout(() => {
                            const draft = generateSummaryDraft();
                            setStanceSummaryText(draft);
                          }, 100);
                        }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // 如果加载失败，使用模拟数据
      loadMockData();
      setTimeout(() => {
        generateSummaryDraft();
      }, 100);
    }
  };
  
  // 加载模拟数据（如果没有保存的数据）
  const loadMockData = () => {
    // 模拟初始直觉数据
    setInitialStance({
      value: 60,
      note: "我觉得需要谨慎评估核污染水排海的长期影响，但同时也理解这是一个复杂的技术问题。"
    });
    
    // 模拟元认知反思数据
    setMetaReflection({
      highlightEvidenceId: "E1",
      highlightEvidenceComment: "IAEA的评估报告具有较高的权威性，但也存在一些不确定性",
      reflection: {
        q1IdentityPerspective: "我一开始是以普通学生的身份在思考，主要关注的是环境影响和安全问题，可能忽略了技术和经济方面的考量。",
        q2InitialBasis: "我最初的判断主要基于媒体报道和一些环保组织的观点，现在看来可能有些片面，没有全面了解科学数据和技术细节。",
        q3StanceChange: "经过学习，我的立场从比较担忧风险转变为更加客观。我认识到需要平衡技术可行性、环境风险和社会责任等多方面因素。",
        q4RemainingQuestions: "我对长期环境影响的数据模型仍然有些疑问。未来可以查找更多独立的科学研究和长期监测数据来进一步了解。"
      },
      selfEval: {
        q1: 4,
        q2: 3,
        q3: 4,
        q4: 3,
        q5: 4
      },
      timestamp: Date.now()
    });
    
    // 设置最终立场默认值
    setFinalStanceValue(50);
  };
  
   // mapStanceValueToLabel：数值→中文标签
  const mapStanceValueToLabel = (value: number | "undecided"): string => {
    if (value === "undecided") return "未决定";
    
    if (value < 20) {
      return "强烈反对";
    } else if (value < 40) {
      return "比较反对";
    } else if (value < 60) {
      return "模棱两可";
    } else if (value < 80) {
      return "比较赞成";
    } else {
      return "强烈赞成";
    }
  };
  
   // generateSummaryDraft：根据前面步骤数据生成学习小结草稿
   const generateSummaryDraft = () => {
     // 获取初始立场标签
     const initialLabel = mapStanceValueToLabel(initialStance?.value || 50);
     
     // 获取当前立场标签
     const finalLabel = mapStanceValueToLabel(finalStanceValue);
     
     // 提取元反思中的关键信息，任何字段缺失时都用默认句子顶上
     const identityPerspective = metaReflection?.reflection?.q1IdentityPerspective?.trim() || '一个普通学习者';
     const initialBasis = metaReflection?.reflection?.q2InitialBasis?.trim() || '一些零散的新闻、他人的看法和自己的直觉';
     const stanceChangeTrigger = metaReflection?.reflection?.q3StanceChange?.trim() || '在阅读材料、分析论证和进行对话的过程中，我看到了比之前更多的证据和不同角度的观点';
     const highlightEvidence = metaReflection?.highlightEvidenceComment?.trim() || '其中有一两条证据让我印象特别深，它们让我重新思考了原来的看法';
     const remainingQuestions = metaReflection?.reflection?.q4RemainingQuestions?.trim() || '还有一些细节问题和长期影响，我觉得有必要在今后继续关注';

     const finalComment = (finalStanceComment && finalStanceComment.trim()) || '现在的立场是经过本次学习后形成的，我会尝试用更充分的理由来说明自己的看法。';
     const safeTopic = (topic?.title && topic.title.trim()) || '这个议题';

     // 输出调试信息
     console.log('[S1-8] summary draft data', {
       initialStance,
       finalStanceValue,
       finalStanceComment,
       metaReflection,
     });
     
     return [
       `在本次关于"${safeTopic}"的学习中，我一开始是以${identityPerspective}的身份来思考问题，当时的立场大致是"${initialLabel}"。我的初始判断主要依据是：${initialBasis}。`,
       `${stanceChangeTrigger}。这些经历让我的思考更加细致，不再只是停留在单一的角度。`,
       `现在，我的立场是"${finalLabel}"。我会用${highlightEvidence}等理由来支持自己的看法。`,
       `总体来说，${finalComment}`,
       `同时，我仍然对${remainingQuestions}保持关注，希望以后能通过查阅更多资料或向相关专业人士请教来加深理解。`,
     ].join('\n\n');
   };
  
  // generateTrajectorySummary：生成中性描述立场变化的文本
  const generateTrajectorySummary = (): { labelInitial: string; labelFinal: string; diff: number; text: string } => {
    const initialValue = initialStance?.value || 50;
    const initialLabel = mapStanceValueToLabel(initialValue);
    const finalLabel = mapStanceValueToLabel(finalStanceValue);
    
    // 计算差值（如果初始立场是undecided，则差值为0）
    const diff = typeof initialValue === 'number' ? finalStanceValue - initialValue : 0;
    
    let text = "";
    
    // 如果有明显变化（例如数值差超过某个阈值）
    if (Math.abs(diff) > 15) {
      text = `你的立场从"${initialLabel}"移动到了"${finalLabel}"。这说明在学习过程中，你接触到的信息和思考让你对该议题有了不同的理解。`;
    } else {
      // 如果变化很小或几乎没有
      text = `你的立场在活动前后保持在"${initialLabel}"的附近。不过，你可以尝试回顾：现在的你，是否拥有了更多用来解释这一立场的理由或证据？`;
    }
    
    return {
      labelInitial: initialLabel,
      labelFinal: finalLabel,
      diff,
      text
    };
  };
  
   // generateSummaryDraftWithSet：根据前面步骤数据生成学习小结草稿并设置状态
   const generateSummaryDraftWithSet = () => {
     const draft = generateSummaryDraft();
     setStanceSummaryText(draft);
   };
  
  // 保存立场回顾结果
  const saveStanceReview = () => {
    const trajectorySummary = generateTrajectorySummary();
    
    const stanceReviewResult: StanceReviewResult = {
      initial: {
        value: initialStance?.value || 50,
        comment: initialStance?.note || ""
      },
      final: {
        value: finalStanceValue,
        comment: finalStanceComment
      },
      trajectorySummary,
      summaryText: stanceSummaryText,
      timestamp: Date.now()
    };
    
    // 保存到localStorage
    localStorage.setItem(`topic_${id}_stance_review`, JSON.stringify(stanceReviewResult));
    
    // 显示成功提示
    toast.success("立场回顾已保存");
  };
  
  // 复制学习小结到剪贴板
  const copySummaryToClipboard = () => {
    // 复制当前文本框里的内容
    navigator.clipboard.writeText(stanceSummaryText)
      .then(() => {
        toast.success("学习小结已复制到剪贴板");
      })
      .catch(err => {
        console.error("复制失败:", err);
        toast.error("复制失败，请手动选择并复制");
      });
  };
  
  // 返回元认知反思
  const handleBackToMetaCognition = () => {
    navigate(getStepRoute(id, 7));
  };
  
  // 完成本议题
  const handleCompleteTopic = () => {
    // 保存当前数据
    saveStanceReview();
    
    // 标记该步骤为已完成
    markStepCompleted(8);
    
    // 显示成功提示
    toast.success("已完成本议题学习");
    
    // 跳转回议题广场
    navigate("/");
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
  
  // 计算轨迹摘要
  const trajectorySummary = generateTrajectorySummary();
  
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
              立场回顾与变化轨迹
            </h1>
            
            <p className="text-xl text-gray-600 italic mb-8">
              "记录从初始直觉到当前思考的变化过程，这本身就是重要的学习。"
            </p>
          </div>
        </section>
        
        {/* 主体区域布局：立场回顾页面 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
               {/* 区块 A：初始立场与当前立场（双栏对比） */}
              <div className="stance-section stance-compare mb-12">
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm animate-fade-in"
                >
                  <div className="mb-8">
                    <p className="text-gray-700 mb-6">
                      你在本议题中的立场不会被"判定对错"，这里只是帮你记录：
                      <span className="font-medium">从一开始的直觉，到现在的想法，中间发生了什么变化。</span>
                    </p>
                  </div>
                  
                  {/* 左右两栏布局 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 左栏：初始立场回顾（只读） */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center text-blue-600 mb-4">
                             <Circle className="w-5 h-5 mr-2" />
                             <h2 className="text-xl font-bold text-gray-800">一开始</h2>
                           </div>
                      
                      {initialStance ? (
                        <>
                          {/* 只读滑杆 */}
                          <div className="mb-6">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-700">强烈反对</span>
                              <span className="text-gray-700">强烈赞成</span>
                            </div>
                            
                            <div className="relative">
                              <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                                  style={{ width: `${typeof initialStance.value === 'number' ? initialStance.value : 50}%` }}
                                ></div>
                              </div>
                              
                              {/* 滑块标记 */}
                              <div 
                                className="absolute top-1/2 w-5 h-5 bg-blue-600 rounded-full transform -translate-y-1/2"
                                style={{ left: `${typeof initialStance.value === 'number' ? initialStance.value : 50}%`, transform: 'translate(-50%, -50%)' }}
                              ></div>
                            </div>
                            
                            {/* 立场标签 */}
                            <div className="mt-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                initialStance.value === 'undecided' 
                                  ? 'bg-gray-200 text-gray-800' 
                                  : typeof initialStance.value === 'number' && initialStance.value < 20
                                    ? 'bg-red-100 text-red-800'
                                    : typeof initialStance.value === 'number' && initialStance.value < 40
                                      ? 'bg-orange-100 text-orange-800'
                                      : typeof initialStance.value === 'number' && initialStance.value < 60
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : typeof initialStance.value === 'number' && initialStance.value < 80
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-blue-100 text-blue-800'
                              }`}>
                                {mapStanceValueToLabel(initialStance.value)}
                              </span>
                            </div>
                          </div>
                          
                          {/* 初始一句话观点 */}
                          {initialStance.note && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                              <p className="text-gray-700 italic">"{initialStance.note}"</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>未找到你的初始记录（可能是未完成 S1-3）</p>
                        </div>
                      )}
                    </div>
                    
                    {/* 右栏：当前立场填写（可编辑） */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center text-blue-600 mb-4">
                             <Square className="w-5 h-5 mr-2" />
                             <h2 className="text-xl font-bold text-gray-800">现在</h2>
                           </div>
                      
                      {/* 可交互滑杆 */}
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700">强烈反对</span>
                          <span className="text-gray-700">强烈赞成</span>
                        </div>
                        
                        <div className="relative">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={finalStanceValue}
                            onChange={(e) => setFinalStanceValue(parseInt(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                            style={{
                              background: `linear-gradient(to right, #EF4444 0%, #FBBF24 45%, #3B82F6 50%, #10B981 55%, #2563EB 100%)`
                            }}
                          />
                          
                          {/* 滑块标记 */}
                          <div 
                            className="absolute top-1/2 w-5 h-5 bg-blue-600 rounded-full shadow-lg transform -translate-y-1/2 cursor-pointer"
                            style={{ left: `${finalStanceValue}%`, transform: 'translate(-50%, -50%)' }}
                          ></div>
                        </div>
                        
                        {/* 立场标签 */}
                        <div className="mt-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            finalStanceValue < 20
                              ? 'bg-red-100 text-red-800'
                              : finalStanceValue < 40
                                ? 'bg-orange-100 text-orange-800'
                                : finalStanceValue < 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : finalStanceValue < 80
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                          }`}>
                            {mapStanceValueToLabel(finalStanceValue)}
                          </span>
                        </div>
                      </div>
                      
                      {/* 当前一句话观点 */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          请用 2–3 句说明：现在的你是如何看待这个议题的？
                        </label>
                        <textarea
                          value={finalStanceComment}
                          onChange={(e) => setFinalStanceComment(e.target.value)}
                          placeholder="可以写下你最想告诉别人的关键信息或理由..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          rows={4}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
               {/* 区块 B：立场轨迹可视化（简单而清晰） */}
              <div className="stance-section stance-trajectory mb-12">
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm animate-fade-in"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="flex items-center text-blue-600 mb-6">
                    <TrendingUp className="w-6 h-6 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">立场变化轨迹</h2>
                  </div>
                  
                  {/* 简单轨迹条 */}
                  <div className="stance-scale mb-8">
                    {/* 标签 */}
                    <div className="scale-labels flex justify-between mb-6">
                      <span className="text-gray-700 font-medium">强烈反对</span>
                      <span className="text-gray-700 font-medium">中立</span>
                      <span className="text-gray-700 font-medium">强烈赞成</span>
                    </div>
                    
                    {/* 轨迹条 */}
                    <div className="scale-bar relative">
                      {/* 基础线条 */}
                      <div className="scale-line h-1 w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"></div>
                      
                      {/* 初始立场标记 */}
                      <div 
                        className="marker initial absolute -top-2 w-5 h-5 bg-blue-600 rounded-full shadow-lg"
                        style={{ left: `${initialStance && typeof initialStance.value === 'number' ? initialStance.value : 50}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-700">
                          初始立场
                        </div>
                      </div>
                      
                      {/* 当前立场标记 */}
                      <div 
                        className="marker final absolute -top-2 w-5 h-5 bg-orange-500 rounded-full shadow-lg"
                        style={{ left: `${finalStanceValue}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-700">
                          当前立场
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 文本化轨迹描述 */}
                  <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-gray-800 leading-relaxed">
                      {trajectorySummary.text}
                    </p>
                  </div>
                </div>
              </div>
              
               {/* 区块 C：本议题学习小结（自动草稿 + 可编辑） */}
              <div className="stance-section stance-summary">
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm animate-fade-in"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="flex items-center text-blue-600 mb-6">
                    <Clipboard className="w-6 h-6 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">本议题学习小结</h2>
                  </div>
                  
                  {/* 自动生成草稿说明 */}
                  <p className="text-gray-700 mb-4">
                    下面是根据你前面回答自动生成的学习小结，你可以自由修改、增删内容，让它更贴近你的真实想法。
                  </p>
                  
                  {/* 可编辑的文本框 */}
                  <div className="relative">
                    <textarea
                      value={stanceSummaryText}
                      onChange={(e) => setStanceSummaryText(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      rows={10}
                    ></textarea>
                    
                    {/* 复制按钮 */}
                    <button
                      onClick={copySummaryToClipboard}
                      className="absolute top-2 right-2 p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
                      title="复制到剪贴板"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* 提示信息 */}
                  <div className="mt-4 text-center text-sm text-gray-500 italic">
                    提示：完成后点击下方按钮，该小结将保存到你的学习档案中。
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
                      className={`flex flex-col items-center mb-8 relative cursor-pointer ${!step.isCurrent ? 'hover:opacity-90 hover:-translate-y-5 transition-all duration-300' : ''}`}
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
                      className={`flex flex-col items-center relative cursor-pointer ${!step.isCurrent ? 'hover:opacity-90 hover:-translate-y-5 transition-all duration-300' : ''}`}
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
                onClick={handleBackToMetaCognition}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                返回元认知反思
              </button>
              
              <button 
                onClick={handleCompleteTopic}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center"
              >
                完成本议题
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PositionReview;