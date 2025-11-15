/**
 * 迁移 API 服务
 * 处理匿名历史迁移到 Supabase 账户
 */

// 使用相对路径，开发环境通过 Vite proxy，生产环境通过 Nginx
const API_BASE = '/api';

/**
 * 迁移匿名历史到 Supabase 账户
 */
export async function migrateAnonymousHistory(
  anonymousUserId: string,
  supabaseUserId: string
): Promise<{ migrated: number; synced: number; message: string }> {
  console.log('🔄 [MigrationAPI] 开始迁移...');
  console.log('👻 [MigrationAPI] 匿名 ID:', anonymousUserId);
  console.log('👤 [MigrationAPI] Supabase ID:', supabaseUserId);
  
  const response = await fetch(`${API_BASE}/user/migrate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      anonymousUserId,
      supabaseUserId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ [MigrationAPI] 迁移失败:', error);
    throw new Error(error.error || 'Migration failed');
  }

  const result = await response.json();
  console.log('✅ [MigrationAPI] 迁移成功:', result);
  
  return result;
}

