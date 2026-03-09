import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from "react"
import axiosInstance from "../../Services/Api/AxiosInstance"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDetail, setIsDetail] = useState(null)

  const hasShownExpiredAlert = useRef(false)
  const checkAuthInProgress = useRef(false) 
  const authCheckTimeout = useRef(null)

  const checkAuth = useCallback(async (isInitialCheck = false) => {
    // Давхар дуудалтаас сэргийлэх
    if (checkAuthInProgress.current) {
      return
    }

    checkAuthInProgress.current = true

    try {
      const response = await axiosInstance.get('/me/user')
      
      if (response && response.data) {
        setUser(response.data.data)
        setIsAuthenticated(true)
        setIsDetail(response?.data?.data?.detail)
        hasShownExpiredAlert.current = false
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      // Initial check эсвэл login хуудсан дээр байвал чимээгүй алдаа шийдвэрлэх
      if (isInitialCheck || window.location.pathname === '/login') {
        setUser(null)
        setIsAuthenticated(false)
        if (isInitialCheck) setLoading(false)
        checkAuthInProgress.current = false
        return
      }

      // 401 алдаа бол session дууссан гэсэн үг
      if (error.response?.status === 401) {
        handleSessionExpired(error.response?.data?.message)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } finally {
      if (isInitialCheck) {
        setLoading(false)
      }
      checkAuthInProgress.current = false
    }
  }, [])

  const handleSessionExpired = useCallback((errorMessage = '') => {
    setUser(null)
    setIsAuthenticated(false)
    
    if (window.location.pathname !== '/login' && !hasShownExpiredAlert.current) {
      hasShownExpiredAlert.current = true
      
      if (errorMessage && errorMessage.includes('хугацаа дууссан')) {
        console.warn('Session expired')
        alert('Таны нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.')
      }
      
      window.location.href = '/login'
    }
  }, [])

  // Component mount үед auth шалгах
  useEffect(() => {
    checkAuth(true)
  }, [checkAuth])

  // Нэвтэрсэн бол 5 минут тутамд auth шалгах
  useEffect(() => {
    if (isAuthenticated) {
      if (authCheckTimeout.current) {
        clearInterval(authCheckTimeout.current)
      }

      authCheckTimeout.current = setInterval(() => {
        checkAuth(false)
      }, 5 * 60 * 1000) // 5 минут

      return () => {
        if (authCheckTimeout.current) {
          clearInterval(authCheckTimeout.current)
        }
      }
    }
  }, [isAuthenticated, checkAuth])

  const login = useCallback(async (username, password) => {
    try {
      const response = await axiosInstance.post('/user/login', {
        kode: username,
        password
      })

      if (response?.data?.success) {
        hasShownExpiredAlert.current = false
        
        await checkAuth(false)
        
        return { success: true, message: response.data.message }
      }
      
      return { 
        success: false, 
        message: response?.data?.message || 'Нэвтрэхэд алдаа гарлаа' 
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа'
      }
    }
  }, [checkAuth])

  const logout = useCallback(async () => {
    try {
      const response = await axiosInstance.post('/logout/student')

      if(response && response.status === 200) {
        console.log('Logout successful')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // State-ийг цэвэрлэх
      setUser(null)
      setIsAuthenticated(false)
      hasShownExpiredAlert.current = false
      
      // Interval-ийг зогсоох
      if (authCheckTimeout.current) {
        clearInterval(authCheckTimeout.current)
      }
      
      // Login хуудас руу шилжих
      window.location.href = '/login'
    }
  }, [])

  // Context value - зөвхөн шаардлагатай зүйлсийг дамжуулах
  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      checkAuth,
      isDetail,
      setIsDetail
    }),
    [user, isAuthenticated, loading, login, logout, checkAuth, isDetail]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/* ============================================
   OPTIMIZATION NOTES
   ============================================
   
1. ✅ useCallback & useMemo
   - Шаардлагагүй re-render багасгах
   
2. ✅ checkAuthInProgress ref
   - Давхар API request илгээхгүй
   
3. ✅ Cleanup functions
   - Memory leak-ээс сэргийлэх
   
4. ✅ Error handling
   - 401 алдааг зөв шийдвэрлэх
   - Initial load дээр алдааг чимээгүй зохицуулах
   
5. ✅ Login flow
   - Login амжилттай болсны дараа checkAuth() дуудаж
     user мэдээллийг татаж авах
   
6. ✅ Session management
   - 5 минут тутамд session шалгах
   - Session дууссан үед зөв redirect хийх
*/