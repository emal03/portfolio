// src/lib/supabase.ts
import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);

// Helper: execute raw parameterized query via Neon
async function rawQuery(query: string, params: any[] = []): Promise<any[]> {
    const result = await (sql as any).query(query, params);
    return Array.isArray(result) ? result : [];
}

// Supabase-compatible query builder for Neon
class QueryBuilder {
    private table: string;
    private conditions: { column: string; value: any; op?: string }[] = [];
    private orderByCol: string | null = null;
    private orderAsc: boolean = true;
    private limitCount: number | null = null;
    private selectCols: string = '*';
    private isSingle: boolean = false;
    private isCount: boolean = false;
    private isHead: boolean = false;
    private _insertData: any[] | null = null;
    private _updateData: Record<string, any> | null = null;
    private _deleteMode: boolean = false;

    constructor(table: string) {
        this.table = table;
    }

    select(columns: string = '*', options?: { count?: string; head?: boolean }) {
        this.selectCols = columns;
        if (options?.count === 'exact') this.isCount = true;
        if (options?.head) this.isHead = true;
        return this;
    }

    eq(column: string, value: any) {
        this.conditions.push({ column, value });
        return this;
    }

    neq(column: string, value: any) {
        this.conditions.push({ column, value, op: '!=' });
        return this;
    }

    contains(column: string, value: any[]) {
        this.conditions.push({ column, value, op: '@>' });
        return this;
    }

    ilike(column: string, value: string) {
        this.conditions.push({ column, value, op: 'ILIKE' });
        return this;
    }

    order(column: string, options?: { ascending?: boolean }) {
        this.orderByCol = column;
        this.orderAsc = options?.ascending ?? true;
        return this;
    }

    limit(count: number) {
        this.limitCount = count;
        return this;
    }

    single() {
        this.isSingle = true;
        this.limitCount = 1;
        return this;
    }

    insert(rows: any | any[]) {
        this._insertData = Array.isArray(rows) ? rows : [rows];
        return this;
    }

    update(updates: Record<string, any>) {
        this._updateData = updates;
        return this;
    }

    delete() {
        this._deleteMode = true;
        return this;
    }

    private buildWhere(startIdx: number = 1): { clause: string; values: any[] } {
        const values: any[] = [];
        let clause = '';
        this.conditions.forEach((cond, i) => {
            const paramIdx = startIdx + i;
            const op = cond.op || '=';
            const prefix = i === 0 ? ' WHERE ' : ' AND ';
            if (op === '@>') {
                clause += `${prefix}"${cond.column}"::jsonb @> $${paramIdx}::jsonb`;
                values.push(JSON.stringify(cond.value));
            } else {
                clause += `${prefix}"${cond.column}" ${op} $${paramIdx}`;
                values.push(cond.value);
            }
        });
        return { clause, values };
    }

    async then(
        resolve: (value: { data: any; error: any; count?: number | null }) => void,
        reject?: (reason?: any) => void
    ) {
        try {
            if (this._insertData) {
                const row = this._insertData[0];
                const keys = Object.keys(row);
                const values = Object.values(row);
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                const columns = keys.map(k => `"${k}"`).join(', ');
                const query = `INSERT INTO "${this.table}" (${columns}) VALUES (${placeholders}) RETURNING *`;
                const result = await rawQuery(query, values);
                resolve({
                    data: this.isSingle ? (result[0] || null) : result,
                    error: null,
                    count: result.length,
                });
                return;
            }

            if (this._updateData) {
                const keys = Object.keys(this._updateData);
                const values = Object.values(this._updateData);
                const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
                const where = this.buildWhere(values.length + 1);
                const query = `UPDATE "${this.table}" SET ${setClauses}${where.clause} RETURNING *`;
                const result = await rawQuery(query, [...values, ...where.values]);
                resolve({
                    data: this.isSingle ? (result[0] || null) : result,
                    error: null,
                });
                return;
            }

            if (this._deleteMode) {
                const where = this.buildWhere();
                const query = `DELETE FROM "${this.table}"${where.clause} RETURNING *`;
                const result = await rawQuery(query, where.values);
                resolve({ data: result, error: null });
                return;
            }

            if (this.isCount && this.isHead) {
                const where = this.buildWhere();
                const query = `SELECT COUNT(*) as count FROM "${this.table}"${where.clause}`;
                const result = await rawQuery(query, where.values);
                resolve({ data: null, error: null, count: parseInt(result[0].count) });
                return;
            }

            const cols = this.selectCols === '*'
                ? '*'
                : this.selectCols.split(',').map(c => {
                    const trimmed = c.trim();
                    return trimmed === 'id' || trimmed === '*' ? trimmed : `"${trimmed}"`;
                }).join(', ');

            let query = `SELECT ${cols} FROM "${this.table}"`;
            const where = this.buildWhere();
            query += where.clause;

            if (this.orderByCol) {
                query += ` ORDER BY "${this.orderByCol}" ${this.orderAsc ? 'ASC' : 'DESC'}`;
            }
            if (this.limitCount) {
                query += ` LIMIT ${this.limitCount}`;
            }

            const result = await rawQuery(query, where.values);

            if (this.isSingle) {
                resolve({
                    data: result[0] || null,
                    error: result.length === 0 ? { message: 'No rows found' } : null,
                });
            } else {
                resolve({ data: result, error: null, count: result.length });
            }
        } catch (error: any) {
            console.error(`[DB Error] ${this.table}:`, error.message);
            if (reject) reject(error);
            else resolve({ data: null, error: { message: error.message }, count: null });
        }
    }
}

// Supabase Storage client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const hasSupabaseCreds = supabaseUrl !== '' && supabaseServiceKey !== '';

const supabaseClient = hasSupabaseCreds ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Mock storage for fallback
const storageMock = {
    from: (_bucket: string) => ({
        upload: async (path: string, file: any, options?: any) => {
            console.log(`[Mock Storage] Upload file to: ${path}`);
            return { data: { path }, error: null };
        },
        getPublicUrl: (path: string) => ({
            data: { publicUrl: `/uploads/${path}` },
        }),
        createSignedUrl: async (path: string, expiresIn: number) => {
            return { data: { signedUrl: `/uploads/${path}` }, error: null };
        },
        remove: async (paths: string[]) => {
            return { data: paths, error: null };
        }
    }),
};

// Supabase-compatible client backed by Neon for queries and real/mock Supabase for Storage
export const supabase = {
    from: (table: string) => new QueryBuilder(table),
    storage: supabaseClient ? supabaseClient.storage : storageMock,
};

export { sql };
