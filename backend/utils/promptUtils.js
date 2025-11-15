/**
 * 提示词工具函数
 */

/**
 * 替换提示词模板中的变量
 * @param {string} template - 提示词模板
 * @param {object} variables - 变量对象 {key: value}
 * @returns {string} 替换后的提示词
 */
export function replacePromptVariables(template, variables) {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    
    // 如果值是对象或数组，转为格式化的JSON
    const replacement = typeof value === 'object' && value !== null
      ? JSON.stringify(value, null, 2)
      : String(value);
    
    // 全局替换
    result = result.split(placeholder).join(replacement);
  }
  
  return result;
}

/**
 * 并发执行API调用任务
 * @param {Array<Function>} tasks - 异步任务数组
 * @param {number} concurrentLimit - 并发数限制
 * @returns {Promise<Array>} 所有任务的结果
 */
export async function parallelAPICall(tasks, concurrentLimit = 5) {
  const results = new Array(tasks.length);
  const executing = [];
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    
    const promise = Promise.resolve()
      .then(() => task())
      .then(result => {
        results[i] = result;
        // 从执行队列中移除
        const index = executing.indexOf(promise);
        if (index > -1) {
          executing.splice(index, 1);
        }
        return result;
      });
    
    executing.push(promise);
    
    // 当达到并发限制时，等待一个完成
    if (executing.length >= concurrentLimit) {
      await Promise.race(executing);
    }
  }
  
  // 等待所有任务完成
  await Promise.all(executing);
  
  return results;
}


