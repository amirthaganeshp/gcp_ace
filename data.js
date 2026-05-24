// GCP ACE Exam Study Guide Database - Comprehensive Ranga Karnam 28minutes Alignment
const GCP_DATABASE = {
  services: [
    // --- COMPUTE SERVICES ---
    {
      id: "compute-engine",
      name: "Google Compute Engine (GCE)",
      category: "Compute",
      description: "Secure, customizable virtual machines (VMs) running on Google's infrastructure.",
      keyFeatures: [
        "Predefined and custom machine types (CPU, RAM, GPUs)",
        "Persistent Disks (Standard, Balanced, SSD) and ephemeral Local SSDs",
        "Managed Instance Groups (MIGs) with autoscaling and auto-healing capabilities",
        "Spot VMs with massive cost savings (up to 91%)"
      ],
      whenToUse: [
        "Legacy applications requiring direct OS/kernel level modifications.",
        "Monolithic web hosts or custom third-party software.",
        "High-performance workloads needing heavy GPUs or specific CPU setups."
      ],
      whenNotToUse: [
        "Simple containerized microservices (use Cloud Run or GKE instead to save on overhead).",
        "Serverless functions running on quick event-triggers (use Cloud Functions).",
        "Static web hosting (use Cloud Storage or Firebase Hosting)."
      ],
      cliCommands: [
        { command: "gcloud compute instances create [VM_NAME] --zone=[ZONE] --machine-type=e2-medium --subnet=[SUBNET]", desc: "Creates a new GCE VM instance." },
        { command: "gcloud compute instances stop [VM_NAME] --zone=[ZONE]", desc: "Stops a GCE instance to halt compute billing." }
      ],
      examTips: [
        "Local SSDs are highly performant but ephemeral; data is lost when instance is stopped or deleted.",
        "MIGs use Instance Templates to deploy identical instances across multiple zones for HA."
      ]
    },
    {
      id: "app-engine",
      name: "Google App Engine (GAE)",
      category: "Compute",
      description: "Fully-managed Platform-as-a-Service (PaaS) to build and deploy web applications without managing underlying servers.",
      keyFeatures: [
        "Standard Environment: Sandboxed runtimes, extremely fast startup, scales to zero, specific language versions.",
        "Flexible Environment: Docker container-based, custom runtimes and OS libs, scales to minimum of 1 instance (no scale-to-zero)."
      ],
      whenToUse: [
        "Monolithic web applications using standard runtime stacks (Node.js, Python, Java).",
        "Rapid prototyping where containerization is not desired or familiar."
      ],
      whenNotToUse: [
        "Applications requiring complex microservice container orchestrations (use GKE or Cloud Run).",
        "Protocols other than HTTP/HTTPS/WebSockets (Standard environment does not support raw TCP/UDP)."
      ],
      cliCommands: [
        { command: "gcloud app create --region=[LOCATION]", desc: "Initializes an irreversible App Engine instance in your project." },
        { command: "gcloud app deploy app.yaml", desc: "Deploys your application code to App Engine using configurations in app.yaml." }
      ],
      examTips: [
        "App Engine locations are PERMANENT and irreversible within a GCP Project.",
        "Traffic Splitting: GAE can split incoming traffic between multiple versions based on Cookie or IP address."
      ]
    },
    {
      id: "gke",
      name: "Google Kubernetes Engine (GKE)",
      category: "Compute",
      description: "Secured and managed Kubernetes service for deploying, managing, and scaling containerized applications.",
      keyFeatures: [
        "Autopilot mode: Google manages nodes, provisioning, security, and cluster scaling.",
        "Standard mode: Full operational control over underlying VM nodes and node pools.",
        "Horizontal Pod Autoscaling (HPA) and cluster-level autoscaling."
      ],
      whenToUse: [
        "Complex containerized microservice architectures needing orchestrations.",
        "Stateful containerized systems utilizing Kubernetes native APIs."
      ],
      whenNotToUse: [
        "Simple stateless single-container APIs (use Cloud Run for cheaper, simpler serverless deployment).",
        "Infrequent event-driven scripting workloads."
      ],
      cliCommands: [
        { command: "gcloud container clusters create-auto my-cluster --region=[REGION]", desc: "Creates a fully-managed GKE Autopilot cluster." },
        { command: "gcloud container clusters get-credentials my-cluster --region=[REGION]", desc: "Retrieves credentials to control the cluster using kubectl." }
      ],
      examTips: [
        "Autopilot is standard best practice; you are charged per running pod rather than for VM nodes.",
        "Node Pools allow a Standard cluster to run VM node groups with different machine specs (e.g. GPUs)."
      ]
    },
    {
      id: "cloud-functions",
      name: "Cloud Functions",
      category: "Compute",
      description: "Serverless execution environment for building and connecting single-purpose, event-driven functions.",
      keyFeatures: [
        "Scale-to-zero model with zero idle charges.",
        "Event triggers (HTTP, Pub/Sub, Cloud Storage, Firestore).",
        "Supports Node.js, Python, Go, Java, and .NET."
      ],
      whenToUse: [
        "Real-time file processing (e.g., generating image thumbnails upon bucket upload).",
        "Webhook processors, simple APIs, or data pipeline extraction steps."
      ],
      whenNotToUse: [
        "Complex monolithic web systems with extensive endpoints.",
        "Long-running batch workloads (maximum execution time is typically 60 mins)."
      ],
      cliCommands: [
        { command: "gcloud functions deploy [VM_NAME] --runtime=python310 --trigger-http --allow-unauthenticated", desc: "Deploys a Python HTTP-triggered function." }
      ],
      examTips: [
        "Functions are completely stateless. Local scratch space (/tmp) is held in memory and wiped out when function scales down."
      ]
    },
    {
      id: "cloud-run",
      name: "Cloud Run",
      category: "Compute",
      description: "Fully managed serverless platform that enables you to run containerized applications directly.",
      keyFeatures: [
        "Scales automatically from 0 to N instances based on concurrent requests.",
        "Billed strictly down to the nearest 100ms only during request execution.",
        "Supports any programming language or OS library that runs in a container."
      ],
      whenToUse: [
        "Stateless web applications, REST APIs, and microservices inside containers.",
        "Rapid scale-to-zero hosting to eliminate costs of idle development boxes."
      ],
      whenNotToUse: [
        "Applications needing continuous background processing or direct kernel module additions.",
        "Systems that cannot containerize."
      ],
      cliCommands: [
        { command: "gcloud run deploy [VM_NAME] --source=. --region=[REGION] --allow-unauthenticated", desc: "Builds, registers, and deploys code to Cloud Run with public access." }
      ],
      examTips: [
        "A single container instance handles up to 250 requests concurrently, unlike AWS Lambda (1 request per container)."
      ]
    },

    // --- STORAGE SERVICES ---
    {
      id: "cloud-storage",
      name: "Cloud Storage (GCS)",
      category: "Storage",
      description: "Globally durable, highly scalable object storage system for structured or unstructured files.",
      keyFeatures: [
        "Storage Classes: Standard (hot), Nearline (30+ days), Coldline (90+ days), Archive (365+ days).",
        "Object Lifecycle Management (auto-delete or auto-transition to cheaper classes).",
        "Object Versioning to protect against accidental modifications/deletes."
      ],
      whenToUse: [
        "Storing backup files, log archives, analytics datasets, or static media (images, videos).",
        "Static website hosting (HTML, CSS, JS)."
      ],
      whenNotToUse: [
        "Dynamic block storage for database transaction logs (use Persistent Disks).",
        "Highly-transactional ACID relational storage."
      ],
      cliCommands: [
        { command: "gcloud storage buckets create gs://[BUCKET_NAME] --location=[LOCATION] --storage-class=nearline", desc: "Creates a Nearline bucket." },
        { command: "gcloud storage cp test.txt gs://[BUCKET_NAME]/", desc: "Copies a local file to GCS." }
      ],
      examTips: [
        "Signed URLs provide secure, temporary access to GCS objects for users without Google Accounts.",
        "Nearline, Coldline, and Archive have minimum retention durations; deleting objects early incurs cost penalties."
      ]
    },
    {
      id: "persistent-disks",
      name: "Persistent Disks (Standard, Balanced, SSD)",
      category: "Storage",
      description: "Durable, high-performance block storage volumes attached directly to GCE VMs.",
      keyFeatures: [
        "Standard (pd-standard): Efficient HDD storage for sequential access.",
        "Balanced (pd-balanced): Balanced performance/cost for general workloads.",
        "SSD (pd-ssd): High IOPS for transactional database files.",
        "Multi-writer mode allows multiple VMs to attach in Read-Only (or Read-Write for select clustered filesystems)."
      ],
      whenToUse: [
        "Primary OS system drives for virtual machine instances.",
        "High-performance databases needing localized transaction logs."
      ],
      whenNotToUse: [
        "Shared storage among hundreds of independent web servers (use Cloud Storage or Cloud Filestore)."
      ],
      cliCommands: [
        { command: "gcloud compute disks resize [DISK_NAME] --size=200GB --zone=[ZONE]", desc: "Resizes an attached disk on-the-fly without downtime." }
      ],
      examTips: [
        "Persistent Disks can be resized on-the-fly, but you must manually expand the filesystem inside the VM operating system."
      ]
    },
    {
      id: "local-ssds",
      name: "Local SSDs",
      category: "Storage",
      description: "High-performance, transient physical SSD storage directly attached to the GCE VM host server.",
      keyFeatures: [
        "Ultra-low latency and extremely high IOPS compared to Persistent Disks.",
        "Attached physically to the host machine slot.",
        "Billed by device increment sizes of 375GB."
      ],
      whenToUse: [
        "Flash cache layers, scratch spaces, or temporary database indexes.",
        "High-performance computing (HPC) staging directories."
      ],
      whenNotToUse: [
        "Long-term persistent data storage (data is wiped if the VM stops or is terminated)."
      ],
      cliCommands: [],
      examTips: [
        "Local SSD data is preserved during VM live migrations but is strictly deleted when the VM instance stops or terminates."
      ]
    },
    {
      id: "cloud-filestore",
      name: "Cloud Filestore",
      category: "Storage",
      description: "Fully managed Network Attached Storage (NAS) providing shared NFS file systems.",
      keyFeatures: [
        "Fully POSIX-compliant file system storage.",
        "Multi-writer support: concurrent mount points across multiple GCE VMs or GKE nodes.",
        "Sub-millisecond latency for traditional file operations."
      ],
      whenToUse: [
        "Enterprise migrations of legacy applications requiring traditional shared directory directories.",
        "Active web server assets shared simultaneously among multiple server instances."
      ],
      whenNotToUse: [
        "Low-cost static archiving (use Cloud Storage which is much cheaper)."
      ],
      cliCommands: [
        { command: "gcloud filestore instances create my-nfs --zone=[ZONE] --tier=STANDARD --file-share=name='vol1',capacity=1TB --network=name='[PROJECT]'", desc: "Creates a standard Filestore instance." }
      ],
      examTips: [
        "Filestore represents a Network File System (NFSv3) sharing system, allowing standard file locks."
      ]
    },

    // --- DATABASE SERVICES ---
    {
      id: "cloud-sql",
      name: "Cloud SQL",
      category: "Database",
      description: "Fully-managed relational database service compatible with MySQL, PostgreSQL, and SQL Server.",
      keyFeatures: [
        "Automated backups, replication, patching, and minor version updates.",
        "High Availability (HA) using active-standby zones inside the same region.",
        "Read replicas to scale out read operations across zones/regions."
      ],
      whenToUse: [
        "Traditional web applications (WordPress, Magento, Django) requiring full ACID compatibility.",
        "Migrating existing on-premise relational SQL systems to GCP with zero code changes."
      ],
      whenNotToUse: [
        "Massive global relational systems demanding multi-region write scalability (use Cloud Spanner).",
        "Analytic write-heavy IoT logs (use BigQuery or Bigtable)."
      ],
      cliCommands: [
        { command: "gcloud sql instances create my-db --database-version=POSTGRES_14 --tier=db-custom-2-7680 --region=[REGION]", desc: "Creates a PostgreSQL database." }
      ],
      examTips: [
        "HA configuration sets up a standby in another AZ in the SAME region, which automatically assumes the primary IP on failure."
      ]
    },
    {
      id: "cloud-spanner",
      name: "Cloud Spanner",
      category: "Database",
      description: "Enterprise-grade, globally scalable, strongly consistent relational database service.",
      keyFeatures: [
        "Combines relational features (SQL, ACID, Joins) with horizontal NoSQL scale.",
        "Strong global consistency with synchronous multi-region writes.",
        "99.999% SLA availability."
      ],
      whenToUse: [
        "Mission-critical global financial transactions, inventory, and billing ledgers.",
        "Relational schemas growing past the storage capabilities of regional Cloud SQL (>64TB)."
      ],
      whenNotToUse: [
        "Small systems under 100GB (Spanner is highly expensive due to minimum node requirements)."
      ],
      cliCommands: [],
      examTips: [
        "Spanner uses Spanner Node pools to scale. If a question mentions relational, SQL, global scale, and strong consistency, Spanner is always the answer."
      ]
    },
    {
      id: "firestore",
      name: "Cloud Datastore / Firestore",
      category: "Database",
      description: "Highly scalable, serverless NoSQL document database optimized for web, mobile, and IoT applications.",
      keyFeatures: [
        "Serverless: auto-scales from zero to millions of concurrent reads/writes.",
        "Document model: JSON-like documents grouped into collections.",
        "Native mode (real-time sync for client apps) and Datastore mode (optimized for high server-side throughput)."
      ],
      whenToUse: [
        "Mobile and web application backends (storing shopping carts, user profiles, game states).",
        "Hierarchical JSON-structured data."
      ],
      whenNotToUse: [
        "Heavy SQL analytic operations or extensive cross-table JOINs (use BigQuery).",
        "IoT telemetry write ingestion at extreme scales (use Bigtable)."
      ],
      cliCommands: [],
      examTips: [
        "Firestore scales to zero, meaning zero active compute cost when there is no traffic."
      ]
    },
    {
      id: "cloud-bigtable",
      name: "Cloud Bigtable",
      category: "Database",
      description: "Google's NoSQL wide-column database service, optimized for massive low-latency write ingestion.",
      keyFeatures: [
        "Consistent sub-10ms performance at scale.",
        "Scales to petabytes of data.",
        "Compatible with Apache HBase APIs."
      ],
      whenToUse: [
        "IoT streams, financial ticks, time-series metrics, clickstreams, and marketing tracking data.",
        "Heavy write workloads exceeding several terabytes."
      ],
      whenNotToUse: [
        "Small datasets (<1TB) due to continuous active node pricing overheads.",
        "Relational SQL requirements."
      ],
      cliCommands: [],
      examTips: [
        "Row Key Design: Avoid sequential timestamps as start keys to prevent hotspotting on specific nodes."
      ]
    },
    {
      id: "memorystore",
      name: "Cloud Memorystore (Redis, Memcached)",
      category: "Database",
      description: "Fully managed, in-memory data store service providing high-performance sub-millisecond caching layers.",
      keyFeatures: [
        "Redis: Advanced data structures, replication, HA, and Pub/Sub mechanics.",
        "Memcached: Highly scalable, multi-threaded simple key-value cache system."
      ],
      whenToUse: [
        "Web application session caches, leaderboards, or query cache shields to protect backend databases.",
        "In-memory sub-millisecond data requirements."
      ],
      whenNotToUse: [
        "Persistent primary storage for transactional business ledgers."
      ],
      cliCommands: [],
      examTips: [
        "Memorystore is an in-memory cache. Choose Redis for high availability, snapshots, and complex structures. Choose Memcached for simple scaling."
      ]
    },

    // --- NETWORKING SERVICES ---
    {
      id: "vpc",
      name: "Virtual Private Cloud (VPC)",
      category: "Networking",
      description: "Managed, globally scalable logical network partition for GCP resources.",
      keyFeatures: [
        "VPC network scope is Global; it spans all available regions.",
        "Subnets are regional boundaries containing allocated IP ranges.",
        "Stateful Firewall rules filter resource traffic flows."
      ],
      whenToUse: [
        "All cloud compute environments require a VPC network to establish secure traffic boundaries."
      ],
      whenNotToUse: [],
      cliCommands: [
        { command: "gcloud compute networks create my-vpc --subnet-mode=custom", desc: "Creates a secure custom VPC network." }
      ],
      examTips: [
        "Custom subnet mode VPC is recommended best practice. Auto mode creates subnets in every single region automatically, causing IP overlap risks."
      ]
    },
    {
      id: "vpc-peering",
      name: "VPC Peering",
      category: "Networking",
      description: "Securely connects two completely independent VPC networks, enabling direct internal IP communication.",
      keyFeatures: [
        "Traffic remains entirely on Google's private network backbone (no public internet transit).",
        "Direct connection without adding gateway/router bottlenecks.",
        "Administered across different GCP organizations."
      ],
      whenToUse: [
        "Connecting distinct internal projects or systems belonging to different entities/departments without VPC centralization."
      ],
      whenNotToUse: [
        "VPC networks with overlapping IP ranges (peering will fail)."
      ],
      cliCommands: [],
      examTips: [
        "VPC Peering is non-transitive: if VPC A is peered with B, and B with C, A is NOT peered with C."
      ]
    },
    {
      id: "shared-vpc",
      name: "Shared VPC",
      category: "Networking",
      description: "Enables a single host project to share regional subnets with other service projects.",
      keyFeatures: [
        "Centralized administration of network properties (CIDR, firewalls, routing) in a Host Project.",
        "Service Projects can deploy compute VMs into the shared subnets without having network admin rights."
      ],
      whenToUse: [
        "Large enterprises wanting to centralize network security and routing rules while delegating developer workloads."
      ],
      whenNotToUse: [
        "Organizations wanting completely decentralized, independent team network control."
      ],
      cliCommands: [],
      examTips: [
        "Shared VPC requires a designated Shared VPC Admin. It bridges project boundaries, unlike VPC Peering."
      ]
    },
    {
      id: "cloud-vpn",
      name: "Cloud VPN (HA VPN, Classic)",
      category: "Networking",
      description: "Connects on-premises networks to GCP VPCs securely through encrypted IPSec tunnels.",
      keyFeatures: [
        "HA VPN: 99.99% SLA using two active interfaces with distinct external IP addresses in a single region.",
        "Classic VPN: Legacy single-interface tunnel (99.9% SLA).",
        "Supports dynamic routing with Border Gateway Protocol (BGP)."
      ],
      whenToUse: [
        "Establishing quick, secure, encrypted hybrid-cloud network connections to on-premise offices."
      ],
      whenNotToUse: [
        "Workloads requiring multi-gigabit continuous throughput that cannot tolerate latency fluctuations (use Interconnect instead)."
      ],
      cliCommands: [],
      examTips: [
        "HA VPN requires two public IP addresses and two active IPSec tunnels from your local peer gateway to achieve the 99.99% SLA."
      ]
    },
    {
      id: "cloud-interconnect",
      name: "Cloud Interconnect (Dedicated, Partner)",
      category: "Networking",
      description: "Provides high-throughput, low-latency physical fiber links from corporate networks to GCP.",
      keyFeatures: [
        "Dedicated Interconnect: Direct physical connection to a Google co-location facility (10Gbps or 100Gbps circuits).",
        "Partner Interconnect: Connection via a third-party service provider (50Mbps to 10Gbps capacities)."
      ],
      whenToUse: [
        "Enterprise architectures transferring massive analytics data continuously.",
        "Workloads demanding consistent network performance and sub-10ms latency."
      ],
      whenNotToUse: [
        "Small systems that can rely on quick internet-routed Cloud VPN tunnels."
      ],
      cliCommands: [],
      examTips: [
        "Interconnect does NOT encrypt traffic by default. If encryption is required, you must run IPSec tunnels over the Interconnect link."
      ]
    },
    {
      id: "cloud-load-balancing",
      name: "Cloud Load Balancing",
      category: "Networking",
      description: "Fully managed, scalable load distribution system to route user traffic to the closest compute resource.",
      keyFeatures: [
        "Global Load Balancers (HTTP(S), SSL Proxy, TCP Proxy) using a single external IP.",
        "Regional Load Balancers (Network Load Balancer, Internal Load Balancer).",
        "Integrates with Cloud CDN for edge caching."
      ],
      whenToUse: [
        "Distributing heavy global HTTP/HTTPS traffic to autoscaling GCE VM groups.",
        "Terminating SSL certificates securely at Google's network edge."
      ],
      whenNotToUse: [],
      cliCommands: [],
      examTips: [
        "Understand that the External Application Load Balancer is Layer 7 (HTTP/S), and the Network Load Balancer is Layer 4 (TCP/UDP)."
      ]
    },
    {
      id: "cloud-dns",
      name: "Cloud DNS",
      category: "Networking",
      description: "Reliable, low-latency, resilient domain name lookup service running on Google's infrastructure.",
      keyFeatures: [
        "Public zones accessible to the internet.",
        "Private zones accessible only within selected internal VPC networks.",
        "Supports DNSSEC to prevent spoofing."
      ],
      whenToUse: [
        "Publishing domain records for public websites.",
        "Internal name resolution inside private VPC systems."
      ],
      whenNotToUse: [],
      cliCommands: [
        { command: "gcloud dns managed-zones create my-zone --description='Private Zone' --dns-name='internal.net.' --visibility=private --networks='[PROJECT]'", desc: "Creates a private DNS zone." }
      ],
      examTips: [
        "Private DNS zones are attached to specific VPCs and cannot be resolved from outside unless VPN/Interconnect configurations are present."
      ]
    },

    // --- ANALYTICS & BIG DATA ---
    {
      id: "bigquery",
      name: "BigQuery",
      category: "Analytics",
      description: "Serverless, highly scalable, cost-effective multi-cloud data warehouse designed for business agility.",
      keyFeatures: [
        "Standard ANSI SQL query support.",
        "Separate compute and storage scaling.",
        "Built-in machine learning (BQML) and geospatial analysis."
      ],
      whenToUse: [
        "Analyzing petabytes of structured log files or transactional database exports.",
        "Fast SQL analysis and business intelligence reporting (Looker/Tableau integrations)."
      ],
      whenNotToUse: [
        "Online Transaction Processing (OLTP) demanding high-frequency small row updates (use Cloud SQL)."
      ],
      cliCommands: [
        { command: "bq mk --dataset --location=US [PROJECT]:my_dataset", desc: "Creates a BigQuery dataset." },
        { command: "bq query --use_legacy_sql=false 'SELECT name, COUNT(*) FROM `my-proj.my_dataset.users` GROUP BY name'", desc: "Runs an SQL query." }
      ],
      examTips: [
        "Partitioning and Clustering tables by columns significantly reduces query scanning costs and improves query performance."
      ]
    },
    {
      id: "cloud-dataflow",
      name: "Cloud Dataflow",
      category: "Analytics",
      description: "Fully managed serverless data processing service running Apache Beam pipelines.",
      keyFeatures: [
        "Unified programming model for batch and real-time streaming pipelines.",
        "Automatic resource provisioning and autoscaling.",
        "Guaranteed exactly-once processing."
      ],
      whenToUse: [
        "Extract, Transform, Load (ETL) data pipelines.",
        "Real-time processing of streaming event logs (e.g. Pub/Sub to BigQuery)."
      ],
      whenNotToUse: [
        "Traditional Hadoop/Spark jobs that need simple lift-and-shift migration (use Dataproc instead)."
      ],
      cliCommands: [],
      examTips: [
        "Dataflow handles autoscaling workers dynamically. Choose it for modern serverless ETL pipelines."
      ]
    },
    {
      id: "cloud-dataproc",
      name: "Cloud Dataproc",
      category: "Analytics",
      description: "Managed spark and Hadoop service to run open-source data analytics software clusters.",
      keyFeatures: [
        "Spin up fully-configured clusters in less than 90 seconds.",
        "Dynamic scaling using preemptible/Spot VMs to save costs.",
        "Integration with Cloud Storage (GCS) as a persistent HDFS replacement."
      ],
      whenToUse: [
        "Lift-and-shift migrations of existing Hadoop, Spark, Pig, or Hive scripts to the cloud.",
        "Running large machine learning models using familiar open-source frameworks."
      ],
      whenNotToUse: [
        "Greenfield data pipeline designs (choose serverless Dataflow instead to avoid managing clusters)."
      ],
      cliCommands: [
        { command: "gcloud dataproc clusters create my-hadoop --region=[REGION] --num-workers=2 --worker-boot-disk-size=50GB", desc: "Spins up a Dataproc Hadoop cluster." }
      ],
      examTips: [
        "You can reduce Dataproc cost by choosing GCS (gs://) as your storage instead of native cluster HDFS, allowing you to delete clusters when jobs finish."
      ]
    },

    // --- INTEGRATION SERVICES ---
    {
      id: "pubsub",
      name: "Cloud Pub/Sub",
      category: "Integration",
      description: "Serverless asynchronous messaging service that decouples systems that produce events from systems that process them.",
      keyFeatures: [
        "At-least-once message delivery guarantees.",
        "Scales automatically to handle millions of messages per second.",
        "Supports push and pull subscription models."
      ],
      whenToUse: [
        "Decoupling microservice communications.",
        "Ingesting continuous IoT streams or user clickstream activity events for data pipeline stages."
      ],
      whenNotToUse: [
        "Relational transaction queues requiring absolute FIFO strict processing rules (Pub/Sub is typically out-of-order by default unless explicit ordering keys are used)."
      ],
      cliCommands: [
        { command: "gcloud pubsub topics create my-topic", desc: "Creates a Pub/Sub topic." },
        { command: "gcloud pubsub subscriptions create my-sub --topic=my-topic", desc: "Creates a pull subscription to the topic." }
      ],
      examTips: [
        "Messages are stored in Pub/Sub for up to 7 days by default. Subscribers pull messages or configure HTTP push webhooks."
      ]
    },

    // --- MANAGEMENT & SECURITY ---
    {
      id: "deployment-manager",
      name: "Google Cloud Deployment Manager",
      category: "Management",
      description: "Infrastructure-as-Code (IaC) tool that allows you to specify all project resources in declarative templates.",
      keyFeatures: [
        "YAML configuration files paired with Python or Jinja2 templates.",
        "Handles resource dependencies and creation order automatically."
      ],
      whenToUse: [
        "Automating repeatable, templated project deployments in a declarative format."
      ],
      whenNotToUse: [
        "Multi-cloud architectures where standard open-source tools like Terraform are preferred."
      ],
      cliCommands: [
        { command: "gcloud deployment-manager deployments create my-infra --config=config.yaml", desc: "Deploys resources defined in config.yaml." }
      ],
      examTips: [
        "Understand that Deployment Manager is GCP-native. For multi-cloud scenarios, the exam will usually point to Terraform."
      ]
    },
    {
      id: "iam",
      name: "Cloud Identity and Access Management (IAM)",
      category: "Security",
      description: "Authorizes who (identity) has what permissions (roles) to act on specific resources.",
      keyFeatures: [
        "Primitive roles (Owner, Editor, Viewer).",
        "Predefined roles: Google-managed roles targeting specific jobs (e.g. roles/storage.objectAdmin).",
        "Custom roles: User-defined granular permission configurations."
      ],
      whenToUse: [
        "Enforcing the principle of least privilege access across all team roles and resources."
      ],
      whenNotToUse: [],
      cliCommands: [
        { command: "gcloud projects add-iam-policy-binding [PROJECT] --member='user:dev@example.com' --role='roles/viewer'", desc: "Grants View permissions to a user." }
      ],
      examTips: [
        "IAM Policy inheritance is top-down: Org -> Folder -> Project -> Resource. Permissions cannot be removed at lower levels; they can only be added."
      ]
    },
    {
      id: "service-accounts",
      name: "Service Accounts",
      category: "Security",
      description: "Digital identity representing an application, VM, or service rather than a human user.",
      keyFeatures: [
        "Uses cryptographic keys to authorize access.",
        "Attached directly to Compute instances, Cloud Run services, or GKE nodes."
      ],
      whenToUse: [
        "Authorizing a Compute Engine VM to read from an internal Cloud Storage bucket securely without hardcoding access keys."
      ],
      whenNotToUse: [],
      cliCommands: [
        { command: "gcloud iam service-accounts create my-sa --display-name='App SA'", desc: "Creates a new service account." }
      ],
      examTips: [
        "Service Account User Role (`roles/iam.serviceAccountUser`): Essential permission needed by developers to associate/deploy service accounts onto VMs."
      ]
    },
    {
      id: "cloud-operations",
      name: "Cloud Operations Suite",
      category: "Operations",
      description: "Comprehensive performance monitoring, log aggregation, and error diagnostic tools for GCP workloads.",
      keyFeatures: [
        "Cloud Logging: Centralized capture and Log Router sinks.",
        "Cloud Monitoring: Metric tracking, uptime checks, dashboards, and alerts.",
        "Cloud Trace (latency profiling), Cloud Profiler (resource CPU/memory tracing), Error Reporting (aggregates crashes)."
      ],
      whenToUse: [
        "Centralizing system audits, tracking application latency, and setting up CPU utilization alerting policies."
      ],
      whenNotToUse: [],
      cliCommands: [
        { command: "gcloud logging read 'severity>=ERROR' --limit=5", desc: "Reads the 5 most recent error-level logs." }
      ],
      examTips: [
        "Ops Agent must be installed inside GCE VMs to monitor internal metrics like memory usage and disk capacity."
      ]
    }
  ],

  syllabus: [
    {
      id: "domain-1",
      title: "Domain 1: Compute Services & Architecture",
      description: "Choosing, planning, and deploying VM clusters, platforms, and serverless containers.",
      topics: [
        {
          id: "gce-topics",
          title: "Google Compute Engine (GCE)",
          summary: "Configuring VMs, setting machine sizes, deploying Managed Instance Groups (MIGs), and setting up autoscaling scripts.",
          whenToUse: [
            "Legacy monolithic workloads requiring dedicated OS controls.",
            "Workloads needing custom kernel modules, static IPs, and direct administrative controls."
          ],
          whenNotToUse: [
            "Infrequent execution scripts (use Cloud Functions).",
            "Modern microservices where server maintenance overhead is unwanted (use Cloud Run)."
          ],
          commands: [
            "gcloud compute instances create [VM_NAME] --zone=[ZONE] --machine-type=e2-medium --subnet=[SUBNET]",
            "gcloud compute instance-groups managed create my-mig --template=my-temp --size=2 --zone=[ZONE]"
          ]
        },
        {
          id: "gae-topics",
          title: "Google App Engine (GAE)",
          summary: "PaaS hosting for web apps. Choosing between Standard (sandboxed, fast boot, scale-to-zero) and Flexible (Docker containers, slower boot, minimum 1 active instance).",
          whenToUse: [
            "Web APIs and monolithic websites built in Python, Java, Node.js, Go where zero infrastructure management is wanted."
          ],
          whenNotToUse: [
            "Complex microservices utilizing container orchestration APIs."
          ],
          commands: [
            "gcloud app deploy app.yaml",
            "gcloud app services set-traffic default --splits=v2=0.5,v1=0.5"
          ]
        },
        {
          id: "gke-topics",
          title: "Google Kubernetes Engine (GKE)",
          summary: "Deploying managed Kubernetes. Understand Autopilot (Google manages node pools, charges per pod) vs Standard (User controls cluster VMs).",
          whenToUse: [
            "Orchestrating dense microservices requiring container clustering and complex network control."
          ],
          whenNotToUse: [
            "Simple single-container microservices with low operational overhead (use Cloud Run)."
          ],
          commands: [
            "gcloud container clusters create-auto my-cluster --region=[REGION]",
            "kubectl create deployment web-app --image=nginx:alpine"
          ]
        },
        {
          id: "functions-run",
          title: "Serverless Compute: Cloud Functions & Cloud Run",
          summary: "Stateless microservices. Functions are event-triggered snippets; Cloud Run is any containerized microservice that handles concurrent requests.",
          whenToUse: [
            "Event-driven scripts (Functions) or containerized REST APIs (Cloud Run) that need to scale automatically from 0 to N instances."
          ],
          whenNotToUse: [
            "Workloads exceeding execution time limits or requiring persistent background threads."
          ],
          commands: [
            "gcloud run deploy [VM_NAME] --source=. --region=[REGION] --allow-unauthenticated"
          ]
        }
      ]
    },
    {
      id: "domain-2",
      title: "Domain 2: Storage & Database Solutions",
      description: "Planning and configuring object files, block drives, and managed SQL/NoSQL databases.",
      topics: [
        {
          id: "gcs-topics",
          title: "Cloud Storage (GCS)",
          summary: "Unstructured object store. Choose storage classes (Standard, Nearline, Coldline, Archive) and lifecycle rules.",
          whenToUse: [
            "Storing database backups, compliance logs, static website files, and media files."
          ],
          whenNotToUse: [
            "Dynamic transactional database log directories."
          ],
          commands: [
            "gcloud storage buckets create gs://[BUCKET_NAME] --location=[LOCATION] --storage-class=nearline",
            "gcloud storage cp test.txt gs://[BUCKET_NAME]/"
          ]
        },
        {
          id: "disk-types",
          title: "Persistent Disks vs Local SSDs vs Filestore",
          summary: "VM Block storage and NFS. Persistent disks are durable and resizable; Local SSDs are transient but ultra-fast; Filestore is POSIX NFS shared storage.",
          whenToUse: [
            "Persistent Disks for standard GCE OS drives, Local SSDs for high-speed cache layers, Filestore for multi-writer NFS shared drives."
          ],
          whenNotToUse: [
            "Storing unstructured media files (use GCS to save on cost)."
          ],
          commands: [
            "gcloud compute disks resize [DISK_NAME] --size=200GB --zone=[ZONE]"
          ]
        },
        {
          id: "sql-spanner",
          title: "Relational Databases: Cloud SQL & Spanner",
          summary: "ACID databases. Cloud SQL handles PostgreSQL, MySQL, SQL Server regional apps. Spanner handles global scale SQL with multi-region strong consistency.",
          whenToUse: [
            "Standard business ledgers (Cloud SQL) or global transaction processing systems (Spanner)."
          ],
          whenNotToUse: [
            "IoT sensor logs (use Bigtable) or semi-structured JSON catalogs (use Firestore)."
          ],
          commands: [
            "gcloud sql instances create my-db --database-version=POSTGRES_14 --tier=db-custom-2-7680 --region=[REGION]"
          ]
        },
        {
          id: "nosql-caches",
          title: "NoSQL Databases & Cache: Firestore, Bigtable & Memorystore",
          summary: "Firestore stores document JSONs; Bigtable handles IoT time-series streams; Memorystore houses ultra-fast Redis/Memcached cache layers.",
          whenToUse: [
            "Mobile user profiles (Firestore), clickstream logging (Bigtable), or db queries acceleration (Memorystore)."
          ],
          whenNotToUse: [
            "Complex transactional schemas requiring deep relational JOIN models."
          ],
          commands: []
        }
      ]
    },
    {
      id: "domain-3",
      title: "Domain 3: Networking & Connectivity",
      description: "Designing subnets, peering connections, firewalls, and managed load balancers.",
      topics: [
        {
          id: "vpc-subnets",
          title: "VPC, Subnets & Firewalls",
          summary: "Defining subnets, managing IP allocation, configuring stateful firewall rules with target tags, and Private Google Access.",
          whenToUse: [
            "Constructing custom regional subnets and creating secure network boundaries for GCE VMs."
          ],
          whenNotToUse: [
            "Production environments should never use default 'Auto' subnet configurations."
          ],
          commands: [
            "gcloud compute networks create my-vpc --subnet-mode=custom",
            "gcloud compute networks subnets create [SUBNET] --network=my-vpc --region=[REGION] --range=10.0.1.0/24 --enable-private-ip-google-access"
          ]
        },
        {
          id: "shared-peering",
          title: "Shared VPC & VPC Peering",
          summary: "Interconnecting networks. Shared VPC shares host project subnets with service projects; VPC Peering connects separate VPCs securely without transitive routing.",
          whenToUse: [
            "Centralizing network controls in large corporations (Shared VPC) or linking independent system compartments (VPC Peering)."
          ],
          whenNotToUse: [
            "Peering networks with overlapping CIDR IP blocks."
          ],
          commands: []
        },
        {
          id: "hybrid-connectivity",
          title: "Hybrid Connections: VPN vs Interconnect",
          summary: "Connecting on-premise to GCP. HA VPN provides encrypted IPSec tunnels; Dedicated or Partner Interconnect provides high-capacity physical fiber links.",
          whenToUse: [
            "Quick hybrid-cloud encryption links (HA VPN) or massive continuous analytics ingestion pipelines (Interconnect)."
          ],
          whenNotToUse: [],
          commands: []
        },
        {
          id: "lb-dns",
          title: "Cloud Load Balancing & Cloud DNS",
          summary: "Traffic routing. Global External Application Load Balancers handle Layer 7 HTTP/S; Network Load Balancers handle Layer 4 TCP/UDP. Cloud DNS manages lookup zones.",
          whenToUse: [
            "Distributing global traffic across region groups (HTTP LB) or setting up internal DNS zones."
          ],
          whenNotToUse: [],
          commands: []
        }
      ]
    },
    {
      id: "domain-4",
      title: "Domain 4: Data, Analytics & Integration",
      description: "Managing big data analytical pipelines, message decoupling, and IaC deployment scripting.",
      topics: [
        {
          id: "big-data",
          title: "Big Data: BigQuery, Dataflow & Dataproc",
          summary: "Analyzing data. BigQuery is a serverless SQL data warehouse; Dataflow executes batch/stream ETL pipelines; Dataproc hosts Hadoop/Spark clusters.",
          whenToUse: [
            "SQL business reports (BigQuery), real-time log pipelines (Dataflow), or migrating legacy Spark scripts (Dataproc)."
          ],
          whenNotToUse: [],
          commands: [
            "bq mk --dataset [PROJECT]:my_dataset",
            "gcloud dataproc clusters create my-hadoop --region=[REGION]"
          ]
        },
        {
          id: "pubsub-topics",
          title: "Decoupling with Cloud Pub/Sub",
          summary: "Asynchronous publisher/subscriber queue system. Helps decouple independent application services.",
          whenToUse: [
            "Microservice message channels, log routing ingestion, and heavy event streaming."
          ],
          whenNotToUse: [
            "Strict traditional sequential databases requiring instant transaction order queuing."
          ],
          commands: [
            "gcloud pubsub topics create my-topic",
            "gcloud pubsub subscriptions create my-sub --topic=my-topic"
          ]
        },
        {
          id: "tooling-calc",
          title: "IaC, Tooling & Pricing Calculator",
          summary: "Infrastructure scripting. Deployment Manager automates resource blueprints natively. Config Connector runs GCP resources inside Kubernetes. Pricing Calculator estimates project bills.",
          whenToUse: [
            "Declarative deployment automation (Deployment Manager) or budgeting projected monthly cloud spend."
          ],
          whenNotToUse: [],
          commands: [
            "gcloud deployment-manager deployments create my-infra --config=config.yaml"
          ]
        }
      ]
    },
    {
      id: "domain-5",
      title: "Domain 5: Access, Security & Operations",
      description: "Configuring IAM roles, service accounts, audits, audit logs, and Cloud Operations Suite monitoring.",
      topics: [
        {
          id: "iam-sa",
          title: "IAM, Roles & Service Accounts",
          summary: "Identity controls. Understand Predefined least-privilege roles, Organization Policies, and how to assign Service Accounts to VMs without downloading keys.",
          whenToUse: [
            "Controlling project access permissions, making sure service processes can read buckets without persistent keys."
          ],
          whenNotToUse: [
            "Do not assign primitive roles (Owner, Editor) for day-to-day operations."
          ],
          commands: [
            "gcloud iam service-accounts create my-sa --display-name='App SA'",
            "gcloud projects add-iam-policy-binding [PROJECT] --member='serviceAccount:my-sa@[PROJECT].iam.gserviceaccount.com' --role='roles/storage.objectViewer'"
          ]
        },
        {
          id: "security-auditing",
          title: "Access Controls, KMS & OS Login",
          summary: "Securing resources. Access Control Lists (ACLs) manage granular object permissions; KMS manages encryption keys; OS Login connects SSH keys to IAM identities.",
          whenToUse: [
            "Providing granular individual GCS file access (ACLs) or managing Linux VM logins via user IAM accounts (OS Login)."
          ],
          whenNotToUse: [],
          commands: []
        },
        {
          id: "ops-suite",
          title: "Cloud Operations Suite (Logging & Monitoring)",
          summary: "Resource tracking. Cloud Logging routes audit logs; Cloud Monitoring tracks VM metrics (Ops Agent required for memory/disk alerts); Trace, Profiler, and Error Reporting diagnose issues.",
          whenToUse: [
            "Creating log sinks to GCS for 7-year archives or configuring database CPU spike alerts."
          ],
          whenNotToUse: [],
          commands: [
            "gcloud logging read 'severity>=ERROR' --limit=5"
          ]
        }
      ]
    }
  ],

  commands: [
    { id: "cmd-gcloud-init", category: "IAM & SDK Setup", title: "Initialize CLI", command: "gcloud init", description: "Links your GCP account and sets active project/region configs." },
    { id: "cmd-gcloud-config-set", category: "IAM & SDK Setup", title: "Set Active Project", command: "gcloud config set project [PROJECT_ID]", description: "Switches local CLI scope to target the specified project ID." },
    { id: "cmd-gce-create", category: "Compute Engine", title: "Create VM", command: "gcloud compute instances create [VM_NAME] --zone=[ZONE] --machine-type=e2-medium --subnet=[SUBNET]", description: "Launches a new virtual machine instance inside a custom subnet." },
    { id: "cmd-gce-stop", category: "Compute Engine", title: "Stop VM", command: "gcloud compute instances stop [VM_NAME] --zone=[ZONE]", description: "Gracefully stops a running VM to halt compute billing." },
    { id: "cmd-gcs-mb", category: "Cloud Storage", title: "Create Storage Bucket", command: "gcloud storage buckets create gs://[BUCKET_NAME] --location=[LOCATION] --storage-class=standard", description: "Creates a GCS object storage bucket in the specified location." },
    { id: "cmd-gcs-cp", category: "Cloud Storage", title: "Copy File", command: "gcloud storage cp [LOCAL_PATH] gs://[BUCKET_NAME]/[REMOTE_PATH]", description: "Copies a local file into a GCS bucket." },
    { id: "cmd-gke-credentials", category: "Kubernetes Engine", title: "Import GKE Credentials", command: "gcloud container clusters get-credentials [CLUSTER_NAME] --region=[REGION]", description: "Links kubectl command-line tool to control GKE cluster workloads." },
    { id: "cmd-kubectl-deploy", category: "Kubernetes Engine", title: "K8s Deployment", command: "kubectl create deployment [DEPLOYMENT_NAME] --image=[IMAGE]", description: "Deploys a container image as a Kubernetes workload." },
    { id: "cmd-bq-mk", category: "BigQuery", title: "Create Dataset", command: "bq mk --dataset --location=[LOCATION] [PROJECT_ID]:[DATASET_NAME]", description: "Initializes a structured dataset container inside BigQuery." },
    { id: "cmd-pubsub-create", category: "Integration Services", title: "Create Pub/Sub Topic", command: "gcloud pubsub topics create my-topic", description: "Creates a messaging topic in Pub/Sub." },
    { id: "cmd-pubsub-sub", category: "Integration Services", title: "Create Subscription", command: "gcloud pubsub subscriptions create my-sub --topic=my-topic", description: "Creates a message pull subscription linked to the topic." },
    { id: "cmd-ops-logging", category: "Operations Suite", title: "Query Error Logs", command: "gcloud logging read 'severity>=ERROR' --limit=5", description: "Reads error logs from Stackdriver logging systems." }
  ],

  quiz: [
    {
      id: "q1",
      question: "You are designing an application that requires a relational database to store global financial transactions. The system demands absolute SQL ACID transaction guarantees and strong consistency globally, with multi-region write scalability. Which database service should you choose?",
      options: [
        "Cloud SQL",
        "Cloud Spanner",
        "Cloud Bigtable",
        "Firestore in Datastore mode"
      ],
      correctIndex: 1,
      explanation: "Cloud Spanner is Google Cloud's globally scalable relational SQL database that offers strong global consistency and multi-region write ACID transactions. Cloud SQL is regional and cannot handle global-write horizontal scale. Cloud Bigtable and Datastore/Firestore are NoSQL databases that do not support standard global relational SQL ACID requirements."
    },
    {
      id: "q2",
      question: "Your team wants to establish a highly available network connection between your corporate on-premise data center and a Google Cloud VPC. The connection must achieve a 99.99% availability SLA. Which network solution should you implement?",
      options: [
        "A single Classic VPN tunnel.",
        "A Cloud HA VPN gateway configured with two active IPSec tunnels using distinct public IP addresses.",
        "A single Dedicated Interconnect link with zero secondary failover gateways.",
        "A Shared VPC linking internal department networks."
      ],
      correctIndex: 1,
      explanation: "Google Cloud HA VPN provides a 99.99% availability SLA by using two active IPSec tunnels routed via two independent external IP interfaces in a single regional gateway. Classic VPN only supports a 99.9% SLA. A single Dedicated Interconnect has a 99% SLA unless it is paired with redundant links or HA VPN failovers. Shared VPC is a project network sharing mechanism, not a hybrid connectivity gateway."
    },
    {
      id: "q3",
      question: "An application running on a GCE virtual machine needs to download objects from a secure, private Cloud Storage bucket in the same project. To adhere to Google-recommended security guidelines, how should you grant the GCE instance permission?",
      options: [
        "Generate a service account private JSON key, download it, and upload it to the VM filesystem.",
        "Assign the primitive role 'Owner' to the VM's primary administrator user account.",
        "Create a dedicated service account, grant it the predefined role 'roles/storage.objectViewer' on the GCS bucket, attach this service account to the GCE VM, and let the application use Application Default Credentials (ADC).",
        "Configure the GCS bucket to allow Public Access so that the VM can download files via curl."
      ],
      correctIndex: 2,
      explanation: "Under the principle of least privilege, you should create a service account with the narrowest role required (roles/storage.objectViewer) scoped to the resource, attach it directly to the GCE VM, and utilize Application Default Credentials. Hardcoding JSON keys on the VM is a security risk. Primitive roles grant excessive access. Public access exposes private company data."
    },
    {
      id: "q4",
      question: "You want to configure your local gcloud CLI configuration profile to target a newly created development project and automatically set the default compute region to us-central1. Which command sequence should you run?",
      options: [
        "gcloud config set project [PROJECT]; gcloud config set compute/region us-central1",
        "gcloud init --username=developer",
        "gcloud compute instances update --zone=us-central1-a",
        "gcloud auth list"
      ],
      correctIndex: 0,
      explanation: "To update your local gcloud configuration properties, you use `gcloud config set project [PROJECT]` to set the target project, and `gcloud config set compute/region [REGION]` to set the default region profile properties."
    },
    {
      id: "q5",
      question: "Your enterprise wants to centralize all IP address allocations, subnets, and firewalls in a dedicated network administration project, while allowing developers in separate business units to deploy GCE virtual machines into these subnets. Which networking model matches this requirement?",
      options: [
        "VPC Peering",
        "Shared VPC",
        "Cloud HA VPN",
        "Private Google Access"
      ],
      correctIndex: 1,
      explanation: "Shared VPC allows an organization to designate a Host Project containing the shared subnets, while Service Projects (business units) deploy GCE instances into these subnets under centralized control. VPC Peering links independent VPC networks, but does not centralize administration. HA VPN is for hybrid links. Private Google Access allows VMs with private IPs to access Google APIs."
    },
    {
      id: "q6",
      question: "You are deploying a GKE cluster. You want Google to fully manage the cluster nodes, sizing, operating system patching, and scaling, while charging you strictly per running Pod resource rather than for VM nodes. Which GKE mode fits this description?",
      options: [
        "GKE Standard Mode",
        "GKE Autopilot Mode",
        "GCE Managed Instance Group",
        "App Engine Flexible Environment"
      ],
      correctIndex: 1,
      explanation: "GKE Autopilot Mode is a fully-managed Kubernetes deployment where Google manages all cluster node infrastructure, security, and updates, and charges you based on running Pod consumption. Standard Mode leaves node pool VM management to the user. MIGs are for GCE VMs. App Engine is a PaaS, not a Kubernetes orchestrator."
    },
    {
      id: "q7",
      question: "You need to export Stackdriver logs to a secure long-term archiving system for 7 years for compliance reporting. The logs must be easily queryable if requested, but stored at the lowest possible cost. Where should you route these logs using Log Router?",
      options: [
        "A BigQuery dataset.",
        "A Cloud Storage bucket with a lifecycle rule transitioning objects to Archive Storage class.",
        "A Pub/Sub messaging topic linked to a custom relational database.",
        "The default _Default logging bucket with active retention policies."
      ],
      correctIndex: 1,
      explanation: "Cloud Storage Archive class offers the lowest cost per gigabyte for long-term data archiving, making GCS with lifecycle rules the optimal sink target. BigQuery is useful for analytics but significantly more expensive for cold archiving. Pub/Sub is for streaming. The _Default logging bucket cannot retain records for 7 years."
    }
  ]
};

// Export database for browser utilization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GCP_DATABASE;
} else {
  window.GCP_DATABASE = GCP_DATABASE;
}
