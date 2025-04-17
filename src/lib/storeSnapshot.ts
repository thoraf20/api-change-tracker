import db from "../config/db";

export async function storeSnapshot(data: {
  method: string;
  url: string;
  headers: any;
  body: any;
}) {

  const { url, method, body, headers } = data
  await db.query(
    "INSERT INTO snapshots (url, method, body, headers, created_at) VALUES ($1, $2, $3, $4, NOW())",
    [url, method, body, headers]
  );
}

export async function saveSnapshot({
  url,
  method,
  requestBody,
  responseBody,
  statusCode,
  clientId,
}: {
  url: string;
  method: string;
  requestBody: any;
  responseBody: any;
  statusCode: number;
  clientId: string;
}) {
  const result = await db.query(
    `
    INSERT INTO snapshots (
      url, method, request_body, response_body, status_code, client_id, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *;
    `,
    [url, method, requestBody, responseBody, statusCode, clientId]
  );

  return result.rows[0];
}

export async function getPreviousSnapshot({
  url,
  method,
  clientId,
}: {
  url: string;
  method: string;
  clientId: string;
}) {
  const result = await db.query(
    `
    SELECT *
    FROM snapshots
    WHERE url = $1
      AND method = $2
      AND client_id = $3
    ORDER BY created_at DESC
    OFFSET 1
    LIMIT 1;
    `,
    [url, method, clientId]
  );

  return result.rows[0] || null;
}

export async function getSnapshots({
  url,
  method,
}: {
  url?: string;
  method?: string;
}) {
  const filters: string[] = [];
  const values: any[] = [];

  if (url) {
    filters.push(`url = $${values.length + 1}`);
    values.push(String(url));
  }

  if (method) {
    filters.push(`method = $${values.length + 1}`);
    values.push(String(method).toUpperCase());
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const result = await db.query(
    `
    SELECT *
    FROM snapshots
    ${whereClause}
    ORDER BY created_at DESC;
    `,
    values
  );

  return result.rows;
}

export async function getRecentSnapshots({
  url,
  method,
  limit = 2,
}: {
  url: string;
  method: string;
  limit?: number;
}) {
  const result = await db.query(
    `
    SELECT *
    FROM snapshots
    WHERE url = $1 AND method = $2
    ORDER BY created_at DESC
    LIMIT $3;
    `,
    [url, method.toUpperCase(), limit]
  );

  return result.rows;
}
