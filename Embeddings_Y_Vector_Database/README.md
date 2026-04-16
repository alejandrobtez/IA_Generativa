# 🔍 Proyecto Azure AI Search — Implementación de RAG y Búsqueda Híbrida

### Implementación de IA Generativa y Recuperación de Información con Azure

**🚀 VISTA RÁPIDA:** [**📑 Notebook de Pruebas**](./notebooks/ejercicios.ipynb)

---

## 📖 Sobre el Proyecto

Este proyecto documenta el flujo de trabajo para implementar un sistema de **Generación Aumentada por Recuperación (RAG)**. El objetivo principal es permitir que un modelo de lenguaje consulte una base de conocimientos técnica (SQL y eventos) para ofrecer respuestas precisas y fundamentadas.

A lo largo del desarrollo, hemos configurado un ecosistema capaz de realizar **Búsqueda Híbrida** (Vectores + Palabras clave) y optimizar los resultados mediante **Re-ranking Semántico**, garantizando que la información más relevante siempre aparezca en las primeras posiciones.

---

## 🏗️ 1. Infraestructura y Configuración del Entorno

La primera fase consistió en desplegar los servicios base en Azure para soportar el almacenamiento y el procesamiento de los datos.

### 1.1 Azure AI Search
Configuramos el servicio de búsqueda `generativasearch`. Se seleccionó el nivel **Basic** para contar con capacidades de búsqueda vectorial y semántica.

![Setup AI Search](img/aisearchconfig.png)
> **Fig 1.** *Provisionamiento: Configuración inicial del servicio Azure AI Search.*

### 1.2 Almacenamiento (Blob Storage)
Desplegamos la cuenta de almacenamiento `aisearchalm` donde se alojarán los archivos PDF originales.

![Setup Storage](img/storageconfig.png)
> **Fig 2.** *Data Source: Creación del recurso de almacenamiento para los documentos fuente.*

### 1.3 Azure OpenAI Service
Instanciamos el servicio de OpenAI para gestionar el modelo de embeddings.

![Setup OpenAI](img/openaiconfig.png)
> **Fig 3.** *IA Engine: Configuración del recurso de Azure OpenAI `openaiembedd`.*

---

## 📥 2. Preparación y Seguridad de los Datos

Antes de indexar, preparamos el contenedor y gestionamos las credenciales necesarias para la conexión entre servicios.

### 2.1 Contenedores y Claves de Acceso
Creamos el contenedor `embeddingscontainer` y extrajimos las cadenas de conexión necesarias para que el servicio de búsqueda pueda "leer" el almacenamiento.

![Blob Container](img/blobcontainer.png)
> **Fig 4.** *Contenedor: Preparación del espacio para la ingesta de documentos.*

![Access Keys](img/storagekeys.png)
> **Fig 5.** *Seguridad: Gestión de Access Keys para la integración técnica.*

### 2.2 Despliegue del Modelo de Embedding
Configuramos el modelo **text-embedding-3-small**, encargado de transformar el texto en vectores de 1536 dimensiones.

![Model Config](img/modelconfig.png)
> **Fig 6.** *Embedding Model: Detalles del despliegue del modelo de IA.*

---

## ⚙️ 3. Pipeline de RAG: Importación y Vectorización

Utilizamos el asistente de Azure para automatizar la fragmentación (chunking) y la vectorización de los archivos.

### 3.1 Configuración del Asistente (Wizard)
Definimos los parámetros del pipeline, incluyendo el prefijo del índice y la activación del **Semantic Ranker**.

![RAG Config](img/ragconfig.png)
> **Fig 7.** *Pipeline RAG: Configuración integral de Skillset, Índice e Indexador.*

### 3.2 Ejecución y Monitoreo del Indexador
Validamos que el indexador procese los documentos con éxito, transformando los PDFs en fragmentos navegables.

![Indexer Status](img/indexer.png)
> **Fig 8.** *Indexer History: Estado de éxito tras la ejecución del proceso de carga.*

---

## 🚀 4. Validación y Optimización de Búsqueda

La fase final consistió en probar el motor de búsqueda y ajustar la relevancia de los resultados.

### 4.1 Search Explorer y Fragmentación
Comprobamos en el portal que los documentos se han dividido correctamente en "chunks" y que el score vectorial es coherente.

![Search Explorer](img/errorchunks.png)
> **Fig 9.** *Validación: Prueba de consulta y visualización de fragmentos (chunks).*

### 4.2 Scoring Profiles (Relevancia Personalizada)
Creamos perfiles de puntuación para dar más peso a campos específicos. Tuvimos que crear el perfil `perfilExtra` para dar prioridad al campo `chunk`, garantizando resultados más precisos.

![Scoring Profiles](img/scoringprofiles.png)
> **Fig 10.** *Custom Scoring: Configuración de perfiles para alterar la relevancia de los resultados.*

---

> [!NOTE]
> ## Tecnologías Utilizadas
>
> * **Plataforma:** Azure AI Search / Azure OpenAI.
> * **Modelos:** text-embedding-3-small (1536 dimensiones).
> * **Almacenamiento:** Azure Blob Storage.
> * **Lenguajes:** Python 3.14+, Azure SDK, Jupyter Notebooks.

---

> [!TIP]
> ## Desafíos y Soluciones
>
> * **Relevancia:** La búsqueda estándar no siempre priorizaba los títulos. Se solucionó implementando **Scoring Profiles**.
> * **Búsqueda Semántica:** Se activó el **Semantic Ranker** para obtener el `reranker_score`, permitiendo una comprensión contextual de las preguntas SQL.
> * **Seguridad:** Uso de variables de entorno `.env` y **Managed Identities** para proteger las claves del servicio.

---
*Proyecto desarrollado como parte del Máster en IA & Big Data por Alejandro Benítez.*
