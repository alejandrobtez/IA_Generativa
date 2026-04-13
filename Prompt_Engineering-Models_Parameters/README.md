# 🧪 Práctica: Prompt Engineering y Parametrización de Modelos

### Optimización de IA Generativa en Azure AI Foundry

**🚀 VISTA RÁPIDA:** * [**📑 Técnicas de Prompting**](./notebooks/ejercicio01.ipynb)
* [**⚙️ Experimentación de Parámetros**](./notebooks/ejercicio02.ipynb)
* [**🎓 Tutorial de Técnicas Avanzadas**](./notebooks/ejercicio_extra.ipynb)

---

## 📖 Sobre el Proyecto

Este proyecto documenta un proceso de experimentación profunda con modelos de lenguaje a través de la plataforma **Azure AI Foundry**. El objetivo principal es comprender cómo la estructura de las instrucciones (**Prompt Engineering**) y la configuración técnica de los modelos (**Parametrización**) afectan directamente a la calidad, creatividad y precisión de las respuestas de la IA.

A diferencia de una interacción básica, aquí se analiza el comportamiento del modelo bajo diferentes niveles de aleatoriedad, restricciones de vocabulario y metodologías de razonamiento avanzado.

---

## 🎯 1. Técnicas de Prompt Engineering

La primera fase del proyecto se centró en dejar de tratar a la IA como un buscador y empezar a utilizarla como un motor de razonamiento estructurado. Se implementaron y validaron las siguientes técnicas clave:

### 1.1 Técnicas Fundamentales
* **Rol / Persona 🎭:** Asignación de identidades específicas para ajustar el tono y el vocabulario técnico.
* **Few-shot 📚:** Entrenamiento en contexto mediante ejemplos para que el modelo replique patrones de respuesta específicos.
* **Chain-of-Thought (CoT) 🔗:** Obligar al modelo a desglosar problemas lógicos paso a paso para reducir errores de cálculo y lógica.
* **Format Forcing (JSON) 🔒:** Garantizar que la salida sea estructurada y legible por máquinas o bases de datos.
* **Give the model an "out" 🚪:** Prevención de alucinaciones permitiendo al modelo admitir desconocimiento de forma explícita.

### 1.2 Casos de Uso Reales
Se aplicaron combinaciones de estas técnicas en escenarios prácticos como la **extracción de entidades en textos legales** y la creación de un sistema de **soporte técnico automatizado**, demostrando que un prompt bien diseñado es la base de cualquier aplicación de IA fiable.

---

## ⚙️ 2. Experimentación con Parámetros

Para entender el "cerebro" detrás de la respuesta, se testearon los parámetros de configuración en el motor **GPT-4o**, analizando cómo cambia su comportamiento.

### 2.1 Control de Aleatoriedad (Temperature vs Top_P)
Analizamos cómo el modelo elige el siguiente token en una secuencia según la probabilidad:

| Parámetro | Rango Probado | Efecto Observado |
| :--- | :--- | :--- |
| **Temperature** | 0.0 a 1.5 | De respuestas 100% deterministas y rígidas a salidas altamente creativas y variadas. |
| **Top_P** | 0.1 a 1.0 | Un filtro de "recorte" de probabilidad que permite ganar fluidez manteniendo mejor la coherencia que la temperatura pura. |

### 2.2 Gestión de Repetición (Penalties)
Implementamos penalizaciones para evitar que el modelo se vuelva monótono en descripciones extensas:
* **Presence Penalty:** Forzó al modelo a saltar a **temas nuevos** y conceptos no mencionados anteriormente.
* **Frequency Penalty:** Evitó la repetición de palabras exactas, obligando al modelo a buscar **sinónimos** y riqueza léxica.

---

## 🚀 3. Tutorial: Técnicas Avanzadas

El proyecto culmina con un tutorial de nivel experto que incluye metodologías que no aparecen en la documentación base, mejorando el rendimiento del modelo en tareas críticas.

### 3.1 Self-Consistency (Auto-consistencia)
Implementación de razonamiento por "voto mayoritario", donde el modelo genera múltiples caminos de pensamiento para una misma pregunta lógica y selecciona la respuesta más consistente entre todas ellas para evitar errores puntuales.

### 3.2 Emotional Stimuli (Estímulos Emocionales)
Prueba del impacto de estímulos de importancia (como "Este es mi examen final") para mejorar el esfuerzo cognitivo y la atención al detalle del modelo, basándose en investigaciones recientes de IA.

---

## 🛠️ Tecnologías Utilizadas

* **Plataforma:** Azure AI Foundry.
* **Modelos:** GPT-4o.
* **Lenguaje:** Python 3.10+.
* **Librerías:** `openai` (v1.x), `python-dotenv`.
* **Entorno:** Jupyter Notebooks (.ipynb).

---

## ⚠️ Desafíos Técnicos y Soluciones

* **Conectividad con Endpoints de Proyecto:** Se solucionó el error de compatibilidad de la ruta `/v1` utilizando la clase estándar de `OpenAI` con el `base_url` completo del proyecto en lugar del SDK de Azure tradicional.
* **Seguridad de Credenciales:** Implementación de arquitectura basada en variables de entorno `.env` para evitar la exposición de API Keys en el historial de Git o en el código fuente.
* **Control de Alucinaciones:** Mitigado mediante la combinación de `temperature: 0.0` y la instrucción explícita de "vía de escape" en el prompt.

---
*Proyecto desarrollado como parte de la formación en IA & Big Data.*

