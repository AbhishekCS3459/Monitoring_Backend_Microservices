
https://github.com/AbhishekCS3459/Monitoring-Backend-Microservices/assets/94506000/031dd3ba-dad7-4f5b-b2dd-fa80a3b6e46f

<vedio src="" autoplay></video>
<h1>
Log Ingestor and Query Interface
</h1>

<h1>Objective </h1>
Develop a log ingestor system that can efficiently handle vast volumes of log data, and offer a simple interface for querying this data using full-text search or specific field filters.
<p>
  <b>Both the systems (the log ingestor and the query interface) can be built using any programming language of your choice.The logs should be ingested (in the log ingestor) over HTTP, on port 3000</b>
</p>

### SOLUTION VIDEO

![MONOTORING_SERVICE](https://github.com/AbhishekCS3459/Monitoring-Backend-Microservices/assets/94506000/f9e36348-ecbc-49db-9a33-78e336f10c1b)


### Inserting data to datbase using Redis as PUB-SUB
![image](https://github.com/AbhishekCS3459/Monitoring-Backend-Microservices/assets/94506000/c9d7dd1f-9367-43ca-8485-54c9a0d2d8d7)


###### Sample Log Data Format:

### The logs to be ingested will be sent in this format
``` bash
{
 "level": "error",
 "message": "Failed to connect to DB",
 "resourceId": "server-1234",
 "timestamp": "2023-09-15T08:00:00Z",
 "traceId": "abc-xyz-123",
 "spanId": "span-456",
 "commit": "5e5342f",
 "metadata": {
  "parentResourceId": "server-0987"
 }
}
```

## Requirements

 The requirements for the log ingestor and the query interface are specified below.

### Log Ingestor:

- Develop a mechanism to ingest logs in the provided format.
- Ensure scalability to handle high volumes of logs efficiently.
- Mitigate potential bottlenecks such as I/O operations, database write speeds, etc.
- Make sure that the logs are ingested via an HTTP server, which runs on port `3000` by default.

### Query Interface:

- Offer a user interface (Web UI or CLI) for full-text search across logs.
- Include filters based on:
    - level
    - message
    - resourceId
    - timestamp
    - traceId
    - spanId
    - commit
    - metadata.parentResourceId
- Aim for efficient and quick search results.

  
## Advanced Features (Bonus):
- Implement search within specific date ranges.
- Utilize regular expressions for search.
- Allow combining multiple filters.
- Provide real-time log ingestion and searching capabilities.
- Implement role-based access to the query interface.

