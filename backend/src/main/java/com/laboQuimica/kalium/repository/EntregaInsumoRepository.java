package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.EntregaInsumo;
import com.laboQuimica.kalium.entity.Entrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EntregaInsumoRepository extends JpaRepository<EntregaInsumo, Integer> {
    List<EntregaInsumo> findByEntrega(Entrega entrega);
}
