// src/utiles/handlebarsCompiler.js

import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

// Usamos path.resolve() para asegurar la ruta absoluta
const TEMPLATE_DIR = path.resolve('src', 'templates');

/**
 * Compila una plantilla Handlebars dada el nombre del archivo y los datos.
 * @param {string} templateName Nombre del archivo de la plantilla 
 * @param {object} data Datos a inyectar en la plantilla
 * @returns {string} El HTML compilado
 * @throws 
 */
export const compileTemplate = (templateName, data) => {
    try {
        const templatePath = path.join(TEMPLATE_DIR, `${templateName}.hbs`);
        
        // Verificamos si la plantilla existe
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Plantilla no encontrada: ${templateName}.hbs. Asegúrese de crear el archivo en ${TEMPLATE_DIR}`);
        }
        
        const source = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(source);
        const html = template(data);
        
        return html;
        
    } catch (error) {
        console.error(`Error al compilar la plantilla ${templateName}:`, error.message);
        throw new Error(`Fallo en el sistema de plantillas: ${error.message}`);
    }
};

/**
 * Helper para formatear fechas.
 */
handlebars.registerHelper('formatDate', (date, format = 'DD/MM/YYYY HH:mm') => {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');

    // Formateo de la fecha según el formato especificado
    if (format.includes('DD/MM/YYYY') && format.includes('HH:mm')) {
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }
    if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
    }

    return `${day}/${month}/${year} ${hour}:${minute}`;
});

/**
 * Helper para formatear moneda
 * Convierte números a formato de pesos argentinos
 * @example {{formatCurrency 15000.50}} → $15,000.50
 */
handlebars.registerHelper('formatCurrency', (value) => {
    if (!value && value !== 0) return '$0.00';
    
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    
    // Formatea con separador de miles y 2 decimales
    return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});

/**
 * Helper para verificar si un array tiene elementos
 * @example {{#if (hasItems servicios)}}...{{/if}}
 */
handlebars.registerHelper('hasItems', (array) => {
    return Array.isArray(array) && array.length > 0;
});

/**
 * Helper para comparaciones
 * @example {{#if (eq status "activo")}}...{{/if}}
 */
handlebars.registerHelper('eq', (a, b) => {
    return a === b;
});