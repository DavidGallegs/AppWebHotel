import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from './esquemaSesiones';
import { signIn } from 'auth-astro/client'; 
import { useState } from 'react'; 
import '../../styles/sesiones.css';

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  
  // NUEVOS ESTADOS PARA EL 2FA
  const [paso, setPaso] = useState<1 | 2>(1);
  const [codigoOTP, setCodigoOTP] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    getValues, // Para leer los valores sin enviar el formulario completo
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmitPaso1 = async (data: LoginFormValues) => {
    setServerError(null); 
    setCargando(true);

    try {
      // PASO 1: Comprobamos credenciales y pedimos a Laravel que envíe el correo
      // OJO: Como esto se ejecuta en el navegador (cliente), usamos el puerto 8000 expuesto, no el de docker interno
      const response = await fetch("http://localhost:8000/api/pre-login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      if (response.ok) {
        setPaso(2); // Credenciales ok, correo enviado. Pasamos a pedir el código.
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

    const data = getValues(); // Recuperamos email y pass del paso 1

    // PASO 2: Ahora sí, llamamos a Astro Auth con todo el paquete completo
    const options = {
      email: data.email,
      password: data.password,
      otp: codigoOTP, // Añadimos el código que nos pide Laravel
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
      <div className="login-card">
        <h2>{paso === 1 ? 'Iniciar Sesión' : 'Verificación en 2 Pasos'}</h2>
        
        {serverError && (
          <div className="error-banner" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', background: '#fee2e2', padding: '0.5rem', borderRadius: '8px' }}>
            {serverError}
          </div>
        )}

        {/* --- PASO 1: EMAIL Y CONTRASEÑA --- */}
        {paso === 1 && (
          <form onSubmit={handleSubmit(onSubmitPaso1)} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input type="email" id="email" placeholder="tu@email.com" {...register('email')} />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" placeholder="**" {...register('password')} />
              {errors.password && <span className="error-text">{errors.password.message}</span>}
            </div>

            <button type="submit" className="login-btn" disabled={cargando}>
              {cargando ? 'Verificando...' : 'Siguiente'}
            </button>
          </form>
        )}

        {/* --- PASO 2: CÓDIGO OTP --- */}
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

            <button type="submit" className="login-btn" disabled={cargando || codigoOTP.length < 6}>
              {cargando ? 'Iniciando sesión...' : 'Entrar al Panel'}
            </button>

            <button type="button" onClick={() => setPaso(1)} style={{ background: 'none', border: 'none', color: '#3b82f6', marginTop: '1rem', cursor: 'pointer', width: '100%' }}>
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