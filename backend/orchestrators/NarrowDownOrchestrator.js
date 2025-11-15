/**
 * Narrow Down 流程编排器
 * 负责协调5步流程的执行和数据传递
 */
import { Prompt } from '../models/Prompt.js';
import { Settings } from '../models/Settings.js';
import { AuditLog } from '../models/AuditLog.js';
import { replacePromptVariables, parallelAPICall } from '../utils/promptUtils.js';
import { OpenRouterClient } from '../openrouter.js';

export class NarrowDownOrchestrator {
  constructor(db, openrouterClient, userInput, model) {
    this.db = db;
    this.client = openrouterClient;
    this.userInput = userInput;
    this.model = model;
    
    // 流程数据
    this.names = [];
    this.contextAnalysis = null;
    this.nameCandidates = [];
    this.evaluations = [];
    this.rankingList = [];
    this.stories = [];
  }

  /**
   * 调用 AI API（流式转非流式）
   * @param {string} prompt - 提示词内容
   * @param {string} model - 使用的模型（可选，默认使用构造函数的model）
   * @returns {Promise<{response: string, usage: object}>}
   */
  async callAPI(prompt, model = null) {
    // 如果指定了模型且与当前client不同，临时创建新客户端
    let client = this.client;
    
    if (model && model !== this.model) {
      // 只在有API key时创建新客户端（避免测试环境报错）
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (apiKey) {
        client = new OpenRouterClient(apiKey, model);
      }
    }
    
    let fullResponse = '';
    let usage = null;
    
    for await (const chunk of client.generateNames(prompt)) {
      if (chunk.content) {
        fullResponse += chunk.content;
      }
      if (chunk.usage) {
        usage = chunk.usage;
      }
    }
    
    return { response: fullResponse, usage };
  }

  /**
   * 从 AI 响应中提取 JSON（增强容错）
   */
  extractJSON(response) {
    try {
      // 1. 尝试提取 markdown 代码块
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return this.parseJSON(jsonMatch[1]);
      }
      
      // 2. 尝试直接解析
      return this.parseJSON(response);
    } catch (error) {
      console.error('❌ JSON 解析失败:', error.message);
      console.error('📄 原始响应:', response.substring(0, 500) + '...');
      throw new Error(`JSON 解析失败: ${error.message}`);
    }
  }

  /**
   * 解析 JSON（增强容错）
   */
  parseJSON(text) {
    try {
      // 直接解析
      return JSON.parse(text);
    } catch (e) {
      console.warn('⚠️ 标准 JSON 解析失败，尝试修复...');
      
      // 修复常见问题
      let fixed = text
        .replace(/,\s*}/g, '}')          // 移除对象末尾的逗号
        .replace(/,\s*\]/g, ']')          // 移除数组末尾的逗号
        .replace(/'/g, '"')                // 单引号转双引号
        .replace(/(\w+):/g, '"$1":')       // 属性名加引号
        .replace(/\n/g, ' ')               // 移除换行
        .replace(/\r/g, '')                // 移除回车
        .trim();
      
      try {
        return JSON.parse(fixed);
      } catch (e2) {
        // 最后尝试：提取第一个完整的 JSON 对象
        const objMatch = fixed.match(/\{[\s\S]*\}/);
        if (objMatch) {
          return JSON.parse(objMatch[0]);
        }
        throw e; // 抛出原始错误
      }
    }
  }

  /**
   * 步骤1: 提取名字列表
   */
  async step1_listNames(onProgress) {
    onProgress?.({ step: 'tracking', message: 'Tracking names...' });
    
    const startTime = Date.now();
    
    // 获取 list_names 提示词（按名称查找）
    const promptTemplate = this.db.prepare(
      'SELECT * FROM prompts WHERE tag = ? AND name LIKE ? ORDER BY id DESC LIMIT 1'
    ).get('selection', '%list_names%');
    
    if (!promptTemplate) {
      throw new Error('未找到 list_names 提示词');
    }
    
    // 替换变量
    const prompt = replacePromptVariables(promptTemplate.content, {
      user_input: this.userInput,
    });
    
    // 使用提示词的 default_model（优先级最高）
    const promptModel = promptTemplate.default_model || this.model;
    console.log('🎯 list_names 使用模型:', promptModel);
    
    // 调用 API
    const { response, usage } = await this.callAPI(prompt, promptModel);
    
    // 解析名字列表（\n分隔的纯文本）
    this.names = response.split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    // 记录审计日志
    AuditLog.create(this.db, {
      model: promptModel,
      promptId: promptTemplate.id,
      userInput: this.userInput,
      systemPrompt: prompt,
      rawOutput: response,
      tokensPrompt: usage?.prompt_tokens || null,
      tokensCompletion: usage?.completion_tokens || null,
      tokensTotal: usage?.total_tokens || null,
      costUsd: null, // OpenRouter 不直接返回费用，需要根据模型计算
      durationMs: Date.now() - startTime,
      success: true,
      workflowType: 'narrow_down',
      stepName: 'list_names',
      namesCount: this.names.length,
    });
    
    // 检查数量限制
    const maxNames = parseInt(Settings.get(this.db, 'max_names') || '5');
    if (this.names.length > maxNames) {
      throw new Error(`名字数量超过限制。最多 ${maxNames} 个，实际 ${this.names.length} 个`);
    }
    
    return { names: this.names, count: this.names.length };
  }

  /**
   * 步骤2: 分析上下文和区隔名字
   */
  async step2_isolate(onProgress) {
    onProgress?.({ step: 'analyzing', message: 'Context analyzing...' });
    
    const startTime = Date.now();
    
    // 获取 isolate 提示词（按名称查找）
    const isolatePrompt = this.db.prepare(
      'SELECT * FROM prompts WHERE tag = ? AND name LIKE ? ORDER BY id DESC LIMIT 1'
    ).get('selection', '%isolate%');
    
    if (!isolatePrompt) {
      throw new Error('未找到 isolate 提示词');
    }
    
    const prompt = replacePromptVariables(isolatePrompt.content, {
      user_input: this.userInput,
    });
    
    const promptModel = isolatePrompt.default_model || this.model;
    console.log('🎯 isolate 使用模型:', promptModel);
    
    const { response, usage } = await this.callAPI(prompt, promptModel);
    const result = this.extractJSON(response);
    
    this.contextAnalysis = result.context_analysis;
    this.nameCandidates = result.name_candidates;
    
    // 记录审计日志
    AuditLog.create(this.db, {
      model: promptModel,
      promptId: isolatePrompt.id,
      userInput: this.userInput,
      systemPrompt: prompt,
      rawOutput: response,
      tokensPrompt: usage?.prompt_tokens || null,
      tokensCompletion: usage?.completion_tokens || null,
      tokensTotal: usage?.total_tokens || null,
      costUsd: null,
      durationMs: Date.now() - startTime,
      success: true,
      workflowType: 'narrow_down',
      stepName: 'isolate',
      namesCount: this.nameCandidates.length,
    });
    
    return {
      contextAnalysis: this.contextAnalysis,
      nameCandidates: this.nameCandidates,
    };
  }

  /**
   * 步骤3: 并发获取每个名字的详细信息
   */
  async step3_information(onProgress) {
    onProgress?.({ step: 'researching', message: 'Doing research...' });
    
    // 获取 information 提示词（按名称查找）
    const infoPrompt = this.db.prepare(
      'SELECT * FROM prompts WHERE tag = ? AND name LIKE ? ORDER BY id DESC LIMIT 1'
    ).get('selection', '%information%');
    
    if (!infoPrompt) {
      throw new Error('未找到 information 提示词');
    }
    
    const promptModel = infoPrompt.default_model || this.model;
    console.log('🎯 information 使用模型:', promptModel);
    
    // 准备并发任务
    const tasks = this.nameCandidates.map((candidate) => {
      return async () => {
        const startTime = Date.now();
        
        // 通知前端当前处理的名字
        onProgress?.({
          step: 'researching',
          numbering: candidate.numbering,
          name: candidate.name,
          dimension: 'perceptual_fluency',
        });
        
        const prompt = replacePromptVariables(infoPrompt.content, {
          user_input: this.userInput,
          context_analysis: JSON.stringify(this.contextAnalysis, null, 2),
          isolated_names: JSON.stringify({
            numbering: candidate.numbering,
            name: candidate.name,
            certainty: candidate.certainty,
            attachment: candidate.attachment,
          }, null, 2),
        });
        
        const { response, usage } = await this.callAPI(prompt, promptModel);
        const result = this.extractJSON(response);
        
        // 记录审计日志
        AuditLog.create(this.db, {
          model: promptModel,
          promptId: infoPrompt.id,
          userInput: `Name: ${candidate.name}`,
          systemPrompt: prompt,
          rawOutput: response,
          tokensPrompt: usage?.prompt_tokens || null,
          tokensCompletion: usage?.completion_tokens || null,
          tokensTotal: usage?.total_tokens || null,
          costUsd: null,
          durationMs: Date.now() - startTime,
          success: true,
          workflowType: 'narrow_down',
          stepName: 'information',
          namesCount: 1,
        });
        
        return result.name_candidates[0]; // 返回该名字的evaluation
      };
    });
    
    // 并发执行（最多5个）
    const concurrentLimit = parseInt(Settings.get(this.db, 'concurrent_limit') || '5');
    this.evaluations = await parallelAPICall(tasks, concurrentLimit);
    
    return { evaluations: this.evaluations };
  }

  /**
   * 步骤4: 决策和排名
   */
  async step4_decide(onProgress) {
    onProgress?.({ step: 'deciding', message: 'Deciding...' });
    
    const startTime = Date.now();
    
    // 获取 decide 提示词（按名称查找）
    const decidePrompt = this.db.prepare(
      'SELECT * FROM prompts WHERE tag = ? AND name LIKE ? ORDER BY id DESC LIMIT 1'
    ).get('selection', '%decide%');
    
    if (!decidePrompt) {
      throw new Error('未找到 decide 提示词');
    }
    
    // 汇总所有名字信息
    const allNameInformation = this.nameCandidates.map((candidate, index) => ({
      numbering: candidate.numbering,
      name: candidate.name,
      certainty: candidate.certainty,
      attachment: candidate.attachment,
      evaluation: this.evaluations[index].evaluation,
    }));
    
    const prompt = replacePromptVariables(decidePrompt.content, {
      user_input: this.userInput,
      context_analysis: JSON.stringify(this.contextAnalysis, null, 2),
      name_information: JSON.stringify(allNameInformation, null, 2),
    });
    
    const promptModel = decidePrompt.default_model || this.model;
    console.log('🎯 decide 使用模型:', promptModel);
    
    const { response, usage } = await this.callAPI(prompt, promptModel);
    const result = this.extractJSON(response);
    
    this.rankingList = result.ranking_list;
    this.strongOpinion = result.strong_opinion;
    
    // 记录审计日志
    AuditLog.create(this.db, {
      model: promptModel,
      promptId: decidePrompt.id,
      userInput: this.userInput,
      systemPrompt: prompt,
      rawOutput: response,
      tokensPrompt: usage?.prompt_tokens || null,
      tokensCompletion: usage?.completion_tokens || null,
      tokensTotal: usage?.total_tokens || null,
      costUsd: null,
      durationMs: Date.now() - startTime,
      success: true,
      workflowType: 'narrow_down',
      stepName: 'decide',
      namesCount: this.rankingList.length,
    });
    
    return {
      rankingList: this.rankingList,
      strongOpinion: this.strongOpinion,
    };
  }

  /**
   * 步骤5: 并发生成每个名字的故事
   */
  async step5_story(onProgress) {
    onProgress?.({ step: 'crafting', message: 'Crafting stories...' });
    
    // 获取 story 提示词（按名称查找）
    const storyPrompt = this.db.prepare(
      'SELECT * FROM prompts WHERE tag = ? AND name LIKE ? ORDER BY id DESC LIMIT 1'
    ).get('selection', '%story%');
    
    if (!storyPrompt) {
      throw new Error('未找到 story 提示词');
    }
    
    const promptModel = storyPrompt.default_model || this.model;
    console.log('🎯 story 使用模型:', promptModel);
    
    // 准备并发任务
    const tasks = this.nameCandidates.map((candidate, index) => {
      return async () => {
        const startTime = Date.now();
        
        // 找到该名字的排名信息
        const rankingInfo = this.rankingList.find(r => r.numbering === candidate.numbering);
        
        onProgress?.({
          step: 'crafting',
          numbering: candidate.numbering,
          name: candidate.name,
        });
        
        const prompt = replacePromptVariables(storyPrompt.content, {
          name_information: JSON.stringify({
            numbering: candidate.numbering,
            name: candidate.name,
            evaluation: this.evaluations[index].evaluation,
          }, null, 2),
          ranking_and_reason: JSON.stringify({
            ranking: rankingInfo.ranking,
            reason_of_ranking: rankingInfo.reason_of_ranking,
          }, null, 2),
          context_analysis: JSON.stringify(this.contextAnalysis, null, 2),
        });
        
        const { response, usage } = await this.callAPI(prompt, promptModel);
        const result = this.extractJSON(response);
        
        // 记录审计日志
        AuditLog.create(this.db, {
          model: promptModel,
          promptId: storyPrompt.id,
          userInput: `Name: ${candidate.name}`,
          systemPrompt: prompt,
          rawOutput: response,
          tokensPrompt: usage?.prompt_tokens || null,
          tokensCompletion: usage?.completion_tokens || null,
          tokensTotal: usage?.total_tokens || null,
          costUsd: null,
          durationMs: Date.now() - startTime,
          success: true,
          workflowType: 'narrow_down',
          stepName: 'story',
          namesCount: 1,
        });
        
        return result;
      };
    });
    
    // 并发执行
    const concurrentLimit = parseInt(Settings.get(this.db, 'concurrent_limit') || '5');
    this.stories = await parallelAPICall(tasks, concurrentLimit);
    
    return { stories: this.stories };
  }

  /**
   * 执行完整流程
   */
  async execute(onProgress) {
    try {
      // 步骤1: 提取名字
      const step1Result = await this.step1_listNames(onProgress);
      
      // 步骤2: 分析上下文
      const step2Result = await this.step2_isolate(onProgress);
      
      // 步骤3: 获取名字信息（并发）
      const step3Result = await this.step3_information(onProgress);
      
      // 步骤4: 排名决策
      const step4Result = await this.step4_decide(onProgress);
      
      // 步骤5: 生成故事（并发）
      const step5Result = await this.step5_story(onProgress);
      
      // 返回完整结果
      return {
        names: this.names,
        contextAnalysis: this.contextAnalysis,
        nameCandidates: this.nameCandidates,
        evaluations: this.evaluations,
        rankingList: this.rankingList,
        strongOpinion: this.strongOpinion,
        stories: this.stories,
      };
    } catch (error) {
      console.error('❌ Narrow Down 流程执行失败:', error);
      throw error;
    }
  }
}

