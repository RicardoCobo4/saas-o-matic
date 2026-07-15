# Vibe Coding: Auditoría y Control de Calidad

[cite_start]El desarrollo se llevó a cabo de forma iterativa actuando como "Director de Orquesta"[cite: 44, 49], validando el código de la IA y resolviendo problemas de entorno en tiempo real:

1.  **Comparativa de Modelos:** Se lanzaron prompts paralelos para evaluar qué IA estructuraba mejor la lógica matemática del "Tiered Pricing". Se descartaron versiones básicas que fallaban en la lógica acumulativa.
2.  **Resolución de Bugs de Entorno:** Durante el despliegue del backend, se detectó una incompatibilidad de la librería `ts-node` con la última versión de Node.js v24 LTS. En lugar de retroceder la versión de Node, audité la situación y migré el script de ejecución a `tsx`, resolviendo el volcado de memoria instantáneamente.
3.  **Auditoría Frontend:** Se gestionaron errores de parseo (PARSE_ERROR) en Vite causados por fragmentos de texto conversacional inyectados por la IA en el código fuente. Se corrigió forzando entregas limpias ("Strict completion").