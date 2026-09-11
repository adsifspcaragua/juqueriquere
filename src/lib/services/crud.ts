import { supabase } from "../supabase";

/**
 * Busca um único registro pelo ID em qualquer tabela.
 */
export async function getById<T>(
    table: string, 
    id: string | number, 
    columns = "*"
): Promise<T | null> {
    const { data, error } = await supabase
        .from(table)
        .select(columns)
        .eq("id", id)
        .single();

    if (error) {
        console.error(`[crud.getById] Erro ao buscar em '${table}':`, error);
        return null;
    }

    return data as T;
}

/**
 * Busca uma lista de registros de qualquer tabela.
 */
export async function getAll<T>(
    table: string, 
    columns = "*", 
    orderBy = "id", 
    ascending = true
): Promise<T[]> {
    const { data, error } = await supabase
        .from(table)
        .select(columns)
        .order(orderBy, { ascending });

    if (error) {
        console.error(`[crud.getAll] Erro ao buscar em '${table}':`, error);
        return [];
    }

    return data as T[];
}

/**
 * Atualiza um registro existente pelo ID.
 */
export async function updateById<T>(
    table: string, 
    id: string | number, 
    payload: Partial<T>
): Promise<T | null> {
    const { data, error } = await supabase
        .from(table)
        .update(payload as any)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error(`[crud.updateById] Erro ao atualizar '${table}':`, error);
        throw error;
    }

    return data as T;
}

/**
 * Insere um novo registro em qualquer tabela.
 */
export async function createRecord<T>(
    table: string, 
    payload: Partial<T>
): Promise<T | null> {
    const { data, error } = await supabase
        .from(table)
        .insert(payload as any)
        .select()
        .single();

    if (error) {
        console.error(`[crud.createRecord] Erro ao criar em '${table}':`, error);
        throw error;
    }

    return data as T;
}

/**
 * Remove um registro pelo ID.
 */
export async function deleteById(table: string, id: string | number): Promise<boolean> {
    const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

    if (error) {
        console.error(`[crud.deleteById] Erro ao deletar em '${table}':`, error);
        throw error;
    }

    return true;
}

/*
alias
*/
export const deleteRecord = deleteById; 

