package com.laboQuimica.kalium.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Administrador")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Administrador {
    
    @Id
    @Column(name = "IDAdministrador")
    private Integer idAdministrador;
    
    @ManyToOne
    @JoinColumn(name = "IDUsuario", nullable = false)
    private Usuario usuario;
}
