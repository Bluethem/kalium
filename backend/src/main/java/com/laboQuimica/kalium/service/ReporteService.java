package com.laboQuimica.kalium.service;

import com.laboQuimica.kalium.dto.ReporteInventarioDTO;
import com.laboQuimica.kalium.entity.Insumo;
import com.laboQuimica.kalium.entity.Quimico;
import com.laboQuimica.kalium.entity.TipoInsumo;
import com.laboQuimica.kalium.repository.InsumoRepository;
import com.laboQuimica.kalium.repository.QuimicoRepository;
import com.laboQuimica.kalium.repository.TipoInsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReporteService {
    
    @Autowired
    private TipoInsumoRepository tipoInsumoRepository;
    
    @Autowired
    private InsumoRepository insumoRepository;
    
    @Autowired
    private QuimicoRepository quimicoRepository;
    
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    
    public List<ReporteInventarioDTO> generarReporteInventario(
            LocalDate fechaInicio, 
            LocalDate fechaFin, 
            String categoria) {
        
        List<ReporteInventarioDTO> reporte = new ArrayList<>();
        List<TipoInsumo> tipos = tipoInsumoRepository.findAll();
        
        for (TipoInsumo tipo : tipos) {
            // Filtrar por categoría si se especifica
            if (categoria != null && !categoria.equals("Todas")) {
                boolean esQuimico = tipo.getEsQuimico() != null && tipo.getEsQuimico();
                if (categoria.equals("Químicos") && !esQuimico) continue;
                if (categoria.equals("Insumo") && esQuimico) continue;
            }
            
            ReporteInventarioDTO item = new ReporteInventarioDTO();
            item.setIdTipoInsumo(tipo.getIdTipoInsumo());
            item.setNombreProducto(tipo.getNombreTipoInsumo());
            item.setCategoria(tipo.getCategoria() != null ? tipo.getCategoria().getNombreCategoria() : "N/A");
            item.setUnidad(tipo.getUnidad() != null ? tipo.getUnidad().getUnidad() : "N/A");
            item.setEsQuimico(tipo.getEsQuimico() != null && tipo.getEsQuimico());
            
            // Calcular cantidad y última actualización
            if (item.getEsQuimico()) {
                List<Quimico> quimicos = quimicoRepository.findByTipoInsumo(tipo);
                
                // Filtrar por fecha si se especifica
                if (fechaInicio != null && fechaFin != null) {
                    quimicos = quimicos.stream()
                        .filter(q -> {
                            LocalDate fecha = q.getFechaIngreso();
                            return fecha != null && 
                                   !fecha.isBefore(fechaInicio) && 
                                   !fecha.isAfter(fechaFin);
                        })
                        .collect(Collectors.toList());
                }
                
                Float total = quimicos.stream()
                    .map(Quimico::getCantQuimico)
                    .reduce(0f, Float::sum);
                item.setCantidad(String.format("%.2f", total));
                
                // Última actualización
                LocalDate ultimaFecha = quimicos.stream()
                    .map(Quimico::getFechaIngreso)
                    .filter(fecha -> fecha != null)
                    .max(LocalDate::compareTo)
                    .orElse(null);
                item.setUltimaActualizacion(ultimaFecha != null ? ultimaFecha.format(formatter) : "N/A");
                
            } else {
                List<Insumo> insumos = insumoRepository.findByTipoInsumo(tipo);
                
                // Filtrar por fecha si se especifica
                if (fechaInicio != null && fechaFin != null) {
                    insumos = insumos.stream()
                        .filter(i -> {
                            LocalDate fecha = i.getFechaIngreso();
                            return fecha != null && 
                                   !fecha.isBefore(fechaInicio) && 
                                   !fecha.isAfter(fechaFin);
                        })
                        .collect(Collectors.toList());
                }
                
                item.setCantidad(String.valueOf(insumos.size()));
                
                // Última actualización
                LocalDate ultimaFecha = insumos.stream()
                    .map(Insumo::getFechaIngreso)
                    .filter(fecha -> fecha != null)
                    .max(LocalDate::compareTo)
                    .orElse(null);
                item.setUltimaActualizacion(ultimaFecha != null ? ultimaFecha.format(formatter) : "N/A");
            }
            
            reporte.add(item);
        }
        
        return reporte;
    }
}