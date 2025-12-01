import { Outlet } from "react-router-dom"
import { useAuth } from "@/layouts/Root"
import { useSelector } from "react-redux"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const Layout = () => {
  const { logout } = useAuth()
  const { user } = useSelector(state => state.user)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with logout */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckSquare" className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">FlowTrack</h1>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {user.firstName || user.emailAddress}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
                className="text-slate-600 hover:text-slate-800"
              >
                <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
    </div>
  )
}
export default Layout