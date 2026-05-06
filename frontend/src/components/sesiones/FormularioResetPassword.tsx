// src/components/auth/FormularioResetFinal.tsx
import { useState } from 'react';

interface Props {
    token: string;
    email: string;
}

export function FormularioResetFinal({ token, email }: Props) {
    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmar) {
            alert("Las contraseñas no coinciden");
            return;
        }

        setCargando(true);

        try {
            const res = await fetch("http://localhost:8000/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    token,
                    email,
                    password,
                    password_confirmation: confirmar
                })
            });

            if (res.ok) {
                alert("¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.");
                window.location.href = "/login";
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Error al restablecer. El enlace podría haber caducado.");
            }
        } catch (error) {
            alert("Error de conexión.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form onSubmit={manejarReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Nueva Contraseña</label>
                <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Confirmar Contraseña</label>
                <input 
                    type="password" 
                    required 
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="Repite la contraseña"
                    style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc' }}
                />
            </div>

            <button 
                type="submit" 
                disabled={cargando}
                style={{ 
                    background: '#2563eb', 
                    color: 'white', 
                    padding: '1rem', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: cargando ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    marginTop: '0.5rem'
                }}
            >
                {cargando ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
        </form>
    );
}