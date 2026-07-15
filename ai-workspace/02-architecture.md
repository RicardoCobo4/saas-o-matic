# Diseño de Arquitectura y Prevención de Deuda Técnica

[cite_start]Para este proyecto interno, prioricé un stack moderno, modular y fácil de levantar en cualquier máquina sin fricciones[cite: 51, 52].

## Stack Elegido
* [cite_start]**Backend:** Node.js con Express y TypeScript[cite: 9]. TypeScript proporciona un tipado estricto que previene errores en tiempo de compilación.
* [cite_start]**Base de Datos:** SQLite[cite: 10]. Elegida por su ligereza. Al ser un archivo local (`saas-o-matic.db`), evitamos la complejidad de requerir contenedores Docker para un evaluador de la prueba.
* [cite_start]**Frontend:** React (Vite) + TypeScript[cite: 23]. [cite_start]Permite un renderizado ultra rápido y maneja eficientemente el estado del conversor de divisas asíncrono[cite: 25].

## Directrices dadas a la IA
1.  **Seguridad SQL:** Instruí al modelo para que utilizara consultas preparadas (`db.prepare`) en todas las interacciones con SQLite, evitando inyecciones SQL.
2.  **Modularidad visual:** Para el frontend, se estableció un diseño mediante CSS Grid y flexbox directo en el componente para evitar la saturación de archivos extraídos innecesarios en una prueba técnica.