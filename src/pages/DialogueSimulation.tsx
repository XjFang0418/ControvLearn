import { useState, useEffect, useRef } from "react";
// 已移除 framer-motion 依赖，使用 CSS 过渡效果替代
import { 
  BookOpen, 
  User, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  MessageCircle,
  Quote,
  Send,
  FileText,
  HelpCircle as HelpIcon
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getStepRoute, isStepCompleted, markStepCompleted, updateLastVisitedLearningPage } from "@/lib/utils";

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

// 定义主张类型
interface Claim {
  id: string;
  text: string;
  sentenceId: string;
  stance: 'pro' | 'con' | 'conditional' | 'neutral';
}

// 定义证据类型
interface Evidence {
  id: string;
  text: string;
  sentenceId: string;
  claimId: string;
  type: string;
}

// 定义推理桥类型
interface ReasoningBridge {
  id: string;
  claimId: string;
  evidenceId: string;
  text: string;
}

// 定义角色类型
interface Role {
  id: string;
  label: string;
  defaultStance: string;
}

// 定义消息类型
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system';
  round: number;
  timestamp: Date;
  evidenceTags: string[];
}

const DialogueSimulation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // 模拟议题数据（从 S0-1 获取并扩展）
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 从 S1-5 读取的数据
  const [claims, setClaims] = useState<Claim[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [reasoningBridge, setReasoningBridge] = useState<ReasoningBridge[]>([]);
  
  // 角色选择状态
  const [selectedRoleA, setSelectedRoleA] = useState<string>("student");  // 我方角色
  const [selectedRoleB, setSelectedRoleB] = useState<string>("fisher");  // 系统角色
  
  // 主张输入状态
  const [myOpinion, setMyOpinion] = useState<string>("");  // 我方大致观点
  const [systemOpinion, setSystemOpinion] = useState<string>("");  // 系统大致观点（可选）
  
  // 对话状态
  const [conversationStarted, setConversationStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const maxRounds = 3;
  
  // 证据参考区的Tab状态
  const [activeTab, setActiveTab] = useState<string>("byClaim");
  
  // 角色数据
  const roles: Role[] = [
    { id: 'student',  label: '普通学生',      defaultStance: 'neutral' },
    { id: 'fisher',   label: '当地渔民',      defaultStance: 'con' },
    { id: 'company',  label: '电力公司工程师', defaultStance: 'pro' },
    { id: 'gov',      label: '政府官员',      defaultStance: 'conditional' },
    { id: 'ngo',      label: '环保组织代表',   defaultStance: 'con' },
    { id: 'scientist',label: '独立科学家',    defaultStance: 'conditional' },
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
      isCurrent: true
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

  // 生成关键词文本的函数
  const getKeywordText = (fullText: string, maxLen = 14) => {
    if (!fullText) return '';
    const t = fullText.trim();
    return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
  };
  
   // 获取角色标签样式
  const getStanceLabelClass = (stance: string) => {
    switch(stance) {
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'con':
        return 'bg-red-100 text-red-800';
      case 'conditional':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
  
  // 获取角色的默认立场
  const getRoleDefaultStance = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.defaultStance : 'conditional';
  };
  
  // 获取角色对象
  const getRoleById = (roleId: string) => {
    return roles.find(r => r.id === roleId) || roles[0];
  };
  
  // 模拟获取议题数据和S1-5的数据
  useEffect(() => {
    setIsLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      // 查找对应ID的议题
      const selectedTopic = topics.find(t => t.id === id);
      
      if (selectedTopic) {
        setTopic(selectedTopic);
        
        // 标记当前步骤为已完成
        markStepCompleted(6);
        
        // 记录最近学习页面
        updateLastVisitedLearningPage({
          topicId: id,
          topicTitle: selectedTopic.title,
          stepId: 6,
          routePath: getStepRoute(id, 6),
          visitedAt: Date.now()
        });
        
        // 尝试从localStorage中加载S1-5的数据
        const loadFromLocalStorage = () => {
          // 加载主张数据
          const savedClaims = localStorage.getItem(`topic_${id}_claims`);
          const savedEvidences = localStorage.getItem(`topic_${id}_evidences`);
          const savedReasoningBridge = localStorage.getItem(`topic_${id}_reasoning_bridge`);
          
          if (savedClaims && savedEvidences && savedReasoningBridge) {
            try {
              const parsedClaims: Claim[] = JSON.parse(savedClaims);
              const parsedEvidences: Evidence[] = JSON.parse(savedEvidences);
              const parsedReasoningBridge: ReasoningBridge[] = JSON.parse(savedReasoningBridge);
              
              setClaims(parsedClaims);
              setEvidences(parsedEvidences);
              setReasoningBridge(parsedReasoningBridge);
            } catch (error) {
              console.error("Failed to parse data from localStorage", error);
              loadMockData();
            }
          } else {
            // 如果没有保存的数据，使用模拟数据
            loadMockData();
          }
        };
        
     // 加载模拟数据
    const loadMockData = () => {
      // 模拟的主张数据
      const mockClaims: Claim[] = [
        { id: 'C1', text: '福岛核污染水排海是当前最安全、最可行的选择', sentenceId: 's1', stance: 'pro' },
        { id: 'C2', text: '核污染水排海存在长期环境风险，不应贸然进行', sentenceId: 's2', stance: 'con' },
        { id: 'C3', text: '在满足严格安全标准和透明度要求的前提下，可以考虑排海', sentenceId: 's3', stance: 'conditional' }
      ];
      
      // 模拟的证据数据
      const mockEvidences: Evidence[] = [
        { id: 'E1', text: 'IAEA报告认为排海符合国际安全标准', sentenceId: 'e1', claimId: 'C1', type: 'authority' },
        { id: 'E2', text: 'ALPS系统能去除62种放射性核素，仅保留氚', sentenceId: 'e2', claimId: 'C1', type: 'data' },
        { id: 'E3', text: '全球有20多个核电站都在以类似方式排放含氚废水', sentenceId: 'e3', claimId: 'C1', type: 'authority' },
        { id: 'E4', text: '福岛附近海域的渔业刚有恢复迹象', sentenceId: 'e4', claimId: 'C2', type: 'experience' },
        { id: 'E5', text: '长期环境影响存在不确定性', sentenceId: 'e5', claimId: 'C2', type: 'experience' },
        { id: 'E6', text: '应建立长期监测机制追踪环境影响', sentenceId: 'e6', claimId: 'C3', type: 'experience' },
        { id: 'E7', text: '应充分听取周边国家和渔民的意见', sentenceId: 'e7', claimId: 'C3', type: 'experience' }
      ];
      
      // 模拟的推理桥数据
      const mockReasoningBridge: ReasoningBridge[] = [
        { id: 'R1', claimId: 'C1', evidenceId: 'E1', text: 'IAEA是国际权威机构，其评估具有较高可信度' },
        { id: 'R2', claimId: 'C1', evidenceId: 'E2', text: 'ALPS技术能够有效降低放射性物质浓度' },
        { id: 'R3', claimId: 'C2', evidenceId: 'E4', text: '排海可能导致消费者信心崩溃，影响渔民生计' }
      ];
      
      setClaims(mockClaims);
      setEvidences(mockEvidences);
      setReasoningBridge(mockReasoningBridge);
    };
        
     loadFromLocalStorage();
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
  
  // 处理引用证据
  const handleInsertEvidenceTag = (evidenceId: string) => {
    if (!inputRef.current) {
      toast.info("请先点击输入框");
      return;
    }
    
    const evidence = evidences.find(e => e.id === evidenceId);
    if (!evidence) return;
    
    const tagText = `[${evidenceId}] ${getKeywordText(evidence.text, 16)}`;
    
    // 在当前光标位置插入标签文本
    const textareaRef = inputRef.current;
    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const newValue = currentMessage.substring(0, start) + tagText + currentMessage.substring(end);
    
    setCurrentMessage(newValue);
    
    // 在下一个渲染周期后恢复光标位置
    setTimeout(() => {
      textareaRef.focus();
      textareaRef.setSelectionRange(start + tagText.length, start + tagText.length);
    }, 0);
  };
  
   // 获取对话反馈
  const getDialogueFeedback = () => {
    const feedbacks: string[] = [];
    
    if (!conversationStarted) return feedbacks;
    
    // 检查是否没有使用连接词
    const hasConnectives = messages.some(msg => 
      msg.sender === 'user' && /因为|所以|因此|所以说|由此可见|综上所述/.test(msg.text)
    );
    
    if (!hasConnectives) {
      feedbacks.push("可以尝试用'因为…所以…'之类的表达，让推理更清晰");
    }
    
    // 检查是否没有引用证据
    const hasEvidenceTags = messages.some(msg => msg.sender === 'user' && msg.evidenceTags.length > 0);
    
    if (!hasEvidenceTags) {
      feedbacks.push("你似乎还没有把前面分析到的证据放进对话中");
    }
    
    // 检查双方立场是否相同
    const userRoleStance = getRoleDefaultStance(selectedRoleA);
    const systemRoleStance = getRoleDefaultStance(selectedRoleB);
    
    if (userRoleStance === systemRoleStance) {
      feedbacks.push("两个角色似乎代表了相同立场，你也可以尝试选择立场不同的角色进行练习");
    }
    
    return feedbacks;
  };
  
  // 保存对话
  const handleSaveDialogue = () => {
    const dialogueData = {
      topicId: id,
      topicTitle: topic?.title,
      roles: {
        user: selectedRoleA,
        system: selectedRoleB
      },
      userOpinion: myOpinion,
      systemOpinion: systemOpinion,
      messages,
      savedAt: new Date().toISOString()
    };
    
    // 保存到localStorage
    localStorage.setItem(`topic_${id}_dialogue`, JSON.stringify(dialogueData));
    
    // 显示成功提示
    toast.success("对话已保存");
  };
  
   // 返回论证解剖
  const handleBackToArgumentAnalysis = () => {
    navigate(getStepRoute(id, 5));
  };
  
  // 进入下一步：元认知反思
  const handleNextStep = () => {
    // 自动保存对话
    handleSaveDialogue();
    
    // 跳转到元认知反思页面
    navigate(getStepRoute(id, 7));
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
  
   // 生成系统开场陈述
  const getSystemOpeningStatement = () => {
    const systemRole = getRoleById(selectedRoleB);
    const systemStance = getRoleDefaultStance(selectedRoleB);
    
    // 根据立场和角色生成不同的开场白
    let openingText = "";
    
    if (systemOpinion.trim()) {
      openingText = `${systemRole.label}：${systemOpinion}`;
    } else {
      switch (systemStance) {
        case 'pro':
          openingText = `${systemRole.label}：在当前议题"${topic?.title}"下，我倾向于认为这是一个可行的选择。根据我了解的信息，这种做法有其科学依据和实际需求。你对这个问题有什么看法吗？`;
          break;
        case 'con':
          openingText = `${systemRole.label}：我对"${topic?.title}"这个问题持有保留意见。从我的专业角度来看，这种做法可能会带来一些潜在风险和负面影响。不知道你是否了解这些方面？`;
          break;
        case 'conditional':
          openingText = `${systemRole.label}：关于"${topic?.title}"，我的看法比较复杂。在满足一定条件的情况下，这种做法可能是可以接受的，但需要谨慎评估各种因素。你对这个问题有什么初步的看法吗？`;
          break;
        default:
          openingText = `${systemRole.label}：对于"${topic?.title}"这个问题，我想先听听你的看法。你对这个争议有什么了解或感受吗？`;
      }
    }
    
    return openingText;
  };
  
  // 生成系统回复
  const getSystemReply = (userText: string) => {
    const systemRole = getRoleById(selectedRoleB);
    const hasBecause = /因为|所以|数据|研究|证据/.test(userText);
    const hasEvidence = evidences.some(evidence => 
      userText.includes(`[${evidence.id}]`)
    );
    
    // 根据轮次和用户回复内容生成不同的回复
    let replyText = "";
    
    switch (currentRound) {
      case 1:
        if (hasBecause || hasEvidence) {
          replyText = `${systemRole.label}：我注意到你用了一些理由和证据来支持你的看法，这是很好的。不过，从我的角度来看，我仍然有些担忧。例如，你提到的这些证据是否考虑了长期影响？或者是否有其他研究得出了不同的结论？`;
        } else {
          replyText = `${systemRole.label}：谢谢你分享你的观点。不过，我想了解更多细节。你能不能具体说明一下你依据的事实或数据？为什么你会有这样的看法呢？`;
        }
        break;
      case 2:
        if (hasBecause || hasEvidence) {
          replyText = `${systemRole.label}：感谢你提供了更多信息和证据。这让我对你的观点有了更清晰的理解。不过，我还是想从另一个角度提出一些思考。例如，在资源有限的情况下，这种选择是否是最优的？或者是否有其他替代方案值得考虑？`;
        } else {
          replyText = `${systemRole.label}：我理解你的立场，但仍然觉得缺乏足够具体的支持。在复杂的问题上，仅仅有态度是不够的，我们需要用事实和数据来支撑自己的观点。你是否可以再补充一些具体的依据？`;
        }
        break;
      case 3:
        replyText = `${systemRole.label}：经过这次讨论，我对你的观点有了更全面的了解。虽然我们可能在一些细节上仍有不同意见，但这种交流本身就是有价值的。通过交换不同的视角和证据，我们可以更全面地理解这个复杂的问题。谢谢你的分享！`;
        break;
      default:
        replyText = `${systemRole.label}：谢谢你的分享。我认为这个问题确实值得深入探讨。`;
    }
    
    return replyText;
  };
  
  // 开始对话
  const handleStartConversation = () => {
    if (!selectedRoleA || !selectedRoleB) {
      toast.info("请先选择角色");
      return;
    }
    
    // 生成系统开场陈述
    const openingStatement = getSystemOpeningStatement();
    
    // 添加到消息列表
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text: openingStatement,
      sender: 'system',
      round: 1,
      timestamp: new Date(),
      evidenceTags: []
    };
    
    setMessages([newMessage]);
    setConversationStarted(true);
    setCurrentRound(1);
    
    // 自动聚焦到输入框
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  
  // 发送用户消息
  const handleSendMessage = () => {
    const userText = currentMessage.trim();
    
    if (!userText) {
      toast.info("请输入消息内容");
      return;
    }
    
    if (currentRound > maxRounds) {
      toast.info("对话已达到设定轮次，可以进入下一步反思");
      return;
    }
    
    // 提取证据标签
    const evidenceTags: string[] = [];
    const tagRegex = /\[([Ee]\d+)\]/g;
    let match;
    while ((match = tagRegex.exec(userText)) !== null) {
      evidenceTags.push(match[1]);
    }
    
    // 创建用户消息
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: `${getRoleById(selectedRoleA).label}：${userText}`,
      sender: 'user',
      round: currentRound,
      timestamp: new Date(),
      evidenceTags
    };
    
    // 添加用户消息到列表
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage("");
    
    // 如果还没到最大轮次，生成系统回复
    if (currentRound < maxRounds) {
      setTimeout(() => {
        const systemReplyText = getSystemReply(userText);
        const systemReply: Message = {
          id: `msg-${Date.now()}`,
          text: systemReplyText,
          sender: 'system',
          round: currentRound + 1,
          timestamp: new Date(),
          evidenceTags: []
        };
        
        setMessages(prev => [...prev, systemReply]);
        setCurrentRound(prev => prev + 1);
      }, 1000);
    } else {
      // 对话结束
      setCurrentRound(prev => prev + 1);
    }
  };
  
  // 处理回车键发送消息
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
            <button className="md:hidden text-gray-600" onClick={() => navigate('/profile')}>
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
              对话模拟：应用与表达
            </h1>
            
            <p className="text-xl text-gray-600 italic mb-8">
              "基于前面分析的论证结构，模拟与不同立场的人进行对话，练习有理有据地表达观点。"
            </p>
          </div>
        </section>
        
        {/* 主体区域：左右两栏布局 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 左侧：对话设置与参考材料 */}
              <div className="lg:w-2/5">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                    对话设置与参考材料
                  </h2>
                  
                  {/* 场景说明卡片 */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2">对话场景</h3>
                    <p className="text-blue-700 text-sm">
                      想象你正在参加一场面向公众的听证会 / 学校辩论会。<br />
                      你和另一位角色将围绕「{topic.title}」进行 3 轮对话。<br />
                      你的目标不是"赢辩论"，而是<span className="font-medium">用清晰的论点和证据表达自己的立场</span>。
                    </p>
                  </div>
                  
                  {/* 角色选择区 */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">角色配置</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 角色A选择 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">我方角色</label>
                        <select
                          value={selectedRoleA}
                          onChange={(e) => setSelectedRoleA(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.label}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          该角色更接近：{getStanceName(getRoleDefaultStance(selectedRoleA))}立场
                        </p>
                      </div>
                      
                      {/* 角色B选择 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">系统角色</label>
                        <select
                          value={selectedRoleB}
                          onChange={(e) => setSelectedRoleB(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.label}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          该角色更接近：{getStanceName(getRoleDefaultStance(selectedRoleB))}立场
                        </p>
                      </div>
                    </div>
                    
                    {/* 立场主张输入 */}
                    <div className="mt-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">我方大致观点（可选）</label>
                        <input
                          type="text"
                          value={myOpinion}
                          onChange={(e) => setMyOpinion(e.target.value)}
                          placeholder="用简单的话表达你对这个问题的看法..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">系统角色大致观点（可选）</label>
                        <input
                          type="text"
                          value={systemOpinion}
                          onChange={(e) => setSystemOpinion(e.target.value)}
                          placeholder="如果希望预设系统方的立场，可以在这里输入..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* 证据与推理桥参考区 */}
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">证据参考栏</h3>
                      
                      {/* 证据参考区的Tab切换 */}
                      <div className="flex rounded-md shadow-sm">
                        <button
                          type="button"
                          className={`px-3 py-1 text-sm font-medium ${activeTab === 'byClaim' ? 'bg-white border border-gray-300 border-r-0 rounded-l-md' : 'bg-gray-50 border border-gray-300 text-gray-500'}`}
                          onClick={() => setActiveTab('byClaim')}
                        >
                          按主张分组
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 text-sm font-medium ${activeTab === 'byStance' ? 'bg-white border border-gray-300 border-l-0 rounded-r-md' : 'bg-gray-50 border border-gray-300 text-gray-500'}`}
                          onClick={() => setActiveTab('byStance')}
                        >
                          按立场分组
                        </button>
                      </div>
                    </div>
                    
                    {/* 证据列表 */}
                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                      {activeTab === 'byClaim' ? (
                        // 按主张分组显示证据
                        claims.map(claim => {
                          const claimEvidences = evidences.filter(e => e.claimId === claim.id);
                          if (claimEvidences.length === 0) return null;
                          
                          return (
                            <div key={claim.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center mb-2">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStanceLabelClass(claim.stance)} mr-2`}>
                                  {getStanceName(claim.stance)}
                                </span>
                                <span className="font-medium text-sm text-gray-800">{claim.id}</span>
                                <span className="text-xs text-gray-600 ml-1">({getKeywordText(claim.text, 12)})</span>
                              </div>
                              
                              <div className="space-y-2">
                                {claimEvidences.map(evidence => {
                                  const hasBridge = reasoningBridge.some(
                                    r => r.claimId === claim.id && r.evidenceId === evidence.id
                                  );
                                  
                                  return (
                                    <div key={evidence.id} className="bg-white border border-gray-200 rounded-md p-2">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="font-medium text-sm text-gray-800">{evidence.id} · {getKeywordText(evidence.text, 16)}</div>
                                          <div className="text-xs text-gray-500 mt-1">类型: {evidence.type}</div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          {hasBridge && (
                                            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                              已写推理桥
                                            </span>
                                          )}
                                          <button
                                            onClick={() => handleInsertEvidenceTag(evidence.id)}
                                            className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors"
                                            title="引用到对话"
                                          >
                                            引用
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // 按立场分组显示证据
                        <>
                          {['pro', 'conditional', 'con'].map(stance => {
                            const stanceClaims = claims.filter(c => c.stance === stance);
                            const claimIds = stanceClaims.map(c => c.id);
                            const stanceEvidences = evidences.filter(e => claimIds.includes(e.claimId));
                            if (stanceEvidences.length === 0) return null;
                            
                            return (
                              <div key={stance} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center mb-2">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStanceLabelClass(stance)}`}>
                                    {getStanceName(stance)}
                                  </span>
                                </div>
                                
                                <div className="space-y-2">
                                  {stanceEvidences.map(evidence => {
                                    const hasBridge = reasoningBridge.some(
                                      r => r.evidenceId === evidence.id
                                    );
                                    const claim = claims.find(c => c.id === evidence.claimId);
                                    
                                    return (
                                      <div key={evidence.id} className="bg-white border border-gray-200 rounded-md p-2">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="font-medium text-sm text-gray-800">{evidence.id} · {getKeywordText(evidence.text, 16)}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              隶属主张: {claim?.id} · 类型: {evidence.type}
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            {hasBridge && (
                                              <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                                已写推理桥
                                              </span>
                                            )}
                                            <button
                                              onClick={() => handleInsertEvidenceTag(evidence.id)}
                                              className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded hover:bg-blue-200 transition-colors"
                                              title="引用到对话"
                                            >
                                              引用
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 右侧：对话编辑器与即时反馈 */}
              <div className="lg:w-3/5">
               <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <Quote className="w-5 h-5 mr-2 text-blue-600" />
                    对话模拟器
                  </h2>
                  
                  {/* 对话区域 */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 h-[500px] flex flex-col">
                    {/* 聊天历史区域 */}
                    <div className="flex-grow overflow-y-auto mb-4 space-y-4">
                      {conversationStarted ? (
                        messages.length > 0 ? (
                          messages.map((message, index) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <div className={`max-w-[80%] ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} rounded-lg p-3 shadow-sm`}>
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                {message.evidenceTags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {message.evidenceTags.map(tag => (
                                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-white bg-opacity-30 text-white">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>对话即将开始...</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-16 text-gray-500">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="mb-2">请选择角色并设置观点，然后点击"开始对话模拟"</p>
                          <p className="text-sm">对话将按照系统先说、你回应、系统再回应的顺序进行3轮</p>
                        </div>
                      )}
                    </div>
                    
                    {/* 输入区域 */}
                    <div className="border-t border-gray-200 pt-4">
                      {conversationStarted ? (
                        <>
                          {currentRound > maxRounds ? (
                            <div className="text-center py-4 text-gray-500">
                              <p className="font-medium">对话已达到设定轮次，可以进入下一步反思</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <textarea
                                ref={inputRef}
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`请输入你的回应... (轮次 ${currentRound}/${maxRounds})`}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                rows={3}
                              ></textarea>
                              <div className="flex justify-end">
                                <button
                                  onClick={handleSendMessage}
                                  disabled={!currentMessage.trim()}
                                  className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                                    currentMessage.trim() 
                                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  发送
                                  <Send className="ml-2 w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <button
                            onClick={handleStartConversation}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                          >
                            开始对话模拟
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 即时反馈卡片 */}
                  <div className="mt-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4">
                      <div className="flex items-start">
                        <HelpIcon className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold text-yellow-800 mb-2">即时反馈</h3>
                          <ul className="space-y-1">
                            {getDialogueFeedback().map((feedback, index) => (
                              <li key={index} className="text-xs text-gray-700 flex items-start">
                                <span className="text-yellow-500 mr-1">•</span>
                                {feedback}
                              </li>
                            ))}
                            {getDialogueFeedback().length === 0 && conversationStarted && messages.length > 0 && (
                              <li className="text-xs text-gray-700">
                                你的对话看起来包含了很好的推理结构和证据支持！
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 保存与继续按钮 */}
                  <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <button 
                      onClick={handleSaveDialogue}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center w-full sm:w-auto"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      保存我的对话
                    </button>
                    
                    <button 
                      onClick={handleNextStep}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center w-full sm:w-auto"
                    >
                      继续：完成本议题并反思
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
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
                onClick={handleBackToArgumentAnalysis}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                返回论证解剖
              </button>
              
              <button 
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center"
              >
                继续：完成本议题并反思
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DialogueSimulation;