package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "Incidentes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incidentes {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDIncidentes")
    private Integer idIncidentes;
    
    @Column(name = "Descripcion", nullable = false, length = 255)
    private String descripcion;
    
    @Column(name = "FechaIncidente", nullable = false)
    private LocalDate fechaIncidente;
    
    @Column(name = "FechaSolucion")
    private LocalDate fechaSolucion;
    
    @ManyToOne
    @JoinColumn(name = "IDDevolucion", nullable = false)
    private Devolucion devolucion;
    
    @ManyToOne
    @JoinColumn(name = "IDEstudiante", nullable = false)
    private Estudiante estudiante;
    
    @ManyToOne
    @JoinColumn(name = "IDEstIncidente", nullable = false)
    private EstIncidente estIncidente;
}
