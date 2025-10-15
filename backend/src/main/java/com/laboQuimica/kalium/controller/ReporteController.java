package com.laboQuimica.kalium.controller;

import com.laboQuimica.kalium.dto.ReporteInventarioDTO;
import com.laboQuimica.kalium.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {
    
    @Autowired
    private ReporteService reporteService;
    
    @GetMapping("/inventario")
    public ResponseEntity<List<ReporteInventarioDTO>> generarReporteInventario(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false, defaultValue = "Todas") String categoria) {
        
        List<ReporteInventarioDTO> reporte = reporteService.generarReporteInventario(
            fechaInicio, fechaFin, categoria
        );
        return ResponseEntity.ok(reporte);
    }
}