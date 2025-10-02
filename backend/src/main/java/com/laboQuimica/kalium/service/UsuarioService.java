package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.entity.Usuario;
import com.laboQuimica.kalium.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }
    
    public Optional<Usuario> obtenerPorId(Integer id) {
        return usuarioRepository.findById(id);
    }
    
    public Optional<Usuario> obtenerPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }
    
    public Usuario guardar(Usuario usuario) {
        // Validación y asignación de ID
        if (usuario.getIdUsuario() == null) {
            // Si no viene ID desde el cliente y la BD no genera uno, lo creamos aquí
            usuario.setIdUsuario(generarIdUnico());
        } else if (usuarioRepository.existsById(usuario.getIdUsuario())) {
            // Si viene un ID y ya existe, rechazamos para evitar colisión
            throw new RuntimeException("IDUsuario ya existe: " + usuario.getIdUsuario());
        }
        return usuarioRepository.save(usuario);
    }
    
    public Usuario actualizar(Integer id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id)
            .map(usuario -> {
                usuario.setNombre(usuarioActualizado.getNombre());
                usuario.setApellido(usuarioActualizado.getApellido());
                usuario.setCorreo(usuarioActualizado.getCorreo());
                if (usuarioActualizado.getContrasena() != null && !usuarioActualizado.getContrasena().isEmpty()) {
                    usuario.setContrasena(usuarioActualizado.getContrasena());
                }
                return usuarioRepository.save(usuario);
            })
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }
    
    public void eliminar(Integer id) {
        usuarioRepository.deleteById(id);
    }
    
    public boolean existePorCorreo(String correo) {
        return usuarioRepository.existsByCorreo(correo);
    }

    public boolean existePorId(Integer id) {
        return usuarioRepository.existsById(id);
    }

    /**
     * Autentica a un usuario validando correo y contraseña.
     * Retorna Optional<Usuario> con el usuario cuando las credenciales son válidas.
     */
    public Optional<Usuario> autenticar(String correo, String contrasena) {
        if (correo == null || contrasena == null) {
            return Optional.empty();
        }
        return usuarioRepository.findByCorreo(correo)
                .filter(u -> contrasena.equals(u.getContrasena()));
    }

    /**
     * Genera un ID entero aleatorio único para IDUsuario, verificando colisiones.
     */
    private Integer generarIdUnico() {
        // Rango: 1 a 9,999,999 (inclusive). Seguimos generando hasta obtener uno que no exista.
        int candidato;
        do {
            candidato = ThreadLocalRandom.current().nextInt(1, 10_000_000);
        } while (usuarioRepository.existsById(candidato));
        return candidato;
    }
}
