// S1-5 论证解剖（新版）：多方材料 + 统一论证结构图
// S1-5 论证解剖（新版）：多方材料 + 统一论证结构图

import { useState, useEffect } from "react";
// 已移除 framer-motion 依赖，使用 CSS 过渡效果替代
import { 
  BookOpen, 
  User, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Eraser,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getStepRoute, isStepCompleted, updateLastVisitedLearningPage } from "@/lib/utils";

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

// 定义句子类型
interface Sentence {
  id: string;
  text: string;
  viewpointId: string;
}

// 定义观点类型
interface Viewpoint {
  id: string;
  title: string;
  description: string;
  sentences: Sentence[];
  position: 'support' | 'oppose' | 'conditional';
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

// 定义证据类型选项
const EVIDENCE_TYPES = [
  { id: 'data', name: '数据/研究' },
  { id: 'expert', name: '权威/机构声明' },
  { id: 'experience', name: '个人经历/个案' },
  { id: 'analogy', name: '类比/假设' },
  { id: 'other', name: '其他' }
];

// 定义立场类型选项
const STANCE_TYPES = [
  { id: 'pro', name: '支持', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'con', name: '反对', color: 'text-red-600', bgColor: 'bg-red-100' },
  { id: 'conditional', name: '条件支持', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { id: 'neutral', name: '中立', color: 'text-gray-600', bgColor: 'bg-gray-100' }
];

// 定义当前步骤类型
type CurrentStep = 1 | 2 | 3;

import { markStepCompleted } from "@/lib/utils";

const ArgumentAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 模拟议题数据（从 S0-1 获取并扩展）
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 所有观点文本（多方材料）
  const [viewpoints, setViewpoints] = useState<Viewpoint[]>([]);
  
  // 当前步骤
  const [currentStep, setCurrentStep] = useState<CurrentStep>(1);
  
  // 主张列表 - 所有材料统一编号 C1, C2, C3...
  // claims 数据结构：{ id, text, sentenceId, stance }
  const [claims, setClaims] = useState<Claim[]>([]);
  
  // 证据列表 - 所有材料统一编号 E1, E2, E3...
  // evidences 数据结构：{ id, text, sentenceId, claimId, type }
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  
  // 推理桥
  // reasoningBridge 数据结构：{ id, claimId, evidenceId, text }
  const [reasoningBridge, setReasoningBridge] = useState<ReasoningBridge[]>([]);
  
  // 当前选中的主张和证据（用于第三步写推理桥）
  const [selectedClaimForReasoning, setSelectedClaimForReasoning] = useState<string | null>(null);
  const [selectedEvidenceForReasoning, setSelectedEvidenceForReasoning] = useState<string | null>(null);
  const [reasoningText, setReasoningText] = useState("");
  
  // 是否显示参考结构
  const [showReference, setShowReference] = useState(false);
  
  // 是否显示论证结构图
  const [showArgumentMap, setShowArgumentMap] = useState(false);
  
  // 选中的论证记录
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  // 模态框状态
  const [showStanceModal, setShowStanceModal] = useState(false);
  const [selectedSentenceForStance, setSelectedSentenceForStance] = useState<string | null>(null);
  
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedSentenceForEvidence, setSelectedSentenceForEvidence] = useState<string | null>(null);
  const [selectedClaimForEvidence, setSelectedClaimForEvidence] = useState<string | null>(null);
  
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
      isCurrent: true
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
  
  // 获取议题相关的多段观点文本
  const getTopicViewpoints = (topicId: string): Viewpoint[] => {
    switch(topicId) {
      case "1": // 核污染水排海
        return [
          {
            id: "viewpointA",
            title: "支持排海计划",
            description: "来自东京电力公司专家的观点",
            position: "support",
            sentences: [
              { id: "s1", text: "福岛核事故已经过去十多年，处理核污染水是一个迫在眉睫的问题。", viewpointId: "viewpointA" },
              { id: "s2", text: "我们已经采用了先进的ALPS处理系统，能够去除水中62种放射性核素，仅保留氚。", viewpointId: "viewpointA" },
              { id: "s3", text: "根据国际原子能机构(IAEA)的评估报告，我们的排海计划符合国际安全标准。", viewpointId: "viewpointA" },
              { id: "s4", text: "氚的浓度远低于世界卫生组织设定的饮用水标准，不会对海洋环境造成显著影响。", viewpointId: "viewpointA" },
              { id: "s5", text: "实际上，全球有20多个核电站都在以类似的方式排放含氚废水，这是行业通行做法。", viewpointId: "viewpointA" },
              { id: "s6", text: "如果继续储存在罐子里，不仅空间有限，还存在地震等自然灾害风险。", viewpointId: "viewpointA" },
              { id: "s7", text: "我们理解公众的担忧，但科学数据表明排海是当前最安全、最可行的选择。", viewpointId: "viewpointA" }
            ]
          },
          {
            id: "viewpointB",
            title: "反对排海计划",
            description: "来自环保组织代表的观点",
            position: "oppose",
            sentences: [
              { id: "s8", text: "核污染水排海不是一个简单的技术问题，而是关系到全球海洋环境和人类健康的重大决策。", viewpointId: "viewpointB" },
              { id: "s9", text: "虽然ALPS系统能够处理大部分核素，但仍有一些放射性物质无法完全去除。", viewpointId: "viewpointB" },
              { id: "s10", text: "即使浓度符合标准，持续30年的排放累积效应不容忽视。", viewpointId: "viewpointB" },
              { id: "s11", text: "福岛附近海域的渔业已经开始恢复，排海计划可能导致消费者信心再次崩溃。", viewpointId: "viewpointB" },
              { id: "s12", text: "我们需要更谨慎的态度，考虑其他替代方案，如蒸汽释放或地层注入。", viewpointId: "viewpointB" },
              { id: "s13", text: "这不仅仅是日本的问题，因为海洋是全人类的共同财产。", viewpointId: "viewpointB" },
              { id: "s14", text: "IAEA的报告也承认存在不确定性，特别是长期环境影响方面。", viewpointId: "viewpointB" }
            ]
          },
          {
            id: "viewpointC",
            title: "谨慎支持，需附加条件",
            description: "来自独立科学家的观点",
            position: "conditional",
            sentences: [
              { id: "s15", text: "从纯技术角度看，经过处理的核污染水排海可能是目前可行的选择之一。", viewpointId: "viewpointC" },
              { id: "s16", text: "但我们必须看到，这个决定面临着科学、政治、经济和伦理等多方面的挑战。", viewpointId: "viewpointC" },
              { id: "s17", text: "首先，必须确保所有数据的透明度，让国际社会能够独立验证。", viewpointId: "viewpointC" },
              { id: "s18", text: "其次，需要建立长期的监测机制，追踪可能的环境影响。", viewpointId: "viewpointC" },
              { id: "s19", text: "最重要的是，应该充分听取利益相关方的意见，特别是渔民和周边国家的担忧。", viewpointId: "viewpointC" },
              { id: "s20", text: "科学评估是必要的，但决策不能仅仅基于科学因素，还需要考虑社会接受度。", viewpointId: "viewpointC" },
              { id: "s21", text: "在当前技术条件下，如果能够满足上述条件，排海或许是权衡后的选择，但绝不是最优解。", viewpointId: "viewpointC" }
            ]
          }
        ];
        
      case "2": // 人工智能是否会取代人类工作
        return [
          {
            id: "viewpointA",
            title: "AI将创造更多就业机会",
            description: "来自乐观派专家的观点",
            position: "support",
            sentences: [
              { id: "s1", text: "历史告诉我们，每一次技术革命都会创造新的就业机会，AI也不例外。", viewpointId: "viewpointA" },
              { id: "s2", text: "虽然AI会取代一些重复性工作，但同时会创造大量与AI开发、维护和应用相关的新岗位。", viewpointId: "viewpointA" },
              { id: "s3", text: "麦肯锡的研究表明，到2030年，AI可能创造的就业机会比摧毁的还要多。", viewpointId: "viewpointA" },
              { id: "s4", text: "就像互联网带来了程序员、数据分析师等新职业一样，AI也会带来我们现在无法想象的新工作。", viewpointId: "viewpointA" },
              { id: "s5", text: "关键不是阻止技术发展，而是调整教育体系，培养适应AI时代的技能，如创造力和批判性思维。", viewpointId: "viewpointA" },
              { id: "s6", text: "AI更多是作为工具增强人类能力，而不是完全替代人类。", viewpointId: "viewpointA" }
            ]
          },
          {
            id: "viewpointB",
            title: "AI将导致大规模失业",
            description: "来自担忧派专家的观点",
            position: "oppose",
            sentences: [
              { id: "s7", text: "这次技术革命与以往不同，AI可能会影响到更多的职业类型，包括一些高技能工作。", viewpointId: "viewpointB" },
              { id: "s8", text: "牛津大学的一项研究预测，未来20年内，美国约47%的工作有被自动化取代的风险。", viewpointId: "viewpointB" },
              { id: "s9", text: "生成式AI的出现，正在威胁到写作、设计、编程等创造性工作。", viewpointId: "viewpointB" },
              { id: "s10", text: "虽然新工作会被创造，但转型的过程可能会非常痛苦，导致大量结构性失业。", viewpointId: "viewpointB" },
              { id: "s11", text: "低收入工人和受教育程度较低的群体可能会受到更严重的冲击。", viewpointId: "viewpointB" },
              { id: "s12", text: "我们需要认真考虑如何通过政策和社会保障来缓解这一转变带来的社会问题。", viewpointId: "viewpointB" }
            ]
          }
        ];
        
      default:
        return [
          {
            id: "viewpointA",
            title: "支持方观点",
            description: "对该做法的支持意见",
            position: "support",
            sentences: [
              { id: "s1", text: "我认为这一做法总体上是利大于弊的，值得尝试。", viewpointId: "viewpointA" },
              { id: "s2", text: "根据最近的研究数据，相关指标确实有了明显改善。", viewpointId: "viewpointA" },
              { id: "s3", text: "很多专家也表示这是目前可行的解决方案之一。", viewpointId: "viewpointA" },
              { id: "s4", text: "虽然存在一些风险，但与其什么都不做，不如积极探索。", viewpointId: "viewpointA" },
              { id: "s5", text: "其他地区已经有成功案例，我们可以借鉴他们的经验。", viewpointId: "viewpointA" }
            ]
          },
          {
            id: "viewpointB",
            title: "反对方观点",
            description: "对该做法的反对意见",
            position: "oppose",
            sentences: [
              { id: "s6", text: "我认为现在实施这一做法还为时过早，存在很多不确定性。", viewpointId: "viewpointB" },
              { id: "s7", text: "现有的数据样本太小，不足以支持如此重大的决策。", viewpointId: "viewpointB" },
              { id: "s8", text: "一些研究也指出了潜在的风险，但被忽视了。", viewpointId: "viewpointB" },
              { id: "s9", text: "我们不能因为急于求成而忽视可能的长期负面影响。", viewpointId: "viewpointB" },
              { id: "s10", text: "在没有充分准备的情况下贸然推进，可能会导致不可挽回的后果。", viewpointId: "viewpointB" }
            ]
          }
        ];
    }
  };
  
  // 模拟获取议题数据
  useEffect(() => {
    setIsLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      // 查找对应ID的议题
      const selectedTopic = topics.find(t => t.id === id);
      
      if (selectedTopic) {
        setTopic(selectedTopic);
        
        // 初始化观点列表
        const topicViewpoints = getTopicViewpoints(id);
        setViewpoints(topicViewpoints);
        
        // 尝试从localStorage中加载已保存的标注结果
        loadSavedData();
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
  
  // 加载已保存的数据
  const loadSavedData = () => {
    // 加载主张数据
    const savedClaims = localStorage.getItem(`topic_${id}_claims`);
    if (savedClaims) {
      const parsed: Claim[] = JSON.parse(savedClaims);
      setClaims(parsed);
    } else {
      setClaims([]);
    }
    
    // 加载证据数据
    const savedEvidences = localStorage.getItem(`topic_${id}_evidences`);
    if (savedEvidences) {
      const parsed: Evidence[] = JSON.parse(savedEvidences);
      setEvidences(parsed);
    } else {
      setEvidences([]);
    }
    
    // 加载推理桥数据
    const savedReasoningBridge = localStorage.getItem(`topic_${id}_reasoning_bridge`);
    if (savedReasoningBridge) {
      const parsed: ReasoningBridge[] = JSON.parse(savedReasoningBridge);
      setReasoningBridge(parsed);
    } else {
      setReasoningBridge([]);
    }
    
    // 加载论证结构图显示状态
    const savedShowArgumentMap = localStorage.getItem(`topic_${id}_show_argument_map`);
    if (savedShowArgumentMap) {
      setShowArgumentMap(savedShowArgumentMap === 'true');
    } else {
      setShowArgumentMap(false);
    }
    
    // 重置当前步骤
    setCurrentStep(1);
  };
  
  // 保存数据到localStorage
  const saveData = () => {
    localStorage.setItem(`topic_${id}_claims`, JSON.stringify(claims));
    localStorage.setItem(`topic_${id}_evidences`, JSON.stringify(evidences));
    localStorage.setItem(`topic_${id}_reasoning_bridge`, JSON.stringify(reasoningBridge));
    localStorage.setItem(`topic_${id}_show_argument_map`, JSON.stringify(showArgumentMap));
  };
  
  // 处理主张标注
  const handleClaimAnnotation = (sentenceId: string) => {
    // 检查是否已标注为主张
    const existingClaim = claims.find(claim => claim.sentenceId === sentenceId);
    
    if (existingClaim) {
      // 移除主张
      setClaims(prev => prev.filter(claim => claim.sentenceId !== sentenceId));
      
      // 同时移除相关的证据
      setEvidences(prev => prev.filter(evidence => evidence.claimId !== existingClaim.id));
      
      // 同时移除相关的推理桥
      setReasoningBridge(prev => prev.filter(bridge => bridge.claimId !== existingClaim.id));
    } else {
      // 显示立场选择模态框
      setSelectedSentenceForStance(sentenceId);
      setShowStanceModal(true);
    }
    
    saveData();
  };
  
  // 确认立场选择
  const confirmStance = (stance: 'pro' | 'con' | 'conditional' | 'neutral') => {
    if (!selectedSentenceForStance) return;
    
    // 查找所有句子中匹配的ID
    let targetSentence: Sentence | undefined;
    for (const viewpoint of viewpoints) {
      targetSentence = viewpoint.sentences.find(s => s.id === selectedSentenceForStance);
      if (targetSentence) break;
    }
    
    if (targetSentence) {
      // 创建新主张，统一编号
      const newClaim: Claim = {
        id: `C${claims.length + 1}`,
        text: targetSentence.text,
        sentenceId: selectedSentenceForStance,
        stance
      };
      
      setClaims(prev => [...prev, newClaim]);
      saveData();
    }
    
    // 关闭模态框
    setShowStanceModal(false);
    setSelectedSentenceForStance(null);
  };
  
  // 处理证据标注
  const handleEvidenceAnnotation = (sentenceId: string) => {
    // 检查是否已标注为证据
    const existingEvidence = evidences.find(evidence => evidence.sentenceId === sentenceId);
    
    if (existingEvidence) {
      // 移除证据
      setEvidences(prev => prev.filter(evidence => evidence.sentenceId !== sentenceId));
      
      // 同时移除相关的推理桥
      setReasoningBridge(prev => prev.filter(bridge => bridge.evidenceId !== existingEvidence.id));
    } else {
      // 如果有主张，直接显示证据类型选择，否则先选择主张
      if (claims.length > 0) {
        setSelectedSentenceForEvidence(sentenceId);
        setSelectedClaimForEvidence(null);
        setShowEvidenceModal(true);
      } else {
        toast.info("请先添加至少一个主张");
      }
    }
    
    saveData();
  };
  
  // 确认证据类型选择
  const confirmEvidence = (evidenceType: string, claimId?: string) => {
    if (!selectedSentenceForEvidence) return;
    
    // 如果在模态框中选择了主张，则使用该主张
    const targetClaimId = claimId || selectedClaimForEvidence;
    
    if (!targetClaimId) return;
    
    // 查找所有句子中匹配的ID
    let targetSentence: Sentence | undefined;
    for (const viewpoint of viewpoints) {
      targetSentence = viewpoint.sentences.find(s => s.id === selectedSentenceForEvidence);
      if (targetSentence) break;
    }
    
    if (targetSentence) {
      // 创建新证据，统一编号
      const newEvidence: Evidence = {
        id: `E${evidences.length + 1}`,
        text: targetSentence.text,
        sentenceId: selectedSentenceForEvidence,
        claimId: targetClaimId,
        type: evidenceType
      };
      
      setEvidences(prev => [...prev, newEvidence]);
      saveData();
    }
    
    // 关闭模态框
    setShowEvidenceModal(false);
    setSelectedSentenceForEvidence(null);
    setSelectedClaimForEvidence(null);
  };
  
  // 处理推理桥提交
  const handleReasoningBridgeSubmit = () => {
    if (!selectedClaimForReasoning || !selectedEvidenceForReasoning || !reasoningText.trim()) return;
    
    // 创建新的推理桥
    const newBridge: ReasoningBridge = {
      id: `R${reasoningBridge.length + 1}`,
      claimId: selectedClaimForReasoning,
      evidenceId: selectedEvidenceForReasoning,
      text: reasoningText.trim()
    };
    
    setReasoningBridge(prev => [...prev, newBridge]);
    setReasoningText("");
    saveData();
    
    toast.success("推理桥已添加");
  };
  
  // 进入下一步
  const handleNextStep = () => {
    if (currentStep < 3) {
      // 检查是否满足进入下一步的条件
      if (currentStep === 1 && claims.length === 0) {
        toast.info("请至少标注1条观点");
        return;
      }
      
      setCurrentStep(prev => (prev + 1) as CurrentStep);
    }
  };
  
  // 返回上一步
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as CurrentStep);
    }
  };
  
  // 清空所有标注
  const clearAllAnnotations = () => {
    if (window.confirm('确定要清空所有标注吗？')) {
      setClaims([]);
      setEvidences([]);
      setReasoningBridge([]);
      setShowArgumentMap(false);
      setCurrentStep(1);
      saveData();
      toast.info('所有标注已清空');
    }
  };
  
  // 生成关键词文本的函数
  const getKeywordText = (fullText: string) => {
    // 去掉首尾空格
    const t = fullText.trim();
    // 取前 12~16 个字符，超出部分用 ...
    const maxLen = 16;
    return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
  };

// renderArgumentMap(): 在页面底部绘制论证记录表视图
  const renderArgumentMap = () => {
    // 使用父组件传入的selectedRecord状态
    
    // 获取各立场统计数据
    const getSummaryByStance = (stance: string) => {
      const stanceClaims = claims.filter(c => c.stance === stance);
      const claimIds = stanceClaims.map(c => c.id);
      const stanceEvidences = evidences.filter(e => claimIds.includes(e.claimId));
      const stanceBridges = reasoningBridge.filter(r => claimIds.includes(r.claimId));
      return {
        claimCount: stanceClaims.length,
        evidenceCount: stanceEvidences.length,
        bridgeCount: stanceBridges.length,
      };
    };
    
    // 生成汇总数据
    const proSummary = getSummaryByStance('pro');
    const conSummary = getSummaryByStance('con');
    const neutralSummary = getSummaryByStance('conditional');
    
    // 准备论证记录表数据
    const prepareArgumentData = () => {
      const records: any[] = [];
      
      // 从证据出发，构建每条记录
      evidences.forEach(evidence => {
        const claim = claims.find(c => c.id === evidence.claimId);
        if (claim) {
          const bridge = reasoningBridge.find(
            r => r.claimId === claim.id && r.evidenceId === evidence.id
          );
          
          records.push({
            id: `${evidence.id}-${claim.id}`,
            stance: claim.stance,
            claimId: claim.id,
            claimText: claim.text,
            evidenceId: evidence.id,
            evidenceText: evidence.text,
            bridgeText: bridge ? bridge.text : null,
            evidenceType: evidence.type
          });
        }
      });
      
      // 按立场和ID排序
      records.sort((a, b) => {
        // 先按立场排序：支持 > 条件 > 反对
        const stanceOrder = { 'pro': 0, 'conditional': 1, 'con': 2 };
        if (a.stance !== b.stance) {
          return stanceOrder[a.stance] - stanceOrder[b.stance];
        }
        
        // 再按主张ID排序
        if (a.claimId !== b.claimId) {
          return a.claimId.localeCompare(b.claimId);
        }
        
        // 最后按证据ID排序
        return a.evidenceId.localeCompare(b.evidenceId);
      });
      
      return records;
    };
    
    const argumentRecords = prepareArgumentData();
    
    // 根据立场分组数据
    const groupedRecords = {
      pro: argumentRecords.filter(r => r.stance === 'pro'),
      conditional: argumentRecords.filter(r => r.stance === 'conditional'),
      con: argumentRecords.filter(r => r.stance === 'con')
    };
    
    // 获取立场标签样式
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
    
    // 处理记录点击
    const handleRecordClick = (record: any) => {
      setSelectedRecord(record);
    };
    
    // 生成组合解释文本
    const generateCombinedExplanation = () => {
      if (!selectedRecord) return '';
      
      const stanceAction = {
        'pro': '支持',
        'con': '反对',
        'conditional': '作为条件补充'
      };
      
      const bridgeText = selectedRecord.bridgeText || '(暂无填写)';
      
      return `因为【${selectedRecord.evidenceText}】，
再加上你认为【${bridgeText}】，
所以你用它来${stanceAction[selectedRecord.stance]}【${selectedRecord.claimText}】。`;
    };
    
    return (
      <div className="w-full overflow-hidden bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          论证结构图
          <span className="ml-2 text-xs text-gray-500 font-normal">（点击记录行查看详细内容）</span>
        </h2>
        
        {/* 上层：主张汇总统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* 支持方汇总卡片 */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">支持方</h3>
            <p className="text-blue-700">
              主张：{proSummary.claimCount} 条 · 证据：{proSummary.evidenceCount} 条 · 推理桥：{proSummary.bridgeCount} 条
            </p>
          </div>
          
          {/* 条件支持汇总卡片 */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">条件支持 / 中立</h3>
            <p className="text-yellow-700">
              主张：{neutralSummary.claimCount} 条 · 证据：{neutralSummary.evidenceCount} 条 · 推理桥：{neutralSummary.bridgeCount} 条
            </p>
          </div>
          
          {/* 反对方汇总卡片 */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">反对方</h3>
            <p className="text-red-700">
              主张：{conSummary.claimCount} 条 · 证据：{conSummary.evidenceCount} 条 · 推理桥：{conSummary.bridgeCount} 条
            </p>
          </div>
        </div>
        
        {/* 下层：左右两栏 */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧：论证记录表 */}
          <div className="lg:w-2/3 overflow-x-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">立场</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">主张（关键词）</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">证据（关键词）</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">推理桥（关键词或空）</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 支持方记录 */}
                  {groupedRecords.pro.length > 0 && (
                    <>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="py-2 px-4 text-sm font-medium text-gray-700 border-b border-gray-200">
                          支持方
                        </td>
                      </tr>
                      {groupedRecords.pro.map((record) => (
                        <tr 
                          key={record.id} 
                          className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedRecord?.id === record.id ? 'bg-blue-50' : ''}`}
                          onClick={() => handleRecordClick(record)}
                        >
                          <td className="py-3 px-4 border-b border-gray-200">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStanceLabelClass(record.stance)}`}>
                              {getStanceName(record.stance)}
                            </span>
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800" title={record.claimText}>
                            {record.claimId} · {getKeywordText(record.claimText)}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800" title={record.evidenceText}>
                            {record.evidenceId} · {getKeywordText(record.evidenceText)}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm" title={record.bridgeText || ''}>
                            {record.bridgeText ? getKeywordText(record.bridgeText) : '——'}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  
                  {/* 条件支持记录 */}
                  {groupedRecords.conditional.length > 0 && (
                    <>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="py-2 px-4 text-sm font-medium text-gray-700 border-b border-gray-200">
                          条件支持 / 中立
                        </td>
                      </tr>
                      {groupedRecords.conditional.map((record) => (
                        <tr 
                          key={record.id} 
                          className={`cursor-pointer hover:bg-yellow-50 transition-colors ${selectedRecord?.id === record.id ? 'bg-yellow-50' : ''}`}
                          onClick={() => handleRecordClick(record)}
                        >
                          <td className="py-3 px-4 border-b border-gray-200">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStanceLabelClass(record.stance)}`}>
                              {getStanceName(record.stance)}
                            </span>
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800" title={record.claimText}>
                            {record.claimId} · {getKeywordText(record.claimText)}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800" title={record.evidenceText}>
                            {record.evidenceId} · {getKeywordText(record.evidenceText)}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm" title={record.bridgeText || ''}>
                            {record.bridgeText ? getKeywordText(record.bridgeText) : '——'}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  
                  {/* 反对方记录 */}
                  {groupedRecords.con.length > 0 && (
                    <>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="py-2 px-4 text-sm font-medium text-gray-700 border-b border-gray-200">
                          反对方
                        </td>
                      </tr>
                      {groupedRecords.con.map((record) => (
                        <tr 
                          key={record.id} 
                          className={`cursor-pointer hover:bg-red-50 transition-colors ${selectedRecord?.id === record.id ? 'bg-red-50' : ''}`}
                          onClick={() => handleRecordClick(record)}
                        >
                          <td className="py-3 px-4 border-b border-gray-200">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStanceLabelClass(record.stance)}`}>
                              {getStanceName(record.stance)}
                            </span>
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800" title={record.claimText}>
                            {record.claimId} · {getKeywordText(record.claimText)}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-800" title={record.evidenceText}>
                            {record.evidenceId} · {getKeywordText(record.evidenceText)}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm" title={record.bridgeText || ''}>
                            {record.bridgeText ? getKeywordText(record.bridgeText) : '——'}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  
                  {/* 空状态 */}
                  {argumentRecords.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
                        暂无论证记录，请先添加主张和证据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 右侧：分析与反馈区域 */}
          <div className="lg:w-1/3">
            <div className="space-y-6">
              {/* 论证体检报告 */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">论证体检报告</h3>
                <p className="text-gray-800">{generateDiagnosisReport()}</p>
              </div>
              
              {/* 选中记录详情卡片 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">选中记录详情</h3>
                
                {selectedRecord ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">立场</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStanceLabelClass(selectedRecord.stance)}`}>
                          {getStanceName(selectedRecord.stance)}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">主张（{selectedRecord.claimId}）</h4>
                        <p className="text-gray-800 text-sm">{selectedRecord.claimText}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">证据（{selectedRecord.evidenceId}）</h4>
                        <p className="text-gray-800 text-sm">{selectedRecord.evidenceText}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">推理桥</h4>
                        <p className="text-gray-800 text-sm">
                          {selectedRecord.bridgeText ? selectedRecord.bridgeText : '你尚未为这条证据写出推理桥'}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">组合解释</h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-line">
                          {generateCombinedExplanation()}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>请在左侧列表中点击一条记录，查看详细的论证结构。</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // generateDiagnosisReport(): 根据结构信息生成文字版论证体检报告
  const generateDiagnosisReport = () => {
    const hasClaims = claims.length > 0;
    
    // 统计各立场主张数量
    const proClaimsCount = claims.filter(claim => claim.stance === 'pro').length;
    const conClaimsCount = claims.filter(claim => claim.stance === 'con').length;
    const neutralClaimsCount = claims.filter(claim => claim.stance === 'conditional' || claim.stance === 'neutral').length;
    
    // 检查是否有观点缺乏证据
    const claimsWithNoEvidence = claims.filter(claim => !evidences.some(evidence => evidence.claimId === claim.id));
    
    // 检查是否只有单一阵营观点
    const hasOnlyOneSide = (proClaimsCount > 0 && conClaimsCount === 0 && neutralClaimsCount === 0) || 
                          (conClaimsCount > 0 && proClaimsCount === 0 && neutralClaimsCount === 0);
    
    // 检查推理桥情况
    const hasReasoningBridges = reasoningBridge.length > 0;
    const evidenceWithBridgeCount = new Set(reasoningBridge.map(bridge => bridge.evidenceId)).size;
    const evidenceTotalCount = evidences.length;
    
    // 根据不同情况生成体检报告
    if (!hasClaims) {
      return "你还没有标注任何主张。试着在所有材料中找出真正表达立场的句子，这是理解整个论证的第一步。";
    } else if (hasOnlyOneSide) {
      return "目前你标注的主张几乎都来自同一立场，另一方的论证结构尚未被完整纳入地图。可以思考：是否还有不同立场的声音没有被记录？";
    } else if (claimsWithNoEvidence.length > 0) {
      const claimIds = claimsWithNoEvidence.map(c => c.id).join('、');
      return `你已经标出了${claims.length}个主张，但其中${claimIds}目前没有任何证据支撑，更像是态度表达而不是论证。你可以回到材料中，尝试为这些观点寻找可核查的依据。`;
    } else if (hasReasoningBridges && evidenceWithBridgeCount < evidenceTotalCount) {
      const bridgePercentage = Math.round((evidenceWithBridgeCount / evidenceTotalCount) * 100);
      return `你为不少主张找到了证据，并且为${bridgePercentage}%的证据添加了推理桥。继续思考其他证据与主张之间的逻辑关系，可以让你的分析更加深入和完整。`;
    } else if (hasReasoningBridges) {
      return "你的论证地图已经包含了多立场观点、相应的证据支持以及连接它们的推理桥，结构相对完整。接下来可以思考这些论证的说服力和可能存在的漏洞。";
    } else {
      return "你已经为各个观点找到了证据，但尚未尝试写出'证据–主张'之间的推理桥。试着用一句话解释：为什么这些事实足以支撑这个结论？这将帮助你更好地理解论证的逻辑结构。";
    }
  };
  
  // 获取步骤提示文本
  const getStepInstruction = () => {
    switch(currentStep) {
      case 1:
        return "第一步：在所有发言中，找出真正表达立场的句子（主张/观点）。";
      case 2:
        return "第二步：为每个主张找出支撑它的证据句。";
      case 3:
        return "第三步（可选）：用你自己的话写一句'桥'，解释这个证据为什么能支持这个主张。";
      default:
        return "";
    }
  };
  
  // 获取句子的标注样式和标签
  const getSentenceAnnotationInfo = (sentenceId: string) => {
    const claim = claims.find(c => c.sentenceId === sentenceId);
    const evidence = evidences.find(e => e.sentenceId === sentenceId);
    
    if (claim) {
      const stanceType = STANCE_TYPES.find(t => t.id === claim.stance);
      return { 
        style: `${stanceType?.bgColor} border-l-4 ${stanceType?.id === 'pro' ? 'border-blue-500' : stanceType?.id === 'con' ? 'border-red-500' : stanceType?.id === 'conditional' ? 'border-yellow-500' : 'border-gray-500'}`, 
        label: claim.id,
        fullLabel: `${claim.id} (${stanceType?.name})`
      };
    } else if (evidence) {
      const evidenceType = EVIDENCE_TYPES.find(t => t.id === evidence.type);
      return { 
        style: `bg-green-50 border-l-4 border-green-500`, 
        label: evidence.id,
        fullLabel: `${evidence.id} (${evidenceType?.name})`
      };
    }
    
    return { style: '', label: '', fullLabel: '' };
  };
  
  // 返回视角拼图
  const handleBackToPerspectivePuzzle = () => {
    saveData();
    navigate(`/topic/${id}/perspective-puzzle`);
  };
  
  // 进入下一步：对话模拟
  const handleNextModule = () => {
    saveData();
    toast.success("已保存你的论证解剖结果");
    navigate(`/topic/${id}/dialogue-simulation`);
  };
  
  // 生成/刷新论证结构图
  const handleGenerateArgumentMap = () => {
    setShowArgumentMap(true);
    saveData();
  };
  
  // 重置论证结构图显示
  const handleResetArgumentMap = () => {
    setShowArgumentMap(false);
    saveData();
  };
  
    // 页面加载时标记当前步骤为已完成
    useEffect(() => {
      if (!isLoading && topic) {
        markStepCompleted(5); // 当前是第5步：论证解剖
        
        // 记录最近学习页面
        updateLastVisitedLearningPage({
          topicId: id,
          topicTitle: topic.title,
          stepId: 5,
          routePath: getStepRoute(id, 5),
          visitedAt: Date.now()
        });
      }
    }, [isLoading, topic, id]);
  
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
      {/* 顶部导航栏 - 复用 S0-1、S0-2、S1-1、S1-2、S1-3 和 S1-4 的样式 */}
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
              论证解剖：这段话到底在怎么论证？
            </h1>
            
            <p className="text-xl text-gray-600 italic mb-8">
              "在下面的材料中标出主张、证据和推理，再看看它的论证结构是否扎实。"
            </p>
            
            {/* 操作提示 */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 inline-block">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-blue-800 text-sm">
                  请按照步骤指引，逐步完成对文本的分析。<br />
                  所有材料会同时展示，你可以在任何一段中进行标注。
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* 主体区域布局：左文本、右报告 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 左侧：多方材料 + 标注工具 */}
              <div className="lg:w-1/2">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                  {/* 步骤提示 */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">
                      {getStepInstruction()}
                    </p>
                  </div>
                  
                  {/* 标注步骤进度条 */}
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">当前进度</span>
                      <span className="text-sm font-medium text-blue-600">第 {currentStep} / 3 步</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* 当前步骤的额外控件 */}
                  {currentStep === 2 && claims.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">选择要添加证据的主张</label>
                      <div className="flex flex-wrap gap-2">
                        {claims.map(claim => {
                          const stanceType = STANCE_TYPES.find(t => t.id === claim.stance);
                          return (
                            <button
                              key={claim.id}
                              onClick={() => {
                                setSelectedClaimForEvidence(claim.id);
                                setSelectedSentenceForEvidence(null);
                                setShowEvidenceModal(true);
                              }}
                              className={`px-3 py-1 ${stanceType?.bgColor} ${stanceType?.color} rounded-full text-sm hover:opacity-80 transition-colors`}
                            >
                              {claim.id}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* 第三步：为"主张-证据"写推理桥 */}
                  {currentStep === 3 && claims.length > 0 && evidences.length > 0 && (
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">选择主张</label>
                          <select
                            value={selectedClaimForReasoning || ''}
                            onChange={(e) => {
                              setSelectedClaimForReasoning(e.target.value);
                              setSelectedEvidenceForReasoning(null);
                              setReasoningText("");
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">-- 选择一个主张 --</option>
                            {claims.map(claim => (
                              <option key={claim.id} value={claim.id}>
                                {claim.id}: {claim.text.substring(0, 30)}...
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {selectedClaimForReasoning && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">选择对应证据</label>
                            <select
                              value={selectedEvidenceForReasoning || ''}
                              onChange={(e) => {
                                setSelectedEvidenceForReasoning(e.target.value);
                                setReasoningText("");
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">-- 选择一条证据 --</option>
                              {evidences
                                .filter(e => e.claimId === selectedClaimForReasoning)
                                .map(evidence => (
                                  <option key={evidence.id} value={evidence.id}>
                                    {evidence.id}: {evidence.text.substring(0, 30)}...
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      </div>
                      
                      {selectedClaimForReasoning && selectedEvidenceForReasoning && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            用一句完整的话说清楚：为什么你选的这条证据（E{selectedEvidenceForReasoning.substring(1)}）可以支持主张 C{selectedClaimForReasoning.substring(1)}
                          </label>
                          <textarea
                            value={reasoningText}
                            onChange={(e) => setReasoningText(e.target.value)}
                            placeholder="用你自己的话写一句桥，把证据和主张连起来..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            rows={3}
                          ></textarea>
                          <button
                            onClick={handleReasoningBridgeSubmit}
                            disabled={!reasoningText.trim()}
                            className={`mt-2 px-4 py-2 rounded-lg transition-colors ${
                              reasoningText.trim() 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            添加推理桥
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 主张列表 - 显示所有标注的主张 */}
                  {currentStep >= 2 && claims.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">已标注的主张</h3>
                      <div className="space-y-2">
                        {claims.map(claim => {
                          const stanceType = STANCE_TYPES.find(t => t.id === claim.stance);
                          const evidenceCount = evidences.filter(e => e.claimId === claim.id).length;
                          
                          return (
                            <div 
                              key={claim.id} 
                              className={`p-3 rounded-lg border ${stanceType?.bgColor} ${stanceType?.id === 'pro' ? 'border-blue-200' : stanceType?.id === 'con' ? 'border-red-200' : stanceType?.id === 'conditional' ? 'border-yellow-200' : 'border-gray-200'}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className={`font-medium ${stanceType?.color}`}>{claim.id}: {claim.text}</div>
                                  <div className="text-xs text-gray-500 mt-1">已添加 {evidenceCount} 条证据</div>
                                </div>
                                <button 
                                  onClick={() => handleClaimAnnotation(claim.sentenceId)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Eraser className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* 多方材料文本区域 - 支持垂直滚动 */}
                  <div className="space-y-6 mb-6 max-h-[500px] overflow-y-auto pr-2">
                    {viewpoints.map((viewpoint) => (
                      <div key={viewpoint.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        {/* 立场标签 */}
                        <div className={`text-sm font-medium mb-3 ${
                          viewpoint.position === 'support' ? 'text-blue-600' : 
                          viewpoint.position === 'oppose' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {viewpoint.position === 'support' ? '支持方' : 
                           viewpoint.position === 'oppose' ? '反对方' : 
                           '条件支持'}: {viewpoint.title}
                        </div>
                        
                        {/* 材料内容 */}
                        <div className="space-y-3">
                          {viewpoint.sentences.map((sentence) => {
                            const { style, fullLabel } = getSentenceAnnotationInfo(sentence.id);
                            return (
                              <div
                                key={sentence.id}
                                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 hover:scale-101 ${style} relative`}
                                onClick={() => {
                                  if (currentStep === 1) {
                                    handleClaimAnnotation(sentence.id);
                                  } else if (currentStep === 2) {
                                    handleEvidenceAnnotation(sentence.id);
                                  }
                                }}
                              >
                                {fullLabel && (
                                  <div className="absolute top-2 right-2 text-xs font-bold opacity-80">
                                    {fullLabel}
                                  </div>
                                )}
                                <p className="text-gray-800">{sentence.text}</p>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* 材料来源描述 */}
                        <div className="text-xs text-gray-500 mt-3 italic">
                          {viewpoint.description}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 步骤操作按钮 */}
                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevStep}
                      disabled={currentStep === 1}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentStep === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    >
                      上一步
                    </button>
                    
                    {currentStep < 3 ? (
                      <button
                        onClick={handleNextStep}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        下一步
                      </button>
                    ) : (
                      <button
                        onClick={handleNextModule}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        完成分析
                      </button>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={clearAllAnnotations}
                      className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Eraser className="w-4 h-4 mr-2" />
                      清空我的标注
                    </button>
                    
                    <button
                      onClick={() => setShowReference(!showReference)}
                      className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {showReference ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          隐藏参考结构
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          显示参考结构
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 右侧：分析与反馈区域 - 不放结构图 */}
              <div className="lg:w-1/2">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">分析与反馈</h2>
                  
                  {/* 顶部区域：中心问题与简单统计 */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">中心问题</h3>
                    <p className="text-blue-700 mb-4">{topic.title}</p>
                    
                    <h3 className="text-lg font-medium text-blue-800 mb-2">标注统计</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">已识别主张总数：</span>
                        <span className="font-medium">{claims.length} 个</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">支持方主张：</span>
                        <span className="font-medium">{claims.filter(c => c.stance === 'pro').length} 个</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">反对方主张：</span>
                        <span className="font-medium">{claims.filter(c => c.stance === 'con').length} 个</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">条件支持/中立主张：</span>
                        <span className="font-medium">{claims.filter(c => c.stance === 'conditional' || c.stance === 'neutral').length} 个</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">已挂接证据的主张：</span>
                        <span className="font-medium">{claims.filter(c => evidences.some(e => e.claimId === c.id)).length} 个</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">还没有证据的主张：</span>
                        <span className="font-medium">{claims.filter(c => !evidences.some(e => e.claimId === c.id)).length} 个</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 中部：分析报告/提示卡片 */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">论证体检报告</h3>
                    <p className="text-gray-800">{generateDiagnosisReport()}</p>
                  </div>
                  
                  {/* 底部：生成结构图按钮 */}
                  <div className="mt-auto">
                    {!showArgumentMap ? (
                      <button
                        onClick={handleGenerateArgumentMap}
                        disabled={claims.length === 0}
                        className={`w-full py-3 rounded-lg transition-colors ${
                          claims.length > 0 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        绘制论证结构图
                      </button>
                    ) : (
                      <button
                        onClick={handleResetArgumentMap}
                        className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        隐藏论证结构图
                      </button>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      完成标注后，点击按钮生成整合的论证结构图
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 下方新增区域：统一的论证结构图 */}
            {showArgumentMap && (
              <div className="mt-12">
                {renderArgumentMap()}
              </div>
            )}
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
                {/* 中间连接线 */}<div className="absolute top-1/2 left-1/2 h-16 bg-gray-200 transform -translate-x-1/2 -translate-y-1/2 -z-10 hidden md:block"></div>
                
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
                onClick={handleBackToPerspectivePuzzle}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                返回视角拼图
              </button>
              
              <button 
                onClick={handleNextModule}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center"
              >
                继续：进入对话模拟
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
      
      {/* 立场选择模态框 */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${showStanceModal ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">选择观点立场</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {STANCE_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => confirmStance(type.id as 'pro' | 'con' | 'conditional' | 'neutral')}
                className={`px-4 py-2 ${type.bgColor} ${type.color} rounded-lg transition-colors text-sm flex items-center justify-center`}
              >
                {type.name}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowStanceModal(false);
                setSelectedSentenceForStance(null);
              }}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
      
      {/* 证据选择模态框 */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${showEvidenceModal ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedClaimForEvidence ? `为观点 ${selectedClaimForEvidence} 添加证据` : '选择要添加证据的观点和类型'}
          </h3>
          
          {!selectedClaimForEvidence && claims.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择观点</label>
              <div className="flex flex-wrap gap-2">
                {claims.map(claim => {
                  const stanceType = STANCE_TYPES.find(t => t.id === claim.stance);
                  return (
                    <button
                      key={claim.id}
                      onClick={() => setSelectedClaimForEvidence(claim.id)}
                      className={`px-3 py-1 ${stanceType?.bgColor} ${stanceType?.color} rounded-full text-sm hover:opacity-80 transition-colors`}
                    >
                      {claim.id}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {selectedClaimForEvidence && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">选择证据类型</label>
              <div className="grid grid-cols-2 gap-2">
                {EVIDENCE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => confirmEvidence(type.id, selectedClaimForEvidence)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-sm"
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowEvidenceModal(false);
                setSelectedSentenceForEvidence(null);
                setSelectedClaimForEvidence(null);
              }}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArgumentAnalysis;