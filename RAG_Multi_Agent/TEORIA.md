# 🔍 RAG (Retrieval-Augmented Generation)

> **📖 Resumen:** RAG es un patrón que extiende las capacidades de los modelos de lenguaje grandes (LLM) al proporcionar contexto adicional proveniente de tus datos propietarios, mejorando la precisión y relevancia de las respuestas generadas.

---

## 📑 Índice

| Sección | Contenido |
|---------|-----------|
| 📌 | **Conceptos Clave** - Fundamentos de RAG |
| 🎯 | **¿Qué es RAG?** - Significado, casos de uso y tipos |
| ⚖️ | **RAG Clásico vs Agentic Retrieval** - Diferencias fundamentales |
| 🗄️ | **Vector Database vs Knowledge Base** - Comparativa técnica |
| 🔧 | **Implementación de RAG** - Cómo construir un sistema RAG |
| ✨ | **Mejores Técnicas de RAG** - Optimización y mejores prácticas |

---

## 📌 Conceptos Clave

> 💡 **Nota:** Estos son los fundamentos esenciales para comprender RAG.

---

### 1️⃣ **Retrieval-Augmented Generation** 

**📝 Explicación:** RAG es un patrón arquitectónico que combina la **recuperación de información** (retrieval) con la **generación de texto** (generation) mediante LLMs. En lugar de depender únicamente del conocimiento embebido en el modelo durante su entrenamiento, RAG busca información relevante en bases de datos externas para fundamentar (ground) las respuestas del modelo.

```markdown
💬 Ventaja principal:
Permite a los LLMs acceder a información actualizada y específica del dominio sin necesidad 
de reentrenar el modelo, reduciendo alucinaciones y mejorando la precisión factual.
```

---

### 2️⃣ **Grounding Data (Datos de Fundamentación)**

**📝 Explicación:** Son los fragmentos de información recuperados de tus fuentes de datos que se inyectan en el contexto del prompt enviado al LLM. Estos datos proporcionan al modelo el contexto necesario para generar respuestas precisas y relevantes basadas en tu información propietaria.

```markdown
💬 Ejemplo:
Usuario pregunta: "¿Cuál es nuestra política de vacaciones para empleados remotos?"
Sistema RAG:
1. Busca en documentos de RRHH: "política vacaciones empleados remotos"
2. Recupera fragmentos relevantes del manual de empleados
3. Envía al LLM: [Prompt original] + [Fragmentos recuperados]
4. LLM genera respuesta fundamentada en los datos reales de la empresa
```

---

### 3️⃣ **Chunking (Fragmentación)**

**📝 Explicación:** Proceso de dividir documentos largos en fragmentos más pequeños (chunks) antes de indexarlos. Esto es crucial porque los LLMs tienen límites de tokens en su ventana de contexto, y enviar documentos completos sería ineficiente e imposible en muchos casos.

```markdown
💬 Consideraciones de tamaño:
- Chunks pequeños (256 tokens): Mayor granularidad, menos ruido, pero puede perder contexto
- Chunks medianos (512-1024 tokens): Balance entre contexto y precisión (recomendado)
- Chunks grandes (1536+ tokens): Más contexto, pero más ruido y mayor costo de procesamiento
```

---

## 🎯 ¿Qué es RAG?

> 💡 **Contexto:** RAG resuelve uno de los mayores desafíos de los LLMs: proporcionar respuestas precisas sobre información que no formaba parte de sus datos de entrenamiento.

### 📋 Significado y Propósito

RAG (**Retrieval-Augmented Generation**) es un patrón arquitectónico que combina:

| Componente | Función | Tecnología |
|------------|---------|------------|
| **Retrieval** | Buscar y recuperar información relevante | Búsqueda vectorial, semántica, híbrida |
| **Augmentation** | Enriquecer el prompt con contexto recuperado | Chunking, ranking semántico |
| **Generation** | Generar respuesta fundamentada | LLM (GPT-4, GPT-4o, etc.) |

**Flujo básico de RAG:**

```
Usuario hace pregunta
    ↓
Vectorización de la pregunta (embedding)
    ↓
Búsqueda en índice vectorial
    ↓
Recuperación de chunks más relevantes (top-k)
    ↓
Construcción de prompt: [Pregunta] + [Contexto recuperado]
    ↓
Envío al LLM
    ↓
Generación de respuesta fundamentada
    ↓
Respuesta con citaciones
```

---

### 🎪 Casos de Uso

RAG es ideal para escenarios donde necesitas:

| Caso de Uso | Descripción | Ejemplo |
|-------------|-------------|---------|
| **💼 Chatbots Empresariales** | Responder preguntas sobre documentación interna | "¿Cuál es el procedimiento de onboarding?" |
| **📚 Asistentes de Documentación** | Ayudar a navegar bases de conocimiento técnico | "¿Cómo configuro autenticación OAuth?" |
| **🔍 Análisis de Datos** | Consultar y resumir grandes volúmenes de información | "Resume los informes trimestrales de 2024" |
| **⚖️ Cumplimiento y Legal** | Buscar en regulaciones y políticas específicas | "¿Qué dice el GDPR sobre retención de datos?" |
| **🩺 Asistencia Médica** | Consultar historiales y literatura médica | "Interacciones del medicamento X con Y" |

> ⚠️ **Importante:** RAG no reemplaza el fine-tuning. Usa RAG para **conocimiento factual externo** y fine-tuning para **adaptar el estilo y comportamiento** del modelo.

---

### 📊 Tipos de RAG

Existen diferentes aproximaciones al patrón RAG según su complejidad:

#### **RAG Básico (Naive RAG)**
```
Pregunta → Embedding → Búsqueda vectorial → Top-k chunks → LLM → Respuesta
```
- ✅ Simple de implementar
- ❌ Puede recuperar información irrelevante
- ❌ No maneja preguntas complejas bien

#### **RAG Avanzado (Advanced RAG)**
```
Pregunta → Reformulación → Múltiples búsquedas → Reranking → Filtrado → LLM → Respuesta
```
- ✅ Mejor precisión mediante reranking semántico
- ✅ Búsquedas híbridas (vectorial + keyword)
- ✅ Filtros metadata
- ❌ Más complejo y costoso

#### **RAG Agéntico (Agentic Retrieval)**
```
Pregunta compleja → LLM planifica → Múltiples subqueries paralelas → Fusión resultados → LLM → Respuesta
```
- ✅ Maneja preguntas muy complejas
- ✅ Descompone queries multi-parte
- ✅ Ejecución paralela
- ❌ Mayor latencia y costo

---

## ⚖️ RAG Clásico vs Agentic Retrieval

> 💡 **Contexto:** Esta es una de las diferencias más importantes a comprender cuando diseñas un sistema RAG moderno.

### 🔄 RAG Clásico (Classic RAG Pattern)

El **RAG clásico** utiliza la arquitectura de ejecución de consultas **original** donde:

**Características principales:**

| Aspecto | Implementación |
|---------|----------------|
| **Consulta** | Tu aplicación envía **una única query** a Azure AI Search |
| **Orquestación** | **Tu código** gestiona el flujo entre búsqueda y LLM |
| **Procesamiento** | Pipeline **simple y lineal** |
| **Modelo de costos** | Basado en **número de consultas** (precio por 1,000 queries) |
| **Latencia** | **Baja** - respuestas en milisegundos |
| **Complejidad queries** | Mejor para preguntas **simples o directas** |

**Flujo de trabajo clásico:**

```python
# Pseudo-código RAG Clásico
def classic_rag(user_question):
    # 1. Tu aplicación vectoriza la pregunta
    query_vector = embedding_model.encode(user_question)
    
    # 2. Búsqueda en Azure AI Search (una sola query)
    search_results = ai_search.search(
        vector=query_vector,
        top=5,
        semantic_ranker=True  # Opcional: mejora relevancia
    )
    
    # 3. Tu aplicación construye el prompt
    context = "\n".join([doc.content for doc in search_results])
    prompt = f"Contexto: {context}\n\nPregunta: {user_question}"
    
    # 4. Tu aplicación llama al LLM
    response = llm.generate(prompt)
    
    return response
```

**✅ Cuándo usar RAG Clásico:**

- ✓ Necesitas **características GA (Generally Available)** - producción estable
- ✓ **Simplicidad y velocidad** son prioridades
- ✓ Preguntas de usuarios son **directas y simples**
- ✓ Ya tienes **código de orquestación** que quieres preservar
- ✓ Necesitas **control granular** sobre el pipeline de consultas
- ✓ Presupuesto limitado - modelo de costos más predecible

---

### 🤖 Agentic Retrieval (RAG Agéntico)

El **Agentic Retrieval** es un **pipeline multi-query** diseñado específicamente para **preguntas complejas** en aplicaciones de chat y agentes.

**Características principales:**

| Aspecto | Implementación |
|---------|----------------|
| **Consulta** | El sistema genera **múltiples subqueries** automáticamente |
| **Orquestación** | **Azure AI Search** gestiona todo el flujo internamente |
| **Procesamiento** | Pipeline **multi-etapa con LLM integrado** |
| **Modelo de costos** | Basado en **tokens procesados** (precio por 1M tokens) |
| **Latencia** | **Mayor** - procesamiento LLM + múltiples búsquedas paralelas |
| **Complejidad queries** | Diseñado para preguntas **complejas y conversacionales** |

**Flujo de trabajo agéntico:**

```python
# Pseudo-código RAG Agéntico
def agentic_retrieval(user_question, chat_history):
    # 1. Llamas a Knowledge Base con retrieve action
    response = knowledge_base.retrieve(
        query=user_question,
        conversation_history=chat_history,
        reasoning_effort="medium"  # minimal/low/medium
    )
    
    # 2. Internamente, el sistema hace:
    #    a) LLM analiza pregunta + historial de chat
    #    b) Genera múltiples subqueries enfocadas
    #       Ejemplo: "hotel cerca playa, con transporte aeropuerto, 
    #                 cerca restaurantes vegetarianos"
    #       Subqueries generadas:
    #         - "hoteles playa transporte aeropuerto"
    #         - "hoteles servicios shuttle aeropuerto costa"
    #         - "restaurantes vegetarianos zona hotelera playa"
    #    
    #    c) Ejecuta TODAS las subqueries en PARALELO
    #    d) Semantic reranking en cada resultado
    #    e) Fusiona y unifica resultados
    #    f) Genera respuesta estructurada con 3 partes:
    #       - Grounding data (contenido relevante)
    #       - Citations (referencias a documentos fuente)
    #       - Activity log (plan de ejecución)
    
    # 3. Recibes respuesta lista para usar
    return response.grounding_data  # o response.answer si habilitaste answer synthesis
```

**🎯 Capacidades únicas del Agentic Retrieval:**

1. **Comprensión contextual avanzada:**
   - Lee el **historial de chat completo** como entrada
   - Comprende **contexto implícito** en la conversación
   - Corrige **errores ortográficos** automáticamente

2. **Descomposición de queries complejas:**
   - Detecta **múltiples "asks"** en una sola pregunta
   - Genera **subqueries enfocadas** para cada aspecto
   - Usa **mapas de sinónimos** y paráfrasis generadas por LLM

3. **Ejecución paralela:**
   - Todas las subqueries se ejecutan **simultáneamente**
   - Mantiene **eficiencia** a pesar de múltiples búsquedas
   - Semantic ranking **integrado** en cada subquery

4. **Respuesta estructurada:**
   ```json
   {
     "grounding_data": "Contenido unificado más relevante",
     "citations": [
       {"source": "doc1.pdf", "page": 3},
       {"source": "doc2.pdf", "page": 7}
     ],
     "activity_log": {
       "subqueries": ["query1", "query2", "query3"],
       "sources_queried": ["index1", "sharepoint", "web"]
     }
   }
   ```

**✅ Cuándo usar Agentic Retrieval:**

- ✓ Tu cliente es un **agente o chatbot conversacional**
- ✓ Necesitas la **máxima relevancia y precisión** posible
- ✓ Queries son **complejas o conversacionales**
- ✓ Quieres **respuestas estructuradas con citaciones**
- ✓ Estás construyendo **implementaciones RAG nuevas**
- ✓ Necesitas acceso a **múltiples fuentes de datos** (SharePoint, Bing, índices)

---

### 📊 Comparativa Directa: Clásico vs Agéntico

| Característica | RAG Clásico | Agentic Retrieval |
|----------------|-------------|-------------------|
| **🔢 Queries por request** | 1 query única | Múltiples subqueries en paralelo |
| **🧠 Uso de LLM** | Solo para respuesta final | Para planificación + respuesta final |
| **💰 Modelo de pricing** | Por consulta ($/1K queries) | Por token ($/1M tokens) |
| **⚡ Latencia** | Baja (~100-500ms) | Media-Alta (~2-5s) |
| **🎯 Precisión** | Buena | Excelente |
| **💬 Contexto conversacional** | ❌ No nativo | ✅ Integrado |
| **🔀 Consultas complejas** | ⚠️ Limitado | ✅ Optimizado |
| **📝 Corrección ortográfica** | ❌ Manual | ✅ Automática |
| **📚 Múltiples fuentes** | ⚠️ Requiere código custom | ✅ Nativo |
| **🎓 Curva de aprendizaje** | Baja | Media |
| **🛠️ Control personalización** | Alto | Medio |
| **🏗️ Complejidad arquitectura** | Baja | Media |

**Ejemplo comparativo:**

```markdown
❓ Pregunta del usuario:
"Busco hotel cerca de playa, con transporte al aeropuerto y vegetariano-friendly"

🔵 RAG CLÁSICO:
1. Tu código hace: embedding("hotel cerca playa transporte aeropuerto vegetariano")
2. 1 búsqueda en índice
3. Top 5 resultados (pueden ser mezclados, no enfocados)
4. LLM intenta responder con contexto mezclado
⏱️ Tiempo: ~300ms

🟢 AGENTIC RETRIEVAL:
1. LLM descompone en 3 subqueries:
   - "hoteles playa transporte aeropuerto"
   - "hoteles shuttle aeropuerto costa"
   - "restaurantes vegetarianos zona hotelera"
2. 3 búsquedas EN PARALELO + semantic reranking cada una
3. Fusión inteligente de resultados
4. LLM genera respuesta con citaciones específicas
⏱️ Tiempo: ~2.5s (pero mucho más preciso)
```

---

### 🎛️ Parámetros de Control: Reasoning Effort

En **Agentic Retrieval**, puedes controlar el equilibrio entre **precisión y latencia** mediante el parámetro `reasoning_effort`:

| Nivel | Uso de LLM | Latencia | Costo | Cuándo usar |
|-------|------------|----------|-------|-------------|
| **minimal** | Mínimo | Baja | Bajo | Queries simples, necesitas velocidad |
| **low** | Reducido | Media | Medio | Balance general |
| **medium** | Completo | Alta | Alto | Máxima precisión, queries complejas |

> 💡 **Tip:** Empieza con `low` y ajusta según tus necesidades de latencia vs precisión.

---

## 🗄️ Vector Database vs Knowledge Base

> 💡 **Contexto:** Estos términos a menudo se confunden, pero representan conceptos diferentes en el ecosistema RAG.

### 📦 Vector Database

**📝 Definición:** Una **base de datos vectorial** es una base de datos optimizada para almacenar, indexar y consultar **vectores de alta dimensionalidad** (embeddings).

**Características principales:**

| Aspecto | Descripción |
|---------|-------------|
| **💾 Tipo de datos** | Vectores numéricos (arrays de floats) + metadata opcional |
| **🔍 Operación principal** | Búsqueda por similitud (nearest neighbors search) |
| **📊 Algoritmos** | HNSW, IVF, Product Quantization |
| **🎯 Propósito** | Encontrar vectores similares eficientemente |
| **📏 Métrica** | Distancia coseno, euclidiana, producto interno |

**Ejemplos de Vector Databases:**
- Azure AI Search (con campos vectoriales)
- Pinecone
- Qdrant
- Weaviate
- Milvus
- Chroma
- FAISS (biblioteca, no base de datos completa)

**Estructura típica en Vector DB:**

```json
{
  "id": "doc_123",
  "vector": [0.123, -0.456, 0.789, ...],  // 1536 dimensiones para text-embedding-ada-002
  "metadata": {
    "title": "Manual empleado",
    "page": 42,
    "section": "Política vacaciones"
  }
}
```

**🔧 Operaciones Vector Database:**

```python
# Operaciones típicas en Vector DB
vector_db = VectorDatabase()

# 1. Insertar vectores
vector_db.upsert(
    id="doc_123",
    vector=[0.1, 0.2, ...],
    metadata={"title": "Manual", "page": 42}
)

# 2. Búsqueda por similitud
results = vector_db.search(
    query_vector=[0.15, 0.18, ...],
    top_k=5,
    metric="cosine"
)

# 3. Búsqueda con filtros
results = vector_db.search(
    query_vector=[0.15, 0.18, ...],
    top_k=5,
    filter={"page": {"$gte": 40, "$lte": 50}}
)
```

**✅ Cuándo usar Vector Database directa:**
- ✓ Necesitas **solo búsqueda vectorial pura**
- ✓ Construyes un **sistema RAG simple**
- ✓ Quieres **control total** sobre chunking y vectorización
- ✓ Tienes **embeddings pre-generados**

---

### 🧠 Knowledge Base

**📝 Definición:** Una **Knowledge Base** es una **abstracción de alto nivel** que orquesta múltiples fuentes de conocimiento y proporciona capacidades avanzadas de recuperación, incluyendo procesamiento inteligente de consultas.

**Características principales:**

| Aspecto | Descripción |
|---------|-------------|
| **🎯 Nivel de abstracción** | Alto - orquesta múltiples componentes |
| **📚 Fuentes de datos** | Múltiples: índices, SharePoint, OneLake, Web (Bing) |
| **🤖 Inteligencia** | Integra LLM para query planning y decomposición |
| **🔄 Procesamiento** | Pipeline completo: chunking, embedding, indexación automática |
| **🔐 Seguridad** | Control de acceso a nivel documento, ACLs, permisos |
| **📊 Respuesta** | Estructurada con grounding data, citations, activity log |

**Arquitectura de Knowledge Base:**

```
Knowledge Base
├── Knowledge Source 1: Azure AI Search Index
│   ├── Auto-chunking
│   ├── Auto-vectorization
│   └── Incremental refresh
├── Knowledge Source 2: SharePoint (remote query)
│   ├── Direct query (no indexing)
│   └── Inherits SharePoint permissions
├── Knowledge Source 3: Bing Web Search
│   └── Public web data
└── Agentic Retrieval Engine
    ├── LLM for query planning
    ├── Parallel subquery execution
    └── Semantic ranking + fusion
```

**🔧 Operaciones Knowledge Base:**

```python
# Operaciones en Knowledge Base (Azure AI Search)
from azure.search.documents import SearchClient

# 1. Crear Knowledge Source (conexión a datos)
knowledge_source = create_knowledge_source(
    name="company-docs",
    type="azure_blob_storage",
    container="documents",
    auto_chunking=True,            # Fragmentación automática
    auto_vectorization=True,       # Embeddings automáticos
    schedule="daily"               # Refresh incremental diario
)

# 2. Crear Knowledge Base (orquestador)
knowledge_base = create_knowledge_base(
    name="hr-knowledge",
    sources=[
        knowledge_source_1,        # Azure AI Search index
        sharepoint_source,         # SharePoint remoto
        web_source                 # Bing web search
    ],
    reasoning_effort="medium",     # Control procesamiento LLM
    llm_model="gpt-4o"
)

# 3. Query con Agentic Retrieval
response = knowledge_base.retrieve(
    query="¿Política vacaciones remotos contratados 2024?",
    conversation_history=chat_history,
    options={
        "top_k": 5,
        "enable_answer_synthesis": True
    }
)

# Response estructura:
print(response.grounding_data)     # Contenido relevante unificado
print(response.citations)          # Referencias documentos fuente
print(response.activity_log)       # Plan ejecución subqueries
print(response.answer)             # Respuesta formulada (si enabled)
```

**✅ Cuándo usar Knowledge Base:**
- ✓ Necesitas **múltiples fuentes de datos** en un solo punto
- ✓ Quieres **automatización completa** (chunking, embedding, indexing)
- ✓ Construyes **agentes conversacionales** complejos
- ✓ Necesitas **control de acceso granular** por documento/usuario
- ✓ Quieres **query planning inteligente** con LLM

---

### 📊 Comparativa: Vector Database vs Knowledge Base

| Característica | Vector Database | Knowledge Base |
|----------------|-----------------|----------------|
| **🎯 Nivel** | Bajo nivel - almacenamiento y búsqueda | Alto nivel - orquestación inteligente |
| **📚 Fuentes** | Una fuente de datos | Múltiples fuentes heterogéneas |
| **🔧 Procesamiento** | Manual (tú haces chunking/embedding) | Automático (integrado) |
| **🧠 Inteligencia** | Solo búsqueda por similitud | Query planning con LLM |
| **🔍 Tipo búsqueda** | Vector search, keyword, híbrida | Agentic retrieval multi-query |
| **🔐 Seguridad** | Filtros metadata básicos | ACLs, permisos Microsoft Entra ID |
| **📊 Respuesta** | Lista de documentos + scores | Grounding data + citations + activity log |
| **⚙️ Configuración** | Requiere código para pipeline | Pipeline automático pre-configurado |
| **💰 Costo** | Solo almacenamiento + queries | + LLM tokens para query planning |
| **🎓 Complejidad** | Menor - más control | Mayor - más automatización |

**Analogía:**

```markdown
🗄️ VECTOR DATABASE = Biblioteca física
   - Tú decides cómo organizar los libros (chunking)
   - Tú creas el sistema de índice (embeddings)
   - Tú buscas manualmente libro por libro
   - Control total, pero más trabajo manual

🧠 KNOWLEDGE BASE = Bibliotecario inteligente con IA
   - Organiza automáticamente los libros
   - Entiende tu pregunta en contexto
   - Busca en múltiples secciones simultáneamente
   - Te trae exactamente lo que necesitas con referencias
   - Menos control, mucha más automatización
```

---

### 🔄 Relación entre Vector Database y Knowledge Base

**📌 Importante:** Una **Knowledge Base usa Vector Databases internamente**, pero añade capas de inteligencia y orquestación encima.

```
Knowledge Base (Capa de Orquestación)
         ↓
    [LLM Query Planning]
         ↓
    [Agentic Retrieval]
         ↓
  ┌──────┴──────┐
  ↓             ↓
Vector DB 1   Vector DB 2   [+ SharePoint, Web, etc.]
(Azure AI     (OneLake
 Search)       Index)
```

**En Azure AI Search:**
- Un **índice de búsqueda con campos vectoriales** = Vector Database
- Un **Knowledge Source** que apunta a ese índice = Wrapper con configuración RAG
- Un **Knowledge Base** = Orquestador que usa múltiples Knowledge Sources + Agentic Retrieval

---

## 🔧 Implementación de RAG

> 💡 **Contexto:** Ahora que conoces embeddings y búsqueda vectorial (tema anterior), veamos cómo integrar estos componentes en un sistema RAG completo.

### 🏗️ Arquitectura de RAG Clásico

**Componentes necesarios:**

| Componente | Tecnología Recomendada | Propósito |
|------------|------------------------|-----------|
| **📄 Fuente de datos** | Azure Blob Storage, SharePoint | Almacenar documentos originales |
| **✂️ Chunking** | LangChain, Semantic Kernel, Custom | Fragmentar documentos |
| **🔢 Embedding model** | Azure OpenAI `text-embedding-ada-002` | Generar vectores |
| **🗄️ Vector store** | Azure AI Search | Almacenar e indexar vectores |
| **🔍 Retrieval** | Azure AI Search Query API | Buscar chunks relevantes |
| **🤖 LLM** | Azure OpenAI GPT-4o, GPT-4 | Generar respuestas |
| **🎨 Orquestación** | LangChain, Semantic Kernel, Custom | Coordinar pipeline |

---

### 📝 Paso a Paso: Construyendo RAG Clásico

#### **Paso 1: Preparación de Datos (Indexing)**

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import AzureOpenAIEmbeddings
from azure.search.documents import SearchClient

# 1.1 Cargar documentos
documents = load_documents_from_blob_storage("container/docs/")

# 1.2 Fragmentar (Chunking)
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1024,           # Tamaño del chunk en caracteres
    chunk_overlap=200,         # Solapamiento entre chunks
    separators=["\n\n", "\n", ". ", " ", ""]
)
chunks = text_splitter.split_documents(documents)

# 1.3 Generar embeddings
embeddings_model = AzureOpenAIEmbeddings(
    model="text-embedding-ada-002",
    azure_endpoint="https://your-openai.openai.azure.com/"
)

# 1.4 Indexar en Azure AI Search
search_client = SearchClient(...)
for chunk in chunks:
    vector = embeddings_model.embed_query(chunk.page_content)
    
    search_client.upload_documents([{
        "id": chunk.metadata["id"],
        "content": chunk.page_content,
        "contentVector": vector,
        "metadata": chunk.metadata
    }])
```

---

#### **Paso 2: Recuperación (Retrieval)**

```python
from azure.search.documents.models import VectorizedQuery

def retrieve_relevant_chunks(user_question: str, top_k: int = 5):
    # 2.1 Vectorizar pregunta del usuario
    question_vector = embeddings_model.embed_query(user_question)
    
    # 2.2 Búsqueda híbrida (vector + keyword)
    results = search_client.search(
        search_text=user_question,                    # Keyword search
        vector_queries=[VectorizedQuery(
            vector=question_vector,
            k_nearest_neighbors=top_k,
            fields="contentVector"
        )],
        select=["content", "metadata"],
        query_type="semantic",                        # Semantic ranking
        semantic_configuration_name="my-semantic-config",
        top=top_k
    )
    
    # 2.3 Extraer chunks
    chunks = [doc["content"] for doc in results]
    return chunks
```

---

#### **Paso 3: Generación (Generation)**

```python
from openai import AzureOpenAI

def generate_answer(user_question: str, context_chunks: list[str]):
    # 3.1 Construir prompt con contexto
    context = "\n\n".join(context_chunks)
    
    system_message = """Eres un asistente útil que responde preguntas basándote 
    SOLO en el contexto proporcionado. Si la respuesta no está en el contexto, 
    di que no tienes esa información."""
    
    user_message = f"""Contexto:
{context}

Pregunta: {user_question}

Responde de forma concisa y precisa, citando las fuentes cuando sea posible."""

    # 3.2 Llamar al LLM
    client = AzureOpenAI(...)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        temperature=0.3  # Baja temperatura para respuestas más precisas
    )
    
    return response.choices[0].message.content
```

---

#### **Paso 4: Pipeline Completo**

```python
def rag_pipeline(user_question: str):
    # 1. Retrieve
    print(f"🔍 Buscando información relevante para: {user_question}")
    relevant_chunks = retrieve_relevant_chunks(user_question, top_k=5)
    
    # 2. Generate
    print(f"🤖 Generando respuesta...")
    answer = generate_answer(user_question, relevant_chunks)
    
    # 3. Return with citations
    return {
        "answer": answer,
        "sources": relevant_chunks,
        "num_sources": len(relevant_chunks)
    }

# Uso
result = rag_pipeline("¿Cuál es nuestra política de vacaciones para remotos?")
print(f"📝 Respuesta: {result['answer']}")
print(f"📚 Basado en {result['num_sources']} fuentes")
```

---


## ✨ Mejores Técnicas de RAG

> 💡 **Contexto:** Estas técnicas te ayudarán a mejorar significativamente la calidad de tu sistema RAG.

### 🎯 1. Optimización del Chunking

| Técnica | Descripción | Cuándo usar |
|---------|-------------|-------------|
| **📏 Tamaño adaptativo** | Ajusta chunk size según tipo documento | PDFs técnicos vs emails cortos |
| **🔗 Solapamiento (overlap)** | 10-20% overlap entre chunks | Preservar contexto entre fragmentos |
| **📚 Chunking semántico** | Divide por secciones/párrafos lógicos | Documentos bien estructurados |
| **🎯 Metadata enrichment** | Añade metadata (título, sección, fecha) | Mejorar filtrado y relevancia |

```python
# Chunking avanzado con metadata
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1024,
    chunk_overlap=200,
    separators=["\n## ", "\n\n", "\n", ". ", " ", ""],  # Respeta estructura Markdown
    length_function=len
)

chunks = splitter.create_documents(
    texts=[document.content],
    metadatas=[{
        "source": document.source,
        "title": document.title,
        "section": document.section,
        "page": document.page,
        "date": document.date
    }]
)
```

---

### 🔍 2. Búsqueda Híbrida (Hybrid Search)

**Combina múltiples tipos de búsqueda** para maximizar recall y precisión:

```python
from azure.search.documents.models import VectorizedQuery

# Búsqueda híbrida: Vector + Keyword + Semantic
results = search_client.search(
    search_text=user_question,              # 1. Keyword search (BM25)
    
    vector_queries=[VectorizedQuery(        # 2. Vector search (cosine similarity)
        vector=question_embedding,
        k_nearest_neighbors=50,             # Recupera top 50 iniciales
        fields="contentVector"
    )],
    
    query_type="semantic",                  # 3. Semantic ranking (L2 reranking)
    semantic_configuration_name="default",
    
    filter="metadata/date ge 2024-01-01",   # 4. Filtros metadata
    
    top=5                                    # Devuelve top 5 finales
)
```

**Por qué híbrida es mejor:**
- ✅ **Vector search:** Captura similitud semántica ("perro" ≈ "canino")
- ✅ **Keyword search:** Captura coincidencias exactas (nombres, IDs, códigos)
- ✅ **Semantic ranking:** Reordena por relevancia contextual
- ✅ **Filtros:** Refina por metadata (fecha, categoría, autor)

---

### 🏆 3. Reranking Semántico

**Mejora la calidad de resultados** reordenando por relevancia semántica:

```python
# Azure AI Search - Configurar semantic ranking
index_schema = {
    "name": "company-docs",
    "fields": [...],
    "semantic": {
        "configurations": [{
            "name": "default",
            "prioritizedFields": {
                "titleField": {"fieldName": "title"},
                "contentFields": [{"fieldName": "content"}],
                "keywordsFields": [{"fieldName": "tags"}]
            }
        }]
    }
}

# En la query, semantic ranking reordena automáticamente
results = search_client.search(
    search_text=query,
    query_type="semantic",
    semantic_configuration_name="default",
    top=5
)
```

**Impacto:**
- 📈 Mejora precisión en **30-50%** vs solo keyword search
- 🎯 Identifica el contenido **semánticamente más relevante**, no solo coincidencias de palabras

---

### 💾 4. Caché de Embeddings

**Reduce costos y latencia** almacenando embeddings de queries frecuentes:

```python
import hashlib
from functools import lru_cache

class EmbeddingCache:
    def __init__(self, embedding_model):
        self.model = embedding_model
        self.cache = {}
    
    def get_embedding(self, text: str):
        # Crear hash del texto
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        # Buscar en caché
        if text_hash in self.cache:
            print(f"✅ Cache hit para: {text[:50]}...")
            return self.cache[text_hash]
        
        # Generar embedding si no está en caché
        print(f"❌ Cache miss - generando embedding...")
        embedding = self.model.embed_query(text)
        self.cache[text_hash] = embedding
        
        return embedding

# Uso
cache = EmbeddingCache(embeddings_model)
embedding = cache.get_embedding(user_question)  # Primera vez: genera
embedding = cache.get_embedding(user_question)  # Segunda vez: caché
```

**Beneficios:**
- 💰 Ahorra **$0.0001 por 1K tokens** (Azure OpenAI embeddings)
- ⚡ Reduce latencia de **~200ms a <1ms**

---

### 📊 5. Query Expansion (Expansión de Consultas)

**Genera múltiples variaciones** de la pregunta para mejorar cobertura:

```python
from openai import AzureOpenAI

def expand_query(original_query: str) -> list[str]:
    client = AzureOpenAI(...)
    
    prompt = f"""Genera 3 variaciones de la siguiente pregunta para mejorar 
    la búsqueda de información relevante. Las variaciones deben:
    - Usar sinónimos
    - Reformular de forma diferente
    - Mantener la intención original
    
    Pregunta original: {original_query}
    
    Devuelve solo las 3 variaciones, una por línea."""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # Modelo rápido/barato para esta tarea
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    variations = response.choices[0].message.content.strip().split("\n")
    return [original_query] + variations

# Ejemplo
query = "¿Política vacaciones empleados remotos?"
expanded = expand_query(query)
# Resultado:
# ["¿Política vacaciones empleados remotos?",
#  "¿Cuántos días libres tienen los trabajadores a distancia?",
#  "¿Qué dice el reglamento sobre tiempo off para teletrabajo?",
#  "¿Permisos y ausencias para empleados que trabajan desde casa?"]

# Buscar con todas las variaciones
all_results = []
for variant in expanded:
    results = retrieve_relevant_chunks(variant, top_k=3)
    all_results.extend(results)

# Deduplicar y reranquear
unique_results = deduplicate_and_rerank(all_results, top_k=5)
```

---

## ✅ Mejores Prácticas - Resumen

| Práctica | Recomendación | 🎯 |
|----------|---------------|-----|
| **📏 Chunk Size** | Usa 512-1024 tokens; ajusta según tipo documento | ✓ |
| **🔍 Búsqueda** | Siempre usa **híbrida** (vector + keyword) + semantic ranking | ✓ |
| **🎯 Top-K** | Empieza con 3-5 chunks; aumenta si respuestas incompletas | ✓ |
| **❄️ Temperature** | Usa 0.0-0.3 para RAG (respuestas factuales) | ✓ |
| **📊 Overlap** | 10-20% overlap en chunking para preservar contexto | ✓ |
| **🏷️ Metadata** | Añade metadata rica (fecha, autor, categoría) para filtrado | ✓ |
| **💾 Caché** | Cachea embeddings de queries frecuentes | ✓ |


> 💡 **Tip Final:** RAG es un sistema iterativo. Empieza simple (RAG clásico básico), mide resultados, e incrementa complejidad solo donde sea necesario. No uses Agentic Retrieval si RAG clásico cubre tus necesidades.

---

## 📚 Referencias

| Fuente | Enlace |
|--------|--------|
| 🔗 **Retrieval-Augmented Generation Overview (Microsoft)** | [Ver documentación](https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview) |
| 🔗 **Agentic Retrieval Overview (Microsoft)** | [Ver documentación](https://learn.microsoft.com/azure/search/agentic-retrieval-overview) |
| 🔗 **Azure OpenAI On Your Data** | [Ver documentación](https://learn.microsoft.com/azure/ai-services/openai/concepts/use-your-data) |
| 🔗 **Vector Search Overview** | [Ver documentación](https://learn.microsoft.com/azure/search/vector-search-overview) |
| 🔗 **Foundry IQ - Knowledge Layer** | [Ver documentación](https://learn.microsoft.com/azure/ai-foundry/agents/concepts/what-is-foundry-iq) |
| 🔗 **Semantic Kernel Vector Stores** | [Ver documentación](https://learn.microsoft.com/semantic-kernel/concepts/vector-store-connectors/) |

---

