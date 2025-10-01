package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.EstIncidente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstIncidenteRepository extends JpaRepository<EstIncidente, Integer> {
}
