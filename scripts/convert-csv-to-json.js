#!/usr/bin/env node

/**
 * CSV to JSON Converter for BNCC Data
 * 
 * This script reads the BNCC CSV file and converts it into a hierarchical JSON structure
 * for efficient querying in the application.
 * 
 * Hierarchy: Disciplina → Ano → Unidade Temática → Objeto do Conhecimento → Habilidade
 */

const fs = require('fs');
const path = require('path');

// File paths
const CSV_PATH = path.join(__dirname, '../public/files/Lista de questões.csv');
const OUTPUT_PATH = path.join(__dirname, '../lib/data/bncc-data.json');

/**
 * Parse CSV line handling quoted fields properly
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

/**
 * Parse and expand year field
 * Handles cases like "1º, 2º" or "1º, 2º, 3º" and returns array of individual years
 */
function parseYears(yearField) {
  // Split by comma and clean up each year
  const years = yearField.split(',').map(y => y.trim());
  return years;
}

/**
 * Build hierarchical structure from CSV data
 */
function buildHierarchy(csvData) {
  const hierarchy = {};
  
  // Skip header row
  for (let i = 1; i < csvData.length; i++) {
    const line = csvData[i].trim();
    if (!line) continue;
    
    const fields = parseCSVLine(line);
    
    if (fields.length < 5) {
      console.warn(`Skipping invalid line ${i + 1}: insufficient fields`);
      continue;
    }
    
    const [disciplina, anoField, unidadeTematica, objetoConhecimento, habilidade] = fields;
    
    // Validate required fields
    if (!disciplina || !anoField || !unidadeTematica || !objetoConhecimento || !habilidade) {
      console.warn(`Skipping line ${i + 1}: missing required fields`);
      continue;
    }
    
    // Parse years - expand if multiple years are present
    const anos = parseYears(anoField);
    
    // Create entry for each year
    for (const ano of anos) {
      // Initialize nested structure
      if (!hierarchy[disciplina]) {
        hierarchy[disciplina] = {};
      }
      
      if (!hierarchy[disciplina][ano]) {
        hierarchy[disciplina][ano] = {};
      }
      
      if (!hierarchy[disciplina][ano][unidadeTematica]) {
        hierarchy[disciplina][ano][unidadeTematica] = {};
      }
      
      if (!hierarchy[disciplina][ano][unidadeTematica][objetoConhecimento]) {
        hierarchy[disciplina][ano][unidadeTematica][objetoConhecimento] = [];
      }
      
      // Add habilidade if not already present
      const habilidades = hierarchy[disciplina][ano][unidadeTematica][objetoConhecimento];
      if (!habilidades.includes(habilidade)) {
        habilidades.push(habilidade);
      }
    }
  }
  
  return hierarchy;
}

/**
 * Main conversion function
 */
function convertCSVToJSON() {
  console.log('Starting CSV to JSON conversion...');
  
  // Check if CSV file exists
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Error: CSV file not found at ${CSV_PATH}`);
    process.exit(1);
  }
  
  // Read CSV file
  console.log(`Reading CSV file: ${CSV_PATH}`);
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.split('\n');
  
  console.log(`Processing ${lines.length} lines...`);
  
  // Build hierarchy
  const hierarchy = buildHierarchy(lines);
  
  // Count statistics
  const stats = {
    disciplinas: Object.keys(hierarchy).length,
    totalAnos: 0,
    totalUnidades: 0,
    totalObjetos: 0,
    totalHabilidades: 0
  };
  
  Object.values(hierarchy).forEach(anos => {
    stats.totalAnos += Object.keys(anos).length;
    Object.values(anos).forEach(unidades => {
      stats.totalUnidades += Object.keys(unidades).length;
      Object.values(unidades).forEach(objetos => {
        stats.totalObjetos += Object.keys(objetos).length;
        Object.values(objetos).forEach(habilidades => {
          stats.totalHabilidades += habilidades.length;
        });
      });
    });
  });
  
  console.log('\nConversion Statistics:');
  console.log(`- Disciplinas: ${stats.disciplinas}`);
  console.log(`- Anos: ${stats.totalAnos}`);
  console.log(`- Unidades Temáticas: ${stats.totalUnidades}`);
  console.log(`- Objetos do Conhecimento: ${stats.totalObjetos}`);
  console.log(`- Habilidades: ${stats.totalHabilidades}`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    console.log(`Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write JSON file
  console.log(`\nWriting JSON file: ${OUTPUT_PATH}`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(hierarchy, null, 2), 'utf-8');
  
  console.log('✓ Conversion completed successfully!');
}

// Run conversion
try {
  convertCSVToJSON();
} catch (error) {
  console.error('Error during conversion:', error);
  process.exit(1);
}
