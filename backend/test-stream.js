/**
 * 手动测试脚本 - 测试 SSE 流式输出
 * 运行: node test-stream.js
 */

import dotenv from 'dotenv';
import { OpenRouterClient } from './openrouter.js';
import { generatePrompt } from './prompts/generator.js';

dotenv.config();

async function testStreaming() {
  console.log('🧪 开始测试流式输出...\n');

  // 检查 API 密钥
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ 错误: 未找到 OPENROUTER_API_KEY');
    console.log('请在 .env 文件中设置 OPENROUTER_API_KEY');
    process.exit(1);
  }

  try {
    // 1. 测试提示词生成
    console.log('1️⃣ 测试提示词生成...');
    const userContext = '给我的科技创业公司起个简洁有力的英文名字';
    const prompt = generatePrompt(userContext);
    console.log('✅ 提示词生成成功');
    console.log(`   用户输入: ${userContext}`);
    console.log(`   提示词长度: ${prompt.length} 字符\n`);

    // 2. 测试 OpenRouter API 连接
    console.log('2️⃣ 测试 OpenRouter API 连接...');
    const client = new OpenRouterClient(process.env.OPENROUTER_API_KEY);
    console.log('✅ 客户端创建成功\n');

    // 3. 测试流式输出
    console.log('3️⃣ 测试流式输出（实时显示）...');
    console.log('─'.repeat(60));
    
    let fullResponse = '';
    let chunkCount = 0;

    for await (const chunk of client.generateNames(prompt)) {
      process.stdout.write(chunk);
      fullResponse += chunk;
      chunkCount++;
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`\n✅ 流式输出测试成功!`);
    console.log(`   接收到 ${chunkCount} 个数据块`);
    console.log(`   总响应长度: ${fullResponse.length} 字符\n`);

    // 4. 尝试解析 JSON
    console.log('4️⃣ 测试 JSON 解析...');
    try {
      // 提取 JSON（去除 markdown 代码块标记）
      const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1];
        const result = JSON.parse(jsonStr);
        
        console.log('✅ JSON 解析成功');
        console.log(`   分析: ${result.analysis.substring(0, 50)}...`);
        console.log(`   策略: ${result.strategy.substring(0, 50)}...`);
        console.log(`   名字数量: ${result.names.length}`);
        console.log(`   推荐名字: ${result.preferred.preferred_name}\n`);
      } else {
        console.log('⚠️  警告: 未找到 JSON 格式的响应');
      }
    } catch (error) {
      console.log('❌ JSON 解析失败:', error.message);
    }

    console.log('🎉 所有测试通过！\n');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
testStreaming();

