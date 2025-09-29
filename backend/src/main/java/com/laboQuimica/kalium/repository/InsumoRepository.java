package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.Insumo;
import com.laboQuimica.kalium.entity.EstInsumo;
import com.laboQuimica.kalium.entity.TipoInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Integer> {
    List<Insumo> findByEstInsumo(EstInsumo estInsumo);
    List<Insumo> findByTipoInsumo(TipoInsumo tipoInsumo);
}
