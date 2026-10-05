import LeftBrandPanel from '../Signup/LeftBrandPanel'
import LoginBox from './LoginBox/LoginBox'

function LoginPage() {
  return (
    <div className="flex flex-col lg:flex-row">
      <LeftBrandPanel />
      <div className="flex justify-center items-start bg-white p-8 lg:h-screen w-full lg:w-1/2 overflow-y-auto">
        <LoginBox />
      </div>
    </div>
  )
}
export default LoginPage