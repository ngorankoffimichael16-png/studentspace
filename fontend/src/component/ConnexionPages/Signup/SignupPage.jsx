import LeftBrandPanel from './LeftBrandPanel'
import RightFormPanel from '../RigthFormPanel/RightFormPanel'

function SignupPage() {
  return (
    <div className="flex flex-col lg:flex-row">
      <LeftBrandPanel />
      <div className="w-full lg:w-1/2">
        <RightFormPanel />
      </div>
    </div>
  )
}
export default SignupPage