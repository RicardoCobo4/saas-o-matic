# Spec-Driven Development: Planificación Funcional

Antes de delegar la escritura de código a la IA, definí estructuradamente las reglas de negocio para asegurar un resultado preciso y evitar alucinaciones del modelo.

## 1. Reglas de Negocio del Algoritmo
[cite_start]El sistema de facturación "SaaS-O-Matic" requiere un cálculo estricto basado en tramos acumulativos (Tiered Pricing)[cite: 5, 17]:
* [cite_start]**Tramo 1 (0 a 10 usuarios):** 10 € / usuario[cite: 18].
* [cite_start]**Tramo 2 (11 a 50 usuarios):** 8 € / usuario[cite: 19].
* [cite_start]**Tramo 3 (Más de 50 usuarios):** 5 € / usuario[cite: 20].
* [cite_start]**Impuestos:** Si el país es España, se suma un 21% de IVA al coste base calculado[cite: 21].

## 2. Seguridad y Validaciones
* [cite_start]**Identificador Fiscal:** Se exige validación algorítmica estricta[cite: 13]. [cite_start]Si el cliente es de España, no se permite un simple regex, sino que se implementó el algoritmo matemático oficial para verificar la letra de control de los DNI/NIE/CIF[cite: 14].

## 3. Contratos de la API
* [cite_start]`POST /customers`: Guarda los datos del cliente corporativo[cite: 12]. Retorna 400 Bad Request si la validación fiscal falla.
* [cite_start]`POST /simulations`: Persiste los cálculos en base de datos[cite: 15, 16].