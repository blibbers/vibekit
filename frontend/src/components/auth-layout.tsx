import { Outlet } from 'react-router'

export function AuthLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50">
            <div className="w-full max-w-md px-4">
                <Outlet />
            </div>
        </div>
    )
}