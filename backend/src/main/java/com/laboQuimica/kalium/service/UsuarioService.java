package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.entity.Usuario;
import com.laboQuimica.kalium.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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
}
