/**
 * A Map that is guaranteed to have a value for every possible key.
 */
export interface FullMap<in out K, V> extends ReadonlyMap<K, V> {
  get(key: K): V;
}

export interface FullMapConstructor {
  new <V, const Entries extends readonly (readonly [unknown, V])[]>(
    entries: Entries,
  ): FullMap<
    NoInfer<Entries> extends readonly (readonly [infer K, V])[] ? K : never,
    V
  >;
}

export const FullMap: FullMapConstructor = Map as FullMapConstructor;
