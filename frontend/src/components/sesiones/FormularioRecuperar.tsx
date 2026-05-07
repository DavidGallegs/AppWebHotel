// src/components/auth/FormularioRecuperar.tsx
import { useState } from 'react';

export function FormularioRecuperar() {
    const [email, setEmail] = useState('');
    const [enviado, setEnviado] = useState(false);
    const [cargando, setCargando] = useState(false);

    const manejarEnvio = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);

        try {
            const res = await fetch("http://localhost:8000/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setEnviado(true);
            } else {
                alert("Hubo un error. Verifica que el email sea correcto.");
            }
        } catch (error) {
            alert("Error de conexión con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    if (enviado) {
        return (
            <div className='auth-msg-true'>
                ¡Enlace enviado! Revisa tu bandeja de entrada o la carpeta de spam.
            </div>
        );
    }

    return (
        <form onSubmit={manejarEnvio} className="auth-form">
            <div className="auth-input-group">
                <label className="auth-label">Correo Electrónico</label>
                <input 
                    type="email" 
                    className="auth-input"
                    placeholder="tu@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <button type="submit" className="auth-button" disabled={cargando}>
                {cargando ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>
            <a href="/login" className="auth-back-link">Volver al inicio de sesión</a>
        </form>
    );
}