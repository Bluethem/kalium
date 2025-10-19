package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.entity.Rol;
import com.laboQuimica.kalium.entity.Solicitud;
import com.laboQuimica.kalium.entity.Usuario;
import com.laboQuimica.kalium.repository.RolRepository;
import com.laboQuimica.kalium.repository.SolicitudRepository;
import com.laboQuimica.kalium.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SolicitudService {

    @Autowired
    private SolicitudRepository solicitudRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    public Solicitud crear(Solicitud solicitud) {
        return solicitudRepository.save(solicitud);
    }

    public List<Solicitud> listar() {
        return solicitudRepository.findAll();
    }

    public void rechazar(Integer idSolicitud) {
        solicitudRepository.deleteById(idSolicitud);
    }

    public Usuario aceptar(Integer idSolicitud) {
        Solicitud s = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + idSolicitud));

        Rol rol = rolRepository.findById(s.getIdRol())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + s.getIdRol()));

        Usuario nuevo = new Usuario();
        nuevo.setNombre(s.getNombre());
        nuevo.setApellido(s.getApellido());
        nuevo.setCorreo(s.getCorreo());
        nuevo.setContrasena(s.getContrasena());
        nuevo.setRol(rol);

        Usuario guardado = usuarioRepository.save(nuevo);
        solicitudRepository.deleteById(idSolicitud);
        return guardado;
    }
}
