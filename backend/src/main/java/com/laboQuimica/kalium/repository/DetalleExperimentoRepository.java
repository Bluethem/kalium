package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.DetalleExperimento;
import com.laboQuimica.kalium.entity.Experimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DetalleExperimentoRepository extends JpaRepository<DetalleExperimento, Integer> {
    List<DetalleExperimento> findByExperimento(Experimento experimento);
}
