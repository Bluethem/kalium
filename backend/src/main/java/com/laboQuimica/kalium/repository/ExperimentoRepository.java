package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Experimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExperimentoRepository extends JpaRepository<Experimento, Integer> {
}
