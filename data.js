// GCP ACE Study Accelerator Database - Expanded, Interactive and Exhaustive
const GCP_DATABASE = {
  services: [
    // --- COMPUTE SERVICES ---
    {
      id: "compute-engine",
      docLink: "https://cloud.google.com/compute/docs",
      name: "Google Compute Engine (GCE)",
      category: "Compute",
      description: "Secure, customizable virtual machines (VMs) running on Google's global infrastructure. VMs can be provisioned as individual instances or scaled automatically via Managed Instance Groups (MIGs) using Instance Templates. GCE supports standard public OS images, custom images (reusable boot disks with pre-installed software), and startup scripts to automatically install packages and initialize services on boot. GCE offers diverse machine families (General Purpose, Compute/Memory/Accelerator Optimized), Spot VMs (ephemeral VMs with up to 91% discount), and persistent block storage options like PDs and local SSDs.",
      keyFeatures: [
        "Predefined & custom machine types (General Purpose, Compute/Memory/Accelerator Optimized)",
        "Persistent Disks (Standard, Balanced, SSD) & ephemeral Local SSDs (ultra high-performance)",
        "Managed Instance Groups (MIGs) with autoscaling, auto-healing, and multi-zone deployment",
        "Spot VMs with massive savings (up to 91% discount) with 30-second preemption notices"
      ],
      whenToUse: [
        "Legacy workloads requiring direct administrative OS/kernel-level control.",
        "Monolithic applications, third-party software, or custom licensing setups.",
        "High-performance workloads requiring GPUs or specific local raw disk speeds."
      ],
      whenNotToUse: [
        "Stateless single-container APIs (use Cloud Run for serverless cost-effectiveness).",
        "Simple language scripts running occasionally (use Cloud Functions to avoid idle VM costs).",
        "Static web hosting (use Cloud Storage which requires zero VM maintenance)."
      ],
      cliCommands: [
        { command: "gcloud compute instances create [VM_NAME] --zone=[ZONE] --machine-type=e2-medium --subnet=[SUBNET] --metadata-from-file=startup-script=script.sh", desc: "Launches a custom virtual machine instance with a startup script." },
        { command: "gcloud compute instances stop [VM_NAME] --zone=[ZONE]", desc: "Halts a running GCE instance to stop compute resource billing." }
      ],
      examTips: [
        "Local SSDs are highly performant but ephemeral; stopping or deleting the VM erases all local SSD data.",
        "MIGs use Instance Templates to deploy identical VMs; resizing, auto-healing, and rolling updates are handled automatically."
      ]
    },
    {
      id: "app-engine",
      docLink: "https://cloud.google.com/appengine/docs",
      name: "Google App Engine (GAE)",
      category: "Compute",
      description: "Fully-managed Platform-as-a-Service (PaaS) to deploy web applications without server overhead.",
      keyFeatures: [
        "Standard Environment: Sandboxed runtimes, scale-to-zero model, extremely fast startup, restricted runtime languages.",
        "Flexible Environment: Docker container-based, custom runtimes and libraries, minimum of 1 active instance (no scale-to-zero)."
      ],
      whenToUse: [
        "Monolithic web applications, microservices, or APIs built in standard languages (Java, Node.js, Python, PHP, Go).",
        "Prototypes and applications where speed-to-market is critical and infrastructure management is unwanted."
      ],
      whenNotToUse: [
        "Applications requiring raw TCP/UDP networking (GAE Standard is strictly HTTP/HTTPS).",
        "Systems that need complex multi-container orchestration (use GKE or Cloud Run)."
      ],
      cliCommands: [
        { command: "gcloud app create --region=[ZONE]", desc: "Initializes a permanent, non-reversible App Engine application within the project." },
        { command: "gcloud app deploy app.yaml", desc: "Deploys your application code to App Engine." }
      ],
      examTips: [
        "App Engine locations are PERMANENT and irreversible within a GCP project. If you need a different region, you must create a new project.",
        "Traffic Splitting: Can split traffic between multiple active app versions based on Cookies, IP Address, or Random weight allocations."
      ]
    },
    {
      id: "gke",
      docLink: "https://cloud.google.com/kubernetes-engine/docs",
      name: "Google Kubernetes Engine (GKE)",
      category: "Compute",
      description: "Secured, managed Kubernetes service for deploying, managing, and scaling containerized applications. It supports two cluster types: Autopilot (fully managed, charged per running pod) and Standard (user-managed worker node pools, charged per running VM). GKE's cluster architecture consists of a Control Plane (formerly Master node) managing cluster operations (API Server for communication, Scheduler for placing pods, Controller Manager for maintaining states, and etcd as the consistent distributed key-value data store) and Worker Nodes (VMs that run container pods, containing a Kubelet daemon to communicate with the control plane, kube-proxy to route internal service network traffic, and container runtimes like containerd). It also supports Kubernetes objects like Deployments (declarative updates to pods and ReplicaSets) vs ReplicaSets (ensuring a specified number of pod replicas are running at any given time).",
      keyFeatures: [
        "Autopilot mode: Google manages VM nodes, provisioning, security, and cluster scaling; charged per running pod.",
        "Standard mode: Full operational control over underlying VM nodes, custom node pools, and host configs.",
        "Robust autoscaling: Horizontal Pod Autoscaler (HPA), Vertical Pod Autoscaler (VPA), and Cluster Autoscaler."
      ],
      whenToUse: [
        "Enterprise containerized microservice systems requiring heavy Kubernetes API orchestrations.",
        "Stateful workloads using native Kubernetes persistent volumes and daemonsets."
      ],
      whenNotToUse: [
        "Simple stateless single-container APIs (Cloud Run is a much lighter, serverless container hosting solution).",
        "Event-driven scripts with minimal compute lifetimes."
      ],
      cliCommands: [
        { command: "gcloud container clusters create-auto [GKE_CLUSTER] --region=[ZONE]", desc: "Spins up a fully-managed GKE Autopilot cluster." },
        { command: "gcloud container clusters get-credentials [GKE_CLUSTER] --zone=[ZONE]", desc: "Links kubectl CLI tool to control the cluster." }
      ],
      examTips: [
        "Autopilot is the Google-recommended default; you pay only for running pods (CPU/Memory/Storage) rather than paying for idle worker VMs.",
        "Node Pools inside a cluster allow you to group VM nodes with different machine specifications (e.g., standard nodes and GPU-heavy nodes)."
      ]
    },
    {
      id: "cloud-functions",
      docLink: "https://cloud.google.com/functions/docs",
      name: "Cloud Functions",
      category: "Compute",
      description: "Serverless execution environment for building and connecting single-purpose, event-driven functions.",
      keyFeatures: [
        "Stateless scale-to-zero execution model with strict pay-per-execution billing.",
        "Built-in trigger integration (HTTP request, Pub/Sub message, GCS bucket file upload, Firestore update).",
        "Supported languages include Node.js, Python, Go, Java, .NET, Ruby, and PHP."
      ],
      whenToUse: [
        "Real-time media conversion (e.g., generating image thumbnails instantly upon upload to GCS).",
        "Webhook processors, simple alert triggers, or lightweight data transformation pipeline blocks."
      ],
      whenNotToUse: [
        "Complex web backends with extensive routes and persistent long-lived database connections.",
        "Long-running batch workloads (maximum execution timeout is limited to 60 minutes)."
      ],
      cliCommands: [
        { command: "gcloud functions deploy [VM_NAME] --runtime=python310 --trigger-http --allow-unauthenticated", desc: "Deploys a Python HTTP-triggered function." }
      ],
      examTips: [
        "Functions are completely stateless. The local `/tmp` directory is held in memory and is wiped clean once the execution terminates."
      ]
    },
    {
      id: "cloud-run",
      docLink: "https://cloud.google.com/run/docs",
      name: "Cloud Run",
      category: "Compute",
      description: "Fully managed serverless platform that enables you to run containerized applications directly.",
      keyFeatures: [
        "Scales automatically from 0 to hundreds of container instances based on incoming request concurrency.",
        "Billed strictly to the nearest 100ms only during request execution.",
        "Supports any programming language, framework, or binary package that can be wrapped in a Docker container."
      ],
      whenToUse: [
        "Stateless web applications, REST APIs, microservices, and webhook servers.",
        "Fast container hosting without paying for idle compute boxes."
      ],
      whenNotToUse: [
        "Applications requiring persistent background threads or direct OS kernel module manipulations.",
        "Code bases that cannot be containerized."
      ],
      cliCommands: [
        { command: "gcloud run deploy [VM_NAME] --source=. --region=[ZONE] --allow-unauthenticated", desc: "Builds, registers, and deploys code to Cloud Run with public access." }
      ],
      examTips: [
        "Unlike AWS Lambda, a single Cloud Run container instance can handle up to 250 concurrent requests, maximizing utilization and minimizing cold startups."
      ]
    },

    // --- STORAGE SERVICES ---
    {
      id: "cloud-storage",
      docLink: "https://cloud.google.com/storage/docs",
      name: "Cloud Storage (GCS)",
      category: "Storage",
      description: "Globally durable, highly scalable, and cost-effective object storage system for unstructured data.",
      keyFeatures: [
        "Storage Classes: Standard (hot), Nearline (30+ days), Coldline (90+ days), Archive (365+ days).",
        "Object Lifecycle Management (auto-delete or auto-transition between storage classes).",
        "Object Versioning and Retention Policies (WORM) for data protection and compliance."
      ],
      whenToUse: [
        "Storing backup files, database snapshots, application log archives, or static assets (images, videos).",
        "Hosting fully static public websites (HTML, CSS, static JS assets)."
      ],
      whenNotToUse: [
        "Dynamic block storage for database transaction logs (use Persistent Disks for low-latency block writes).",
        "Transactional SQL database backends."
      ],
      cliCommands: [
        { command: "gcloud storage buckets create gs://[BUCKET_NAME] --location=[ZONE] --storage-class=nearline", desc: "Creates a regional Nearline bucket." },
        { command: "gcloud storage cp [LOCAL_PATH] gs://[BUCKET_NAME]/", desc: "Copies a file from local filesystem to a GCS bucket." }
      ],
      examTips: [
        "Signed URLs provide secure, temporary, and read/write access to GCS files for clients who do not possess Google accounts.",
        "Nearline, Coldline, and Archive classes have minimum storage durations; deleting or replacing files early incurs cost penalties."
      ]
    },
    {
      id: "persistent-disks",
      docLink: "https://cloud.google.com/compute/docs/disks",
      name: "Persistent Disks (Standard, Balanced, SSD)",
      category: "Storage",
      description: "Durable, high-performance block storage volumes attached directly to Compute Engine VMs.",
      keyFeatures: [
        "pd-standard (efficient HDD for sequential reads), pd-balanced (general purpose), and pd-ssd (high IOPS).",
        "Can expand disk size on-the-fly without restarting the VM or causing downtime.",
        "Multi-writer mode allows multiple VMs to attach a single disk in Read-Only (or Read-Write under clustered filesystems)."
      ],
      whenToUse: [
        "Operating system boot drives for virtual machine instances.",
        "Primary database storage demanding consistent low-latency block writes."
      ],
      whenNotToUse: [
        "Shared file storage accessed simultaneously by hundreds of separate web servers (use Cloud Storage or Filestore)."
      ],
      cliCommands: [
        { command: "gcloud compute disks resize [DISK_NAME] --size=[DISK_SIZE] --zone=[ZONE]", desc: "Expands the capacity of a GCE disk on-the-fly." }
      ],
      examTips: [
        "You can resize a Persistent Disk on-the-fly, but you must still log in to the OS and execute commands to grow the partition and filesystem."
      ]
    },
    {
      id: "local-ssds",
      docLink: "https://cloud.google.com/compute/docs/disks/local-ssd",
      name: "Local SSDs",
      category: "Storage",
      description: "High-performance, transient physical SSD storage directly attached to the GCE VM host server.",
      keyFeatures: [
        "Extreme IOPS and ultra-low latency compared to network-attached Persistent Disks.",
        "Physically connected to the host machine slot.",
        "Allocated in fixed 375GB device chunks."
      ],
      whenToUse: [
        "Flash cache layers, database scratch pads, temporary index storage, or staging directories.",
        "High-Performance Computing (HPC) staging directories."
      ],
      whenNotToUse: [
        "Durable, long-term data storage (stopping or deleting the VM erases all local SSD records)."
      ],
      cliCommands: [],
      examTips: [
        "Data is kept during GCE VM live migrations, but is permanently lost when the VM instance stops or terminates."
      ]
    },
    {
      id: "cloud-filestore",
      docLink: "https://cloud.google.com/filestore/docs",
      name: "Cloud Filestore",
      category: "Storage",
      description: "Fully managed Network Attached Storage (NAS) providing shared POSIX-compliant NFS file systems.",
      keyFeatures: [
        "NFSv3 compatible shared file storage.",
        "Concurrent mount points across multiple GCE VMs or GKE container pods.",
        "Low latency file operations suitable for enterprise applications."
      ],
      whenToUse: [
        "Migrating legacy applications that require traditional shared directory mount points.",
        "Web server media assets shared simultaneously among multiple virtual machines."
      ],
      whenNotToUse: [
        "Low-cost cold file archiving (Cloud Storage standard or coldline is vastly cheaper)."
      ],
      cliCommands: [
        { command: "gcloud filestore instances create my-nfs --zone=[ZONE] --tier=STANDARD --file-share=name='vol1',capacity=1TB --network=name='default'", desc: "Creates a standard Filestore NFS share." }
      ],
      examTips: [
        "Filestore represents a Network File System (NFS) setup, which supports standard OS file locking, unlike Cloud Storage."
      ]
    },

    // --- DATABASE SERVICES ---
    {
      id: "cloud-sql",
      docLink: "https://cloud.google.com/sql/docs",
      name: "Cloud SQL",
      category: "Database",
      description: "Fully-managed relational database service compatible with MySQL, PostgreSQL, and SQL Server.",
      keyFeatures: [
        "Automated backups, replication, minor patching, and server updates.",
        "High Availability (HA) using synchronous active-standby zones in the same region.",
        "Read replicas to scale out read operations globally."
      ],
      whenToUse: [
        "Standard web application databases (WordPress, Django, enterprise ERPs) requiring full SQL ACID properties.",
        "Migrating existing on-premise relational SQL systems to GCP with minimal code changes."
      ],
      whenNotToUse: [
        "Massive global transactional systems requiring multi-region SQL write scaling (use Cloud Spanner).",
        "Analytical write-heavy streaming telemetry logs (use BigQuery or Bigtable)."
      ],
      cliCommands: [
        { command: "gcloud sql instances create my-db --database-version=POSTGRES_14 --tier=db-custom-2-7680 --region=[ZONE]", desc: "Creates a PostgreSQL database." }
      ],
      examTips: [
        "HA configuration sets up a synchronous standby replica in a different AZ inside the SAME region. It automatically takes over using the same IP if the master fails."
      ]
    },
    {
      id: "cloud-spanner",
      docLink: "https://cloud.google.com/spanner/docs",
      name: "Cloud Spanner",
      category: "Database",
      description: "Enterprise-grade, globally scalable, strongly consistent relational database service.",
      keyFeatures: [
        "Combines traditional relational features (SQL, ACID, schema, joins) with NoSQL scale-out capability.",
        "Synchronous multi-region writes and strong global consistency.",
        "Five-nines (99.999%) SLA availability."
      ],
      whenToUse: [
        "Mission-critical global financial transaction systems, ledger systems, or billing systems.",
        "Relational schemas growing past the storage boundaries of regional Cloud SQL (>64TB)."
      ],
      whenNotToUse: [
        "Small systems under 100GB (Spanner requires a minimum node count, making it highly expensive for small workloads)."
      ],
      cliCommands: [],
      examTips: [
        "Spanner is always the correct choice if the exam question mentions: 'relational schema', 'SQL transactions', 'global write scalability', and 'strong consistency'."
      ]
    },
    {
      id: "firestore",
      docLink: "https://cloud.google.com/firestore/docs",
      name: "Firestore",
      category: "Database",
      description: "Highly scalable, serverless NoSQL document database optimized for web, mobile, and IoT apps.",
      keyFeatures: [
        "Serverless document database scaling from zero to millions of reads/writes automatically.",
        "Document model: JSON-like documents grouped into collections.",
        "Supports Datastore mode (high throughput server-side apps) and Native mode (client SDKs with offline sync)."
      ],
      whenToUse: [
        "Mobile/web app backends storing user profiles, shopping carts, game states, or JSON documents.",
        "Hierarchical semi-structured collections."
      ],
      whenNotToUse: [
        "Complex SQL analytics or extensive cross-table JOIN queries (use BigQuery).",
        "IoT streaming writes at extreme velocity (use Bigtable)."
      ],
      cliCommands: [],
      examTips: [
        "Firestore is serverless and scales to zero, meaning zero active compute cost when there is no traffic."
      ]
    },
    {
      id: "cloud-bigtable",
      docLink: "https://cloud.google.com/bigtable/docs",
      name: "Cloud Bigtable",
      category: "Database",
      description: "Google's NoSQL wide-column database, optimized for massive low-latency write ingestion.",
      keyFeatures: [
        "Sub-10ms latency for massive data ingestion.",
        "Scales to petabytes under synchronous write operations.",
        "Fully compatible with Apache HBase APIs."
      ],
      whenToUse: [
        "IoT telemetry, financial ticks, time-series metrics, web clickstreams, and marketing tracking data.",
        "Heavy write workloads exceeding several terabytes."
      ],
      whenNotToUse: [
        "Small datasets (<1TB) due to continuous active node pricing overheads.",
        "Relational SQL requirements or multi-row transactions."
      ],
      cliCommands: [],
      examTips: [
        "Row Key Design: Avoid sequential timestamps as start keys to prevent database hotspotting on a single node. Always strive for balanced row distributions."
      ]
    },
    {
      id: "memorystore",
      docLink: "https://cloud.google.com/memorystore/docs",
      name: "Cloud Memorystore (Redis, Memcached)",
      category: "Database",
      description: "Fully managed, in-memory data store service providing sub-millisecond caching layers.",
      keyFeatures: [
        "Redis: Advanced data structures, replication, HA failover, and Pub/Sub.",
        "Memcached: Highly scalable, multi-threaded simple key-value cache system."
      ],
      whenToUse: [
        "Web application session caches, leaderboard tracking, or query cache shields to protect backend databases.",
        "In-memory sub-millisecond data requirements."
      ],
      whenNotToUse: [
        "Durable primary business ledger storage."
      ],
      cliCommands: [],
      examTips: [
        "Choose Redis for high availability, snapshots, and complex structures. Choose Memcached for simple scaling."
      ]
    },

    // --- NETWORKING SERVICES ---
    {
      id: "vpc",
      docLink: "https://cloud.google.com/vpc/docs",
      name: "Virtual Private Cloud (VPC)",
      category: "Networking",
      description: "Globally scalable logical network partition for GCP compute resources. VPC networks are global, while Subnets are regional boundaries that define internal IP address spaces using CIDR notation (Classless Inter-Domain Routing). Subnets contain allocated private IP ranges (e.g., 10.0.1.0/24 allows 256 IPs from 10.0.1.0 to 10.0.1.255; 10.128.0.0/20 allows 4,096 IPs). VPC uses stateful Firewall Rules to control traffic flow; rules are categorized as Ingress (filtering incoming connections to instances) and Egress (filtering outgoing connections from instances), matching by protocol (TCP, UDP, ICMP), port, and source/target tags or IP ranges.",
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
      docLink: "https://cloud.google.com/vpc/docs/vpc-peering",
      name: "VPC Peering",
      category: "Networking",
      description: "Securely connects two independent VPC networks, enabling direct internal IP communication.",
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
      docLink: "https://cloud.google.com/vpc/docs/shared-vpc",
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
      docLink: "https://cloud.google.com/network-connectivity/docs/vpn",
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
      docLink: "https://cloud.google.com/network-connectivity/docs/interconnect",
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
      docLink: "https://cloud.google.com/load-balancing/docs/choosing-load-balancer",
      name: "Cloud Load Balancing",
      category: "Networking",
      description: "Fully managed load distribution system. Routes traffic to compute resources. CLB is categorized into Application Load Balancer (HTTP/HTTPS, Layer 7) and Network Load Balancer (TCP/UDP/other IP protocols, Layer 4). L7 balancers handle HTTP/HTTPS and can be External (Global/Regional) or Internal (Regional/Cross-region). L4 balancers are categorized as: 1) Proxy: terminates client sessions, can be External (Global/Regional) or Internal (Regional/Cross-region), using TCP/TLS. 2) Passthrough: preserves client IP and routes raw packets directly, can be External (Regional external passthrough Network Load Balancer) or Internal (Regional internal passthrough Network Load Balancer) for TCP/UDP traffic.",
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
      docLink: "https://cloud.google.com/dns/docs",
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
        { command: "gcloud dns managed-zones create my-zone --description='Private Zone' --dns-name='internal.net.' --visibility=private --networks='default'", desc: "Creates a private DNS zone." }
      ],
      examTips: [
        "Private DNS zones are attached to specific VPCs and cannot be resolved from outside unless VPN/Interconnect configurations are present."
      ]
    },

    // --- ANALYTICS & BIG DATA ---
    {
      id: "bigquery",
      docLink: "https://cloud.google.com/bigquery/docs",
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
        { command: "bq mk --dataset --location=US [PROJECT_ID]:[DATASET_NAME]", desc: "Creates a BigQuery dataset." },
        { command: "bq query --use_legacy_sql=false 'SELECT name, COUNT(*) FROM `my-proj.my_dataset.users` GROUP BY name'", desc: "Runs an SQL query." }
      ],
      examTips: [
        "Partitioning and Clustering tables by columns significantly reduces query scanning costs and improves query performance."
      ]
    },
    {
      id: "cloud-dataflow",
      docLink: "https://cloud.google.com/dataflow/docs",
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
      docLink: "https://cloud.google.com/dataproc/docs",
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
        { command: "gcloud dataproc clusters create my-hadoop --region=[ZONE] --num-workers=2 --worker-boot-disk-size=50GB", desc: "Spins up a Dataproc Hadoop cluster." }
      ],
      examTips: [
        "You can reduce Dataproc cost by choosing GCS (gs://) as your storage instead of native cluster HDFS, allowing you to delete clusters when jobs finish."
      ]
    },

    // --- INTEGRATION SERVICES ---
    {
      id: "pubsub",
      docLink: "https://cloud.google.com/pubsub/docs",
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
        { command: "gcloud pubsub topics create [TOPIC_NAME]", desc: "Creates a Pub/Sub topic." },
        { command: "gcloud pubsub subscriptions create [SUB_NAME] --topic=[TOPIC_NAME]", desc: "Creates a pull subscription to the topic." }
      ],
      examTips: [
        "Messages are stored in Pub/Sub for up to 7 days by default. Subscribers pull messages or configure HTTP push webhooks."
      ]
    },

    // --- MANAGEMENT & SECURITY ---
    {
      id: "deployment-manager",
      docLink: "https://cloud.google.com/deployment-manager/docs",
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
      docLink: "https://cloud.google.com/iam/docs",
      name: "Cloud Identity and Access Management (IAM)",
      category: "Security",
      description: "Authorizes who (identity) has what permissions (roles) to act on specific resources. IAM consists of Members (Identities like Google Accounts, Service Accounts, Google Groups, Workspace Domains, or allUsers/allAuthenticatedUsers), Roles (Collections of permissions; can be Primitive like Owner/Editor/Viewer, Predefined like storage.objectAdmin, or Custom created by users), and Policies (Bindings of one or more roles to members, applied at the Organization, Folder, Project, or Resource levels). In contrast to IAM (which manages broad identity-level access across GCP resources), Access Control Lists (ACLs) provide fine-grained, object-level read/write permissions directly on individual items inside Cloud Storage buckets (Legacy/Object ACLs) and should be disabled in favor of uniform bucket-level IAM policies whenever possible.",
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
        { command: "gcloud projects add-iam-policy-binding [PROJECT_ID] --member=[MEMBER] --role=[ROLE]", desc: "Grants specific role permissions to a user/member." }
      ],
      examTips: [
        "IAM Policy inheritance is top-down: Org -> Folder -> Project -> Resource. Permissions cannot be removed at lower levels; they can only be added."
      ]
    },
    {
      id: "service-accounts",
      docLink: "https://cloud.google.com/iam/docs/service-accounts",
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
        { command: "gcloud iam service-accounts create [SERVICE_ACCOUNT] --display-name='App SA'", desc: "Creates a new service account." }
      ],
      examTips: [
        "Service Account User Role (`roles/iam.serviceAccountUser`): Essential permission needed by developers to associate/deploy service accounts onto VMs."
      ]
    },
    {
      id: "cloud-kms",
      docLink: "https://cloud.google.com/kms/docs",
      name: "Cloud Key Management Service (Cloud KMS)",
      category: "Security",
      description: "Fully managed service that enables you to create, import, and rotate cryptographic keys. Google supports both Symmetric encryption (a single key used for both encrypting and decrypting data, ideal for fast internal block storage / GCS envelope setups) and Asymmetric encryption (a key pair comprising a public key to encrypt and a private key to decrypt, crucial for digital signatures, external identity handshakes, and public verification). KMS keys are organized hierarchically: Key Ring -> Crypto Key -> Key Version. KMS enables Customer-Managed Encryption Keys (CMEK) to allow users direct custody over the keys protecting GCS buckets, BigQuery datasets, and GCE disks, rather than relying on standard Google-Managed Encryption Keys (GMEK). Supports hardware security modules (HSM) compliance standards.",
      keyFeatures: [
        "Symmetric encryption (fast single-key block/object operations).",
        "Asymmetric encryption (public key encrypts, private key decrypts; digital signatures).",
        "Hierarchical structure: Key Rings group Keys, which own individual key Versions.",
        "Integrates with CMEK (Customer-Managed Encryption Keys) across major services (GCS, GCE, BigQuery)."
      ],
      whenToUse: [
        "Enforcing strict digital key rotation, importing external on-premise keys (BYOK), or signing metadata.",
        "Complying with regulatory audits demanding absolute custody and monitoring of encryption keys (CMEK)."
      ],
      whenNotToUse: [
        "Storing raw database user passwords or text secrets directly (use Secret Manager to store static string payloads)."
      ],
      cliCommands: [
        { command: "gcloud kms keyrings create my-keyring --location=[LOCATION]", desc: "Creates a new regional KMS key ring." },
        { command: "gcloud kms keys create my-key --location=[LOCATION] --keyring=my-keyring --purpose=encryption", desc: "Creates a symmetric encryption key inside the keyring." }
      ],
      examTips: [
        "Symmetric keys use the SAME key to encrypt and decrypt. Asymmetric keys use a key PAIR (public key to encrypt, private key to decrypt).",
        "CMEK (Customer-Managed Encryption Keys) allows you to authorize services like GCS to use your KMS keys. KMS does not store raw secrets; that is Secret Manager's job."
      ]
    },
    {
      id: "cloud-operations",
      docLink: "https://cloud.google.com/monitoring/docs",
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
    },
    {
      id: "pricing-calculator",
      docLink: "https://cloud.google.com/products/calculator",
      name: "Google Cloud Pricing Calculator",
      category: "Management",
      description: "Web-based upfront estimation tool to model and estimate the costs of GCP services based on custom utilization parameters (such as VM counts, disk sizes, network egress, and committed use discounts). Highly useful for pre-migration planning.",
      keyFeatures: [
        "Generate detailed cost breakdowns for individual services or entire logical multi-tier system designs.",
        "Model custom VM sizes, Committed Use Discounts (CUDs), Sustained Use Discounts (SUDs), and storage classes.",
        "Export and share secure web links of cost estimates directly with clients and finance managers."
      ],
      whenToUse: [
        "Upfront budget planning, cost-benefit analyses, and architecture proposals before resources are provisioned.",
        "Evaluating monthly pricing adjustments between different machine series or persistent storage options."
      ],
      whenNotToUse: [
        "Real-time spend analytics or active resource invoice breakdowns (use Billing Reports, Budgets, and Cost Table instead)."
      ],
      cliCommands: [],
      examTips: [
        "Pricing Calculator is strictly for UPFRONT cost estimation. To manage active spending, configure Cloud Billing Alerts, budgets, and automated billing export to BigQuery."
      ]
    },
    {
      id: "cloud-foundation-toolkit",
      docLink: "https://cloud.google.com/foundation-toolkit/docs",
      name: "Cloud Foundation Toolkit (CFT)",
      category: "Management",
      description: "Provides a comprehensive suite of security-hardened, production-ready infrastructure templates and modular blueprints following Google Cloud best practices, primarily authored in Terraform or Deployment Manager.",
      keyFeatures: [
        "Modular templates covering foundational GCP landing zones: VPC routing, Folder structures, IAM structures, and central logging.",
        "Strictly aligned with Google Cloud's official Security Foundations Blueprint.",
        "Integrates directly into git-ops pipelines for declarative infrastructure deployments."
      ],
      whenToUse: [
        "Bootstrapping new, enterprise-grade GCP organization structures containing strict multi-layered folder security.",
        "Standardizing resource templates across massive engineering teams to enforce uniform security policies."
      ],
      whenNotToUse: [
        "Simple standalone test VMs or quick sandbox environments that are created manually or with single CLI commands."
      ],
      cliCommands: [],
      examTips: [
        "Cloud Foundation Toolkit represents Google's official modular templates (typically Terraform) for landing zones, satisfying the 'reusable security-hardened organization blueprint' exam criteria."
      ]
    },
    {
      id: "cloud-marketplace",
      docLink: "https://cloud.google.com/marketplace/docs",
      name: "Google Cloud Marketplace",
      category: "Management",
      description: "Online service repository that enables users to rapidly discover, procure, and launch pre-configured third-party software applications, specialized VM images, and developer container sets fully integrated with GCP billing.",
      keyFeatures: [
        "One-click direct deployment of popular stacks (WordPress, Elasticsearch, MongoDB) onto GCE VMs, GKE, or serverless runtimes.",
        "Consolidated invoicing: all third-party license costs and subscriptions appear directly on the main Google Cloud bill.",
        "Private Marketplace: administrators can curate and whitelist approved software catalogs to restrict unapproved deployments."
      ],
      whenToUse: [
        "Quickly deploying pre-packaged application packages or OS configurations with zero manual software setups.",
        "Purchasing enterprise software licenses directly through Google Cloud to consume active committed-use discounts."
      ],
      whenNotToUse: [
        "Deploying proprietary in-house microservices that must be developed and packaged internally from scratch."
      ],
      cliCommands: [],
      examTips: [
        "Cloud Marketplace enables deployment of pre-packaged developer setups with zero manual configuration. Under Consolidated Invoicing, software costs apply directly to your GCP Billing Account."
      ]
    }
  ],

  syllabus: [
    {
      id: "domain-1",
      title: "Domain 1: Compute Services & Architecture",
      description: "Choosing, planning, and deploying VM clusters, hosting platforms, and serverless container ecosystems.",
      topics: [
        {
          id: "gce-topics",
          title: "Google Compute Engine (GCE) - Comprehensive",
          summary: `Google Compute Engine (GCE) represents Google's foundational Infrastructure-as-a-Service (IaaS) offering. 
          When designing compute setups on GCE, you must be exhaustive regarding machine sizes, storage volumes, and VM configurations:
          
          • <strong>Machine Families</strong>:
            - <i>General Purpose (E2, N2, N2D, C3)</i>: Cost-optimized workloads, web servers, medium databases. E2 utilizes dynamic resource sharing and has no GPU/local SSD support.
            - <i>Compute Optimized (C2, C2D)</i>: High-performance computing (HPC), gaming, intensive calculations.
            - <i>Memory Optimized (M1, M2, M3)</i>: In-memory databases (SAP HANA) and real-time big data analytics.
            - <i>Accelerator Optimized (G2, A2, A3)</i>: Deep learning, AI training, and CUDA GPU workloads.
            
          • <strong>Storage Options</strong>:
            - <i>Persistent Disks (Standard HDD, Balanced SSD, SSD, Extreme)</i>: Network-attached, durable storage. Can grow disk sizes on-the-fly, but requires OS partition expansion. Supports Multi-Writer mode (Read-Only on multiple VMs).
            - <i>Local SSDs</i>: Physically attached to the host server. Provides ultra-high IOPS and sub-millisecond latency. Highly ephemeral; data is lost on instance stop/termination (preserved on live migrations).
            - <i>Filestore</i>: POSIX-compliant NFS shared network storage. Ideal for concurrent multi-writer web servers.
            
          • <strong>Console VM Options</strong>:
            - <i>Shielded VMs</i>: Protects against rootkits/boot-level malware via Secure Boot, measured boot, and virtual Trusted Platform Module (vTPM).
            - <i>Confidential VMs</i>: Cryptographically encrypts data in-use (in-memory) using AMD SEV/Intel TDX, with zero performance penalties.
            - <i>Spot/Preemptible VMs</i>: Excess compute capacity offered at up to a 91% discount. Highly ephemeral; can be terminated by Google at any time with a 30-second warning; maximum 24-hour runtime.`,
          whenToUse: [
            "Legacy systems needing operating-system/kernel adjustments or custom administrative drivers.",
            "Standard third-party enterprise licensed applications needing physical core allocations.",
            "Workloads requiring ephemeral Local SSD cache spaces for extreme databases."
          ],
          whenNotToUse: [
            "Stateless microservices (use Cloud Run for serverless efficiency to avoid paying for idle worker VMs).",
            "Infrequent scripting actions (use Cloud Functions triggered by Pub/Sub or Cloud Storage)."
          ],
          commands: [
            "gcloud compute instances create [VM_NAME] --zone=[ZONE] --machine-type=e2-medium --subnet=[SUBNET]",
            "gcloud compute disks resize [VM_NAME]-disk --size=[DISK_SIZE] --zone=[ZONE]",
            "gcloud compute instance-groups managed create my-mig --template=[VM_TEMPLATE] --size=[MIG_SIZE] --zone=[ZONE]"
          ]
        },
        {
          id: "gke-topics",
          title: "Google Kubernetes Engine (GKE) - Complete Deep Dive",
          summary: `Google Kubernetes Engine (GKE) represents Google's Container-as-a-Service (CaaS) offering built on Kubernetes.
          
          • <strong>GKE Setup Choices</strong>:
            - <i>Autopilot Mode (Recommended)</i>: Google manages all underlying worker node VM scaling, security, OS patching, and resource scheduling. You do not see worker VMs in your GCE console. You are charged strictly per running Pod resource (CPU, memory, storage requested). Highly secure by default.
            - <i>Standard Mode</i>: You manage the VM instances forming the worker node pools. You retain full control over node OS settings, custom hardware, and cluster configurations, but assume the administrative overhead. Charged based on the underlying GCE VM nodes regardless of whether pods are running.
            
          • <strong>Core Kubernetes Elements</strong>:
            - <i>Pods</i>: The smallest deployable computing units in Kubernetes; contains one or more tightly coupled containers sharing storage and network namespaces.
            - <i>Nodes</i>: The worker VMs running pod containers.
            - <i>Node Pools</i>: Groups of identical worker VM nodes within the cluster. Standard clusters can run multiple node pools with different machine sizes or GPU acceleration.
            - <i>Control Plane</i>: Handles cluster orchestrations (scheduling, controller loops, API access), fully managed by Google in both modes.
            
          • <strong>Autoscaling Systems</strong>:
            - <i>Horizontal Pod Autoscaler (HPA)</i>: Dynamically adds or removes Pod replicas based on CPU load or custom metrics (scales out/in).
            - <i>Vertical Pod Autoscaler (VPA)</i>: Automatically analyzes pod load and adjusts CPU/Memory limits of individual containers (scales up/down). *Note: Cannot be used simultaneously with HPA on standard CPU/memory metrics.*
            - <i>Cluster Autoscaler</i>: Automatically provisions new VM nodes in a node pool when pods are unschedulable due to resource exhaustion, and deletes idle nodes when capacity is free.`,
          whenToUse: [
            "Large-scale microservices requiring complex service mesh, inter-pod routing, and native Kubernetes API definitions.",
            "Stateful container systems that utilize Kubernetes dynamic persistent volumes."
          ],
          whenNotToUse: [
            "Simple single-container microservices with low management budgets (Cloud Run is far simpler and cheaper).",
            "Completely stateless event-driven scripts."
          ],
          commands: [
            "gcloud container clusters create-auto [GKE_CLUSTER] --region=[ZONE]",
            "gcloud container node-pools list --cluster=[GKE_CLUSTER] --zone=[ZONE]",
            "kubectl create deployment [DEPLOYMENT_NAME] --image=[IMAGE]",
            "kubectl expose deployment [DEPLOYMENT_NAME] --type=LoadBalancer --port=8080",
            "kubectl autoscale deployment [DEPLOYMENT_NAME] --max=[MAX_REPLICAS] --cpu-percent=70"
          ]
        },
        {
          id: "serverless-topics",
          title: "Serverless Hosting: Cloud Run vs App Engine vs Functions",
          summary: `GCP offers three distinct serverless paradigms: FaaS, PaaS, and serverless containers:
          
          • <strong>Cloud Run (Containers-as-a-Service)</strong>:
            - Deploys any Docker image.
            - Scales dynamically from 0 to N. A single container handles up to 250 concurrent requests.
            - Strictly billed down to 100ms *only during request processing*.
            - Great for web apps, API gateways, microservices.
            
          • <strong>Cloud App Engine (Platform-as-a-Service)</strong>:
            - Standard Environment: Sandboxed runtimes. Languages: Python, Java, Node.js, Go, PHP. Super fast startup, scales to zero. Cannot write to local filesystem (except in /tmp) or execute arbitrary binaries.
            - Flexible Environment: Docker-based. Custom libraries allowed. No scale-to-zero (minimum 1 active instance). Standard VM startup latency.
            - Splits traffic between versions dynamically (split by Cookie, IP, or Random weight).
            
          • <strong>Cloud Functions (Function-as-a-Service)</strong>:
            - Deploys raw code snippets triggered by system events (HTTP, Pub/Sub topic, Cloud Storage bucket uploads, Firestore changes).
            - Completely serverless, scale-to-zero.
            - Ideal for asynchronous event-driven background processing.`,
          whenToUse: [
            "Cloud Run: For any containerized app wanting serverless scale-to-zero cost optimization.",
            "App Engine Standard: For monolithic web platforms requiring direct source-code deployment without Docker management.",
            "Cloud Functions: For simple file processing pipelines or webhooks."
          ],
          whenNotToUse: [
            "Continuous stateful background calculations (serverless instances are ephemeral and terminate on idle)."
          ],
          commands: [
            "gcloud run deploy [VM_NAME] --source=. --region=[ZONE] --allow-unauthenticated",
            "gcloud app deploy app.yaml --version=[VERSION] --no-promote",
            "gcloud app services set-traffic default --splits=[SPLITS] --split-by=random"
          ]
        }
      ]
    },
    {
      id: "domain-2",
      title: "Domain 2: Storage & Database Solutions",
      description: "Durable storage systems, block systems, and fully-managed relational (SQL) or NoSQL database platforms.",
      topics: [
        {
          id: "gcs-exhaustive",
          title: "Cloud Storage (GCS) - Complete Reference",
          summary: `Google Cloud Storage (GCS) is a highly durable object store. Important configuration components include:
          
          • <strong>Storage Classes & Durability</strong>:
            - <i>Standard</i>: Highly active data (web assets, staging environments). No retrieval penalties.
            - <i>Nearline</i>: Data accessed less than once a month. Minimum 30-day billing retention.
            - <i>Coldline</i>: Data accessed less than once a quarter. Minimum 90-day billing retention.
            - <i>Archive</i>: Regulatory archives, backups accessed less than once a year. Minimum 365-day retention. Highest retrieval penalty but lowest storage costs.
            - All classes deliver millisecond access times and 99.999999999% (11 9s) durability.
            
          • <strong>Key Configurations</strong>:
            - <i>Object Lifecycle Management</i>: Automates rule actions (e.g., transition objects from Standard to Nearline after 30 days, delete objects after 365 days, delete old versions).
            - <i>Object Versioning</i>: Preserves history of modified/deleted files, creating custom generation numbers.
            - <i>Signed URLs</i>: Cryptographic URL strings giving temporary read/write permissions to external users who lack Google identities.
            - <i>Retention Policies</i>: Locks a bucket to ensure data cannot be deleted or overwritten until a specified retention period has elapsed (supports WORM compliance).`,
          whenToUse: [
            "Long-term automated system data archives and database snapshots.",
            "Serving static website resources (HTML, CSS, image files) worldwide.",
            "Big data analytical pipeline raw data intake staging areas."
          ],
          whenNotToUse: [
            "Dynamic relational transactional databases."
          ],
          commands: [
            "gcloud storage buckets create gs://[BUCKET_NAME] --location=[ZONE] --storage-class=[CLASS]",
            "gcloud storage cp [LOCAL_PATH] gs://[BUCKET_NAME]/",
            "gsutil signurl -d [DURATION] [KEY_FILE] gs://[BUCKET_NAME]/[FILE_NAME]"
          ]
        },
        {
          id: "file-block-storage",
          title: "File & Block Storage: Persistent Disks, Local SSDs & Filestore",
          summary: `ACE Candidates must distinguish between the three primary non-object storage paradigms:
          
          • <strong>Persistent Disks (Network Block Storage)</strong>:
            - Durable, network-attached block volumes attached to GCE VM instances.
            - Types: Standard HDD (sequential read workloads), Balanced SSD (general web app defaults), SSD (high database IOPS), and Extreme SSD.
            - Features: Can expand capacity on-the-fly without VM downtime, but still requires logging in to resize the OS partition/filesystem. Supports Multi-Writer mode (attaches to multiple VMs in Read-Only or clustered read-write configurations).
            
          • <strong>Local SSDs (Host-Attached Block Storage)</strong>:
            - Ephemeral, physically attached SSD block drives connected to the physical host GCE slot.
            - Deliver ultra-high IOPS and extremely low sub-millisecond latencies.
            - Ephemeral Nature: Data persists through VM live migrations, but is permanently wiped clean when the VM is STOPPED or DELETED (cannot be re-attached).
            
          • <strong>Cloud Filestore (Network Shared Filesystem)</strong>:
            - Fully managed NAS server supporting NFSv3. Mounts concurrently to hundreds of VMs and GKE container pods.
            - Supports POSIX-compliant file locking for multi-writer applications.
            - Billed based on allocated storage capacity rather than metrics of scanned bytes.`,
          whenToUse: [
            "Persistent Disks: Primary VM boot volumes, high-performance database storage demanding low-latency network block writes.",
            "Local SSDs: High-performance caching layers, database scratchpads, and temporary indexing folders.",
            "Filestore: Shared filesystems mounted across multiple web servers, migrating legacy on-premise NFS filesystems."
          ],
          whenNotToUse: [
            "Persistent Disks: Storing unstructured object files globally (use GCS to save costs).",
            "Local SSDs: Storing long-term primary customer records or databases without custom application-level node replication.",
            "Filestore: Low-cost file archiving (GCS is vastly cheaper for non-POSIX shared storage)."
          ],
          commands: [
            "gcloud compute disks create my-disk --size=100GB --type=pd-balanced --zone=[ZONE]",
            "gcloud compute instances attach-disk [VM_NAME] --disk=my-disk --zone=[ZONE]",
            "gcloud filestore instances create my-nfs --zone=[ZONE] --tier=STANDARD --file-share=name='share1',capacity=1TB --network=name='default'"
          ]
        },
        {
          id: "db-comparisons",
          title: "GCP Relational SQL & NoSQL Databases",
          summary: `Selecting the correct database engine is a major focus on the ACE exam:
          
          • <strong>Cloud SQL (Relational, MySQL/PostgreSQL/SQL Server)</strong>:
            - Regional scope. Maximum storage is 64TB.
            - <i>High Availability (HA)</i>: Set up by toggling the HA active-standby interface. Synchronous replication is created to a standby VM in a different Zone in the same region. Failover is automatic with zero IP changes.
            - <i>Read Replicas</i>: Asynchronous replication. Used to scale out read queries (cannot assist HA failovers).
            
          • <strong>Cloud Spanner (Relational SQL, Global scale)</strong>:
            - Delivers horizontal scaling of NoSQL with global ACID relational properties.
            - Scaled using Spanner Nodes. Synchronous replication across multi-region configurations. 
            - Always the correct answer for global ACID relational workloads.
            
          • <strong>Firestore (NoSQL Document database)</strong>:
            - Stores JSON document tree hierarchies. Scales to zero.
            - Optimized for web and mobile profile syncing.
            
          • <strong>Cloud Bigtable (NoSQL Wide-Column, IoT Scale)</strong>:
            - Massive low-latency write performance. Petabyte scale.
            - Optimized for IoT, sensor telemetry, and clickstream logging.
            - Row-key design: Must be designed to distribute reads/writes evenly. Sequential keys (like timestamps) must be avoided as they lead to write hotspotting on single nodes.`,
          whenToUse: [
            "Cloud SQL: Standard regional web database (MySQL/PostgreSQL) requiring relational schemas.",
            "Cloud Spanner: Global multi-region financial platforms requiring strong consistency.",
            "Firestore: Rapid mobile backends storing profile models.",
            "Bigtable: Massive streaming sensor data or financial ticker streams (>1TB)."
          ],
          whenNotToUse: [
            "Never select Bigtable or Spanner for small-scale standard apps due to high node pricing overhead."
          ],
          commands: [
            "gcloud sql instances create my-db --database-version=POSTGRES_14 --tier=db-custom-2-7680 --region=[ZONE]",
            "gcloud sql connect my-db --user=root --quiet"
          ]
        }
      ]
    },
    {
      id: "domain-3",
      title: "Domain 3: Networking & Connectivity",
      description: "Configuring global virtual networks, firewalls, routing topologies, load balancing, and hybrid tunnels.",
      topics: [
        {
          id: "vpc-routing",
          title: "VPC, Firewalls & Network Connectors",
          summary: `Google's network infrastructure is a global software-defined system:
          
          • <strong>Core VPC Concepts</strong>:
            - <i>Global Scope</i>: A single VPC spans all Google regions worldwide.
            - <i>Regional Subnets</i>: Subnets are regional boundaries containing internal IP allocations.
            - <i>Custom vs. Auto subnet modes</i>: Custom mode is recommended best practice. Auto mode generates subnets in every single region automatically, risking IP address overlaps in peered architectures.
            - <i>Private Google Access</i>: A subnet toggle allowing internal VMs (possessing only private IP addresses) to securely access Google APIs (such as Cloud Storage buckets) without traversing the public internet.
            
          • <strong>Centralized Networking</strong>:
            - <i>VPC Peering</i>: Links two separate VPC networks via internal routing. It is non-transitive. Overlapping CIDRs will cause peering to fail.
            - <i>Shared VPC</i>: A Host Project shares regional subnets with Service Projects. Service projects deploy VMs directly into the shared network subnets. Centralizes network security control (firewall rules, IP allocations) under network admins, while giving developers VM provisioning access.
            
          • <strong>Firewall Rules</strong>:
            - Stateful by default. You define direction (ingress/egress), action (allow/deny), protocol/port, and target criteria (target tags, service accounts).`,
          whenToUse: [
            "Custom Subnet VPC: Setup VPC for all enterprise projects to control CIDR planning.",
            "Private Google Access: For secure backend VMs that must query GCS or BigQuery without public internet routes.",
            "Shared VPC: For organizations with dedicated networking teams overseeing multiple product development environments."
          ],
          whenNotToUse: [
            "Auto Subnet VPC in interconnected multi-vpc environments (IP collision risk)."
          ],
          commands: [
            "gcloud compute networks create my-vpc --subnet-mode=custom",
            "gcloud compute networks subnets create [SUBNET] --network=my-vpc --region=[ZONE] --range=10.0.1.0/24 --enable-private-ip-google-access",
            "gcloud compute firewall-rules create allow-http --network=my-vpc --allow=tcp:80 --target-tags=web-server"
          ]
        },
        {
          id: "hybrid-lb",
          title: "Hybrid Connections & Load Balancing",
          summary: `ACE Candidates must grasp hybrid network connectors and traffic distribution:
          
          • <strong>Hybrid Connectivity Options</strong>:
            - <i>Cloud VPN</i>: Secure encrypted IPSec tunnels routed over the public internet. HA VPN utilizes two active interfaces with distinct external IP addresses inside a single regional gateway, providing a 99.99% SLA. Requires BGP routing via a Cloud Router.
            - <i>Dedicated Interconnect</i>: High-capacity, physical fiber link connecting your data center directly to a Google co-location facility (available in 10Gbps or 100Gbps interfaces). Unencrypted by default (IPSec over Interconnect can be configured if needed).
            - <i>Partner Interconnect</i>: Connects your physical network to GCP via a third-party telecom provider. Flexible bandwidth (50Mbps to 10Gbps).
            
          • <strong>Cloud Load Balancing (CLB)</strong>:
            - <i>Global Application Load Balancer (Layer 7 HTTP/HTTPS)</i>: Routes HTTP traffic based on URL path, host header, or region. Single external IP. Integrates edge caching with CDN.
            - <i>Global Proxy Load Balancer (Layer 4 TCP/SSL Proxy)</i>: Terminates non-HTTP TCP/SSL traffic at the edge.
            - <i>Regional Network Load Balancer (Layer 4 External TCP/UDP)</i>: Routes traffic based on IP protocol, address, and port. Excellent for extreme high-throughput workloads.
            - <i>Regional Internal Load Balancer</i>: Distributes internal private traffic within a VPC.`,
          whenToUse: [
            "HA VPN: Quick, encrypted, high-availability connections to office networks.",
            "Dedicated Interconnect: Heavy analytics pipelines constantly syncing data lakes with on-premise systems.",
            "Global L7 LB: High-traffic multi-region web applications demanding path-based routing and SSL termination."
          ],
          whenNotToUse: [
            "Dedicated Interconnect for small startup setups due to long lead times and high base costs."
          ],
          commands: []
        }
      ]
    },
    {
      id: "domain-4",
      title: "Domain 4: Data, Analytics & Integration",
      description: "Managing big data analytic warehouses, streaming transform pipelines, event brokers, and declarative IaC structures.",
      topics: [
        {
          id: "bigdata-pipelines",
          title: "GCP Big Data: BigQuery, Dataflow & Dataproc",
          summary: `Google provides powerful serverless and cluster-based analytical systems:
          
          • <strong>BigQuery (Analytical SQL Warehouse)</strong>:
            - Serverless data warehouse using ANSI SQL. Compute and storage scale completely independently.
            - Charged based on data storage (active and long-term) and the amount of data *scanned during query execution*.
            - Optimization: Use Table Partitioning (splitting tables by date, integer range, or ingestion time) and Table Clustering (sorting rows by specific column structures) to minimize data scan costs.
            
          • <strong>Cloud Dataflow (Serverless Stream/Batch ETL)</strong>:
            - Fully-managed service for running Apache Beam pipelines.
            - Auto-provisions and scales worker VM resources dynamically.
            - Guarantees exactly-once processing for pipelines like streaming Pub/Sub events directly into BigQuery.
            
          • <strong>Cloud Dataproc (Managed Hadoop & Spark)</strong>:
            - Lift-and-shift migration path for legacy on-premise Hadoop, Spark, Hive, or Pig setups.
            - Spin up clusters in under 90 seconds. Supports Spot/Preemptible VMs for worker nodes to reduce compute costs.
            - Best practice: Store operational files in Cloud Storage (gs://) instead of native cluster HDFS. This allows you to safely delete clusters when jobs finish without losing data.`,
          whenToUse: [
            "BigQuery: Running petabyte-scale analytical reports and SQL queries.",
            "Dataflow: Unified real-time serverless pipeline transformations.",
            "Dataproc: Migrating existing Apache Spark/Hadoop clusters directly to GCP."
          ],
          whenNotToUse: [
            "BigQuery for Online Transaction Processing (OLTP) demanding high-frequency single-row writes/updates (use Cloud SQL)."
          ],
          commands: [
            "bq mk --dataset --location=US [PROJECT_ID]:[DATASET_NAME]",
            "bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM [DATASET_NAME].users'",
            "gcloud dataproc clusters create my-hadoop --region=[ZONE] --num-workers=2"
          ]
        },
        {
          id: "integration-ops",
          title: "Pub/Sub Decoupling & Infrastructure-as-Code (IaC)",
          summary: `decoupling services and automating blueprints are key architectural pillars:
          
          • <strong>Cloud Pub/Sub (Event Messaging)</strong>:
            - Serverless asynchronous messaging queue. Decouples message publishers from message subscribers.
            - Retains messages for up to 7 days by default.
            - Subscriptions: Push (Pub/Sub sends HTTP requests to subscriber endpoint) vs Pull (Subscribers query Pub/Sub for messages).
            
          • <strong>Infrastructure-as-Code (IaC)</strong>:
            - <i>Deployment Manager</i>: Google's native declarative provisioning system. Blueprints are defined in YAML configurations, optionally using Python or Jinja2 templates.
            - <i>Config Connector</i>: A Kubernetes add-on allowing you to provision and manage Google Cloud resources directly through Kubernetes YAML manifests.`,
          whenToUse: [
            "Pub/Sub: Ingesting high-speed user telemetry clickstreams or decoupling distributed container microservices.",
            "Deployment Manager: Creating repeatable, GCP-only environment blueprints."
          ],
          whenNotToUse: [
            "Pub/Sub for strict FIFO transactional queuing (Pub/Sub delivers messages out of order by default unless explicit ordering keys are assigned)."
          ],
          commands: [
            "gcloud pubsub topics create [TOPIC_NAME]",
            "gcloud pubsub subscriptions create [SUB_NAME] --topic=[TOPIC_NAME]",
            "gcloud pubsub subscriptions pull [SUB_NAME] --auto-ack"
          ]
        }
      ]
    },
    {
      id: "domain-5",
      title: "Domain 5: Access, Security & Operations",
      description: "Managing IAM policies, digital identities, audit logs, resource monitoring, and billing exports.",
      topics: [
        {
          id: "iam-security-deep",
          title: "Identity & Access Management (IAM) - Thorough",
          summary: `IAM controls authentication (who you are) and authorization (what you can do):
          
          • <strong>Role Hierarchies & Types</strong>:
            - <i>Primitive Roles (Owner, Editor, Viewer)</i>: Historically available. Extremely broad. Owner can modify billing and permissions. Editor can modify resources. Viewer can view resources. Avoid in production.
            - <i>Predefined Roles (e.g., roles/storage.objectAdmin)</i>: Preconfigured granular roles created by Google targeting specific job functions. Recommended best practice.
            - <i>Custom Roles</i>: Granular, user-defined permissions. Must be maintained by the user. Can be created at the Project or Organization level, *but cannot be applied at the Folder level*.
            
          • <strong>Service Accounts (Machine Identities)</strong>:
            - Represents an application process or VM rather than a human user.
            - Best practice: Attach service accounts directly to GCE VMs, GKE pods, or Cloud Run containers. Use Application Default Credentials (ADC) instead of downloading private JSON keys, which pose major security leakage risks.
            - <i>Service Account User Role (roles/iam.serviceAccountUser)</i>: Gives a developer the right to run/attach a service account onto a VM instance.
            
          • <strong>Security Protocols</strong>:
            - <i>OS Login</i>: Manages Linux SSH keys and access permissions directly via your IAM identity database. Eliminates manual SSH key distribution.
            - <i>Organization Policies</i>: Establishes rigid constraint rules across folders and projects (e.g., disable external IP allocation, restrict GCS bucket creation to US-only regions).`,
          whenToUse: [
            "Granular Predefined Roles: Granting developers storage viewer rights without letting them access database tables.",
            "Service Accounts: Giving a backend web-server VM access to read a private GCS assets bucket.",
            "OS Login: Centralizing administrative team access on GCE VMs."
          ],
          whenNotToUse: [
            "Primitive Roles (Owner/Editor) for daily developer tasks."
          ],
          commands: [
            "gcloud projects add-iam-policy-binding [PROJECT_ID] --member=user:[MEMBER] --role=[ROLE]",
            "gcloud iam service-accounts create [SERVICE_ACCOUNT] --display-name='Web Engine'",
            "gcloud projects add-iam-policy-binding [PROJECT_ID] --member=serviceAccount:[SERVICE_ACCOUNT]@[PROJECT_ID].iam.gserviceaccount.com --role=roles/storage.objectViewer"
          ]
        },
        {
          id: "kms-encryption",
          title: "Access, Security & Encryption: Google Cloud KMS & Key Cryptography",
          summary: `Cryptographic keys and absolute secrets management are vital security anchors for the ACE exam:
          
          • <strong>Google Cloud KMS (Key Management Service)</strong>:
            - Fully-managed regional service that enables you to create, import, and rotate cryptographic keys.
            - <i>Symmetric Cryptography</i>: Utilizes the exact same single key to both encrypt and decrypt data assets (ideal for fast envelope encryption blocks / GCS disks).
            - <i>Asymmetric Cryptography</i>: Utilizes a mathematically linked key pair: a **Public Key** (available broadly to encrypt data) and a **Private Key** (kept in absolute confidence by the owner to decrypt data). Vital for digital signatures and client-identity handshake verifications.
            
          • <strong>Key Management Custody Levels</strong>:
            - <i>Google-Managed Encryption Keys (GMEK)</i>: Google generates, owns, and rotates the keys protecting your assets by default. Zero developer overhead.
            - <i>Customer-Managed Encryption Keys (CMEK)</i>: Keys are stored inside the customer's Cloud KMS project. The customer has total custody to grant, revoke, and rotate keys via IAM policies while major services (GCS, GCE, BigQuery) consume them.
            - <i>Customer-Supplied Encryption Keys (CSEK)</i>: The customer generates and holds keys in their on-premises vault, sending raw key strings inside GCE VM boot calls or gsutil headers. Google never persists the keys.
            
          • <strong>Secrets Management (Secret Manager)</strong>:
            - Specifically designed for static credentials like API keys, database user passwords, and private SSH certificates. Standard KMS is for binary key-wrapping and block-level cryptographic math.`,
          whenToUse: [
            "Customer-Managed Keys (CMEK): Mandated compliance audits requiring logging key usage and manual rotation.",
            "Asymmetric Encryption: Signing metadata payloads, issuing digital certifications, or external server handshakes.",
            "Secret Manager: Storing raw third-party token secrets or database credentials safely."
          ],
          whenNotToUse: [
            "Customer-Supplied Keys (CSEK) if standard KMS cloud-native keys fit requirements (CSEK has massive operational key loss risks)."
          ],
          commands: [
            "gcloud kms keyrings create project-keyring --location=[LOCATION]",
            "gcloud kms keys create app-encrypt-key --location=[LOCATION] --keyring=project-keyring --purpose=encryption",
            "gcloud secrets create db-password --replication-policy=automatic"
          ]
        },
        {
          id: "ops-billing",
          title: "Cloud Operations Suite & Billing Control",
          summary: `Ops Suite and billing tracking ensure healthy, cost-effective deployments:
          
          • <strong>Cloud Operations Suite (Stackdriver)</strong>:
            - <i>Cloud Logging</i>: Captures logs. Logs are routed via Log Router Sinks to destinations like BigQuery (for analysis), GCS (for cheap long-term archiving), or Pub/Sub.
            - <i>Cloud Monitoring</i>: Tracks infrastructure metrics (CPU load, active connections). *Note: Memory usage and Disk capacity alerts require the installation of the Ops Agent inside the GCE VM.*
            - <i>Uptime Checks</i>: Monitors resource reachability from global edge nodes.
            - <i>APM Tools</i>: Trace (latency tracing), Profiler (CPU/Memory performance tracing), Error Reporting (crash aggregation).
            
          • <strong>Billing Systems</strong>:
            - <i>Billing Accounts</i>: Connected to Projects to pay for resources.
            - <i>Budgets & Alerts</i>: Configures alerts (sent at 50%, 90%, 100% of spending limits). *Note: Budgets do not automatically shut down resources by default.* To auto-shutdown, you must bind Pub/Sub notifications to a Cloud Function.
            - <i>Billing Export</i>: Automatically dumps detailed usage costs into a GCS bucket or a BigQuery dataset for advanced cost analysis.`,
          whenToUse: [
            "Log Router Sinks: Routing system logs to GCS for 7-year regulatory compliance.",
            "Ops Agent: Setting up disk capacity alerts to prevent production database crashes.",
            "BigQuery Billing Export: Constructing visual cost dashboards using Looker Studio."
          ],
          whenNotToUse: [],
          commands: [
            "gcloud logging read 'severity>=ERROR' --limit=5",
            "gcloud logging sinks create my-sink storage.googleapis.com/[BUCKET_NAME] --log-filter='resource.type=gce_instance'"
          ]
        }
      ]
    }
  ],

  commands: [
    // Compute Engine
    { id: "cmd-gce-1", category: "Compute Engine", title: "Create GCE Instance", command: "gcloud compute instances create [VM_NAME] --zone=[ZONE] --machine-type=e2-medium --subnet=[SUBNET]", description: "Creates a new virtual machine instance inside a custom subnet." },
    { id: "cmd-gce-2", category: "Compute Engine", title: "Stop GCE Instance", command: "gcloud compute instances stop [VM_NAME] --zone=[ZONE]", description: "Stops a GCE instance to halt compute resource billing." },
    { id: "cmd-gce-3", category: "Compute Engine", title: "Delete GCE Instance", command: "gcloud compute instances delete [VM_NAME] --zone=[ZONE] --quiet", description: "Deletes a GCE VM permanently, freeing block resources." },
    { id: "cmd-gce-4", category: "Compute Engine", title: "List VM instances", command: "gcloud compute instances list", description: "Lists all GCE VM instances within the active project." },
    { id: "cmd-gce-5", category: "Compute Engine", title: "List Machine Types", command: "gcloud compute machine-types list --filter zone:[ZONE]", description: "Filters and lists available compute machine sizes in a target zone." },
    { id: "cmd-gce-6", category: "Compute Engine", title: "Create Instance Template", command: "gcloud compute instance-templates create [VM_TEMPLATE] --machine-type=e2-medium --subnet=[SUBNET]", description: "Creates a reusable blueprint template for spinning up GCE instances." },
    { id: "cmd-gce-7", category: "Compute Engine", title: "Create MIG (Managed Group)", command: "gcloud compute instance-groups managed create [VM_NAME]-mig --zone=[ZONE] --template=[VM_TEMPLATE] --size=2", description: "Spins up a Managed Instance Group with identical VMs based on a template." },
    { id: "cmd-gce-8", category: "Compute Engine", title: "Configure MIG Autoscaling", command: "gcloud compute instance-groups managed set-autoscaling [VM_NAME]-mig --max-num-replicas=5 --target-cpu-utilization=0.7 --zone=[ZONE]", description: "Enforces dynamic autoscaling on a MIG based on average CPU target metrics." },
    { id: "cmd-gce-9", category: "Compute Engine", title: "Resize MIG Size", command: "gcloud compute instance-groups managed resize [VM_NAME]-mig --size=4 --zone=[ZONE]", description: "Manually forces resizing of a Managed Instance Group node pool." },
    
    // App Engine
    { id: "cmd-gae-1", category: "App Engine", title: "Deploy App Engine Code", command: "gcloud app deploy app.yaml", description: "Deploys your application code to App Engine using configurations in app.yaml." },
    { id: "cmd-gae-2", category: "App Engine", title: "Deploy No-Promote Version", command: "gcloud app deploy app.yaml --version=v2 --no-promote", description: "Deploys a new version (v2) without automatically routing traffic to it." },
    { id: "cmd-gae-3", category: "App Engine", title: "Split App Traffic", command: "gcloud app services set-traffic default --splits=v2=0.5,v1=0.5 --split-by=cookie", description: "Splits App Engine traffic 50/50 between two versions using cookies." },
    { id: "cmd-gae-4", category: "App Engine", title: "List App Services", command: "gcloud app services list", description: "Lists all active service directories running inside App Engine." },
    { id: "cmd-gae-5", category: "App Engine", title: "List App Versions", command: "gcloud app versions list", description: "Lists all historical deployed versions of your App Engine services." },
    
    // Kubernetes (GKE & kubectl)
    { id: "cmd-gke-1", category: "Kubernetes Engine", title: "Create GKE Autopilot Cluster", command: "gcloud container clusters create-auto [GKE_CLUSTER] --region=[ZONE]", description: "Creates a fully-managed GKE Autopilot cluster with automatic node sizing." },
    { id: "cmd-gke-2", category: "Kubernetes Engine", title: "Import GKE Cluster Credentials", command: "gcloud container clusters get-credentials [GKE_CLUSTER] --zone=[ZONE]", description: "Imports cluster credentials into kubectl command-line configurations." },
    { id: "cmd-gke-3", category: "Kubernetes Engine", title: "Create K8s Deployment", command: "kubectl create deployment [VM_NAME]-deploy --image=[IMAGE]", description: "Deploys a container image as a Kubernetes workload." },
    { id: "cmd-gke-4", category: "Kubernetes Engine", title: "Expose Deployment (LoadBalancer)", command: "kubectl expose deployment [VM_NAME]-deploy --type=LoadBalancer --port=8080", description: "Exposes your container workload publicly via a GCP Load Balancer." },
    { id: "cmd-gke-5", category: "Kubernetes Engine", title: "Scale Deployment Replicas", command: "kubectl scale deployment [VM_NAME]-deploy --replicas=3", description: "Manually scales pod replicas within a specific deployment." },
    { id: "cmd-gke-6", category: "Kubernetes Engine", title: "Autoscale K8s Workload", command: "kubectl autoscale deployment [VM_NAME]-deploy --max=5 --cpu-percent=70", description: "Sets up a Horizontal Pod Autoscaler (HPA) to scale pods dynamically." },
    { id: "cmd-gke-7", category: "Kubernetes Engine", title: "Create ConfigMap", command: "kubectl create configmap app-config --from-literal=DB_HOST=10.0.0.5", description: "Initializes a key-value ConfigMap to inject variables into containers." },
    { id: "cmd-gke-8", category: "Kubernetes Engine", title: "Create Secret", command: "kubectl create secret generic app-secret --from-literal=DB_PASS=supersecret", description: "Creates a base64-encoded secret containing sensitive credentials." },
    { id: "cmd-gke-9", category: "Kubernetes Engine", title: "Set Container Image", command: "kubectl set image deployment/[VM_NAME]-deploy [VM_NAME]=[IMAGE]", description: "Triggers a rolling update of a deployment by setting a new container image." },
    { id: "cmd-gke-10", category: "Kubernetes Engine", title: "List Pods Wide", command: "kubectl get pods -o wide", description: "Lists all active pods in the namespace showing their allocated IPs and host nodes." },
    
    // Cloud Storage
    { id: "cmd-gcs-1", category: "Cloud Storage", title: "Create GCS Bucket", command: "gcloud storage buckets create gs://[BUCKET_NAME] --location=[ZONE] --storage-class=standard", description: "Creates a GCS object storage bucket in the specified location." },
    { id: "cmd-gcs-2", category: "Cloud Storage", title: "Copy File to Bucket", command: "gcloud storage cp [LOCAL_PATH] gs://[BUCKET_NAME]/", description: "Uploads a local file to a GCS bucket." },
    { id: "cmd-gcs-3", category: "Cloud Storage", title: "List Bucket Contents", command: "gcloud storage ls gs://[BUCKET_NAME]", description: "Lists objects stored in the target Cloud Storage bucket." },
    
    // Block Storage
    { id: "cmd-pd-1", category: "Block Storage", title: "Resize Persistent Disk", command: "gcloud compute disks resize [VM_NAME]-disk --size=[DISK_SIZE] --zone=[ZONE]", description: "Resizes a network-attached disk volume on-the-fly." },
    { id: "cmd-pd-2", category: "Block Storage", title: "List Disk Types", command: "gcloud compute disk-types list", description: "Lists available disk types (HDD, SSD, Balanced) for the active project." },
    
    // IAM & Project
    { id: "cmd-iam-1", category: "IAM & Identity", title: "Set Active GCP Project", command: "gcloud config set project [PROJECT_ID]", description: "Sets the default project ID context for local terminal commands." },
    { id: "cmd-iam-2", category: "IAM & Identity", title: "Add Project IAM Binding", command: "gcloud projects add-iam-policy-binding [PROJECT_ID] --member=user:[MEMBER] --role=[ROLE]", description: "Grants a specific role binding permission to a human identity." },
    { id: "cmd-iam-3", category: "IAM & Identity", title: "Remove Project IAM Binding", command: "gcloud projects remove-iam-policy-binding [PROJECT_ID] --member=user:[MEMBER] --role=[ROLE]", description: "Revokes a role binding from a user context." },
    { id: "cmd-iam-4", category: "IAM & Identity", title: "Create Service Account", command: "gcloud iam service-accounts create [SERVICE_ACCOUNT] --display-name='App Engine SA'", description: "Creates a machine service account identity." },
    
    // Pub/Sub
    { id: "cmd-pubsub-1", category: "Integration Services", title: "Create Pub/Sub Topic", command: "gcloud pubsub topics create [BUCKET_NAME]-topic", description: "Initializes an event-messaging topic broker." },
    { id: "cmd-pubsub-2", category: "Integration Services", title: "Create Subscription", command: "gcloud pubsub subscriptions create [BUCKET_NAME]-sub --topic=[BUCKET_NAME]-topic", description: "Creates a pull subscription connected to the topic." },
    { id: "cmd-pubsub-3", category: "Integration Services", title: "Publish Message", command: "gcloud pubsub topics publish [BUCKET_NAME]-topic --message='Test message'", description: "Publishes a text payload message to the topic." },
    { id: "cmd-pubsub-4", category: "Integration Services", title: "Pull Messages", command: "gcloud pubsub subscriptions pull [BUCKET_NAME]-sub --auto-ack", description: "Pulls pending messages from the subscription queue and acknowledges them automatically." }
  ],

  quiz: [
    // --- COMPUTE QUESTIONS ---
    {
      id: "q1",
      domain: "domain-1",
      question: "You want to deploy a relational SQL database to Google Cloud. The system must support multi-region horizontal scaling, global synchronous writes, and strong transactional ACID consistency. Which database matches these criteria?",
      options: [
        "Cloud SQL",
        "Cloud Spanner",
        "Cloud Bigtable",
        "Firestore in Datastore mode"
      ],
      correctIndex: 1,
      explanation: "Cloud Spanner is Google's enterprise-grade relational SQL database that offers strong global consistency, ACID transactions, and horizontal scaling. Cloud SQL is regional and cannot handle global-write horizontal scale. Cloud Bigtable and Firestore are NoSQL options."
    },
    {
      id: "q2",
      domain: "domain-1",
      question: "Your team is launching an API on a GCE VM. You want the VM to be able to read objects from a private Cloud Storage bucket in the same project, adhering to Google's security best practices. How should you authorize this access?",
      options: [
        "Generate a service account private JSON key, download it, and upload it to the VM's directory.",
        "Assign the broad primitive role 'Owner' to the VM's project configurations.",
        "Create a dedicated service account, grant it 'roles/storage.objectViewer' on the bucket, attach the service account directly to the GCE VM instance, and let the application use Application Default Credentials (ADC).",
        "Enable Public Read access on the Cloud Storage bucket so that the VM can download files via curl."
      ],
      correctIndex: 2,
      explanation: "According to the principle of least privilege, you should create a scoped service account, assign it the minimal required role (roles/storage.objectViewer), attach it directly to the GCE VM, and leverage Application Default Credentials. Hardcoding keys is a security risk; primitive roles grant too much power; public access is a massive security hazard."
    },
    {
      id: "q3",
      domain: "domain-1",
      question: "You need to deploy a containerized API on GCP that scales down to zero when inactive to save on idle compute costs. You do not need complex Kubernetes routing, and want the simplest, fully-managed serverless environment. Which service fits this requirement?",
      options: [
        "Google Kubernetes Engine (GKE) Standard mode",
        "App Engine Flexible Environment",
        "Cloud Run",
        "Google Compute Engine with Managed Instance Groups"
      ],
      correctIndex: 2,
      explanation: "Cloud Run is a fully-managed serverless container platform that automatically scales to zero when there is no traffic, billing you strictly down to the nearest 100ms during request execution. GKE and GCE VMs incur baseline worker VM costs. App Engine Flex has a minimum scale of 1 instance and does not scale to zero."
    },
    {
      id: "q4",
      domain: "domain-1",
      question: "You are setting up a GKE cluster. You want Google to fully manage the worker VM nodes, OS patching, provisioning, and automatic cluster scaling, while charging you strictly per running Pod resource. Which configuration should you choose?",
      options: [
        "GKE Standard Cluster with Cluster Autoscaling",
        "GKE Autopilot Cluster",
        "Managed Instance Group running Docker containers",
        "App Engine Standard Environment"
      ],
      correctIndex: 1,
      explanation: "GKE Autopilot is a fully-managed mode of GKE where Google manages all cluster VM node infrastructure, security, and scaling. In this mode, you are billed based on the resource requests (CPU, memory, storage) of running pods rather than for the underlying VMs."
    },
    {
      id: "q5",
      domain: "domain-1",
      question: "You want to run a web application on App Engine. The runtime environment requires a highly custom, third-party operating system binary and must write temporary files directly to local system directories. Which runtime option should you select?",
      options: [
        "App Engine Standard Environment",
        "App Engine Flexible Environment",
        "Cloud Functions with HTTP Trigger",
        "Cloud Run in scale-to-zero mode"
      ],
      correctIndex: 1,
      explanation: "App Engine Flexible Environment runs application code inside custom Docker containers, allowing you to configure custom runtimes, install system libraries, and write to local files. The Standard Environment is sandboxed, supports restricted language runtimes, and does not allow writing to local directories."
    },
    {
      id: "q6",
      domain: "domain-1",
      question: "You are designing a batch-processing GCE instance that runs a non-critical algorithm for 4 hours. You want to minimize compute costs. The application can be interrupted at any time and resumed later. Which VM configuration should you use?",
      options: [
        "E2 machine type with a custom Persistent Disk",
        "Spot VM",
        "Shielded VM",
        "Sole-tenant node VM"
      ],
      correctIndex: 1,
      explanation: "Spot VMs (formerly Preemptible VMs) offer up to a 91% discount on standard GCE prices. They leverage excess GCP capacity and can be reclaimed by Google with a 30-second warning, making them perfect for non-critical, fault-tolerant batch workloads."
    },
    {
      id: "q7",
      domain: "domain-1",
      question: "You need to scale a GKE deployment horizontally by adding or removing Pod replicas automatically based on average CPU utilization targets. Which native Kubernetes resource must you configure?",
      options: [
        "Vertical Pod Autoscaler (VPA)",
        "Horizontal Pod Autoscaler (HPA)",
        "Cluster Autoscaler",
        "Node Pool Autoprovisioning"
      ],
      correctIndex: 1,
      explanation: "The Horizontal Pod Autoscaler (HPA) automatically adjusts the number of replica Pods in a deployment based on CPU load or custom metrics. The VPA resizes the CPU/memory of individual container resources. The Cluster Autoscaler adds or removes VM nodes from node pools."
    },
    {
      id: "q8",
      domain: "domain-1",
      question: "An application running on an App Engine application needs to distribute traffic 70% to version v1 and 30% to a newly deployed version v2. How should you configure this?",
      options: [
        "Set up an external Application Load Balancer and configure path-based routing rules.",
        "Use App Engine Traffic Splitting in the Console to allocate traffic percentages by Cookie or IP address.",
        "Create a Cloud Pub/Sub topic that acts as a router to split requests.",
        "Change the DNS records of your domain to point to two different App Engine projects."
      ],
      correctIndex: 1,
      explanation: "App Engine includes native traffic splitting capabilities inside the console or via CLI. You can route specific percentages of incoming web traffic between multiple versions based on cookie sessions or IP addresses."
    },
    {
      id: "q9",
      domain: "domain-1",
      question: "You want to ensure that a GCE VM is fully protected against rootkits and unauthorized boot-level modifications. You want to verify the boot signature using hardware-level measurements. Which console feature must be enabled?",
      options: [
        "Confidential VMs",
        "Shielded VMs with Secure Boot and vTPM",
        "Preemptible VMs",
        "Access Control Lists (ACLs)"
      ],
      correctIndex: 1,
      explanation: "Shielded VMs secure GCE instances against boot-level malware and rootkits by leveraging Secure Boot, measured boot, and virtual Trusted Platform Module (vTPM) monitoring."
    },
    {
      id: "q10",
      domain: "domain-1",
      question: "You are deploy an image-processing microservice that starts executing only when a new image file is uploaded to a Cloud Storage bucket. It completes execution in under 15 seconds. Which serverless model fits best?",
      options: [
        "App Engine Flexible Environment",
        "GKE Standard Node Pool",
        "Cloud Functions triggered by a GCS event",
        "Persistent Disk with Multi-Writer mode"
      ],
      correctIndex: 2,
      explanation: "Cloud Functions are lightweight, event-driven serverless functions. Triggering a function via a GCS bucket upload event is the ideal, most resource-efficient solution for short-lived, reactive tasks."
    },

    // --- STORAGE & DB QUESTIONS ---
    {
      id: "q11",
      domain: "domain-2",
      question: "You are setting up a regional Cloud SQL PostgreSQL database instance. You want to ensure the highest possible availability with automatic failover to another zone in the same region. What configuration should you enable?",
      options: [
        "Create an asynchronous Read Replica in another zone.",
        "Enable High Availability (HA) with a synchronous standby replica in another zone.",
        "Configure automated daily backups to a different region.",
        "Create an external Load Balancer to split writes between two database masters."
      ],
      correctIndex: 1,
      explanation: "To achieve High Availability (HA) on Cloud SQL, you enable the HA toggle, which provisions a synchronous standby replica in a different zone within the same region. Failure of the primary instance triggers automatic failover to the standby with zero connection IP changes."
    },
    {
      id: "q12",
      domain: "domain-2",
      question: "Your company has historical audit logs stored in Cloud Storage. These files must be retained for 7 years for regulatory compliance, but will likely never be accessed. You want to minimize storage costs. Which storage class should you choose?",
      options: [
        "Standard Storage",
        "Nearline Storage",
        "Coldline Storage",
        "Archive Storage"
      ],
      correctIndex: 3,
      explanation: "Archive Storage class provides the lowest storage cost per gigabyte, making it ideal for regulatory compliance data that is accessed less than once a year. Nearline (30+ days) and Coldline (90+ days) are for more frequently accessed data."
    },
    {
      id: "q13",
      domain: "domain-2",
      question: "A high-performance GCE VM database application needs storage with extremely high IOPS and the lowest possible read/write latency. The database replication model already handles node-level data losses. Which storage option is best?",
      options: [
        "Standard Persistent Disk (pd-standard)",
        "Balanced Persistent Disk (pd-balanced)",
        "Local SSD",
        "Cloud Filestore shared drive"
      ],
      correctIndex: 2,
      explanation: "Local SSDs are physically attached to the host server, offering exceptionally low latency and extremely high IOPS compared to network-attached Persistent Disks. Since the application handles node-level recovery, the ephemeral nature of Local SSD is acceptable."
    },
    {
      id: "q14",
      domain: "domain-2",
      question: "You have a WordPress cluster running on multiple GCE VMs that must simultaneously read and write shared media assets to a common directory. Which POSIX-compliant storage system should you implement?",
      options: [
        "Cloud Storage Bucket",
        "Cloud Filestore",
        "pd-ssd Persistent Disk with standard settings",
        "Local SSD in multi-writer configuration"
      ],
      correctIndex: 1,
      explanation: "Cloud Filestore provides fully-managed NFS (Network File System) shared drives that are POSIX-compliant and can be mounted concurrently with read/write access across multiple GCE VMs."
    },
    {
      id: "q15",
      domain: "domain-2",
      question: "You want to automate the process of moving objects in a Cloud Storage bucket from Standard to Coldline after 60 days, and deleting them after 365 days. How can you accomplish this?",
      options: [
        "Write a custom Python script and run it hourly on a GCE cron job.",
        "Configure Object Lifecycle Management rules on the bucket.",
        "Set up a Cloud Monitoring alert policy.",
        "Use BigQuery to run delete scripts on GCS metadata."
      ],
      correctIndex: 1,
      explanation: "Object Lifecycle Management allows you to define declarative rules on a GCS bucket to automatically transition objects to cheaper storage classes or delete them based on age, version count, or creation date."
    },
    {
      id: "q16",
      domain: "domain-2",
      question: "You have an external third-party partner who needs to download a secure, private database snapshot file from your GCS bucket. They do not have Google Cloud identities. How can you safely grant them access for 2 hours?",
      options: [
        "Configure the bucket to be fully public for 2 hours, then make it private again.",
        "Create a temporary Google account for their developer.",
        "Generate a Signed URL for the object with an expiration lifetime of 2 hours.",
        "Ask them to set up a VPN to your VPC to mount the bucket."
      ],
      correctIndex: 2,
      explanation: "A Signed URL grants limited-time cryptographic access to specific GCS objects. This allows external clients without Google identities to securely read or write files for a designated duration."
    },
    {
      id: "q17",
      domain: "domain-2",
      question: "You are experiencing write performance degradation on a Cloud Bigtable instance. Analysis reveals that most write operations are hitting a single database node because your row keys contain sequential timestamps. What is this issue called?",
      options: [
        "Coldline transition failure",
        "Hotspotting",
        "Replica drift",
        "ACID synchronization lag"
      ],
      correctIndex: 1,
      explanation: "Hotspotting occurs in NoSQL wide-column systems like Bigtable when sequential row keys (such as ascending timestamps) route successive write operations to the same node, negating the performance benefits of a distributed cluster."
    },
    {
      id: "q18",
      domain: "domain-2",
      question: "You want to build a cache shield in front of your Cloud SQL database to accelerate query responses for web application users. You need a fully-managed, in-memory data store supporting Redis APIs. Which service fits?",
      options: [
        "Cloud Memorystore",
        "Cloud SQL Read Replicas",
        "Firestore in Datastore mode",
        "Local SSD cache"
      ],
      correctIndex: 0,
      explanation: "Cloud Memorystore is a fully-managed, in-memory caching service that supports open-source Redis and Memcached APIs, providing sub-millisecond query caches for high-traffic databases."
    },
    {
      id: "q19",
      domain: "domain-2",
      question: "You are planning a multi-tenant SaaS application backend. Each tenant requires a separate JSON document tree containing highly dynamic metadata that scales to millions of users automatically. Which serverless NoSQL database should you choose?",
      options: [
        "Cloud SQL PostgreSQL",
        "Cloud Spanner",
        "Firestore",
        "Cloud Bigtable"
      ],
      correctIndex: 2,
      explanation: "Firestore is a serverless, highly-scalable NoSQL document database optimized for storing dynamic JSON document collections. It auto-scales based on traffic and charges only for active operations."
    },
    {
      id: "q20",
      domain: "domain-2",
      question: "You are scaling an attached GCE persistent disk pd-ssd from 50GB to 250GB. The VM remains online. After running the gcloud resize command, what must you do to ensure the extra space is visible inside the VM operating system?",
      options: [
        "Nothing; GCE automatically expands filesystems inside all active virtual machines.",
        "Reboot the GCE VM immediately.",
        "Log into the VM OS and run commands to expand the partition and resize the filesystem.",
        "Detach the disk, format it, and reattach it to the VM."
      ],
      correctIndex: 2,
      explanation: "While GCP allows you to resize Persistent Disks online without downtime, you must still log in to the virtual machine operating system and run partition tools (e.g., resize2fs, xfs_growfs) to expand the filesystem."
    },

    // --- NETWORKING QUESTIONS ---
    {
      id: "q21",
      domain: "domain-3",
      question: "You are setting up a custom VPC network for your organization. You want to ensure that developers can deploy resources securely without auto-creating subnets in every single region. How should you configure the VPC?",
      options: [
        "Create the network in Auto Subnet Mode.",
        "Create the network in Custom Subnet Mode.",
        "Create a Shared VPC Host Project.",
        "Deploy a Cloud Router inside the subnets."
      ],
      correctIndex: 1,
      explanation: "In Custom Subnet Mode, you manually control the creation of regional subnets and their CIDR ranges. Auto mode automatically generates subnets in every single region, which can lead to IP address collisions in peered environments."
    },
    {
      id: "q22",
      domain: "domain-3",
      question: "You have GCE VM instances in a private subnet with *only internal private IP addresses*. These VMs need to securely fetch configuration assets from Google Cloud Storage (GCS) without using public internet routes. What should you configure?",
      options: [
        "Attach public external IP addresses to all VMs.",
        "Configure Private Google Access on the subnet.",
        "Set up a Classic VPN gateway inside the subnet.",
        "Create a firewall rule allowing all outbound egress traffic."
      ],
      correctIndex: 1,
      explanation: "Private Google Access allows GCE VMs with private internal IP addresses to securely access Google APIs and services (such as GCS buckets, BigQuery, etc.) via private IP routing without routing out to the public internet."
    },
    {
      id: "q23",
      domain: "domain-3",
      question: "You need to establish a highly available, encrypted network connection between your on-premises data center and a Google Cloud VPC, ensuring a 99.99% SLA. What hybrid network setup matches this SLA?",
      options: [
        "A single Classic VPN gateway with one tunnel.",
        "A Cloud HA VPN gateway configured with two active IPSec tunnels using distinct public IP interfaces.",
        "A Dedicated Interconnect circuit with no backup lines.",
        "A Shared VPC linking the host project."
      ],
      correctIndex: 1,
      explanation: "Google HA (High Availability) VPN provides a 99.99% SLA by requiring two active IPSec tunnels routed via two independent external IP interfaces in a single regional gateway. Classic VPN only supports a 99.9% SLA."
    },
    {
      id: "q24",
      domain: "domain-3",
      question: "Your large enterprise wants to centralize all IP CIDR planning, subnet allocations, and firewall configurations under a network administration project, while allowing product teams in service projects to deploy compute instances directly into these subnets. Which model fits?",
      options: [
        "VPC Peering",
        "Shared VPC",
        "Cloud HA VPN",
        "Private Google Access"
      ],
      correctIndex: 1,
      explanation: "Shared VPC allows an organization to designate a Host Project containing the shared network subnets, while Service Projects deploy GCE VMs directly into those subnets. This maintains centralized security and administrative control."
    },
    {
      id: "q25",
      domain: "domain-3",
      question: "You want to connect two separate VPC networks (VPC A and VPC B) belonging to different departments in your company. The networks do not have overlapping IP ranges. You want to route internal IP traffic directly without gateway overhead. Which solution should you implement?",
      options: [
        "VPC Peering",
        "Shared VPC",
        "Cloud HA VPN",
        "Private Service Connect"
      ],
      correctIndex: 0,
      explanation: "VPC Peering securely links two completely independent VPC networks, allowing resources to communicate using internal IP addresses with no gateway bottlenecks. VPC Peering is non-transitive."
    },
    {
      id: "q26",
      domain: "domain-3",
      question: "You have a high-traffic global web application deployed across GCE VM groups in the US, Europe, and Asia. You want to route user requests to the closest regional group using a single external IP address, with automatic SSL certificate termination. Which load balancer fits?",
      options: [
        "Regional External Network Load Balancer (L4)",
        "Global External Application Load Balancer (L7)",
        "Regional Internal Load Balancer",
        "Classic VPN Gateway"
      ],
      correctIndex: 1,
      explanation: "The Global External Application Load Balancer is a Layer 7 proxy load balancer that manages incoming HTTP/HTTPS traffic. It supports content-based routing, SSL termination, and routes user traffic to the closest backend group using a single global IP address."
    },
    {
      id: "q27",
      domain: "domain-3",
      question: "Your team wants to deploy a secure internal domain name system within a VPC so that GCE instances can resolve 'api.internal.net' to a private IP. The records must not be visible to the public internet. What should you configure?",
      options: [
        "A public DNS zone in Cloud DNS.",
        "A private DNS zone in Cloud DNS associated with your VPC network.",
        "An host file update on every GCE VM.",
        "A Cloud NAT gateway routing ruleset."
      ],
      correctIndex: 1,
      explanation: "Cloud DNS supports private DNS zones. Private zones are visible only to the specified VPC networks, allowing internal name resolution without exposing internal DNS records to the public internet."
    },
    {
      id: "q28",
      domain: "domain-3",
      question: "You are planning hybrid connectivity. Your corporate data center requires a high-bandwidth, consistent network connection to GCP to sync multiple terabytes of analytics daily, and you cannot tolerate latency spikes. You want a direct physical fiber connection. Which service should you choose?",
      options: [
        "Cloud HA VPN",
        "Dedicated Interconnect",
        "Partner Interconnect",
        "VPC Peering"
      ],
      correctIndex: 1,
      explanation: "Dedicated Interconnect provides a direct, high-capacity physical fiber connection between your corporate network and a Google co-location facility (available in 10Gbps or 100Gbps increments), offering consistent low latency and high throughput."
    },
    {
      id: "q29",
      domain: "domain-3",
      question: "You want to configure a stateful firewall rule to allow ingress TCP traffic on port 80 strictly for VM instances that serve as production web servers. How should you target these specific VMs in the firewall rule?",
      options: [
        "Assign a custom Network Tag (e.g., 'web-server') to the VM instances and specify that tag as the rule target.",
        "Define individual static IP ranges for every single VM instance inside the firewall rule.",
        "Create a new subnet for every single GCE VM.",
        "Assign the primitive role 'Owner' to the VM metadata."
      ],
      correctIndex: 0,
      explanation: "In GCP, you can target stateful firewall rules to specific VMs within a global subnet by using Network Tags (or Service Accounts). This avoids hardcoding dynamic IP addresses in firewall configurations."
    },
    {
      id: "q30",
      domain: "domain-3",
      question: "You want to link VPC A with VPC B, and VPC B with VPC C using VPC Peering. VPC A needs to send internal traffic to VPC C. What will happen when VPC A attempts to route packets to VPC C?",
      options: [
        "The packets will traverse through VPC B automatically since they are peered.",
        "The connection will fail because VPC Peering is non-transitive.",
        "You must configure a Cloud Router to handle transitive peering.",
        "The connection succeeds because VPC Peering is transitive by default."
      ],
      correctIndex: 1,
      explanation: "VPC Peering is non-transitive. If VPC A is peered with B, and B with C, resources in A cannot communicate with C through the peering path. You must establish direct peering between A and C, or route through a transit gateway."
    },

    // --- SECURITY & IAM QUESTIONS ---
    {
      id: "q31",
      domain: "domain-5",
      question: "Your security officer wants to audit every administrative action performed in your GCP project. Where are these logs tracked, and how long are administrative audit records retained by default for free?",
      options: [
        "Cloud Monitoring; 30 days.",
        "Cloud Audit Logs (Admin Activity); 400 days.",
        "Cloud Logging sinks; 7 years.",
        "GCS long-term storage; 365 days."
      ],
      correctIndex: 1,
      explanation: "Cloud Audit Logs automatically track Admin Activity logs, retaining these records for 400 days at no cost. System Event logs are also kept for 400 days, whereas Data Access logs have a default retention of 30 days."
    },
    {
      id: "q32",
      domain: "domain-5",
      question: "You want to grant a new developer permission to view all resource structures in your project, but prevent them from modifying any configurations or viewing database contents. Which role matches this principle?",
      options: [
        "Primitive role 'Editor'",
        "Predefined role 'roles/viewer'",
        "Predefined role 'roles/owner'",
        "A custom role deployed at the folder level"
      ],
      correctIndex: 1,
      explanation: "The predefined role `roles/viewer` (Viewer) permits read-only access to all metadata and resources without allowing modifications. Primitive roles are too broad for this scenario. Custom roles cannot be created at the folder level."
    },
    {
      id: "q33",
      domain: "domain-5",
      question: "You want to create a custom IAM role to grant granular permissions for a proprietary application. You want to make this custom role reusable across multiple projects in a folder named 'Finance'. How should you create it?",
      options: [
        "Create the custom role at the Folder level.",
        "Create the custom role at the Organization level (or Project level) and apply bindings in target projects.",
        "Deploy a primitive Owner role.",
        "Use local VM OS Login rules."
      ],
      correctIndex: 1,
      explanation: "Custom IAM roles can only be created at the Project level or Organization level. They *cannot* be created at the Folder level. You must create the custom role at the Organization level or in individual projects."
    },
    {
      id: "q34",
      domain: "domain-5",
      question: "A developer has been assigned a custom service account named 'data-loader@my-project.iam.gserviceaccount.com' to run backend script operations. They need to assign this service account to a GCE VM. What IAM permission do they need on the service account?",
      options: [
        "roles/iam.serviceAccountKeyAdmin",
        "roles/iam.serviceAccountUser",
        "roles/storage.objectViewer",
        "roles/owner"
      ],
      correctIndex: 1,
      explanation: "To attach a service account to a VM instance, a developer needs the Service Account User role (`roles/iam.serviceAccountUser`) on that service account resource."
    },
    {
      id: "q35",
      domain: "domain-5",
      question: "Your enterprise wants to prevent any developer from launching VMs with public external IP addresses across all active projects. How can you enforce this constraint globally?",
      options: [
        "Create a firewall rule denying all outbound HTTP traffic.",
        "Define an Organization Policy constraint to restrict public external IP allocations and apply it to the root Organization node.",
        "Create a custom IAM role restricting VM creation.",
        "Manually delete external IPs daily."
      ],
      correctIndex: 1,
      explanation: "Organization Policies allow administrators to define declarative constraints (e.g., restrict public external IPs) at the Org, Folder, or Project level. This globally restricts resource configurations."
    },

    // --- OTHER SAMPLES FOR A BIG DATABASE ---
    {
      id: "q36",
      domain: "domain-5",
      question: "You want to secure Linux VM logins across your company by linking SSH keys to users' central IAM identities, avoiding manual SSH key management. Which feature should you enable?",
      options: [
        "Cloud KMS",
        "OS Login",
        "Confidential VMs",
        "Shielded VMs"
      ],
      correctIndex: 1,
      explanation: "OS Login simplifies SSH access management by linking a user's Linux VM login credentials to their Google Workspace or Cloud Identity IAM account, eliminating the need to distribute and manage public SSH keys manually."
    },
    {
      id: "q37",
      domain: "domain-4",
      question: "You are planning an ETL pipeline to ingest massive clickstream data from Cloud Pub/Sub, transform it in real-time, and store the output in BigQuery. You need a serverless, autoscaling processing engine. Which service fits?",
      options: [
        "Cloud Dataproc",
        "Cloud Dataflow",
        "Cloud SQL PostgreSQL",
        "Deployment Manager"
      ],
      correctIndex: 1,
      explanation: "Cloud Dataflow is a fully managed serverless ETL engine running Apache Beam pipelines. It automatically scales worker nodes dynamically and handles both streaming and batch workloads."
    },
    {
      id: "q38",
      domain: "domain-5",
      question: "You want to set a project budget alert of $500. You want to receive email alerts when spending reaches 50%, 90%, and 100% of this budget. Will this budget configuration automatically disable or shut down your active VM instances once spending reaches 100%?",
      options: [
        "Yes, GCP budgets automatically terminate all running GCE VMs upon budget exhaustion.",
        "No, budgets and alerts are purely informational. To automate resource shutdowns, you must route budget alerts to a Pub/Sub topic and trigger a Cloud Function.",
        "Only if you use App Engine Flexible.",
        "Yes, but only if you use a Credit Card payment method."
      ],
      correctIndex: 1,
      explanation: "GCP budgets and alerts do not automatically disable or shut down resources. They are informational notifications. To automate resource termination, you must configure budget notifications to publish to a Pub/Sub topic and trigger a script (e.g., a Cloud Function)."
    },
    {
      id: "q39",
      domain: "domain-4",
      question: "You have an Apache Spark and Hadoop data processing pipeline running on-premise that you want to lift-and-shift to GCP with minimal code changes. You want to provision a managed Hadoop cluster in under 90 seconds. Which service should you choose?",
      options: [
        "Cloud Dataflow",
        "Cloud Dataproc",
        "Cloud Spanner",
        "Google Compute Engine with individual manual VM installations"
      ],
      correctIndex: 1,
      explanation: "Cloud Dataproc is a fully-managed Spark and Hadoop service that allows you to deploy and scale open-source big data clusters in under 90 seconds, making it ideal for direct lift-and-shift migrations."
    },
    {
      id: "q40",
      domain: "domain-4",
      question: "You are optimizing BigQuery query performance for a massive active user table that is queried daily using a date filter. You want to minimize data scans and costs. What should you configure on the table?",
      options: [
        "Create an index on the user ID column.",
        "Partition the table by the query date column.",
        "Export the data to GCS Standard class.",
        "Convert the table to a Cloud SQL relational format."
      ],
      correctIndex: 1,
      explanation: "Partitioning a BigQuery table divides it into segments based on a date or integer column. Queries filtered by the partition column only scan the relevant segments, significantly reducing data processing costs and query latency."
    },
    {
      id: "q41",
      domain: "domain-5",
      question: "You want to grant a developer the ability to create and download private keys for service accounts in a specific project, without granting them the full broad 'Editor' or 'Owner' primitive roles. Which predefined role should you assign?",
      options: [
        "roles/iam.serviceAccountUser",
        "roles/iam.serviceAccountKeyAdmin",
        "roles/iam.securityAdmin",
        "roles/viewer"
      ],
      correctIndex: 1,
      explanation: "The Service Account Key Admin role (roles/iam.serviceAccountKeyAdmin) allows users to create, delete, and manage service account keys without broader project administration permissions."
    },
    {
      id: "q42",
      domain: "domain-3",
      question: "You need to securely connect two VPC networks located in different GCP projects within the same organization. The IP ranges of the networks do not overlap. What is the most performant, low-latency way to enable private IP communication between them?",
      options: [
        "Create an IPSec VPN tunnel using Cloud VPN.",
        "Set up VPC Network Peering between the two networks.",
        "Configure an External Application Load Balancer to proxy traffic.",
        "Use a Shared VPC with the host project configuration."
      ],
      correctIndex: 1,
      explanation: "VPC Network Peering allows you to connect two VPC networks in different projects or organizations so that resources can communicate privately using internal IP addresses with no external internet transit."
    },
    {
      id: "q43",
      domain: "domain-2",
      question: "Your enterprise has strict compliance requirements. Audit logs stored in a Cloud Storage bucket must be retained for exactly 7 years and cannot be deleted or modified by any user, including the project owner, during that duration. Which GCS feature should you implement?",
      options: [
        "Set up an Object Lifecycle rule to delete objects older than 7 years.",
        "Enable Object Versioning on the bucket.",
        "Configure a Retention Policy on the bucket and lock it.",
        "Use an Access Control List (ACL) to restrict write access to read-only."
      ],
      correctIndex: 2,
      explanation: "A locked bucket Retention Policy enforces a WORM (Write Once Read Many) standard. Once locked, it cannot be deleted or overridden by anyone, even the project Owner, until the specified retention time has passed."
    },
    {
      id: "q44",
      domain: "domain-1",
      question: "You are deploying an application on GKE. The workload experiences unpredictable traffic spikes, causing some Pods to go into a 'Pending' status due to insufficient CPU capacity on existing worker nodes. What should you enable to handle this dynamically?",
      options: [
        "Horizontal Pod Autoscaler (HPA)",
        "Vertical Pod Autoscaler (VPA)",
        "GKE Cluster Autoscaler",
        "Managed Instance Group Autohealing"
      ],
      correctIndex: 2,
      explanation: "The GKE Cluster Autoscaler automatically adds or removes VM worker nodes from your GKE node pools when there are unschedulable Pods due to resource limitations."
    },
    {
      id: "q45",
      domain: "domain-4",
      question: "Your finance department needs to analyze daily cost spikes and run custom SQL queries on resources inside your GCP billing accounts. They want to connect Looker Studio for visual reports. What is the Google-recommended approach to set this up?",
      options: [
        "Write a Python script that parses billing logs in Cloud Logging.",
        "Download billing CSV invoices monthly and upload them to Cloud Memorystore.",
        "Configure Billing Data Export to BigQuery and query the datasets with SQL.",
        "Provide primitive roles/owner access of the billing account to the finance team."
      ],
      correctIndex: 2,
      explanation: "Configuring Cloud Billing export to BigQuery allows automatic daily loading of cost metrics. From BigQuery, teams can execute complex SQL analyses and build interactive visualization panels using Looker Studio."
    },
    {
      id: "q46",
      domain: "domain-5",
      question: "You are deploying a Cloud Run service that connects to a Cloud SQL PostgreSQL database. You need to supply the database password securely, preventing it from appearing in plaintext inside environment configurations or build logs. Which service fits best?",
      options: [
        "Google Cloud KMS (Key Management Service)",
        "Secret Manager",
        "Compute Engine Metadata Server",
        "Cloud Storage bucket with restricted ACLs"
      ],
      correctIndex: 1,
      explanation: "Secret Manager is the GCP service designed specifically to store sensitive data like passwords, API keys, and certificates. Cloud Run can mount secrets as environment variables or filesystem volumes."
    },
    {
      id: "q47",
      domain: "domain-1",
      question: "You have a web application running on App Engine Flexible. To cut down on idle compute infrastructure costs, you want the application instances to scale down to zero when there is no traffic. What is the most effective solution?",
      options: [
        "Configure App Engine Flex to scale to zero using app.yaml configurations.",
        "Migrate the application runtime to App Engine Standard Environment.",
        "Move the web application to a single-tenant Compute Engine VM.",
        "Attach a Spot VM to the App Engine Flexible deployment."
      ],
      correctIndex: 1,
      explanation: "App Engine Flexible does not support scaling down to zero; it requires a minimum of 1 active instance. App Engine Standard environment natively supports scaling to zero instances to avoid compute costs during idle periods."
    },
    {
      id: "q48",
      domain: "domain-3",
      question: "You have deployed a backend processing application on GCE VM instances within a private subnet. These VMs possess *only* internal private IP addresses. The application must regularly query an external third-party API on the internet. How can you facilitate this?",
      options: [
        "Enable Private Google Access on the subnet.",
        "Assign public ephemeral IPs to all backend GCE instances.",
        "Deploy a Cloud NAT gateway in the subnet's region.",
        "Set up a VPC Peering link to the external API's network."
      ],
      correctIndex: 2,
      explanation: "Cloud NAT allows GCE VMs without public IPs to securely initiate connections to the internet (outbound traffic) for updates or API queries, while blocking unsolicited incoming traffic."
    },
    {
      id: "q49",
      domain: "domain-2",
      question: "You are migrating an on-premise application cache running on Redis to GCP. The database cache must be fully managed, support sub-millisecond read latency, and automatically failover across zones in the same region. Which service should you choose?",
      options: [
        "Cloud Memorystore for Redis in High Availability (HA) tier",
        "Deploy Redis on a GKE cluster with manual node mounting",
        "Cloud Spanner in multi-region setup",
        "Firestore in Datastore mode"
      ],
      correctIndex: 0,
      explanation: "Cloud Memorystore for Redis is GCP's fully managed Redis service. The High Availability (HA) tier automatically provisions a primary node and a standby replica in a different zone with automatic failover."
    },
    {
      id: "q50",
      domain: "domain-4",
      question: "You want to set up an alert policy that sends a notification to your team's Slack channel whenever a production VM instance's CPU utilization exceeds 85% for more than 5 minutes. What service should you use?",
      options: [
        "Cloud Logging sinks",
        "Cloud Monitoring Alerting Policies",
        "Google Cloud Deployment Manager triggers",
        "Cloud Pub/Sub push notification queue"
      ],
      correctIndex: 1,
      explanation: "Cloud Monitoring allows you to define Alerting Policies. You can set conditions (such as CPU > 85% for 5 minutes) and attach notification channels like Slack, Webhooks, or Email."
    },
    {
      id: "q51",
      domain: "domain-5",
      question: "A security compliance auditor needs to inspect all resource metadata across your entire GCP Organization (including all folders and projects) to confirm IAM policies. What is the most efficient way to authorize this?",
      options: [
        "Grant the primitive role 'Owner' to the auditor's email in every project individually.",
        "Grant the predefined role 'Viewer' (roles/viewer) at the Organization resource root level.",
        "Generate a service account and attach it to the auditor's local desktop.",
        "Create a custom role with billing admin rights at the folder level."
      ],
      correctIndex: 1,
      explanation: "IAM permissions are inherited down the resource hierarchy. Granting the Viewer role at the Organization root level automatically propagates read-only metadata viewing access to all Folders, Projects, and resources."
    },
    {
      id: "q52",
      domain: "domain-1",
      question: "You run a stateful database on a group of GCE VMs. You want to ensure that if a VM instance experiences OS-level crashes or database engine hangs, the system automatically detects this and redeploys the instance. What is the Google-recommended approach?",
      options: [
        "Write a cron job on a manager VM that periodically executes ping scripts.",
        "Configure a Managed Instance Group (MIG) with an Autohealing policy and an HTTP health check.",
        "Move the database to GKE Standard with horizontal autoscaling.",
        "Enable Spot VM preemptible scheduling to recycle nodes daily."
      ],
      correctIndex: 1,
      explanation: "Managed Instance Groups support Autohealing. By configuring an active health check (like an HTTP path or TCP port check), the MIG automatically recreates individual VM instances if they fail the health criteria."
    },
    {
      id: "q53",
      domain: "domain-3",
      question: "You are launching a global consumer-facing web application that will be hosted in both the US and Europe. You need a load balancing configuration that provides a single global external IP address, routes clients to the closest backend region based on latency, and handles SSL termination at the edge. Which balancer fits?",
      options: [
        "Regional External Application Load Balancer",
        "Global External Application Load Balancer",
        "External TCP/UDP Network Load Balancer (Proxy)",
        "Internal Application Load Balancer"
      ],
      correctIndex: 1,
      explanation: "The Global External Application Load Balancer is a Layer 7 proxy that uses a single global IP, terminates SSL close to users via Google's edge points, and intelligently routes traffic based on proximity and backend health."
    },
    {
      id: "q54",
      domain: "domain-2",
      question: "You are setting up a high-performance database cluster on GCE VMs. You want to configure a block storage volume that can be mounted as Read-Write on the primary active VM, but must also be mounted as Read-Only on multiple standby replica VMs simultaneously. What should you configure?",
      options: [
        "A Cloud Storage bucket with gcsfuse mounts.",
        "A Persistent Disk configured in Multi-Writer mode.",
        "A Cloud Filestore NFS share.",
        "Multiple Local SSDs attached to the VMs."
      ],
      correctIndex: 1,
      explanation: "GCP Persistent Disks support Multi-Writer mode (for SSD and Balanced PDs), allowing up to 10 VMs to attach a single disk. One VM can attach as Read-Write while the rest attach as Read-Only, or all as Read-Only."
    },
    {
      id: "q55",
      domain: "domain-4",
      question: "Your developers run large analytical queries on a BigQuery database. Several queries scan over 20TB of data, incurring high on-demand pricing costs. You want to enforce a safeguard that prevents queries from running if they will scan more than 5TB. What should you do?",
      options: [
        "Partition and cluster all BigQuery tables immediately.",
        "Configure a maximum bytes billed limit for queries in the query settings.",
        "Export the BigQuery tables to GCS Standard class to save on query costs.",
        "Configure custom Slack alerts whenever a query takes more than 1 minute."
      ],
      correctIndex: 1,
      explanation: "Setting the 'Maximum bytes billed' in BigQuery query settings terminates queries before execution if the estimate exceeds the limit. This prevents massive runaway on-demand costs."
    },
    {
      id: "q56",
      domain: "domain-5",
      question: "A developer wants to connect to a Compute Engine virtual machine instance via SSH from their local command terminal using the gcloud CLI. How does the gcloud command authorize this connection by default?",
      options: [
        "It prompts the user to type the VM's administrator OS password.",
        "It automatically creates and registers temporary SSH key pairs in project metadata or leverages OS Login.",
        "It opens port 22 globally to the public internet.",
        "It routes the connection through a Cloud Storage bucket."
      ],
      correctIndex: 1,
      explanation: "By executing 'gcloud compute ssh', the Google Cloud SDK automatically generates a local SSH key pair, uploads the public key to project metadata (or OS Login profile), and connects securely over SSH."
    },
    {
      id: "q57",
      domain: "domain-1",
      question: "You want to deploy a docker container image serverlessly on GCP. The service requires 32GB RAM and 8 vCPUs to handle heavy mathematical processing, and it must scale down to zero when idle. Which platform meets these specs?",
      options: [
        "App Engine Standard Environment",
        "Cloud Run",
        "Cloud Functions (1st Gen)",
        "GKE Autopilot running small pods"
      ],
      correctIndex: 1,
      explanation: "Cloud Run supports container deployments and allows resource allocations up to 8 vCPUs and 32GB of memory. It also supports scaling down to zero when there is no traffic."
    },
    {
      id: "q58",
      domain: "domain-3",
      question: "You are the network administrator for a large company. You want to centralize IP space allocation, firewall configurations, and VPN routing inside a single host project, while allowing developer teams to spin up VMs in separate service projects. What should you configure?",
      options: [
        "VPC Peering between all project networks.",
        "A Shared VPC.",
        "Multiple HA VPN tunnels connecting the projects.",
        "An External Network Load Balancer proxying project subnets."
      ],
      correctIndex: 1,
      explanation: "A Shared VPC allows an organization to connect resources from multiple projects (Service Projects) to a common, centrally administered VPC network (Host Project)."
    },
    {
      id: "q59",
      domain: "domain-2",
      question: "You are designing an application that ingests continuous telemetry streams from millions of IoT devices simultaneously. Write volumes are massive (terabytes per hour) and require sub-10ms write latency. Which GCP storage service is optimized for this write-heavy latency?",
      options: [
        "Cloud Spanner",
        "Cloud Bigtable",
        "BigQuery",
        "Cloud SQL MySQL"
      ],
      correctIndex: 1,
      explanation: "Cloud Bigtable is Google's NoSQL wide-column database. It is explicitly designed for massive, low-latency write workloads (IoT sensors, time-series data, clickstreams)."
    },
    {
      id: "q60",
      domain: "domain-4",
      question: "You want to process a continuous stream of metrics pushed to Cloud Pub/Sub, perform deduplication in real-time, and write the output directly into BigQuery. You want a fully-managed serverless execution engine. Which service fits?",
      options: [
        "Cloud Dataproc running Spark streaming",
        "Cloud Dataflow running Apache Beam pipelines",
        "App Engine Flexible running Node.js",
        "Compute Engine MIG with cron auto-pulls"
      ],
      correctIndex: 1,
      explanation: "Cloud Dataflow is a serverless data processing engine that executes Apache Beam streaming and batch pipelines. It automatically scales worker nodes based on telemetry data."
    },
    {
      id: "q61",
      domain: "domain-1",
      question: "You are planning to run fault-tolerant containerized batch scripts on GKE worker nodes. You want to maximize cost savings on compute nodes. The workloads can survive interruptions. What node pool configuration should you use?",
      options: [
        "Enable Spot VMs in the node pool configuration.",
        "Configure Sole-Tenant VM nodes.",
        "Disable GKE Cluster Autoscaler.",
        "Use App Engine Flexible instance templates."
      ],
      correctIndex: 0,
      explanation: "Spot VMs offer steep discounts on GCE computing nodes. GKE node pools configured with Spot VMs are ideal for running stateless, fault-tolerant batch workloads at a fraction of the cost."
    },
    {
      id: "q62",
      domain: "domain-2",
      question: "You want to store archival backups in Cloud Storage buckets. The backups must be kept indefinitely. To save costs, you want objects to transition from Standard class to Nearline after 30 days, and to Archive class after 365 days. What should you configure?",
      options: [
        "A Cloud Function that moves files daily.",
        "An Object Lifecycle Management policy with transition actions.",
        "Enable Object Versioning on the bucket.",
        "A custom cron job script on a GCE instance."
      ],
      correctIndex: 1,
      explanation: "Object Lifecycle Management allows you to define rules that transition GCS files to colder, cheaper storage classes (or delete them) based on age, creation date, or versioning state."
    },
    {
      id: "q63",
      domain: "domain-3",
      question: "You are setting up VPC Firewall rules. You want to allow incoming TCP port 80 traffic to a web server VM, but block all other incoming traffic to the VM. You have two overlapping firewall rules. Which setting determines which rule is evaluated first?",
      options: [
        "The alphabetical name of the rule.",
        "The rule priority (lower integers represent higher priority).",
        "The order of creation timestamp.",
        "The geographical location of the subnet."
      ],
      correctIndex: 1,
      explanation: "GCP VPC Firewall rules use numeric priorities (from 0 to 65535). Rules with lower integers (e.g. 1000) have higher priority and are evaluated before rules with higher integers (e.g. 65535)."
    },
    {
      id: "q64",
      domain: "domain-5",
      question: "A developer needs to deploy an application to a GCE VM. The VM must run under a specific service account identity to access BigQuery. Which role must the developer have on the service account to associate it with the VM?",
      options: [
        "roles/iam.serviceAccountKeyAdmin",
        "roles/iam.serviceAccountUser",
        "roles/iam.securityAdmin",
        "roles/viewer"
      ],
      correctIndex: 1,
      explanation: "The Service Account User role (roles/iam.serviceAccountUser) allows an identity (like a developer) to associate a service account with a resource (like a VM or container pool) to run workloads under that identity."
    },
    {
      id: "q65",
      domain: "domain-4",
      question: "You have a Dataproc Hadoop cluster processing large datasets. To minimize costs, you want to delete the Dataproc cluster when the daily processing jobs finish, without losing the processed outputs or HDFS files. How should you design this?",
      options: [
        "Move the data to local SSDs attached to the worker nodes.",
        "Store the output data directly in Cloud Storage (GCS) using the 'gs://' scheme instead of internal HDFS.",
        "Configure automatic backup snapshots of the master VM.",
        "Disable Spot VMs on the cluster."
      ],
      correctIndex: 1,
      explanation: "Storing inputs and outputs in GCS (Cloud Storage) decouples compute from storage. This allows you to safely delete Dataproc clusters when idle to stop VM compute costs, without losing data."
    },
    {
      id: "q66",
      domain: "domain-1",
      question: "You have updated the GCE Instance Template used by your Managed Instance Group (MIG). You want to apply this new template to all running VM instances gradually, ensuring that at least 3 instances remain healthy during the rolling update. What should you configure?",
      options: [
        "Set the update policy to 'Opportunistic'.",
        "Use a 'Rolling Update' with maxSurge or maxUnavailable parameters.",
        "Recreate the entire MIG manually.",
        "Move the instances to a Shared VPC host."
      ],
      correctIndex: 1,
      explanation: "MIG rolling updates allow you to deploy a new template across active instances. By configuring maxUnavailable or maxSurge parameters, you control the pace of deployment to maintain service uptime."
    },
    {
      id: "q67",
      domain: "domain-2",
      question: "You are provisioning a production Cloud SQL PostgreSQL database. You need to ensure the database can tolerate a complete zonal outage without data loss or manual failover. Which configuration should you choose?",
      options: [
        "Create a read replica in a different region.",
        "Enable High Availability (HA) with a synchronous standby replica in another zone.",
        "Write a daily backup schedule to an Archive GCS bucket.",
        "Migrate to Cloud Memorystore HA."
      ],
      correctIndex: 1,
      explanation: "Cloud SQL High Availability (HA) provisions a primary master instance in one zone and a standby replica in a different zone in the same region. Writes are synchronously replicated, facilitating automatic failover during outages."
    },
    {
      id: "q68",
      domain: "domain-3",
      question: "You want to create a new Virtual Private Cloud (VPC) network. You plan to deploy Compute instances in the US-East region and databases in the Europe-West region, allowing them to communicate over private IPs. What type of subnets should you create?",
      options: [
        "You must create two separate VPC networks and connect them via Cloud VPN.",
        "Create a single custom VPC, and configure a subnet in us-east1 and a second subnet in europe-west1.",
        "Configure an automatic subnet VPC network.",
        "Use an External Application Load Balancer to bridge the subnets."
      ],
      correctIndex: 1,
      explanation: "VPC networks in GCP are global resources. A single VPC network can host subnets in multiple distinct regions globally, allowing internal IP-to-IP private communication across regions."
    },
    {
      id: "q69",
      domain: "domain-5",
      question: "You are setting up GCP identities for your enterprise. You want to synchronize your active on-premises Active Directory users and groups with Cloud Identity. Which tool should you use to automate this synchronization?",
      options: [
        "Directory Sync / Google Cloud Directory Sync (GCDS)",
        "Workload Identity Federation",
        "IAM Policy Analyzer",
        "Deployment Manager blueprints"
      ],
      correctIndex: 0,
      explanation: "Google Cloud Directory Sync (GCDS) and Directory Sync allow you to synchronize users and groups from Active Directory / LDAP directories to your Cloud Identity organization."
    },
    {
      id: "q70",
      domain: "domain-4",
      question: "Your auditor requires you to export all audit logs from your GCP projects and store them in an Archive class Cloud Storage bucket for long-term cold storage. Which GCP feature should you configure?",
      options: [
        "A Cloud Trace logging sink.",
        "A Log Router sink targeting the Cloud Storage bucket destination.",
        "A custom python script running on a cron VM.",
        "Enable billing export to GCS."
      ],
      correctIndex: 1,
      explanation: "Cloud Logging Log Router sinks allow you to route/export matching logs (based on a query filter) to external destinations like Cloud Storage, BigQuery, or Pub/Sub."
    },
    {
      id: "q71",
      domain: "domain-1",
      question: "You need to scale down the worker capacity of a GKE Standard cluster pool to save on compute costs during weekends. What is the most direct command or action to achieve this?",
      options: [
        "Run 'kubectl scale' on GKE master node pools.",
        "Execute 'gcloud container clusters resize' specifying the target pool size.",
        "Delete the VM instances directly from the GCE console.",
        "Stop the GKE cluster control plane."
      ],
      correctIndex: 1,
      explanation: "The command 'gcloud container clusters resize' allows you to set the target size (number of worker nodes) for a GKE node pool dynamically."
    },
    {
      id: "q72",
      domain: "domain-2",
      question: "You are designing a prototype web application that will store user configurations. You want a document database that is fully managed, serverless, and charges strictly $0 when the app is completely idle. Which service meets this criteria?",
      options: [
        "Cloud SQL",
        "Firestore in Native mode",
        "Cloud Bigtable",
        "Cloud Spanner"
      ],
      correctIndex: 1,
      explanation: "Firestore is a serverless document database. It scales to zero and has no minimum base compute fees, charging strictly based on operations (reads/writes) and storage capacity used."
    },
    {
      id: "q73",
      domain: "domain-3",
      question: "You want a GCE virtual machine running in a private subnet with no public IP to be able to access Google services, such as Cloud Storage buckets and BigQuery datasets, privately without routing traffic over the public internet. What must be enabled?",
      options: [
        "Cloud NAT",
        "Private Google Access on the subnet.",
        "VPC Peering.",
        "Workload Identity Federation."
      ],
      correctIndex: 1,
      explanation: "Private Google Access allows VM instances with only internal private IP addresses to securely query Google APIs and services (such as GCS and BigQuery) privately."
    },
    {
      id: "q74",
      domain: "domain-4",
      question: "You want to partition a BigQuery table, but you also query the table using a secondary filter column 'department_id' which is highly Cardinal. You want to group similar departments together inside the partitions to minimize scans. What should you configure?",
      options: [
        "Create a secondary index on department_id.",
        "Clustered Table on department_id.",
        "Export the table daily to GCS Nearline.",
        "Convert the table to a Cloud SQL format."
      ],
      correctIndex: 1,
      explanation: "Clustering a BigQuery table organizes database storage based on specific columns, sorting row data to optimize queries that filter by those clustered columns."
    },
    {
      id: "q75",
      domain: "domain-5",
      question: "You have assigned a user the role of 'Viewer' (roles/viewer) at the Folder level. You want to block this user from viewing resources inside a specific Project nested under that Folder. How can you accomplish this using standard IAM policies?",
      options: [
        "Deny the permission at the project level.",
        "Assign roles/viewer to the project level, and select 'block inheritance' settings.",
        "You cannot block inherited permissions in GCP IAM. Permissions are inherited top-down and are additive.",
        "Use custom firewall rules to block the user."
      ],
      correctIndex: 2,
      explanation: "GCP IAM policies are inherited top-down and are strictly additive. Inherited permissions from folders or organizations cannot be restricted or blocked at the project/resource levels."
    },
    {
      id: "q76",
      domain: "domain-1",
      question: "You have deployed a new version of your web application to App Engine. You want to route 90% of active user sessions to the stable version v1, and 10% to the new version v2 to test performance. What should you configure?",
      options: [
        "Create a Cloud DNS record with weighted records.",
        "Configure App Engine Traffic Splitting via the console or CLI.",
        "Set up an External Network Load Balancer.",
        "Run two different GCE VM instance groups."
      ],
      correctIndex: 1,
      explanation: "App Engine includes native traffic splitting capabilities inside the console or CLI, allowing you to split incoming HTTP web traffic between versions based on cookies or IP addresses."
    },
    {
      id: "q77",
      domain: "domain-2",
      question: "You want to establish automated daily backups of your primary production GCE boot drives. The backups must be incremental, stored securely across regions, and automatically expire after 14 days. What should you set up?",
      options: [
        "A custom cron script that runs 'gcloud compute disks' commands.",
        "A Resource Policy for Disk Snapshot Schedules.",
        "Object Versioning on GCS buckets.",
        "Deploy a Cloud Storage Transfer job."
      ],
      correctIndex: 1,
      explanation: "Resource Policies for Snapshot Schedules inside GCE allow you to schedule automated daily, weekly, or monthly incremental snapshots of persistent disks, complete with custom retention parameters."
    },
    {
      id: "q78",
      domain: "domain-3",
      question: "You have a cluster of web servers running custom protocol traffic over Layer 4 (non-HTTP TCP). You want to configure an external load balancer to distribute traffic directly to the backend VMs with maximum performance, using port-based proxy routing. Which balancer should you choose?",
      options: [
        "Global External Application Load Balancer",
        "External TCP/UDP Network Load Balancer",
        "Internal Application Load Balancer",
        "Cloud DNS routing"
      ],
      correctIndex: 1,
      explanation: "The External TCP/UDP Network Load Balancer is a Layer 4 balancer that distributes incoming non-HTTP TCP/UDP traffic to backend VM instances."
    },
    {
      id: "q79",
      domain: "domain-4",
      question: "You want to trace the source of crashes in your web app. You need a GCP diagnostic service that automatically aggregates application stack traces, identifies the languages, and groups similar exceptions together. Which service fits?",
      options: [
        "Cloud Trace",
        "Error Reporting",
        "Cloud Logging",
        "Cloud Profiler"
      ],
      correctIndex: 1,
      explanation: "Error Reporting analyzes crash details and stack traces generated in GCE, GKE, or Cloud Run, grouping similar exceptions together and offering Slack/email alert integrations."
    },
    {
      id: "q80",
      domain: "domain-5",
      question: "A new engineer has joined your operations team. Why is it a major security risk to assign the primitive role 'Owner' (roles/owner) to this user context at the project level, according to GCP guidelines?",
      options: [
        "Owner roles cannot run any CLI commands.",
        "Owner grants broad, non-restrictive admin permissions on all resources, including billing management and permission assignment, violating least privilege.",
        "Owner roles are automatically billed per minute.",
        "Owner permissions cannot inherit Folder-level policies."
      ],
      correctIndex: 1,
      explanation: "Primitive roles (Owner, Editor, Viewer) grant broad, all-encompassing permissions. Assigning 'Owner' allows full read-write access to resources and the ability to modify permissions, violating least-privilege security policies."
    },
    {
      id: "q81",
      domain: "domain-1",
      question: "You are setting up a virtual machine group on GCE. You noticed that the term 'Preemptible VMs' is often used interchangeably with 'Spot VMs'. What is a key billing difference between them?",
      options: [
        "Preemptible VMs are billed by the hour, whereas Spot VMs are billed by the second.",
        "Spot VMs have no fixed 24-hour runtime limit and continue running if excess capacity exists, unlike Preemptible VMs which are terminated after 24 hours.",
        "Spot VMs cost 50% more than Preemptible VMs.",
        "Spot VMs require a Dedicated Interconnect connection."
      ],
      correctIndex: 1,
      explanation: "Spot VMs represent the modern version of Preemptible VMs. Unlike Preemptible VMs (which have a strict 24-hour limit), Spot VMs can run indefinitely as long as GCP has excess physical capacity."
    },
    {
      id: "q82",
      domain: "domain-2",
      question: "You want to allow a third-party client to upload a massive video file directly to a secure, private Cloud Storage bucket in your project. The client does not possess a Google account. What is the Google-recommended approach?",
      options: [
        "Set the private bucket's permissions to Public Read/Write.",
        "Create a Signed URL with write permissions and send it to the client.",
        "Generate a service account key, download the JSON, and email it to the client.",
        "Peering the client's network to your project VPC."
      ],
      correctIndex: 1,
      explanation: "A Signed URL grants secure, temporary, and scoped write/read access to private GCS objects for anyone, without requiring a Google account or credentials."
    },
    {
      id: "q83",
      domain: "domain-3",
      question: "You have peered VPC-A with VPC-B. You then peer VPC-B with VPC-C. Can a VM in VPC-A privately communicate with a VM in VPC-C through these peering connections?",
      options: [
        "Yes, VPC Network Peering is fully transitive.",
        "No, VPC Network Peering is non-transitive. To connect VPC-A with VPC-C, you must create a direct peering link between them.",
        "Only if you configure an External Load Balancer.",
        "Yes, but only if both VPCs are in the us-central1 region."
      ],
      correctIndex: 1,
      explanation: "VPC Network Peering is strictly non-transitive. Traffic cannot hop across multiple peering links. A direct peering connection must exist between VPC-A and VPC-C."
    },
    {
      id: "q84",
      domain: "domain-4",
      question: "You want to build a single operational dashboard that displays GCE VM CPU charts, Pub/Sub pending message counts, and Cloud SQL active connections in real-time. Which tool should you use?",
      options: [
        "Cloud Logging Query Panel",
        "Cloud Monitoring Custom Dashboards",
        "Google Cloud Deployment Manager dashboards",
        "Looker Studio billing connections"
      ],
      correctIndex: 1,
      explanation: "Cloud Monitoring Dashboards allow you to assemble charts, graphs, and metric displays across multiple GCP services in a single pane."
    },
    {
      id: "q85",
      domain: "domain-5",
      question: "You want to assign a team member the permission to link GCP projects to your corporate billing account, but you do not want them to see project resources or create VMs. Which role should you assign on the Billing Account?",
      options: [
        "roles/billing.admin",
        "roles/billing.user",
        "roles/billing.viewer",
        "roles/owner"
      ],
      correctIndex: 1,
      explanation: "The Billing User role (roles/billing.user) allows an identity to link a GCP project to a billing account, without granting administrative rights over the billing account itself."
    },
    {
      id: "q86",
      domain: "domain-1",
      question: "You are configuring autoscaling on a GKE deployment. You want the number of Pod replicas to increase or decrease automatically based on custom incoming request rates. Which resource should you configure?",
      options: [
        "Vertical Pod Autoscaler (VPA)",
        "Horizontal Pod Autoscaler (HPA)",
        "GKE Node Auto-Provisioning",
        "Cloud Monitoring triggers"
      ],
      correctIndex: 1,
      explanation: "The Horizontal Pod Autoscaler (HPA) adjusts Pod replica counts dynamically based on CPU, memory, or custom metrics (like query/request rates)."
    },
    {
      id: "q87",
      domain: "domain-2",
      question: "Your production Cloud SQL database is experiencing heavy read performance degradation due to a massive surge in analytics reporting queries. What is the most efficient way to scale read throughput?",
      options: [
        "Resize the master database VM to a memory-optimized class.",
        "Create Cloud SQL Read Replicas and route reporting queries to them.",
        "Configure Memorystore Redis cache clusters.",
        "Enable database High Availability (HA)."
      ],
      correctIndex: 1,
      explanation: "Read Replicas allow you to distribute read workloads across regional copies of the database, offloading queries from the primary master database."
    },
    {
      id: "q88",
      domain: "domain-3",
      question: "You are setting up an HA VPN to connect your on-premises office to a GCP VPC network. What is a key requirement to achieve the 99.99% SLA availability tier?",
      options: [
        "A Partner Interconnect circuit.",
        "Two active tunnels from your local peer gateway to two distinct GCP HA VPN interfaces in a single region.",
        "A Dedicated Interconnect circuit.",
        "A custom static router in every subnet."
      ],
      correctIndex: 1,
      explanation: "GCP HA VPN requires configuring two active IPSec tunnels from a single peer gateway (with two interfaces) to two distinct interfaces on the GCP HA VPN gateway to achieve a 99.99% SLA."
    },
    {
      id: "q89",
      domain: "domain-4",
      question: "You want to receive email alerts when your project's monthly spend reaches 50%, 80%, and 100% of a $1000 budget. Will this budget setup automatically shut down or terminate your VM instances once spending reaches 100%?",
      options: [
        "Yes, budgets automatically disable resources to prevent overruns.",
        "No, budgets are informational only. To automate resource shutdowns, you must route budget notifications to a Pub/Sub topic and trigger a Cloud Function.",
        "Only if the project is associated with an active credit card.",
        "Yes, but only if you use Spot VMs."
      ],
      correctIndex: 1,
      explanation: "GCP Budgets and Alerts are purely informational. They do not shut down resources. Resource termination must be automated by routing budget events through Pub/Sub and triggering scripts (like a Cloud Function)."
    },
    {
      id: "q90",
      domain: "domain-5",
      question: "Your security officer wants to restrict developers from creating public IP addresses on GCE VMs. What should you configure at the Folder level to enforce this constraint globally?",
      options: [
        "A strict IAM project role binding.",
        "An Organization Policy Constraint with GCE rules.",
        "A VPC firewall rule blocking port 80/443.",
        "A custom Secret Manager policy."
      ],
      correctIndex: 1,
      explanation: "Organization Policies allow you to enforce project constraints (like restricting external IP creations) globally or hierarchically at Folder/Org levels."
    },
    {
      id: "q91",
      domain: "domain-1",
      question: "What is a key architectural advantage of Cloud Run's concurrency model over AWS Lambda?",
      options: [
        "Cloud Run can compile Python scripts on-the-fly.",
        "A single Cloud Run container instance can process up to 250 concurrent requests simultaneously, whereas AWS Lambda instances process only one request at a time.",
        "Cloud Run does not support scale-to-zero.",
        "Cloud Run is billed by the month instead of by request."
      ],
      correctIndex: 1,
      explanation: "Cloud Run instances support concurrency. A single container instance can handle up to 250 concurrent requests, reducing cold startups and costs."
    },
    {
      id: "q92",
      domain: "domain-2",
      question: "You have transitioned several database backups to GCS Coldline class to save costs. If you delete or replace these files 15 days after creation, will you incur a cost penalty?",
      options: [
        "No, GCS classes charge strictly by storage size used.",
        "Yes, GCS Coldline has a 90-day minimum retention duration. Deleting files earlier incurs an early deletion penalty charge.",
        "Yes, but only if you use Object Versioning.",
        "No, deletions are always free in object storage."
      ],
      correctIndex: 1,
      explanation: "Colder GCS classes (Nearline, Coldline, Archive) have minimum storage retention durations (30, 90, and 365 days respectively). Deleting early incurs cost penalties."
    },
    {
      id: "q93",
      domain: "domain-3",
      question: "You want your Global External Application Load Balancer to automatically redirect all incoming HTTP traffic to HTTPS. How should you design this?",
      options: [
        "Create a second load balancer that proxies port 80 to port 443.",
        "Configure an HTTP-to-HTTPS redirect rule directly in the Load Balancer's URL map configurations.",
        "Deploy a Cloud NAT gateway inside the Load Balancer subnet.",
        "Peering the subnets to local databases."
      ],
      correctIndex: 1,
      explanation: "GCP Global Application Load Balancers support native HTTP-to-HTTPS redirects. You can configure this directly inside the load balancer's URL map."
    },
    {
      id: "q94",
      domain: "domain-4",
      question: "You are setting up a Dataproc Hadoop cluster to run non-critical daily batch analysis. You want to minimize costs. What cluster configuration should you specify?",
      options: [
        "Use Sole-Tenant nodes only.",
        "Configure Dataproc worker pools to utilize Spot / Preemptible VMs.",
        "Enable GKE cluster auto-provisioning.",
        "Use Memorystore databases."
      ],
      correctIndex: 1,
      explanation: "Dataproc clusters can utilize Spot/Preemptible VMs for worker nodes, allowing you to run big data operations at significant discounts."
    },
    {
      id: "q95",
      domain: "domain-5",
      question: "You are managing service accounts for an application. According to security best practices, what should you do with service account keys?",
      options: [
        "Generate a single master key, and share it among all team members.",
        "Avoid using downloaded JSON keys. Attach service accounts directly to GCE VMs, GKE Pods, or Cloud Run, and use Application Default Credentials.",
        "Store JSON keys in a public Git repository to ensure accessibility.",
        "Commit JSON keys directly to application codebases."
      ],
      correctIndex: 1,
      explanation: "Downloading private JSON service account keys is a major security risk. Attach service accounts directly to compute resources and leverage Application Default Credentials."
    },
    {
      id: "q96",
      domain: "domain-1",
      question: "Google Cloud is performing scheduled hardware maintenance on the physical host machine running your primary GCE VM. What happens to your running GCE instance during this maintenance window by default?",
      options: [
        "The GCE instance is immediately terminated and data is lost.",
        "The VM is automatically live-migrated to a different physical host without downtime or rebooting.",
        "The VM reboots into a single-tenant node.",
        "The VM reboots and data in Local SSDs is erased."
      ],
      correctIndex: 1,
      explanation: "Compute Engine VM instances support live migration by default. Google automatically migrates running instances to a different host without rebooting or disruption."
    },
    {
      id: "q97",
      domain: "domain-2",
      question: "You need to store financial ledgers requiring strong global consistency, standard SQL queries, and multi-region write capability with 99.999% SLA availability. Which database service fits?",
      options: [
        "Cloud SQL PostgreSQL",
        "Cloud Spanner",
        "Cloud Bigtable",
        "Firestore"
      ],
      correctIndex: 1,
      explanation: "Cloud Spanner is GCP's globally scalable relational SQL database, offering synchronous multi-region writes, strong global consistency, and a 99.999% availability SLA."
    },
    {
      id: "q98",
      domain: "domain-3",
      question: "You want to configure name resolution for Compute Engine VM instances inside a private VPC network. You do not want these DNS records to be queryable from outside the VPC. What should you configure?",
      options: [
        "A public DNS zone in Cloud DNS.",
        "A private DNS zone in Cloud DNS attached to your specific VPC network.",
        "A local /etc/hosts file script on every VM.",
        "Enable Private Google Access."
      ],
      correctIndex: 1,
      explanation: "Cloud DNS private zones allow you to define custom domain name lookups that are strictly queryable from within specified internal VPC networks."
    },
    {
      id: "q99",
      domain: "domain-4",
      question: "You have created a Pub/Sub pull subscription. What is the maximum duration that unacknowledged messages will be stored in the Pub/Sub queue by default?",
      options: [
        "24 Hours",
        "7 Days",
        "30 Days",
        "365 Days"
      ],
      correctIndex: 1,
      explanation: "By default, Cloud Pub/Sub retains messages in subscription queues for up to 7 days before discarding them, regardless of delivery status."
    },
    {
      id: "q100",
      domain: "domain-5",
      question: "You want to structure access policies for your enterprise resources. What is the correct hierarchy of resource organization in Google Cloud (from highest to lowest level of inheritance)?",
      options: [
        "Project -> Folder -> Organization -> Resource",
        "Organization -> Folder -> Project -> Resource",
        "Folder -> Organization -> Project -> Resource",
        "Organization -> Project -> Folder -> Resource"
      ],
      correctIndex: 1,
      explanation: "GCP resource hierarchy follows the order: Organization (root) -> Folders (nested department groups) -> Projects (resource containers) -> Resources (GCE VMs, GCS Buckets, etc.)."
    }
  ]
};

// Export database for browser utilization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GCP_DATABASE;
} else {
  window.GCP_DATABASE = GCP_DATABASE;
}

