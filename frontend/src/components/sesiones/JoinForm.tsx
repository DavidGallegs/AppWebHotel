import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { joinSchema, type JoinFormValues } from './esquemaSesiones';
import '../../styles/sesiones.css';

export default function JoinForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
  });

  const onSubmit = async (data: JoinFormValues) => {
    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // Importante para Laravel
        },
        body: JSON.stringify({
          name: data.nombre,
          apellido1: data.apellido1,
          email: data.email,
          password: data.password,
          password_confirmation: data.confirmPassword // Convención de Laravel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error desde Laravel:', errorData);
        alert('Hubo un error al registrar el usuario.');
        return;
      }

      console.log('¡Usuario registrado con éxito!');
      window.location.href = '/login'; // Redirigimos para que inicie sesión

    } catch (error) {
      console.error('Error de red al intentar conectar con el backend:', error);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Crear Cuenta</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="input-group">
            <label htmlFor="nombre" className="auth-label">Nombre</label>
            <input id="nombre" className="auth-input" placeholder="Juan" {...register('nombre')} />
            {errors.nombre && <span className="error-text">{errors.nombre.message}</span>}

            <label htmlFor="apellido1" className="auth-label">Primer Apellido</label>
            <input id="apellido1" className="auth-input" placeholder="Pérez" {...register("apellido1")}/>
            {errors.apellido1 && <span className="error-text">{errors.apellido1.message}</span>}
        </div>
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" placeholder="tu@email.com" {...register('email')} />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" placeholder="********" {...register('password')} />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Repetir Contraseña</label>
            <input type="password" id="confirmPassword" placeholder="********" {...register('confirmPassword')} />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="login-btn">Registrarse</button>
        </form>
        <p className="footer-text">¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
      </div>
    </div>
  );
}