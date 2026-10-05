import { useState } from 'react'
import LoginHeader from './LoginHeader'
import LoginFields from './LoginFields'
import LoginSubmitButton from './LoginSubmitButton'
import LoginFooter from './LoginFooter'

function LoginBox() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!formData.email) newErrors.email = true
    if (!formData.password) newErrors.password = true

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      console.log('Connexion valide, envoyée :', formData)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md my-[50px]">
      <LoginHeader />

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <LoginFields formData={formData} onChange={handleChange} errors={errors} />
        <LoginSubmitButton />
      </form>

      <LoginFooter />
    </div>
  )
}

export default LoginBox