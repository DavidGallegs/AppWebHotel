import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from './esquemaSesiones';
import { signIn } from 'auth-astro/client'; // 1. Importamos la magia de Auth-Astro
import { useState } from 'react'; // Para mostrar errores del servidor
import '../../styles/sesiones.css';

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null); 

    // 1. Solucionamos el Error 2353 empaquetando las opciones y usando 'as any'
    // para decirle a TypeScript que ignore su regla estricta aquí.
    const options = {
      email: data.email,
      password: data.password,
      redirect: false,
    };

    const result = await signIn('credentials', options as any);

    // 2. Solucionamos el Error 2339 evaluando el objeto Response nativo.
    // Si la respuesta existe pero NO está 'ok' (ej. Error 401 Unauthorized), mostramos el mensaje.
    if (result && !result.ok) {
      setServerError("Correo o contraseña incorrectos");
    } 
    // Si la respuesta es 'ok' (Status 200), le dejamos pasar.
    else if (result?.ok) {
      window.location.href = '/reserva'; 
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        
        {/* 3. Cartelito de error si Laravel rechaza el login */}
        {serverError && (
          <div className="error-banner" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="tu@email.com"
              {...register('email')}
            />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="**"
              {...register('password')}
            />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button type="submit" className="login-btn">Entrar</button>
        </form>
        <p className="footer-text">¿No tienes cuenta? <a href="/join">Regístrate aquí</a></p>
        <p className="footer-text">¿Has olvidado tu contraseña? <a href="/forgetPassword">Cambiar</a></p>
      </div>
    </div>
  );
}