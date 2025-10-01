package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.EstDevolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstDevolucionRepository extends JpaRepository<EstDevolucion, Integer> {
}
