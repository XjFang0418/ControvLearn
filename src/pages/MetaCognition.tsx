// S1-7 元认知反思（过程回顾）：让学生回顾整个学习过程并进行结构化反思
import { useState, useEffect } from "react";
// 已移除 framer-motion 依赖，使用 CSS 过渡效果替代
import { 
  BookOpen, 
  User, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  Brain,
  MessageCircle,
  CheckSquare
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

// 定义论证记录类型
interface ArgumentRecord {
  id: string;
  stance: 'pro' | 'con' | 'conditional' | 'neutral';
  claimId: string;
  claimText: string;
  evidenceId: string;
  evidenceText: string;
  bridgeText: string | null;
}

// 定义对话消息类型
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system';
  round: number;
  timestamp: Date;
  evidenceTags: string[];
}

// 定义对话数据类型
interface DialogueData {
  topicId: string;
  topicTitle: string | undefined;
  roles: {
    user: string;
    system: string;
  };
  userOpinion: string;
  systemOpinion: string;
  messages: Message[];
  savedAt: string;
}

// 定义反思结果类型
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

// 定义角色类型
interface Role {
  id: string;
  label: string;
  defaultStance: string;
}

const MetaCognition = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 模拟议题数据（从 S0-1 获取并扩展）
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 从前面步骤读取的数据
  const [initialIntuition, setInitialIntuition] = useState<InitialIntuitionData | null>(null);
  const [argumentRecords, setArgumentRecords] = useState<ArgumentRecord[]>([]);
  const [dialogueData, setDialogueData] = useState<DialogueData | null>(null);
  
  // 角色数据
  const roles: Role[] = [
    { id: 'student',  label: '普通学生',      defaultStance: 'neutral' },
    { id: 'fisher',   label: '当地渔民',      defaultStance: 'con' },
    { id: 'company',  label: '电力公司工程师', defaultStance: 'pro' },
    { id: 'gov',      label: '政府官员',      defaultStance: 'conditional' },
    { id: 'ngo',      label: '环保组织代表',   defaultStance: 'con' },
    { id: 'scientist',label: '独立科学家',    defaultStance: 'conditional' },
  ];
  
  // 反思表单状态
  const [highlightEvidenceId, setHighlightEvidenceId] = useState<string | null>(null);
  const [highlightEvidenceComment, setHighlightEvidenceComment] = useState("");
  
  // 反思问题答案
  const [reflectionAnswers, setReflectionAnswers] = useState({
    q1IdentityPerspective: "",
    q2InitialBasis: "",
    q3StanceChange: "",
    q4RemainingQuestions: ""
  });
  
  // 自我评估答案
  const [selfEvalAnswers, setSelfEvalAnswers] = useState({
    q1: 3, // 默认中间值
    q2: 3,
    q3: 3,
    q4: 3,
    q5: 3
  });
  
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
      isCurrent: true
    },
    {
      id: "8",
      name: "立场回顾与变化轨迹",
      description: "回顾立场变化并总结学习收获",
      isCurrent: false
    }
  ];

  // 获取角色名称
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.label : roleId;
  };

  // 生成关键词文本的函数
  const getKeywordText = (fullText: string, maxLen = 16) => {
    if (!fullText) return '';
    const t = fullText.trim();
    return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
  };

  // 获取立场中文名称
  const getStanceName = (stance: string) => {
    switch(stance) {
      case 'pro':
        return '支持';
      case 'con':
        return '反对';
      case 'conditional':
        return '条件支持';
      default:
        return '中立';
    }
  };
  
  // 模拟获取议题数据和前面步骤的数据
  useEffect(() => {
    setIsLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      // 查找对应ID的议题
      const selectedTopic = topics.find(t => t.id === id);
      
      if (selectedTopic) {
        setTopic(selectedTopic);
        
         // 标记当前步骤为已完成
        markStepCompleted(7);
        
        // 记录最近学习页面
        updateLastVisitedLearningPage({
          topicId: id,
          topicTitle: selectedTopic.title,
          stepId: 7,
          routePath: getStepRoute(id, 7),
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
        const parsed: InitialIntuitionData = JSON.parse(savedIntuition);
        setInitialIntuition(parsed);
      }
      
      // 加载论证记录数据
      const savedClaims = localStorage.getItem(`topic_${id}_claims`);
      const savedEvidences = localStorage.getItem(`topic_${id}_evidences`);
      const savedReasoningBridge = localStorage.getItem(`topic_${id}_reasoning_bridge`);
      
      if (savedClaims && savedEvidences) {
        const claims = JSON.parse(savedClaims);
        const evidences = JSON.parse(savedEvidences);
        const bridges = savedReasoningBridge ? JSON.parse(savedReasoningBridge) : [];
        
        // 构建论证记录
        const records: ArgumentRecord[] = evidences.map((evidence: any) => {
          const claim = claims.find((c: any) => c.id === evidence.claimId);
          const bridge = bridges.find((b: any) => b.claimId === evidence.claimId && b.evidenceId === evidence.id);
          
          return {
            id: `${evidence.id}-${evidence.claimId}`,
            stance: claim?.stance || 'neutral',
            claimId: evidence.claimId,
            claimText: claim?.text || '',
            evidenceId: evidence.id,
            evidenceText: evidence.text,
            bridgeText: bridge?.text || null
          };
        });
        
        setArgumentRecords(records);
      }
      
      // 加载对话数据
      const savedDialogue = localStorage.getItem(`topic_${id}_dialogue`);
      if (savedDialogue) {
        const parsed: DialogueData = JSON.parse(savedDialogue);
        setDialogueData(parsed);
      }
      
      // 加载之前保存的反思数据（如果有）
      const savedReflection = localStorage.getItem(`topic_${id}_meta_reflection`);
      if (savedReflection) {
        const parsed: MetaReflectionResult = JSON.parse(savedReflection);
        setHighlightEvidenceId(parsed.highlightEvidenceId);
        setHighlightEvidenceComment(parsed.highlightEvidenceComment);
        setReflectionAnswers(parsed.reflection);
        setSelfEvalAnswers(parsed.selfEval);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // 如果加载失败，使用模拟数据
      loadMockData();
    }
  };
  
  // 加载模拟数据（如果没有保存的数据）
  const loadMockData = () => {
    // 模拟初始直觉数据
    setInitialIntuition({
      value: 60,
      note: "我觉得需要谨慎评估核污染水排海的长期影响，但同时也理解这是一个复杂的技术问题。"
    });
    
    // 模拟论证记录数据
    const mockRecords: ArgumentRecord[] = [
      {
        id: "E1-C1",
        stance: "pro",
        claimId: "C1",
        claimText: "福岛核污染水排海是当前最安全、最可行的选择",
        evidenceId: "E1",
        evidenceText: "IAEA报告认为排海符合国际安全标准",
        bridgeText: "IAEA是国际权威机构，其评估具有较高可信度"
      },
      {
        id: "E2-C1",
        stance: "pro",
        claimId: "C1",
        claimText: "福岛核污染水排海是当前最安全、最可行的选择",
        evidenceId: "E2",
        evidenceText: "ALPS系统能去除62种放射性核素，仅保留氚",
        bridgeText: "ALPS技术能够有效降低放射性物质浓度"
      },
      {
        id: "E4-C2",
        stance: "con",
        claimId: "C2",
        claimText: "核污染水排海存在长期环境风险，不应贸然进行",
        evidenceId: "E4",
        evidenceText: "福岛附近海域的渔业刚有恢复迹象",
        bridgeText: "排海可能导致消费者信心崩溃，影响渔民生计"
      }
    ];
    setArgumentRecords(mockRecords);
    
    // 模拟对话数据
    const mockDialogue: DialogueData = {
      topicId: id || "1",
      topicTitle: "核污染水排海是否可接受？",
      roles: {
        user: "student",
        system: "fisher"
      },
      userOpinion: "我认为需要谨慎评估核污染水排海的长期影响",
      systemOpinion: "",
      messages: [
        {
          id: "msg-1",
          text: "当地渔民：我对核污染水排海非常担忧，这会直接影响我们的生计。我们的渔业刚刚有恢复迹象，担心排海会导致消费者对海产品失去信心。",
          sender: "system",
          round: 1,
          timestamp: new Date(),
          evidenceTags: []
        },
        {
          id: "msg-2",
          text: "普通学生：我理解你的担忧。不过根据IAEA的报告，排海计划符合国际安全标准。而且ALPS系统能够去除大部分放射性物质，只保留氚，其浓度远低于安全标准。",
          sender: "user",
          round: 1,
          timestamp: new Date(),
          evidenceTags: ["E1", "E2"]
        },
        {
          id: "msg-3",
          text: "当地渔民：这些技术数据我不太懂，但我更关心实际影响。我们的鱼卖不出去怎么办？我们世世代代都靠海为生。",
          sender: "system",
          round: 2,
          timestamp: new Date(),
          evidenceTags: []
        }
      ],
      savedAt: new Date().toISOString()
    };
    setDialogueData(mockDialogue);
  };
  
  // 处理反思问题答案变化
  const handleReflectionChange = (question: string, value: string) => {
    setReflectionAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };
  
  // 处理自我评估答案变化
  const handleSelfEvalChange = (question: string, value: number) => {
    setSelfEvalAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };
  
  // 保存元认知反思结果
  const saveMetaReflection = () => {
    const metaReflectionResult: MetaReflectionResult = {
      highlightEvidenceId,
      highlightEvidenceComment,
      reflection: reflectionAnswers,
      selfEval: selfEvalAnswers,
      timestamp: Date.now()
    };
    
    // 保存到localStorage
    localStorage.setItem(`topic_${id}_meta_reflection`, JSON.stringify(metaReflectionResult));
    
    // 显示成功提示
    toast.success("反思记录已保存");
  };
  
  // 返回对话模拟
  const handleBackToDialogueSimulation = () => {
    navigate(getStepRoute(id, 6));
  };
  
  // 进入下一步：立场回顾与变化轨迹
  const handleNextStep = () => {
    // 保存当前反思数据
    saveMetaReflection();
    
    // 标记该步骤为已完成
    markStepCompleted(7);
    
    // 显示提示
    toast.success("已保存你的反思记录");
    
    // 跳转到立场回顾与变化轨迹页面
    navigate(getStepRoute(id, 8));
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
  
  // 统计数据
  const totalEvidence = argumentRecords.length;
  const withBridge = argumentRecords.filter(r => !!r.bridgeText).length;
  const dialogueRounds = dialogueData?.messages ? Math.ceil(dialogueData.messages.length / 2) : 0;
  
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
              元认知反思：回顾我的思考旅程
            </h1>
            
            <p className="text-xl text-gray-600 italic mb-8">
              "停下来思考：我是怎么形成现在的观点的？哪些因素真正影响了我的判断？"
            </p>
          </div>
        </section>
        
        {/* 主体区域布局：元认知反思页面 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
               {/* 区块 A：学习路径回顾 */}
              <div className="meta-section meta-summary mb-12">
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm animate-fade-in"
                >
                  <div className="flex items-center text-blue-600 mb-6">
                    <Clock className="w-6 h-6 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">学习路径回顾</h2>
                  </div>
                  
                  <div className="mb-8">
                    <p className="text-gray-700 mb-6">
                      你已经依次完成了：背景阅读 → 视角拼图 → 论证解剖 → 对话模拟。<br />
                      现在，请回头看一看：<span className="font-medium">哪些环节真正改变了你的想法？哪些证据最打动你？</span>
                    </p>
                    
                    {/* 步骤小时间线 */}
                    <div className="relative">
                      {/* 连接线 */}
                      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 transform -translate-x-1/2 z-0 hidden md:block"></div>
                      
                      {/* 步骤列表 */}
                      <div className="space-y-6">
                        {/* 背景阅读 */}
                        <div className="relative flex">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                            <BookOpen className="w-3 h-3" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 mb-1">背景阅读</h3>
                            <p className="text-gray-600 text-sm">已完成背景材料阅读，了解了相关事实、数据和研究</p>
                          </div>
                        </div>
                        
                        {/* 视角拼图 */}
                        <div className="relative flex">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                            <User className="w-3 h-3" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 mb-1">视角拼图</h3>
                            <p className="text-gray-600 text-sm">从多角度理解了不同立场的观点，分析了各方关注点</p>
                          </div>
                        </div>
                        
                        {/* 论证解剖 */}
                        <div className="relative flex">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                            <FileText className="w-3 h-3" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 mb-1">论证解剖</h3>
                            <p className="text-gray-600 text-sm">共分析了 {totalEvidence} 条证据，其中 {withBridge} 条写了推理桥</p>
                          </div>
                        </div>
                        
                        {/* 对话模拟 */}
                        <div className="relative flex">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                            <MessageCircle className="w-3 h-3" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 mb-1">对话模拟</h3>
                            <p className="text-gray-600 text-sm">与「{dialogueData ? getRoleName(dialogueData.roles.system) : '系统角色'}」进行了 {dialogueRounds} 轮对话，练习了有理有据地表达观点</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 我印象最深的一条证据 */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">我印象最深的一条证据</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">选择一条证据</label>
                        <select
                          value={highlightEvidenceId || ""}
                          onChange={(e) => setHighlightEvidenceId(e.target.value || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">-- 请选择一条证据 --</option>
                          {argumentRecords.map(record => (
                            <option key={record.evidenceId} value={record.evidenceId}>
                              {record.evidenceId} · {getKeywordText(record.evidenceText)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">为什么它很重要？</label>
                        <textarea
                          value={highlightEvidenceComment}
                          onChange={(e) => setHighlightEvidenceComment(e.target.value)}
                          placeholder="请说明这条证据为什么让你印象深刻..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          rows={3}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
               {/* 区块 B：关键反思问题 */}
              <div className="meta-section meta-questions mb-12">
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm animate-fade-in"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="flex items-center text-blue-600 mb-6">
                    <Brain className="w-6 h-6 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">关键反思问题</h2>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Q1：初始判断的"身份视角" */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">1. 初始判断的"身份视角"</h3>
                      <p className="text-gray-700 mb-4">
                        回想你在一开始做出判断的时候：<br />
                        你当时是以怎样的"身份"或"角色"在思考这个问题的？（例如：普通学生、担心环境的居民、科学追随者、当地渔民等）<br />
                        这个身份视角，可能会让你特别关注哪些方面，又容易忽略哪些方面？
                      </p>
                      <textarea
                        value={reflectionAnswers.q1IdentityPerspective}
                        onChange={(e) => handleReflectionChange("q1IdentityPerspective", e.target.value)}
                        placeholder="请分享你最初思考时的身份视角..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        rows={4}
                      ></textarea>
                    </div>
                    
                    {/* Q2：最初想法的依据与可能的片面性 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">2. 最初想法的依据与可能的片面性</h3>
                      <p className="text-gray-700 mb-4">
                        你最初产生"赞成/反对/保留态度"的依据主要是什么？<br />
                        比如：听到的新闻、家人同学的意见、社交媒体上的说法、某些数据或报道等。<br />
                        现在回头看，你觉得当时的依据有没有可能是<span className="font-medium">片面的</span>？如果有，你认为片面在哪里？
                      </p>
                      <textarea
                        value={reflectionAnswers.q2InitialBasis}
                        onChange={(e) => handleReflectionChange("q2InitialBasis", e.target.value)}
                        placeholder="请分析你最初观点的依据及其可能的片面性..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        rows={4}
                      ></textarea>
                    </div>
                    
                    {/* Q3：立场是否改变，以及改变/坚持的理由 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">3. 立场是否改变，以及改变/坚持的理由</h3>
                      <p className="text-gray-700 mb-4">
                        经过这次围绕本议题的学习（阅读材料、分析论证、模拟对话等），你的立场有没有发生变化？<br />
                        <br />
                        <span className="font-medium">如果有改变</span>，请说明：是什么促成了这种变化？（例如某条证据、某个角色的观点、发现自己之前忽略了什么……）<br />
                        <span className="font-medium">如果没有改变</span>，请说明：你现在会如何用更充分的论据来支持原来的立场？
                      </p>
                      <textarea
                        value={reflectionAnswers.q3StanceChange}
                        onChange={(e) => handleReflectionChange("q3StanceChange", e.target.value)}
                        placeholder="请分享你的立场是否发生了变化，以及原因..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        rows={4}
                      ></textarea>
                    </div>
                    
                    {/* Q4：仍然存在的疑问与下一步打算 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">4. 仍然存在的疑问与下一步打算</h3>
                      <p className="text-gray-700 mb-4">
                        到现在为止，你对这个议题还有哪些关键问题是"不确定"或"仍然有疑问"的？<br />
                        你觉得如果要进一步弄清楚这些问题，下一步可以去查找哪些信息或请教哪些人？
                      </p>
                      <textarea
                        value={reflectionAnswers.q4RemainingQuestions}
                        onChange={(e) => handleReflectionChange("q4RemainingQuestions", e.target.value)}
                        placeholder="请列出你仍然存在的疑问和下一步打算..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        rows={4}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
               {/* 区块 C：自我评估小量表 */}
              <div className="meta-section meta-selfeval">
                <div 
                  className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm animate-fade-in"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="flex items-center text-blue-600 mb-6">
                    <CheckSquare className="w-6 h-6 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">自我评估小量表</h2>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    请对自己在这次学习过程中的思考方式进行简单评价（1-5分，1分表示"完全不同意"，5分表示"完全同意"）：
                  </p>
                  
                  <div className="space-y-6">
                    {/* Q1 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">1. 我尝试从<span className="font-bold">不同角色的角度</span>来思考这个议题。</span>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => handleSelfEvalChange("q1", score)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                selfEvalAnswers.q1 === score
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              } transition-colors`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>完全不同意</span>
                        <span>完全同意</span>
                      </div>
                    </div>
                    
                    {/* Q2 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">2. 在表达观点时，我有意识地引用了<span className="font-bold">具体的事实或数据</span>。</span>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => handleSelfEvalChange("q2", score)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                selfEvalAnswers.q2 === score
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              } transition-colors`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>完全不同意</span>
                        <span>完全同意</span>
                      </div>
                    </div>
                    
                    {/* Q3 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">3. 我会留意自己有没有因为情绪或立场而忽略反对证据。</span>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => handleSelfEvalChange("q3", score)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                selfEvalAnswers.q3 === score
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              } transition-colors`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>完全不同意</span>
                        <span>完全同意</span>
                      </div>
                    </div>
                    
                    {/* Q4 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">4. 当别人提出不同意见时，我愿意先弄清楚他的依据是什么。</span>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => handleSelfEvalChange("q4", score)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                selfEvalAnswers.q4 === score
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              } transition-colors`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>完全不同意</span>
                        <span>完全同意</span>
                      </div>
                    </div>
                    
                    {/* Q5 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">5. 将来遇到类似科学争议，我知道自己大概会按照哪些步骤来判断信息。</span>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => handleSelfEvalChange("q5", score)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                selfEvalAnswers.q5 === score
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              } transition-colors`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>完全不同意</span>
                        <span>完全同意</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center text-gray-500 text-sm italic">
                    提示：这些自评结果只用于你的学习记录，不作为正式成绩。
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
                onClick={handleBackToDialogueSimulation}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                返回对话模拟
              </button>
              
              <button 
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center"
              >
                继续：回顾我的立场变化
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MetaCognition;