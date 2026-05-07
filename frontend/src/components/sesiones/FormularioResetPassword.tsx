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
                headers: { 
                    "Content-Type": "application/json", 
                    "Accept": "application/json" 
                },
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
            alert("Error de conexión con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form onSubmit={manejarReset} className="form-reset">
            <div className="form-group">
                <label htmlFor="password">Nueva Contraseña</label>
                <input 
                    id="password"
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                />
            </div>

            <div className="form-group">
                <label htmlFor="confirmar">Confirmar Contraseña</label>
                <input 
                    id="confirmar"
                    type="password" 
                    required 
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="Repite la contraseña"
                />
            </div>

            <button type="submit" disabled={cargando}className="btn-submit">
                {cargando ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
        </form>
    );
}