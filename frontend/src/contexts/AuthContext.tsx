import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { resetUsage } from '../utils/usageLimit';
import { getAnonymousId, clearAnonymousId } from '../utils/userAuth';
import { migrateAnonymousHistory } from '../services/migrationAPI';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider - 管理 Supabase 认证状态
 * 遵循 good_habits.md: 职责单一，错误处理完善
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      console.log('🔐 [AuthContext] 初始 session:', session ? '已登录' : '未登录');
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 [AuthContext] Auth 状态变化:', event);
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // 登录成功时的处理
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ [AuthContext] 用户登录成功:', session.user.email);
        
        // 重置使用限制
        resetUsage();
        
        // 迁移匿名历史
        const anonymousId = getAnonymousId();
        if (anonymousId) {
          console.log('🔄 [AuthContext] 检测到匿名历史，开始迁移...');
          
          try {
            const result = await migrateAnonymousHistory(anonymousId, session.user.id);
            console.log('✅ [AuthContext] 历史迁移成功:', result);
            
            // 清除匿名 ID
            clearAnonymousId();
          } catch (error) {
            console.error('⚠️ [AuthContext] 历史迁移失败（不影响登录）:', error);
            // 迁移失败不应该影响登录流程
          }
        } else {
          console.log('ℹ️ [AuthContext] 无匿名历史需要迁移');
        }
      }

      // 登出时的处理
      if (event === 'SIGNED_OUT') {
        console.log('👋 [AuthContext] 用户已登出');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Google 登录
   */
  const signInWithGoogle = async () => {
    console.log('🔍 [AuthContext] Google 登录开始...');
    
    // 开发环境：localhost:5173
    // 生产环境：实际域名（window.location.origin 自动适配）
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log('🔗 [AuthContext] Redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',  // 强制显示隐私条款和权限确认
        },
      },
    });

    if (error) {
      console.error('❌ [AuthContext] Google 登录失败:', error);
      throw error;
    }
  };

  /**
   * Email + Password 登录
   */
  const signInWithEmail = async (email: string, password: string) => {
    console.log('✉️ [AuthContext] Email 登录开始:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ [AuthContext] Email 登录失败:', error);
      throw error;
    }
    
    console.log('✅ [AuthContext] Email 登录成功');
  };

  /**
   * Email + Password 注册
   */
  const signUpWithEmail = async (email: string, password: string) => {
    console.log('📝 [AuthContext] Email 注册开始:', email);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ [AuthContext] Email 注册失败:', error);
      throw error;
    }
    
    console.log('✅ [AuthContext] Email 注册成功，请检查邮箱验证');
  };

  /**
   * Magic Link 登录
   */
  const signInWithMagicLink = async (email: string) => {
    console.log('🔗 [AuthContext] Magic Link 发送中:', email);
    
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log('🔗 [AuthContext] Redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('❌ [AuthContext] Magic Link 发送失败:', error);
      throw error;
    }
    
    console.log('✅ [AuthContext] Magic Link 已发送，请检查邮箱');
  };

  /**
   * 登出
   */
  const signOut = async () => {
    console.log('👋 [AuthContext] 登出开始...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // 如果是 session 缺失错误，不抛出异常（正常情况）
        if (error.message?.includes('Auth session missing')) {
          console.warn('⚠️ [AuthContext] Session 已过期或不存在，清除本地状态');
        } else {
          console.error('❌ [AuthContext] 登出失败:', error);
          throw error;
        }
      }
      
      console.log('✅ [AuthContext] 登出成功');
    } catch (error) {
      // 任何错误都尝试清除本地状态
      console.error('❌ [AuthContext] 登出异常:', error);
      // 不抛出异常，确保用户能登出
    }
    
    // 无论如何，清除本地状态
    setUser(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook: 使用 Auth Context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

