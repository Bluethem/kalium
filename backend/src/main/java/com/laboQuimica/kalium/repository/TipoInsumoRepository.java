package com.laboQuimica.kalium.repository;

import com.laboQuimica.kalium.entity.TipoInsumo;
import com.laboQuimica.kalium.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TipoInsumoRepository extends JpaRepository<TipoInsumo, Integer> {
    List<TipoInsumo> findByCategoria(Categoria categoria);
}
