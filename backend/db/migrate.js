/**
 * 数据迁移脚本
 * 将现有的 prompt_generation.xml 导入数据库
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase, closeDatabase } from './init.js';
import { Prompt } from '../models/Prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 开始数据迁移...\n');

try {
  const db = getDatabase();

  // 1. 导入 prompt_generation.xml
  console.log('1️⃣ 导入 prompt_generation.xml...');
  const generationXmlPath = path.join(__dirname, '..', '..', 'prompt_generation.xml');
  
  if (!fs.existsSync(generationXmlPath)) {
    throw new Error('找不到 prompt_generation.xml 文件');
  }

  const generationContent = fs.readFileSync(generationXmlPath, 'utf-8');
  
  // 检查是否已存在
  const existing = Prompt.getActive(db, 'generation');
  if (existing) {
    console.log('⚠️  generation 标签下已有激活提示词，跳过');
  } else {
    const id = Prompt.create(db, {
      name: 'Name Generation Prompt',
      version: '1.0',
      tag: 'generation',
      content: generationContent,
      defaultModel: 'anthropic/claude-3.5-sonnet',
      isActive: true,
    });
    console.log('✅ 已导入 generation 提示词，ID:', id);
  }

  // 2. 导入 prompt_selection.xml（如果有内容）
  console.log('\n2️⃣ 检查 prompt_selection.xml...');
  const selectionXmlPath = path.join(__dirname, '..', '..', 'prompt_selection.xml');
  
  if (fs.existsSync(selectionXmlPath)) {
    const selectionContent = fs.readFileSync(selectionXmlPath, 'utf-8');
    
    if (selectionContent.trim().length > 0) {
      const existingSelection = Prompt.getActive(db, 'selection');
      if (existingSelection) {
        console.log('⚠️  selection 标签下已有激活提示词，跳过');
      } else {
        const id = Prompt.create(db, {
          name: 'Name Selection Prompt',
          version: '1.0',
          tag: 'selection',
          content: selectionContent,
          defaultModel: 'anthropic/claude-3.5-sonnet',
          isActive: true,
        });
        console.log('✅ 已导入 selection 提示词，ID:', id);
      }
    } else {
      console.log('⚠️  prompt_selection.xml 文件为空，跳过');
    }
  } else {
    console.log('⚠️  找不到 prompt_selection.xml 文件，跳过');
  }

  // 3. 显示迁移结果
  console.log('\n3️⃣ 迁移结果汇总:');
  const allPrompts = Prompt.findAll(db);
  console.log('📋 数据库中的提示词:');
  allPrompts.forEach(p => {
    console.log(`   - [${p.tag}] ${p.name} v${p.version} ${p.is_active ? '✅ 激活' : ''}`);
  });

  closeDatabase(db);

  console.log('\n🎉 数据迁移完成！');

} catch (error) {
  console.error('\n❌ 迁移失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}


