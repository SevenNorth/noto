

/**
 * snake_case -> camelCase
 */
const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_: string, p1: string) => p1.toUpperCase());

/**
 * camelCase -> snake_case
 */
const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

/**
 * 递归转换对象或数组的 key
 * @param obj - 需要转换的对象或数组
 * @param transformFn - key 转换函数
 * @returns 转换后的值
 */
const transformKeys = (obj: unknown, transformFn: (key: string) => string): unknown => {
  if (Array.isArray(obj)) {
    return (obj as unknown[]).map((item) => transformKeys(item, transformFn));
  } else if (
    obj &&
    typeof obj === "object" &&
    !Object.prototype.toString.call(obj).includes("Date")
  ) {
    const newObj: Record<string, unknown> = {};
    Object.keys(obj as Record<string, unknown>).forEach((key) => {
      const newKey = transformFn(key);
      newObj[newKey] = transformKeys((obj as Record<string, unknown>)[key], transformFn);
    });
    return newObj;
  } else {
    return obj;
  }
};

/**
 * snake_case -> camelCase (递归)
 */
const deepSnakeToCamel = (obj: unknown): unknown => transformKeys(obj, snakeToCamel);

/**
 * camelCase -> snake_case (递归)
 */
const deepCamelToSnake = (obj: unknown): unknown => transformKeys(obj, camelToSnake);

/**
 * 根据 value 从 options 中查找对应对象并返回 toKey 的值
 * @param options - 选项数组
 * @param value - 查找值
 * @param toKey - 返回的 key
 * @param fromKey - 查找的 key
 * @returns 对应的 toKey 值，如果没找到返回 undefined
 */
const valueTo = <T extends Record<string, any>>(
  options: T[] = [],
  value: any,
  toKey = "label",
  fromKey = "value"
): any | undefined => {
  if (!Array.isArray(options)) return undefined;
  const item = (options as T[]).find((opt) => (opt as any)[fromKey] === value);
  return item ? (item as any)[toKey] : undefined;
};

export {
  snakeToCamel,
  camelToSnake,
  deepSnakeToCamel,
  deepCamelToSnake,
  valueTo,
};
