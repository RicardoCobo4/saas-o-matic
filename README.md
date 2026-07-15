# SaaS-O-Matic 🚀 (Dynamic Billing Optimizer)

Prueba técnica resuelta aplicando Spec-Driven Development, Vibe Coding y auditoría de IA.

## Requisitos
* Node.js (v18 o superior).

## Instrucciones de Despliegue Local

### 1. Levantar el Backend (API & Base de Datos)
Abre una terminal y ejecuta:
\`\`\`bash
cd backend
npm install
npm install -D tsx
npx tsx server.ts
\`\`\`
[cite_start]El servidor se iniciará en `http://localhost:3000` y creará la base de datos `saas-o-matic.db` automáticamente[cite: 10].

### 2. Levantar el Frontend (Dashboard)
Abre una **nueva** terminal (sin cerrar la del backend) y ejecuta:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
Abre `http://localhost:5173` en tu navegador.

## Documentación del Proceso (AI Workspace)
[cite_start]Toda la justificación de arquitectura, diseño de prompts y logs de control de calidad se encuentra en la carpeta `/ai-workspace` adjunta en la raíz de este repositorio.