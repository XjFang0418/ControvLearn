import { useState, useEffect } from "react";
import { 
  BookOpen, 
  User, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight,
  Trash2,
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

// 定义角色类型
interface Role {
  id: string;
  name: string;
  concern: string;
  description: string;
  isPlaced?: boolean;
}

// 定义立场位置类型
type PositionType = 'left' | 'left-center' | 'center' | 'right-center' | 'right' | null;

// 定义立场槽位类型
interface PositionSlot {
  id: PositionType;
  label: string;
  roles: Role[];
}

// 定义角色标签类型
interface RoleTag {
  id: string;
  name: string;
  category: 'concern' | 'source';
}

// 定义角色详情类型
interface RoleDetail {
  role: Role | null;
  tags: {
    concern: string[];
    source: string[];
  };
}

// 定义视角映射类型
interface PerspectiveMap {
  [roleId: string]: {
    position: PositionType;
    tags: {
      concern: string[];
      source: string[];
    };
  };
}

const PerspectivePuzzle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 模拟议题数据（从 S0-1 获取并扩展）
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 角色列表状态
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  
  // 立场槽位状态
  const [positionSlots, setPositionSlots] = useState<PositionSlot[]>([
    { id: 'left', label: '更担忧风险', roles: [] },
    { id: 'left-center', label: '偏担忧', roles: [] },
    { id: 'center', label: '复杂 / 说不清', roles: [] },
    { id: 'right-center', label: '偏乐观', roles: [] },
    { id: 'right', label: '更相信可控', roles: [] }
  ]);
  
  // 选中的角色状态
  const [selectedRole, setSelectedRole] = useState<RoleDetail>({
    role: null,
    tags: {
      concern: [],
      source: []
    }
  });
  
  // 视角映射状态 - 用于记录每个角色的立场位置与关切标签
  const [perspectiveMap, setPerspectiveMap] = useState<PerspectiveMap>({});
  
  // 预设的角色标签
  const roleTags: RoleTag[] = [
    { id: 'economic', name: '主要关心经济影响', category: 'concern' },
    { id: 'environment', name: '主要关心环境安全', category: 'concern' },
    { id: 'health', name: '主要关心健康风险', category: 'concern' },
    { id: 'technology', name: '主要关注技术可行性', category: 'concern' },
    { id: 'official', name: '更信任官方说法', category: 'source' },
    { id: 'scientific', name: '更信任科学研究', category: 'source' },
    { id: 'experience', name: '更信任民间经验', category: 'source' },
    { id: 'media', name: '主要通过媒体了解', category: 'source' }
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
      isCurrent: true
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
  
  // 获取议题相关的角色列表
  const getTopicRoles = (topicId: string): Role[] => {
    switch(topicId) {
      case "1": // 核污染水排海
        return [
          { id: "role1", name: "当地渔民", concern: "担心海产品销量与家人健康", description: "居住在福岛附近海域的传统渔民，世代以捕鱼为生，担心核污染水排海会影响渔业资源和销售" },
          { id: "role2", name: "福岛附近餐馆老板", concern: "担心顾客流失和生计问题", description: "经营海鲜餐厅的老板，依赖新鲜海产品和良好的声誉吸引顾客，担心排海计划影响生意" },
          { id: "role3", name: "核电站运营公司代表", concern: "强调处理水安全性和技术可行性", description: "东京电力公司的技术专家，负责福岛核电站的善后工作，强调经过处理的核污染水符合国际安全标准" },
          { id: "role4", name: "日本政府官员", concern: "平衡安全、经济和国际影响", description: "负责环境政策的政府官员，需要在科学依据、经济成本和国际形象之间寻找平衡" },
          { id: "role5", name: "国际原子能机构科学家", concern: "基于科学数据评估风险", description: "IAEA的核专家，通过独立评估分析排海计划的科学合理性和潜在环境影响" },
          { id: "role6", name: "环保组织成员", concern: "担忧长期环境影响和风险", description: "国际环保组织的活动人士，关注核污染水排海可能带来的长期生态风险和潜在的健康影响" },
          { id: "role7", name: "普通城市消费者", concern: "担心食品安全和健康风险", description: "居住在东京等城市的普通市民，关心日常消费的海产品安全性和潜在健康风险" }
        ];
        
      case "2": // 人工智能是否会取代人类工作
        return [
          { id: "role1", name: "软件工程师", concern: "担心职业被AI工具替代", description: "从事软件开发工作的专业人士，关注AI编程工具对自身职业的影响" },
          { id: "role2", name: "企业CEO", concern: "关注生产效率和成本节约", description: "科技公司的领导者，看到AI技术提升效率和降低成本的潜力" },
          { id: "role3", name: "经济学家", concern: "分析长期就业结构变化", description: "研究技术变革对经济影响的学者，关注AI对就业市场的长期结构性影响" },
          { id: "role4", name: "教育工作者", concern: "思考未来教育方向调整", description: "大学教授，思考如何调整教育体系以适应AI时代的技能需求变化" },
          { id: "role5", name: "工厂工人", concern: "面临自动化替代风险", description: "制造业一线工人，直接感受到自动化和AI技术对传统工作的威胁" },
          { id: "role6", name: "AI伦理研究员", concern: "关注社会公平和就业权益", description: "研究AI伦理问题的专家，关注技术变革中的社会公平和就业权益保障" },
          { id: "role7", name: "自由职业者", concern: "探索与AI协作的新可能", description: "从事创意工作的自由职业者，尝试将AI作为工具提升自身工作效率和创造力" }
        ];
        
      default:
        // 通用角色列表
        return [
          { id: "role1", name: "行业专家", concern: "基于专业知识评估利弊", description: "在该领域有深入研究和实践经验的专业人士，能够从专业角度分析议题的利弊" },
          { id: "role2", name: "政策制定者", concern: "平衡多方利益和社会影响", description: "负责制定相关政策的政府官员，需要考虑政策的社会影响和多方利益平衡" },
          { id: "role3", name: "普通民众", concern: "关注日常生活的实际影响", description: "受议题直接或间接影响的普通市民，关心议题对自己日常生活的实际影响" },
          { id: "role4", name: "相关企业代表", concern: "关注商业利益和发展机遇", description: "与议题相关的企业代表，关注议题可能带来的商业机会和挑战" },
          { id: "role5", name: "环保人士", concern: "关注环境可持续性", description: "环保组织成员或关注环境问题的公民，关心议题对环境的影响" },
          { id: "role6", name: "学者", concern: "关注长期影响和深层问题", description: "研究相关领域的学者，关注议题的长期影响和深层社会、经济或科学问题" },
          { id: "role7", name: "媒体工作者", concern: "传播信息和公众讨论", description: "报道相关议题的记者或编辑，负责向公众传播信息并促进讨论" }
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
        
        // 初始化角色列表
        const roles = getTopicRoles(id);
        setAvailableRoles(roles);
        
        // 尝试从localStorage中加载已保存的视角映射
        // 这些数据将在学习报告和 S1-8 立场回顾中使用
        const savedPerspectiveMap = localStorage.getItem(`topic_${id}_perspective_map`);
        if (savedPerspectiveMap) {
          const parsed: PerspectiveMap = JSON.parse(savedPerspectiveMap);
          setPerspectiveMap(parsed);
          
          // 根据保存的映射恢复角色位置
          restoreRolesFromPerspectiveMap(parsed, roles);
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
  
    // 页面加载时标记当前步骤为已完成
   useEffect(() => {
     if (!isLoading && topic) {
       markStepCompleted(4); // 当前是第4步：视角拼图
       
       // 记录最近学习页面
       updateLastVisitedLearningPage({
         topicId: id,
         topicTitle: topic.title,
         stepId: 4,
         routePath: getStepRoute(id, 4),
         visitedAt: Date.now()
       });
     }
   }, [isLoading, topic, id]);
   
   // 从视角映射恢复角色位置
  const restoreRolesFromPerspectiveMap = (map: PerspectiveMap, allRoles: Role[]) => {
    // 重置所有槽位
    const updatedSlots = positionSlots.map(slot => ({ ...slot, roles: [] }));
    
    // 找出已放置的角色ID
    const placedRoleIds = Object.keys(map).filter(roleId => map[roleId].position !== null);
    
    // 过滤出未放置的角色
    const unplacedRoles = allRoles.filter(role => !placedRoleIds.includes(role.id));
    
    // 将已放置的角色放入对应的槽位
    placedRoleIds.forEach(roleId => {
      const position = map[roleId].position;
      const role = allRoles.find(r => r.id === roleId);
      
      if (position && role) {
        const slotIndex = updatedSlots.findIndex(slot => slot.id === position);
        if (slotIndex !== -1) {
          updatedSlots[slotIndex].roles.push(role);
        }
      }
    });
    
    // 更新状态
    setPositionSlots(updatedSlots);
    setAvailableRoles(unplacedRoles);
  };
  
  // 处理角色拖拽开始
  const handleDragStart = (e: React.DragEvent, role: Role) => {
    e.dataTransfer.setData('roleId', role.id);
    // 为了视觉效果，设置一个半透明的拖拽图像
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.7';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, dragImage.offsetWidth / 2, dragImage.offsetHeight / 2);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };
  
  // 处理拖入事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // 处理放置事件
  const handleDrop = (e: React.DragEvent, positionId: PositionType) => {
    e.preventDefault();
    const roleId = e.dataTransfer.getData('roleId');
    
    // 从可用角色列表中查找角色
    const roleToPlace = availableRoles.find(role => role.id === roleId);
    
    if (roleToPlace) {
      // 更新槽位状态
      setPositionSlots(prevSlots => {
        return prevSlots.map(slot => {
          if (slot.id === positionId) {
            // 检查角色是否已存在于该槽位
            if (!slot.roles.some(r => r.id === roleId)) {
              return { ...slot, roles: [...slot.roles, roleToPlace] };
            }
          }
          return slot;
        });
      });
      
      // 从可用角色列表中移除
      setAvailableRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
      
      // 更新视角映射
      updatePerspectiveMap(roleId, positionId);
      
      // 显示提示
      toast.info(`${roleToPlace.name} 已放置到 ${positionSlots.find(s => s.id === positionId)?.label}`);
    }
  };
  
  // 处理从槽位中移除角色
  const handleRemoveFromSlot = (roleId: string, positionId: PositionType) => {
    // 找到要移除的角色
    const slotIndex = positionSlots.findIndex(slot => slot.id === positionId);
    if (slotIndex !== -1) {
      const roleToRemove = positionSlots[slotIndex].roles.find(role => role.id === roleId);
      
      if (roleToRemove) {
        // 更新槽位状态
        setPositionSlots(prevSlots => {
          const updatedSlots = [...prevSlots];
          updatedSlots[slotIndex] = {
            ...updatedSlots[slotIndex],
            roles: updatedSlots[slotIndex].roles.filter(role => role.id !== roleId)
          };
          return updatedSlots;
        });
        
        // 将角色添加回可用列表
        setAvailableRoles(prevRoles => [...prevRoles, roleToRemove]);
        
        // 更新视角映射
        updatePerspectiveMap(roleId, null);
        
        // 如果移除的是当前选中的角色，清除选中状态
        if (selectedRole.role?.id === roleId) {
          setSelectedRole({
            role: null,
            tags: { concern: [], source: [] }
          });
        }
        
        // 显示提示
        toast.info(`${roleToRemove.name} 已移回待放置区域`);
      }
    }
  };
  
  // 更新视角映射
  const updatePerspectiveMap = (roleId: string, position: PositionType) => {
    const updatedMap = { ...perspectiveMap };
    
    // 如果该角色已存在于映射中，更新位置
    if (updatedMap[roleId]) {
      updatedMap[roleId].position = position;
    } else {
      // 否则创建新条目
      updatedMap[roleId] = {
        position,
        tags: { concern: [], source: [] }
      };
    }
    
    // 更新状态
    setPerspectiveMap(updatedMap);
    
    // 保存到localStorage
    localStorage.setItem(`topic_${id}_perspective_map`, JSON.stringify(updatedMap));
  };
  
  // 处理角色点击
  const handleRoleClick = (role: Role) => {
    // 查找角色在视角映射中的标签信息
    const roleInMap = perspectiveMap[role.id];
    
    setSelectedRole({
      role,
      tags: roleInMap ? roleInMap.tags : { concern: [], source: [] }
    });
  };
  
  // 处理标签切换
  const handleTagToggle = (tagId: string, category: 'concern' | 'source') => {
    if (!selectedRole.role) return;
    
    const updatedMap = { ...perspectiveMap };
    const roleId = selectedRole.role.id;
    
    // 确保角色在映射中
    if (!updatedMap[roleId]) {
      updatedMap[roleId] = {
        position: null,
        tags: { concern: [], source: [] }
      };
    }
    
    // 找到标签名称
    const tag = roleTags.find(t => t.id === tagId);
    if (!tag) return;
    
    // 更新标签
    const tagIndex = updatedMap[roleId].tags[category].indexOf(tag.name);
    
    if (tagIndex === -1) {
      // 添加标签
      updatedMap[roleId].tags[category].push(tag.name);
    } else {
      // 移除标签
      updatedMap[roleId].tags[category].splice(tagIndex, 1);
    }
    
    // 更新状态
    setPerspectiveMap(updatedMap);
    setSelectedRole({
      ...selectedRole,
      tags: updatedMap[roleId].tags
    });
    
    // 保存到localStorage
    localStorage.setItem(`topic_${id}_perspective_map`, JSON.stringify(updatedMap));
  };
  
  // 重置视角拼图
  const handleResetPuzzle = () => {
    if (window.confirm('确定要重置所有角色位置吗？这将清除当前的所有放置和标签设置。')) {
      // 重置所有角色到初始状态
      const roles = getTopicRoles(id);
      setAvailableRoles(roles);
      setPositionSlots(prevSlots => prevSlots.map(slot => ({ ...slot, roles: [] })));
      setSelectedRole({ role: null, tags: { concern: [], source: [] } });
      
      // 清除视角映射
      const emptyMap: PerspectiveMap = {};
      setPerspectiveMap(emptyMap);
      localStorage.setItem(`topic_${id}_perspective_map`, JSON.stringify(emptyMap));
      
      // 显示提示
      toast.info('视角拼图已重置');
    }
  };
  
  // 返回初始直觉记录
  const handleBackToInitialIntuition = () => {
    // 保存当前状态
    localStorage.setItem(`topic_${id}_perspective_map`, JSON.stringify(perspectiveMap));
    navigate(`/topic/${id}/initial-intuition`);
  };
  
  // 进入下一步：论证解剖
  const handleNextStep = () => {
    // 保存当前状态
    localStorage.setItem(`topic_${id}_perspective_map`, JSON.stringify(perspectiveMap));
    
    // 显示提示
    toast.success("已保存你的视角拼图");
    
     // 跳转到论证解剖页面（S1-5）
    navigate(`/topic/${id}/argument-analysis`);
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
      {/* 顶部导航栏 - 复用 S0-1、S0-2、S1-1、S1-2 和 S1-3 的样式 */}
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
              视角拼图：谁在这场争议中发声？
            </h1>
            
            <p className="text-xl text-gray-600 italic mb-8">
              "拖拽不同角色到你认为合适的位置，看看在这场争议中，谁更担忧、谁更乐观。"
            </p>
            
            {/* 操作提示 */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 inline-block">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-blue-800 text-sm">
                  拖动角色卡片到光谱上，表示你理解中他们的立场倾向。<br />
                  这不是对错题，只是帮你整理脑中的"角色地图"。
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* 三栏布局核心交互区 */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 左栏：角色卡片列表 */}
              <div className="lg:w-1/4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    待放置角色
                  </h2>
                  
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {availableRoles.length > 0 ? (
                      availableRoles.map((role) => (
                         <div
                           key={role.id}
                           className="bg-white border border-gray-200 rounded-lg p-4 cursor-grab hover:bg-blue-50 hover:border-blue-200 transition-colors"
                           draggable
                           onDragStart={(e) => handleDragStart(e, role)}
                           onClick={() => handleRoleClick(role)}
                         >
                          <h3 className="font-semibold text-gray-800 mb-1">{role.name}</h3>
                          <p className="text-sm text-gray-600">{role.concern}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>所有角色已放置到光谱上</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 中栏：立场光谱区 */}
              <div className="lg:w-2/4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-800">立场光谱</h2>
                    <button 
                      onClick={handleResetPuzzle}
                      className="text-sm text-red-500 hover:text-red-700 flex items-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      重置视角拼图
                    </button>
                  </div>
                  
                  {/* 立场光谱 */}
                  <div className="relative">
                    {/* 光谱背景 */}
                    <div className="h-12 bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 rounded-full mb-6 overflow-hidden">
                      {/* 光谱分段线 */}
                      <div className="h-full border-r border-white border-opacity-50" style={{ width: '20%' }}></div>
                      <div className="h-full border-r border-white border-opacity-50 absolute top-0 left-[40%]"></div>
                      <div className="h-full border-r border-white border-opacity-50 absolute top-0 left-[60%]"></div>
                      <div className="h-full border-r border-white border-opacity-50 absolute top-0 left-[80%]"></div>
                    </div>
                    
                    {/* 光谱标签 */}
                    <div className="flex justify-between mb-8">
                      <span className="text-sm font-medium text-red-600">更担忧风险</span>
                      <span className="text-sm font-medium text-yellow-600">偏担忧</span>
                      <span className="text-sm font-medium text-orange-600">复杂 / 说不清</span>
                      <span className="text-sm font-medium text-green-600">偏乐观</span>
                      <span className="text-sm font-medium text-blue-600">更相信可控</span>
                    </div>
                    
                    {/* 落点槽位 */}
                    <div className="grid grid-cols-5 gap-4">
                      {positionSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors relative"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, slot.id)}
                        >
                          {/* 角色卡片 */}
                          <div className="space-y-2">
                            {slot.roles.map((role) => (
                               <div
                                 key={role.id}
                                 className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                 onClick={() => handleRoleClick(role)}
                               >
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium text-gray-800 text-sm">{role.name}</h4>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFromSlot(role.id, slot.id);
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{role.concern}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 提示文本 */}
                    <div className="mt-8 text-center text-gray-500 text-sm italic">
                      "这里只是你当前对各角色可能立场的判断，没有标准答案。"
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 右栏：角色详情与标签区 */}
              <div className="lg:w-1/4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">角色详情</h2>
                  
                  {selectedRole.role ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedRole.role.name}</h3>
                      <p className="text-gray-600 mb-4 text-sm">{selectedRole.role.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2 text-sm">主要关注点</h4>
                        <div className="space-y-2">
                          {roleTags
                            .filter(tag => tag.category === 'concern')
                            .map((tag) => (
                              <div key={tag.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={tag.id}
                                  checked={selectedRole.tags.concern.includes(tag.name)}
                                  onChange={() => handleTagToggle(tag.id, 'concern')}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={tag.id} className="ml-2 text-sm text-gray-700">
                                  {tag.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2 text-sm">信息来源倾向</h4>
                        <div className="space-y-2">
                          {roleTags
                            .filter(tag => tag.category === 'source')
                            .map((tag) => (
                              <div key={tag.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={tag.id}
                                  checked={selectedRole.tags.source.includes(tag.name)}
                                  onChange={() => handleTagToggle(tag.id, 'source')}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={tag.id} className="ml-2 text-sm text-gray-700">
                                  {tag.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>请点击左侧或光谱中的角色卡片查看详情</p>
                    </div>
                  )}
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
                onClick={handleBackToInitialIntuition}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                返回初始直觉
              </button>
              
              <button 
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center"
              >
                继续：进入论证解剖
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PerspectivePuzzle;