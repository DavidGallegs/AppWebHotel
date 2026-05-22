import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from './esquemaSesiones';
import { signIn } from 'auth-astro/client'; 
import { useState } from 'react'; 
import '../../styles/sesiones.css';

/* * COMPONENTE: LoginForm
 * Propósito: Gestiona la entrada del usuario en dos fases (Credenciales + Código 2FA por email).
 */
export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Estados para controlar el Doble Factor de Autenticación (2FA)
  const [paso, setPaso] = useState<1 | 2>(1);
  const [codigoOTP, setCodigoOTP] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmitPaso1 = async (data: LoginFormValues) => {
    setServerError(null); 
    setCargando(true);

    try {
      // Fase 1: Tocamos a Laravel por el puerto externo para que valide email/pass y mande el código
      const response = await fetch("http://localhost:8000/api/pre-login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      if (response.ok) {
        setPaso(2); // Avanzamos a la pantalla del código OTP
      } else {
        setServerError("Correo o contraseña incorrectos");
      }
    } catch (error) {
      setServerError("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const onSubmitPaso2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setCargando(true);

    const data = getValues(); 

    // Fase 2: Pasamos la pelota a Astro Auth. Esto viaja al servidor de Astro y luego a la red interna de Docker.
    const options = {
      email: data.email,
      password: data.password,
      otp: codigoOTP, 
      redirect: false,
    };

    const result = await signIn('credentials', options as any);

    if (result && !result.ok) {
      setServerError("Código de seguridad incorrecto o caducado.");
      setCargando(false);
    } else if (result?.ok) {
      window.location.href = '/reserva'; 
    }
  };

  return (
    <div className="login-wrapper">
      {/* ACCESIBILIDAD: aria-live anuncia al lector de pantalla si cambiamos del paso 1 al paso 2 */}
      <div className="login-card" aria-live="polite">
        <h2>{paso === 1 ? 'Iniciar Sesión' : 'Verificación en 2 Pasos'}</h2>
        
        {serverError && (
          <div role="alert" className="error-banner" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', background: '#fee2e2', padding: '0.5rem', borderRadius: '8px' }}>
            {serverError}
          </div>
        )}

        {paso === 1 && (
          <form onSubmit={handleSubmit(onSubmitPaso1)} className="login-form" noValidate>
            <div className="input-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input type="email" id="email" placeholder="tu@email.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register('email')} />
              {errors.email && <span id="email-error" className="error-text" role="alert">{errors.email.message}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" placeholder="**" aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} {...register('password')} />
              {errors.password && <span id="password-error" className="error-text" role="alert">{errors.password.message}</span>}
            </div>

            <button type="submit" className="login-btn" disabled={cargando} aria-busy={cargando}>
              {cargando ? 'Verificando...' : 'Siguiente'}
            </button>
          </form>
        )}

        {paso === 2 && (
          <form onSubmit={onSubmitPaso2} className="login-form">
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#4b5563' }}>
              Te hemos enviado un código de 6 dígitos a tu correo. Por favor, introdúcelo abajo.
            </p>
            
            <div className="input-group">
              <label htmlFor="otp">Código de Seguridad</label>
              <input 
                type="text" 
                id="otp" 
                maxLength={6}
                placeholder="_ _ _ _ _ _" 
                value={codigoOTP}
                onChange={(e) => setCodigoOTP(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem', fontWeight: 'bold' }}
                required 
              />
            </div>

            <button type="submit" className="login-btn" disabled={cargando || codigoOTP.length < 6} aria-busy={cargando}>
              {cargando ? 'Iniciando sesión...' : 'Entrar al Panel'}
            </button>

            <button type="button" onClick={() => setPaso(1)} aria-label="Volver al paso anterior" style={{ background: 'none', border: 'none', color: '#3b82f6', marginTop: '1rem', cursor: 'pointer', width: '100%' }}>
              Volver atrás
            </button>
          </form>
        )}

        {paso === 1 && (
          <>
            <p className="footer-text">¿No tienes cuenta? <a href="/join">Regístrate aquí</a></p>
            <p className="footer-text">¿Has olvidado tu contraseña? <a href="/forgetPassword">Cambiar</a></p>
          </>
        )}
      </div>
    </div>
  );
}