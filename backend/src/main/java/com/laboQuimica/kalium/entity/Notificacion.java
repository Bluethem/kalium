package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Notificacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDNotificacion")
    private Integer idNotificacion;
    
    @Column(name = "Titulo", nullable = false, length = 100)
    private String titulo;
    
    @Column(name = "Mensaje", nullable = false, length = 255)
    private String mensaje;
    
    @Column(name = "Tipo", nullable = false, length = 50)
    private String tipo;
    
    @Column(name = "Leida", nullable = false)
    private Boolean leida = false;
    
    @Column(name = "FechaCreacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "IDUsuario", nullable = false)
    private Usuario usuario;
    
    @Column(name = "DatosExtra", columnDefinition = "JSON")
    private String datosExtra;
}