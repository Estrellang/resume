const MAX_MIX_LEVEL = 5; // 最大比对层级

const toString = {}.toString;

// 类型检测
const isType = (value: unknown, type: string): boolean =>
  toString.call(value) === '[object ' + type + ']';

const isObjectLike = (value: unknown): value is object => {
  /**
   * isObjectLike({}) => true
   * isObjectLike([1, 2, 3]) => true
   * isObjectLike(Function) => false
   */
  return typeof value === 'object' && value !== null;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  /**
   * isObjectLike(new Foo) => false
   * isObjectLike([1, 2, 3]) => false
   * isObjectLike({ x: 0, y: 0 }) => true
   */
  if (!isObjectLike(value) || !isType(value, 'Object')) {
    return false;
  }
  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(value) === proto;
};

/***
 * @param {any} dist
 * @param {any} src
 * @param {number} level 当前层级
 * @param {number} maxLevel 最大层级
 */
const deep = (
  dist: Record<string, unknown>,
  src: Record<string, unknown>,
  level = 0,
  maxLevel = MAX_MIX_LEVEL
): void => {
  for (const key in src) {
    if (Object.prototype.hasOwnProperty.call(src, key)) {
      const value = src[key];
      if (!value) {
        // null 、 undefined 等情况直接赋值
        dist[key] = value;
      } else {
        if (isPlainObject(value)) {
          if (!isPlainObject(dist[key])) {
            dist[key] = {};
          }
          if (level < maxLevel) {
            deep(
              dist[key] as Record<string, unknown>,
              value,
              level + 1,
              maxLevel
            );
          } else {
            // 层级过深直接赋值，性能问题
            dist[key] = src[key];
          }
        }
        // else if (isArray(value)) {
        //   // 如果为 undefined，才进行 concat
        //   dist[key] = [];
        //   dist[key] = dist[key].concat(value);
        // }
        else {
          dist[key] = value;
        }
      }
    }
  }
};

/**
 * customAssign 功能类似 merge
 */
export const customAssign = <T extends object>(
  rst: T,
  ...args: unknown[]
): T => {
  for (let i = 0; i < args.length; i += 1) {
    const source = args[i];
    if (isPlainObject(source)) {
      deep(rst as Record<string, unknown>, source);
    }
  }
  return rst;
};
