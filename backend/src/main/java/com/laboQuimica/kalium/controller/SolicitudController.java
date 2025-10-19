package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.entity.Solicitud;
import com.laboQuimica.kalium.entity.Usuario;
import com.laboQuimica.kalium.service.SolicitudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "*")
public class SolicitudController {

    @Autowired
    private SolicitudService solicitudService;

    @PostMapping
    public ResponseEntity<Solicitud> crear(@RequestBody Solicitud solicitud) {
        // Se asume validación mínima; puedes agregar validaciones según negocio
        Solicitud creada = solicitudService.crear(solicitud);
        return ResponseEntity.ok(creada);
    }

    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(solicitudService.listar());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> rechazar(@PathVariable Integer id) {
        solicitudService.rechazar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/aceptar")
    public ResponseEntity<Usuario> aceptar(@PathVariable Integer id) {
        Usuario creado = solicitudService.aceptar(id);
        return ResponseEntity.ok(creado);
    }
}
