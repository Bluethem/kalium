package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.EntregaQuimico;
import com.laboQuimica.kalium.entity.Entrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EntregaQuimicoRepository extends JpaRepository<EntregaQuimico, Integer> {
    List<EntregaQuimico> findByEntrega(Entrega entrega);
}
