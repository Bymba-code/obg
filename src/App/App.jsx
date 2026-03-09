import AppRouter from './Router/AppRouter'
import { ThemeProvider } from './Providers/ThemeProvider'
import { AuthProvider } from './Providers/AuthProvider'
import { ToastProvider } from './Providers/ToastProvider'
import { NotificationProvider } from './Providers/NotificationProvider'

const App = () => {
  return (
    <NotificationProvider>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
            <AppRouter/>
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </NotificationProvider>
  )
}

export default App
