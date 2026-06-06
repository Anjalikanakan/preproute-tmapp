import { useState } from 'react';
import '../assets/scss/login.scss';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { login as loginApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '../assets/images/logo.svg';
import loginbg from '../assets/images/TEST TUBE MAN.svg';

const schema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await loginApi(data.userId, data.password);
      console.log('Login API response:', res.data); 
      const payload = res.data?.data ?? res.data;
      const token = payload?.token;
      const user = payload?.user ?? { id: 'user' };

      if (token) {
        login(token, user);
        toast.success('Login successful!');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Login failed: no token received.');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <img src={loginbg} alt="Logo" className='img-fluid' />
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className='login-logo'>
            <img src={Logo} alt="Logo" />
          </div>
          <div className="login-header">
            <h2>Login</h2>
            <p>Use your company provided Login credentials</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                id="userId"
                type="text"
                placeholder="Enter User ID"
                className={`form-input ${errors.userId ? 'error' : ''}`}
                {...register('userId')}
              />
              {errors.userId && <span className="error-msg">{errors.userId.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  {...register('password')}
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="error-msg">{errors.password.message}</span>}
            </div>
            <div className="form-group">
                <a href="#" className='forgot-password'>Forgot Password</a>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner" /> : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
