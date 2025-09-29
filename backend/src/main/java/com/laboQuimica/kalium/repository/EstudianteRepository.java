package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, Integer> {
}
