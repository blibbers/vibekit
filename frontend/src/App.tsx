import { BrowserRouter, HashRouter } from 'react-router'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import Router from './Router'

const AppRouter = import.meta.env.VITE_USE_HASH_ROUTE === 'true' ? HashRouter : BrowserRouter

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppRouter>
                    <Router />
                </AppRouter>
            </AuthProvider>
        </ThemeProvider>
    )
}
