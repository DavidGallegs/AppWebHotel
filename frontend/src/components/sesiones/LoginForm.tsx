import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from './esquemaSesiones';
import '../../styles/sesiones.css';

export default function LoginForm() {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
    });

  const onSubmit = (data: LoginFormValues) => {
    // Si llegas aquí, Zod ya garantizó que los datos son perfectos
    console.log('Datos listos para enviar al backend:', data);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="tu@email.com"
              {...register('email')}
            />
            {/* Mensaje de error dinámico */}
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              {...register('password')}
            />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button type="submit" className="login-btn">Entrar</button>
        </form>
        
        <p className="footer-text">¿No tienes cuenta? <a href="/join">Regístrate aquí</a></p>
      </div>
    </div>
  );
}