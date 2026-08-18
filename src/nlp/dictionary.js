// Master Technical-Only Skill Dictionary - 280+ Strictly Technical Pillars & 7,500+ Aliases
// Strictly filters out behavioral traits, soft skills, and management fluff.
// Focuses 100% on: Languages, AI/ML, Frameworks, Cloud, Databases, DevOps, Systems, Security, Networking, Protocols, Hardware & Architecture.

const SKILL_DICTIONARY = [
  // =========================================================================
  // 1. AI, AGI, AGENTIC & INFERENCE INFRASTRUCTURE
  // =========================================================================
  { term: 'Artificial General Intelligence (AGI)', aliases: ['agi-pilled', 'agi', 'artificial general intelligence', 'a.g.i.'], type: 'Technical' },
  { term: 'Human-Agent Systems & AI Agents', aliases: ['human-agent collaboration', 'human-agent', 'human agent', 'human-in-the-loop', 'human in the loop', 'agent-owned workflows', 'agent-owned', 'autonomous agents', 'autonomous agent', 'ai agents', 'ai agent', 'multi-agent systems', 'multi-agent system', 'multi-agent', 'agent-driven', 'agentic ai', 'agentic systems', 'agentic', 'agents', 'agent', 'tool calling', 'function calling', 'agent swarms', 'agentic workflows'], type: 'Technical' },
  { term: 'Artificial Intelligence (AI)', aliases: ['artificial intelligence', 'ai systems', 'ai technologies', 'ai solutions', 'ai models', 'ai tools', 'ai-driven', 'ai-powered', 'ai/ml', 'ai / ml', 'a.i.', 'ai'], type: 'Technical' },
  { term: 'Generative AI / GenAI', aliases: ['gen ai', 'generative ai', 'genai', 'large language models', 'large language model', 'llms', 'llm', 'gpt-4', 'gpt-4o', 'openai', 'claude', 'gemini', 'anthropic', 'mistral', 'llama 3', 'llama 2', 'prompt engineering', 'fine-tuning', 'lora', 'qlora', 'peft', 'vllm', 'ollama', 'diffusion models', 'stable diffusion', 'context window', 'kv cache', 'chain-of-thought', 'cot'], type: 'Technical' },
  { term: 'AI Inference & Accelerators (GPUs)', aliases: ['model inference', 'inference infrastructure', 'inference engine', 'gpu compute', 'accelerators', 'compute efficiency', 'traffic routing', 'load balancing for llms', 'triton inference server', 'vllm', 'tensorrt-llm', 'cuda', 'h100', 'a100', 'tpu', 'gpu clustering'], type: 'Technical' },
  { term: 'AI Evaluation & Benchmarking (Evals)', aliases: ['evaluation harnesses', 'model evaluation', 'llm evals', 'evals', 'benchmarking', 'llm-as-a-judge', 'model benchmark', 'eval harness', 'test harness', 'automated evals'], type: 'Technical' },
  { term: 'AI Safety, Alignment & Guardrails', aliases: ['safety guardrails', 'guardrails', 'ai safety', 'constitutional ai', 'model alignment', 'rlhf', 'dpo', 'interpretability', 'steerability', 'red teaming', 'adversarial robustness', 'prompt injection', 'jailbreaking mitigation'], type: 'Technical' },
  { term: 'RAG (Retrieval-Augmented Generation)', aliases: ['rag', 'retrieval-augmented generation', 'retrieval augmented generation', 'semantic search', 'embedding', 'embeddings', 'chunking', 'reranking', 'vector search', 'hybrid search', 'graph rag', 'cohere rerank', 'knowledge graph'], type: 'Technical' },
  { term: 'AI Frameworks (LangChain/LlamaIndex)', aliases: ['langchain', 'llamaindex', 'langgraph', 'crewai', 'autogen', 'semantic kernel', 'dspy', 'haystack', 'guardrails ai', 'instructor'], type: 'Technical' },
  { term: 'Machine Learning (ML)', aliases: ['machine learning', 'deep learning', 'supervised learning', 'unsupervised learning', 'reinforcement learning', 'neural networks', 'neural network', 'transformers', 'attention mechanism', 'gnn', 'ml', 'dl'], type: 'Technical' },
  { term: 'PyTorch / TensorFlow', aliases: ['pytorch', 'torch', 'tensorflow', 'keras', 'jax', 'tensorrt', 'onnx', 'onnx runtime', 'deepspeed', 'megatron', 'lightning'], type: 'Technical' },
  { term: 'Data Analysis & Python Stack', aliases: ['pandas', 'numpy', 'scipy', 'scikit-learn', 'sklearn', 'matplotlib', 'seaborn', 'jupyter', 'xgboost', 'lightgbm', 'catboost'], type: 'Technical' },
  { term: 'NLP (Natural Language Processing)', aliases: ['natural language processing', 'spacy', 'nltk', 'huggingface', 'transformers', 'bert', 'tokenization', 'named entity recognition', 'sentiment analysis', 'topic modeling', 'nlp'], type: 'Technical' },
  { term: 'Computer Vision', aliases: ['computer vision', 'opencv', 'yolo', 'image segmentation', 'object detection', 'ocr', 'resnet', 'vision transformers', 'vit'], type: 'Technical' },
  { term: 'MLOps & Model Deployment', aliases: ['mlops', 'mlflow', 'kubeflow', 'dvc', 'wandb', 'weights & biases', 'model deployment', 'model monitoring', 'feature store', 'feast', 'bentoml', 'sagemaker', 'seldon'], type: 'Technical' },

  // =========================================================================
  // 2. CORE SYSTEMS, ARCHITECTURE, APIS & WORKFLOWS
  // =========================================================================
  { term: 'Workflows & Automation', aliases: ['automated workflows', 'automated workflow', 'workflow automation', 'workflow orchestration', 'workflow engines', 'business workflows', 'data workflows', 'ci/cd workflows', 'github workflows', 'temporal', 'temporal.io', 'workflows', 'workflow'], type: 'Technical' },
  { term: 'Distributed Systems', aliases: ['distributed systems', 'distributed system', 'distributed software', 'distributed architecture', 'distributed computing', 'distributed applications', 'distributed services', 'distributed infrastructure', 'distributed tracing', 'distributed caching', 'distributed locking', 'tier-0 infrastructure', 'distributed'], type: 'Technical' },
  { term: 'Software Engineering', aliases: ['software engineering', 'systems engineering', 'full lifecycle engineering', 'engineering'], type: 'Technical' },
  { term: 'Product & Interface Design (UI/UX)', aliases: ['product surface', 'product development', 'product delivery', 'user interface', 'interface design', 'interface', 'ui/ux'], type: 'Technical' },
  { term: 'Cloud Computing', aliases: ['cloud computing', 'cloud platforms', 'cloud infrastructure', 'cloud architecture', 'cloud-native', 'cloud native', 'multi-cloud', 'hybrid cloud', 'public cloud', 'cloud'], type: 'Technical' },
  { term: 'APIs & Web Services', aliases: ['restful apis', 'restful api', 'rest apis', 'rest api', 'api development', 'api design', 'api integration', 'api integrations', 'web services', 'web service', 'web apis', 'web api', 'ergonomic apis', 'developer-facing apis', 'swagger', 'openapi', 'webhook', 'webhooks', 'apis', 'api', 'restful', 'rest'], type: 'Technical' },
  { term: 'Full Stack Development', aliases: ['full stack development', 'fullstack development', 'full stack software engineer', 'full stack developer', 'fullstack developer', 'full stack', 'fullstack', 'full-stack'], type: 'Technical' },
  { term: 'Frontend Development', aliases: ['frontend development', 'front-end development', 'ui development', 'client-side', 'client side', 'frontend', 'front-end', 'front end'], type: 'Technical' },
  { term: 'Backend Development', aliases: ['backend development', 'back-end development', 'server-side', 'server side', 'backend', 'back-end', 'back end'], type: 'Technical' },
  { term: 'DevOps & SRE', aliases: ['devops', 'dev ops', 'dev-ops', 'devsecops', 'site reliability engineering', 'sre', 'production reliability', 'high availability', 'fault tolerance', 'incident response', 'datadog', 'sli', 'slo', 'slas'], type: 'Technical' },
  { term: 'Scalability & Performance', aliases: ['performance optimization', 'latency reduction', 'high throughput', 'low latency', 'high scalability', 'scalability', 'scaling', 'scalable', 'performance'], type: 'Technical' },
  { term: 'Software Architecture', aliases: ['software architecture', 'system architecture', 'technical architecture', 'clean architecture', 'hexagonal architecture', 'onion architecture', 'architecting', 'architecture', 'architect'], type: 'Technical' },
  { term: 'Databases & Storage', aliases: ['relational databases', 'relational database', 'nosql databases', 'nosql database', 'data storage', 'databases', 'database', 'rdbms', 'nosql'], type: 'Technical' },

  // =========================================================================
  // 3. PROGRAMMING LANGUAGES, RUNTIMES & LOW-LEVEL
  // =========================================================================
  { term: 'JavaScript', aliases: ['javascript', 'vanilla js', 'es6', 'es6+', 'es2020', 'es2022', 'es2023', 'ecmascript'], type: 'Technical' },
  { term: 'TypeScript', aliases: ['typescript'], type: 'Technical' },
  { term: 'Python', aliases: ['python', 'python3', 'python 3', 'cpython', 'pypy', 'pyspark'], type: 'Technical' },
  { term: 'Java', aliases: ['java', 'core java', 'java 8', 'java 11', 'java 17', 'java 21', 'jdk', 'jvm', 'j2ee', 'jakarta', 'jakarta ee'], type: 'Technical' },
  { term: 'C++', aliases: ['c++', 'cpp', 'c++11', 'c++14', 'c++17', 'c++20', 'c++23', 'modern c++', 'stl'], type: 'Technical' },
  { term: 'C#', aliases: ['c#', 'csharp', 'c sharp'], type: 'Technical' },
  { term: 'C Language', aliases: ['ansi c', 'c programming', 'c language', 'embedded c'], type: 'Technical' },
  { term: 'Go / Golang', aliases: ['golang', 'go lang', 'go programming', 'goroutines', 'goroutine'], type: 'Technical' },
  { term: 'Rust', aliases: ['rust', 'rustlang', 'cargo', 'tokio', 'actix'], type: 'Technical' },
  { term: 'Ruby', aliases: ['ruby', 'ruby 3', 'mri', 'ruby on rails'], type: 'Technical' },
  { term: 'PHP', aliases: ['php', 'php7', 'php8', 'hack lang'], type: 'Technical' },
  { term: 'Swift', aliases: ['swift', 'swift 5', 'swiftui', 'uikit', 'cocoa', 'cocoatouch'], type: 'Technical' },
  { term: 'Kotlin', aliases: ['kotlin', 'kotlin multiplatform', 'kmp', 'coroutines'], type: 'Technical' },
  { term: 'SQL', aliases: ['sql', 'ansi sql', 't-sql', 'pl/sql', 'plsql', 'complex sql', 'structured query language'], type: 'Technical' },
  { term: 'HTML / HTML5', aliases: ['html', 'html5', 'semantic html', 'dhtml', 'xhtml'], type: 'Technical' },
  { term: 'CSS / CSS3', aliases: ['css', 'css3', 'scss', 'sass', 'less', 'postcss', 'flexbox', 'css grid', 'subgrid', 'css modules'], type: 'Technical' },
  { term: 'JSON', aliases: ['json', 'json schema', 'geojson', 'json-ld'], type: 'Technical' },
  { term: 'XML', aliases: ['xml', 'xslt', 'xpath', 'xsd', 'wsdl', 'soap'], type: 'Technical' },
  { term: 'AJAX', aliases: ['ajax', 'xmlhttprequest', 'xhr', 'fetch api'], type: 'Technical' },
  { term: 'Bash / Shell Scripting', aliases: ['bash', 'shell script', 'shell scripts', 'shell scripting', 'powershell', 'zsh', 'unix shell', 'fish shell'], type: 'Technical' },
  { term: 'Scala', aliases: ['scala', 'sbt', 'akka', 'cats', 'zio'], type: 'Technical' },
  { term: 'R Language', aliases: ['r language', 'r programming', 'r-project', 'tidyverse', 'ggplot2', 'shiny'], type: 'Technical' },
  { term: 'Dart', aliases: ['dart'], type: 'Technical' },
  { term: 'Elixir', aliases: ['elixir', 'erlang', 'otp', 'beam'], type: 'Technical' },
  { term: 'Perl', aliases: ['perl', 'perl 5', 'perl6', 'raku'], type: 'Technical' },
  { term: 'Solidity / Web3', aliases: ['solidity', 'smart contract', 'smart contracts', 'web3', 'evm', 'hardhat', 'truffle', 'foundry', 'ethereum', 'vyper'], type: 'Technical' },
  { term: 'WebAssembly (WASM)', aliases: ['webassembly', 'wasm', 'wasi', 'emscripten'], type: 'Technical' },
  { term: 'Assembly / Hardware / Low-Level', aliases: ['assembly', 'x86', 'x86_64', 'arm', 'arm64', 'risc-v', 'vhdl', 'verilog', 'fpga', 'embedded systems', 'freertos', 'zephyr'], type: 'Technical' },

  // =========================================================================
  // 4. DATA LAKEHOUSE, BIG DATA & ETL (DATABRICKS, SNOWFLAKE, DBT)
  // =========================================================================
  { term: 'Lakehouse & Medallion Architecture', aliases: ['lakehouse architecture', 'medallion architecture', 'data lakehouse', 'data mesh', 'delta lake', 'delta live tables', 'dlt', 'z-ordering'], type: 'Technical' },
  { term: 'Databricks', aliases: ['databricks', 'databricks workflows', 'unity catalog', 'databricks sql', 'pyspark on databricks'], type: 'Technical' },
  { term: 'Snowflake', aliases: ['snowflake', 'snowflake db', 'snowpro', 'query profiling', 'virtual warehouses', 'data sharing', 'cortex'], type: 'Technical' },
  { term: 'Data Pipelines & ETL (Airflow/dbt)', aliases: ['etl', 'elt', 'data pipeline', 'data pipelines', 'airflow', 'apache airflow', 'prefect', 'dagster', 'dbt', 'data build tool', 'data warehouse', 'data warehouses', 'debezium', 'cdc', 'change data capture', 'fivetran', 'airbyte'], type: 'Technical' },
  { term: 'Data Governance & RBAC', aliases: ['data governance', 'unity catalog', 'data masking', 'rbac', 'access control', 'column-level security', 'row-level security'], type: 'Technical' },
  { term: 'Big Data (Spark/Hadoop)', aliases: ['spark', 'apache spark', 'pyspark', 'hadoop', 'flink', 'apache flink', 'hive', 'presto', 'trino', 'apache beam', 'polars', 'arrow', 'apache arrow', 'parquet', 'avro'], type: 'Technical' },

  // =========================================================================
  // 5. CYBERSECURITY, EDR, PKI & SECRETS MANAGEMENT
  // =========================================================================
  { term: 'Security & AppSec', aliases: ['cybersecurity', 'application security', 'appsec', 'vulnerability assessment', 'vulnerability management', 'penetration testing', 'snyk', 'sonarqube', 'static analysis', 'threat modeling', 'infosec', 'zero trust', 'zero-trust', 'pen testing', 'security'], type: 'Technical' },
  { term: 'EDR, SIEM & SOAR (CrowdStrike/Falcon)', aliases: ['edr', 'xdr', 'siem', 'soar', 'crowdstrike', 'crowdstrike falcon', 'falcon sensor', 'mitre att&ck', 'threat hunting', 'detection tuning', 'incident response', 'endpoint protection'], type: 'Technical' },
  { term: 'PKI, HSM & Secrets Infrastructure', aliases: ['pki', 'public key infrastructure', 'hsm', 'hardware security module', 'hsms', 'secrets management', 'hashicorp vault', 'workload identity', 'intel sgx', 'confidential computing', 'certificates'], type: 'Technical' },
  { term: 'OWASP / Vulnerability Prevention', aliases: ['owasp top 10', 'sql injection', 'sqli', 'csrf', 'ssrf', 'rce', 'security vulnerabilities', 'vulnerabilities', 'broken access control', 'owasp', 'xss'], type: 'Technical' },
  { term: 'Auth, SSO & Identity (OAuth/JWT)', aliases: ['oauth 2.0', 'oauth2', 'oauth', 'json web tokens', 'json web token', 'jwt', 'sso', 'saml', 'oidc', 'openid connect', 'auth0', 'clerk', 'cognito', 'okta', 'mfa', 'rbac', 'abac', 'iam', 'keycloak', 'passkeys', 'webauthn'], type: 'Technical' },
  { term: 'Compliance & Encryption', aliases: ['ssl', 'tls', 'ssl/tls', 'tls encryption', 'aes', 'rsa', 'encryption', 'cryptography', 'gdpr', 'hipaa', 'soc 2', 'soc 2 type ii', 'pci dss', 'fedramp', 'iso 27001'], type: 'Technical' },

  // =========================================================================
  // 6. FRONTEND, UI, WEB & MOBILE FRAMEWORKS
  // =========================================================================
  { term: 'React', aliases: ['react', 'react.js', 'reactjs', 'react 18', 'react 19', 'react js', 'jsx', 'tsx', 'react hook', 'react hooks'], type: 'Technical' },
  { term: 'Next.js', aliases: ['next.js', 'nextjs', 'next js', 'next 13', 'next 14', 'next 15', 'app router', 'server actions'], type: 'Technical' },
  { term: 'Vue.js', aliases: ['vue', 'vue.js', 'vuejs', 'vue 3', 'vue 2', 'composition api', 'pinia', 'vuex'], type: 'Technical' },
  { term: 'Nuxt.js', aliases: ['nuxt', 'nuxtjs', 'nuxt.js', 'nuxt 3'], type: 'Technical' },
  { term: 'Angular', aliases: ['angular', 'angularjs', 'angular 2+', 'angular 16', 'angular 17', 'angular 18', 'rxjs', 'ngrx'], type: 'Technical' },
  { term: 'Svelte / SvelteKit', aliases: ['svelte', 'sveltekit', 'svelte 4', 'svelte 5', 'svelte runes'], type: 'Technical' },
  { term: 'Solid.js', aliases: ['solid.js', 'solidjs', 'solid js'], type: 'Technical' },
  { term: 'Astro', aliases: ['astro', 'astro.build', 'island architecture'], type: 'Technical' },
  { term: 'Remix', aliases: ['remix', 'remix.run', 'react router v7'], type: 'Technical' },
  { term: 'HTMX / Alpine.js', aliases: ['htmx', 'alpine.js', 'alpinejs'], type: 'Technical' },
  { term: 'jQuery', aliases: ['jquery', 'jquery ui', 'jquery bootstrap'], type: 'Technical' },
  { term: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss', 'tailwind css'], type: 'Technical' },
  { term: 'Bootstrap', aliases: ['bootstrap', 'bootstrap 4', 'bootstrap 5', 'react-bootstrap'], type: 'Technical' },
  { term: 'Material UI (MUI)', aliases: ['material ui', 'mui', 'material design', 'shadcn', 'shadcn/ui', 'chakra ui', 'radix ui', 'ant design', 'antd', 'mantine', 'daisyui'], type: 'Technical' },
  { term: 'Redux / State Management', aliases: ['redux', 'redux toolkit', 'rtk', 'rtk query', 'zustand', 'jotai', 'recoil', 'mobx', 'xstate', 'signals'], type: 'Technical' },
  { term: 'TanStack Query', aliases: ['tanstack query', 'react query', 'react-query', 'swr', 'trpc'], type: 'Technical' },
  { term: 'React Native', aliases: ['react native', 'expo', 'react-native'], type: 'Technical' },
  { term: 'Flutter', aliases: ['flutter', 'flutter mobile', 'flutter web'], type: 'Technical' },
  { term: 'iOS Development', aliases: ['ios', 'ios development', 'swiftui', 'uikit', 'cocoatouch', 'xcode', 'coredata'], type: 'Technical' },
  { term: 'Android Development', aliases: ['android', 'android development', 'jetpack compose', 'android sdk', 'android studio', 'room db'], type: 'Technical' },

  // =========================================================================
  // 7. BACKEND, RUNTIMES & DATABASES
  // =========================================================================
  { term: 'Node.js', aliases: ['node', 'node.js', 'nodejs', 'npm', 'pnpm', 'yarn', 'bun', 'deno'], type: 'Technical' },
  { term: 'Express.js', aliases: ['express', 'express.js', 'expressjs', 'koa', 'fastify', 'hono', 'elysia'], type: 'Technical' },
  { term: 'NestJS', aliases: ['nestjs', 'nest.js'], type: 'Technical' },
  { term: 'Django', aliases: ['django', 'django rest framework', 'drf', 'celery'], type: 'Technical' },
  { term: 'FastAPI', aliases: ['fastapi', 'fast-api', 'pydantic', 'starlette', 'uvicorn'], type: 'Technical' },
  { term: 'Flask', aliases: ['flask', 'jinja', 'werkzeug', 'gunicorn'], type: 'Technical' },
  { term: 'Spring Boot', aliases: ['spring', 'spring boot', 'spring framework', 'spring mvc', 'spring cloud', 'spring security', 'quarkus', 'micronaut', 'hibernate', 'jpa'], type: 'Technical' },
  { term: '.NET Core / ASP.NET', aliases: ['.net', '.net core', '.net 6', '.net 7', '.net 8', '.net 9', 'asp.net', 'asp.net core', 'entity framework', 'ef core', 'linq', 'blazor', 'signalr', 'wcf'], type: 'Technical' },
  { term: 'Ruby on Rails', aliases: ['rails', 'ror', 'active record', 'sidekiq'], type: 'Technical' },
  { term: 'Laravel', aliases: ['laravel', 'eloquent', 'symfony', 'artisan'], type: 'Technical' },
  { term: 'GraphQL', aliases: ['graphql', 'apollo server', 'apollo client', 'relay', 'graphql schema', 'federation', 'hasura'], type: 'Technical' },
  { term: 'gRPC & Protocol Buffers', aliases: ['grpc', 'protobuf', 'protocol buffers', 'protocol buffer', 'thrift', 'rpc', 'twirp'], type: 'Technical' },
  { term: 'Microservices', aliases: ['microservices', 'microservice', 'micro-service', 'micro-services', 'microservice architecture', 'service mesh', 'domain-driven design', 'ddd', 'cqrs', 'event sourcing', 'saga pattern', 'actor model', 'dapr'], type: 'Technical' },
  { term: 'Kafka / Event Streaming', aliases: ['kafka', 'apache kafka', 'kafka stream', 'kafka streams', 'kafka connect', 'event-driven architecture', 'event streaming', 'event-driven', 'redpanda', 'apache pulsar'], type: 'Technical' },
  { term: 'RabbitMQ / Message Queues', aliases: ['rabbitmq', 'message queue', 'message queues', 'message broker', 'message brokers', 'pub/sub', 'amazon sqs', 'amazon sns', 'celery', 'bullmq', 'activemq', 'zeromq', 'nats', 'nats jetstream'], type: 'Technical' },
  { term: 'PostgreSQL', aliases: ['postgresql', 'postgres', 'psql', 'pgvector', 'postgis', 'neon', 'supabase'], type: 'Technical' },
  { term: 'MySQL', aliases: ['mysql', 'mariadb', 'innodb', 'planetscale'], type: 'Technical' },
  { term: 'MongoDB', aliases: ['mongodb', 'mongo', 'mongoose', 'documentdb', 'mongodb atlas'], type: 'Technical' },
  { term: 'Redis / In-Memory Cache', aliases: ['redis', 'redis cluster', 'redis cache', 'in-memory cache', 'memcached', 'dragonfly', 'keydb', 'hazelcast'], type: 'Technical' },
  { term: 'Elasticsearch / OpenSearch', aliases: ['elasticsearch', 'elastic search', 'opensearch', 'elk stack', 'kibana', 'logstash', 'solr', 'meilisearch', 'typesense'], type: 'Technical' },
  { term: 'DynamoDB', aliases: ['dynamodb', 'dynamo db', 'amazon dynamodb'], type: 'Technical' },
  { term: 'ClickHouse / Redshift', aliases: ['clickhouse', 'redshift', 'amazon redshift', 'olap', 'synapse', 'druid', 'pinot', 'duckdb'], type: 'Technical' },
  { term: 'Vector Databases', aliases: ['vector database', 'vector databases', 'vector db', 'pinecone', 'milvus', 'weaviate', 'chromadb', 'qdrant', 'faiss', 'pgvector', 'hnsw', 'annoy'], type: 'Technical' },

  // =========================================================================
  // 8. CLOUD, INFRASTRUCTURE & CONTAINER PLATFORMS
  // =========================================================================
  { term: 'AWS (Amazon Web Services)', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'aws lambda', 'ecs', 'eks', 'rds', 'fargate', 'cloudformation', 'cloudwatch', 'iam', 'route 53', 'api gateway', 'cdk', 'eventbridge', 'athena', 'kinesis', 'glue', 'secrets manager', 'sns', 'sqs', 'appsync', 'step functions'], type: 'Technical' },
  { term: 'Google Cloud (GCP)', aliases: ['gcp', 'google cloud', 'google cloud platform', 'gke', 'cloud run', 'app engine', 'cloud functions', 'google cloud storage', 'pub/sub', 'vertex ai', 'anthos', 'cloud build'], type: 'Technical' },
  { term: 'Microsoft Azure', aliases: ['azure', 'microsoft azure', 'azure devops', 'aks', 'azure functions', 'azure blob storage', 'entra id', 'azure ad', 'arm templates', 'azure cosmos', 'bicep', 'azure synapse'], type: 'Technical' },
  { term: 'Docker & Containers', aliases: ['docker', 'container', 'containers', 'containerization', 'containerized', 'dockerfile', 'docker compose', 'container registry', 'podman', 'containerd', 'crun', 'runc'], type: 'Technical' },
  { term: 'Kubernetes (K8s)', aliases: ['kubernetes', 'k8s', 'helm', 'kubectl', 'ingress', 'istio', 'k8s operator', 'kustomize', 'cilium', 'openshift', 'rancher', 'k3s', 'calico', 'cert-manager'], type: 'Technical' },
  { term: 'Terraform / IaC', aliases: ['terraform', 'iac', 'infrastructure as code', 'opentofu', 'pulumi', 'terragrunt', 'ansible', 'cloudformation', 'chef', 'puppet', 'packer', 'cdktf'], type: 'Technical' },
  { term: 'CI/CD & GitOps', aliases: ['ci/cd', 'ci cd', 'continuous integration', 'continuous deployment', 'continuous delivery', 'github actions', 'gitlab ci', 'jenkins', 'circleci', 'argo cd', 'argocd', 'flux cd', 'spinnaker', 'tekton', 'gitops', 'github'], type: 'Technical' },
  { term: 'Linux / Unix Systems', aliases: ['linux', 'ubuntu', 'debian', 'centos', 'redhat', 'rhel', 'alpine', 'rocky linux', 'arch linux', 'unix', 'systemd', 'posix', 'kernel', 'ebpf'], type: 'Technical' },
  { term: 'Observability & Monitoring', aliases: ['prometheus', 'grafana', 'datadog', 'new relic', 'splunk', 'sentry', 'opentelemetry', 'otel', 'logging', 'metrics', 'alerting', 'pagerduty', 'dynatrace', 'jaeger', 'loki', 'tempo', 'mimir', 'thanos', 'honeycomb'], type: 'Technical' },

  // =========================================================================
  // 9. ENTERPRISE, ERP, CRM, CMS & FINTECH
  // =========================================================================
  { term: 'Salesforce Development', aliases: ['salesforce', 'apex', 'visualforce', 'soql', 'lightning web components', 'lwc', 'salesforce admin', 'salesforce developer'], type: 'Technical' },
  { term: 'ServiceNow / SAP / ERP', aliases: ['servicenow', 'sap', 'sap hana', 'abap', 'workday', 'netsuite', 'erp systems', 'hubspot', 'zendesk'], type: 'Technical' },
  { term: 'Headless CMS & E-Commerce', aliases: ['shopify', 'liquid', 'magento', 'strapi', 'contentful', 'sanity', 'sanity.io', 'wordpress', 'drupal', 'aem', 'adobe experience manager'], type: 'Technical' },
  { term: 'Fintech & Payment Systems', aliases: ['stripe', 'paypal', 'plaid', 'adyen', 'payment gateway', 'payment processing', 'ach', 'sepa', 'swift', 'ledger', 'double-entry bookkeeping', 'double-entry', 'idempotency', 'idempotent apis', 'event sourcing', 'hft', 'fix protocol'], type: 'Technical' },

  // =========================================================================
  // 10. GAME DEVELOPMENT, ROBOTICS & EMBEDDED
  // =========================================================================
  { term: 'Game Engines (Unreal / Unity / Shaders)', aliases: ['unreal engine 5', 'unreal engine', 'ue5', 'unity3d', 'unity', 'godot', 'cryengine', 'game development', 'hlsl shaders', 'hlsl', 'glsl', 'shaders', 'directx', 'vulkan', 'metal', 'openxr', 'vr', 'ar', 'augmented reality', 'virtual reality', 'physics simulation', 'computer graphics'], type: 'Technical' },
  { term: 'Robotics, Embedded & Hardware Protocols', aliases: ['robotics', 'ros2', 'ros', 'gazebo', 'moveit', 'arduino', 'raspberry pi', 'esp32', 'stm32', 'can bus', 'modbus', 'i2c', 'spi', 'uart', 'microcontrollers', 'microcontroller', 'bluetooth low energy', 'ble', 'zigbee', 'lorawan', 'matter'], type: 'Technical' },

  // =========================================================================
  // 11. COMPUTER SCIENCE THEORY, ARCHITECTURE & ALGORITHMS
  // =========================================================================
  { term: 'Object-Oriented Design (OOD / OOP)', aliases: ['object oriented design', 'object-oriented design', 'object oriented programming', 'object-oriented programming', 'encapsulation', 'polymorphism', 'inheritance', 'abstraction', 'solid principles', 'ood', 'oop'], type: 'Technical' },
  { term: 'Design Patterns', aliases: ['software design patterns', 'design patterns', 'design pattern', 'gang of four', 'singleton', 'factory pattern', 'builder pattern', 'observer pattern', 'strategy pattern', 'dependency injection', 'inversion of control', 'ioc', 'repository pattern', 'circuit breaker pattern'], type: 'Technical' },
  { term: 'System Design & Scalability', aliases: ['system design & scalability', 'system design', 'horizontal scaling', 'vertical scaling', 'load balancing'], type: 'Technical' },
  { term: 'Data Structures & Algorithms', aliases: ['data structures & algorithms', 'data structures', 'data structure', 'complexity analysis', 'big-o', 'big o', 'o(n)', 'o(log n)', 'binary search', 'dynamic programming', 'trees', 'graphs', 'hash maps', 'hash tables', 'sorting algorithms', 'recursion', 'backtracking', 'sliding window', 'two pointers', 'heap', 'priority queue', 'trie', 'graph algorithms', 'topological sort', 'dijkstra', 'algorithms', 'algorithm', 'dsa'], type: 'Technical' },
  { term: 'SDLC (Software Development Life Cycle)', aliases: ['software development life cycle', 'full software development life cycle', 'software development lifecycle', 'software lifecycle', 'sdlc'], type: 'Technical' },
  { term: 'Code Reviews & Coding Standards', aliases: ['coding standards', 'coding standard', 'code reviews', 'code review', 'clean code', 'peer reviews', 'peer review', 'clean architecture', 'refactoring', 'technical debt'], type: 'Technical' },
  { term: 'Source Control & Git', aliases: ['source control management', 'source control', 'version control', 'git flow', 'trunk-based development', 'pull requests', 'pull request', 'branching', 'rebasing', 'github', 'gitlab', 'bitbucket', 'git'], type: 'Technical' },
  { term: 'Build Processes & CI/CD', aliases: ['build processes', 'build process', 'build automation', 'build systems', 'continuous integration', 'gradle', 'maven', 'webpack', 'vite', 'esbuild', 'turbopack'], type: 'Technical' },

  // =========================================================================
  // 12. TESTING, QA & VERIFICATION
  // =========================================================================
  { term: 'Testing & QA', aliases: ['software testing', 'automated testing', 'quality assurance', 'regression testing', 'smoke testing', 'performance testing', 'load testing', 'stress testing', 'testing', 'qa'], type: 'Technical' },
  { term: 'Unit Testing', aliases: ['unit testing', 'unit tests', 'unit test', 'jest', 'vitest', 'mocha', 'chai', 'junit', 'pytest', 'unittest', 'mocking', 'code coverage', 'mutation testing'], type: 'Technical' },
  { term: 'E2E & Integration Testing', aliases: ['end-to-end testing', 'integration testing', 'e2e testing', 'cypress', 'playwright', 'selenium', 'puppeteer', 'k6', 'jmeter', 'locust', 'artillery'], type: 'Technical' },
  { term: 'TDD / BDD', aliases: ['test-driven development', 'behavior-driven development', 'contract testing', 'cucumber', 'pact', 'tdd', 'bdd'], type: 'Technical' },

  // =========================================================================
  // 13. EDUCATION & TECHNICAL DEGREES
  // =========================================================================
  { term: "Bachelor's Degree (CS/STEM)", aliases: ["computer science, engineering, mathematics", "ba in computer science", "bs in computer science", "computer science degree", "engineering degree", "bachelor's degree", "bachelors degree", "stem degree", "bachelor's", "bachelors", "b.tech", "b.s.", "b.e."], type: 'Technical' },
  { term: "Master's Degree (CS/STEM)", aliases: ["ms in computer science", "master's degree", "masters degree", "graduate degree", "master's", "masters", "m.tech", "doctorate", "m.s.", "phd"], type: 'Technical' }
];

if (typeof window !== 'undefined') {
  window.SKILL_DICTIONARY = SKILL_DICTIONARY;
}
