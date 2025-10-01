package com.laboQuimica.kalium.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // Esto ya no es necesario por CORS config, pero lo dejo por si acaso
public class ApiController {

    // ✅ Endpoint para la raíz de API
    @GetMapping("/")
    public Map<String, String> home() {
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Bienvenido a Kalium API");
        response.put("status", "success");
        response.put("endpoints", "/api/mensaje, /api/usuarios, /api/insumos, /api/categorias, /api/unidades");
        return response;
    }

    // ✅ Endpoint de prueba
    @GetMapping("/mensaje")
    public Map<String, String> getMensaje() {
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Hola desde Spring Boot!");
        response.put("timestamp", new Date().toString());
        return response;
    }

    // ✅ Health check
    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Kalium API");
        response.put("timestamp", new Date().toString());
        return response;
    }

    // ❌ COMENTADO: Estas rutas ahora están en UsuarioController
    /*
    // ✅ Obtener usuarios (simulado)
    @GetMapping("/usuarios")
    public List<Map<String, Object>> getUsuarios() {
        List<Map<String, Object>> usuarios = new ArrayList<>();
        
        Map<String, Object> usuario1 = new HashMap<>();
        usuario1.put("id", 1);
        usuario1.put("nombre", "Juan Pérez");
        usuario1.put("email", "juan@email.com");
        usuario1.put("activo", true);
        usuario1.put("fechaCreacion", new Date());
        
        Map<String, Object> usuario2 = new HashMap<>();
        usuario2.put("id", 2);
        usuario2.put("nombre", "María García");
        usuario2.put("email", "maria@email.com");
        usuario2.put("activo", true);
        usuario2.put("fechaCreacion", new Date());
        
        usuarios.add(usuario1);
        usuarios.add(usuario2);
        
        return usuarios;
    }

    // ✅ Crear usuario
    @PostMapping("/usuarios")
    public Map<String, Object> crearUsuario(@RequestBody Map<String, String> usuario) {
        System.out.println("Usuario recibido: " + usuario);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("mensaje", "Usuario creado correctamente");
        response.put("id", 3); // ID simulado
        response.put("usuario", usuario);
        response.put("timestamp", new Date());
        
        return response;
    }

    // ✅ Ejemplo con parámetro en URL
    @GetMapping("/usuarios/{id}")
    public Map<String, Object> getUsuarioById(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", id);
        response.put("nombre", "Usuario " + id);
        response.put("email", "usuario" + id + "@email.com");
        response.put("encontrado", true);
        
        return response;
    }
    */
}