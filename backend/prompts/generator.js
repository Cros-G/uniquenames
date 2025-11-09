import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 生成完整的提示词，注入用户的 context
 * @param {string} userContext - 用户输入的起名需求
 * @returns {string} 完整的提示词
 */
export function generatePrompt(userContext) {
  if (!userContext || userContext.trim() === '') {
    throw new Error('User context is required');
  }

  // 读取提示词模板
  const templatePath = path.join(__dirname, '..', '..', 'prompt_generation.xml');
  const template = fs.readFileSync(templatePath, 'utf-8');

  // 替换占位符
  const prompt = template.replace('{{#1761448296889.requirement#}}', userContext.trim());

  return prompt;
}

